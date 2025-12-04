// src/services/excel.service.ts

import * as XLSX from 'xlsx';

// Interfaz para el archivo subido
interface FileData {
    data: Buffer;
    name: string;
}

// 1. Definimos la interfaz del formato que esperamos del Excel
export interface CalificacionExcel {
    matricula: string;
    codigo_materia: string;
    periodo: string; 
    
    // Datos Opcionales o Ignorados (incluyendo comentario)
    nombre?: string;
    apellido_paterno?: string;
    apellido_materno?: string;
    correo?: string;
    
    // Datos de Calificación
    ordinario: number | null;
    extraordinario: number | null;
    final: number | null;
    
    // Datos de Kardex
    fecha_cierre?: string; 
    estatus_kardex?: string;
    comentario?: string; // Sigue en la interfaz para mapear si alguien la pone
}

// 2. Definimos TODAS las columnas que el profesor debe incluir (¡'comentario' ELIMINADO!)
const COLUMNAS_OBLIGATORIAS_EXCEL = [
    'matricula', 'nombre', 'apellido_paterno', 'apellido_materno', 
    'correo', 'codigo_materia', 'periodo', 'ordinario', 
    'extraordinario', 'final', 'fecha_cierre', 'estatus_kardex' // <-- ¡CORREGIDO!
];

/**
 * Procesa y valida el archivo Excel subido.
 * Implementa PR7.2 (Validación de tipo) y PR7.3 (Validación de formato robusta).
 * @param file El objeto con el Buffer del archivo.
 * @returns Un arreglo de objetos con los datos de calificación listos para DB.
 */
export const procesarArchivoCalificaciones = (file: FileData): CalificacionExcel[] => {
    // PR7.2: Validación de que el archivo subido sea un archivo Excel válido.
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
        throw new Error('PR7.2: El archivo debe ser un archivo de Excel válido (.xlsx o .xls).');
    }

    const workbook = XLSX.read(file.data, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const data: any[] = XLSX.utils.sheet_to_json(worksheet, {
        defval: null, 
    });

    // PR7.3: Validación inicial
    if (data.length === 0) {
        throw new Error('PR7.3: El archivo Excel está vacío o la primera hoja no contiene datos.');
    }
    
    // 2. Extracción y Normalización de Encabezados (Robusta)
    const rawHeaders = Object.keys(data[0] || {});
    const mappedHeaders = rawHeaders.map(h => h.trim().toLowerCase()); 
    
    // Verificamos qué columnas CRÍTICAS FALTAN
    const missingHeaders = COLUMNAS_OBLIGATORIAS_EXCEL.filter(expectedHeader => 
        !mappedHeaders.includes(expectedHeader)
    );
    
    if (missingHeaders.length > 0) {
        throw new Error(`PR7.3: Faltan las columnas obligatorias en la plantilla: ${missingHeaders.join(', ')}.`);
    }
    
    const processedData: CalificacionExcel[] = [];
    
    // 3. Procesamiento Fila por Fila (La lógica aquí es correcta)
    for (const fila of data) {
        // Creamos un objeto con claves normalizadas
        const mappedFila: any = {};
        Object.keys(fila).forEach(rawKey => {
            const cleanKey = rawKey.trim().toLowerCase();
            mappedFila[cleanKey] = fila[rawKey];
        });
        
        const filaProcesada: Partial<CalificacionExcel> = {};

        // 4. Validar y Mapear Claves de Búsqueda (CRÍTICO)
        filaProcesada.matricula = String(mappedFila.matricula || '').trim();
        filaProcesada.codigo_materia = String(mappedFila.codigo_materia || '').trim();
        filaProcesada.periodo = String(mappedFila.periodo || '').trim();

        if (!filaProcesada.periodo) {
            throw new Error(`PR7.3: El campo 'periodo' no puede estar vacío para la matrícula ${filaProcesada.matricula}.`);
        }
        
        if (!filaProcesada.matricula || !filaProcesada.codigo_materia) {
             throw new Error(`PR7.3: Fila con datos incompletos. 'matricula' o 'codigo_materia' faltantes.`);
        }
        
        // 5. Validar y Mapear Calificaciones
        const notasKeys: Array<keyof CalificacionExcel> = ['ordinario', 'extraordinario', 'final'];
        for (const key of notasKeys) {
            const valor = mappedFila[key]; 
            if (valor !== null && valor !== undefined && valor !== "") {
                const nota = Number(valor);
                if (isNaN(nota) || nota < 0 || nota > 100) {
                    throw new Error(`PR7.3: Calificación inválida en columna '${key}' para matrícula ${filaProcesada.matricula}. Debe ser 0.00 - 100.00.`);
                }
                (filaProcesada as any)[key] = parseFloat(nota.toFixed(2));
            } else {
                (filaProcesada as any)[key] = null;
            }
        }
        
        // 6. Mapear campos de Kardex/Calificación
        filaProcesada.fecha_cierre = mappedFila.fecha_cierre ? String(mappedFila.fecha_cierre).trim() : undefined;
        filaProcesada.estatus_kardex = mappedFila.estatus_kardex ? String(mappedFila.estatus_kardex).trim().toUpperCase() : undefined;
        // Mapeamos comentario aunque no se use en BD para la interfaz de error:
        filaProcesada.comentario = mappedFila.comentario ? String(mappedFila.comentario).trim() : undefined; 

        // Validar formato de fecha YYYY-MM-DD
        const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (filaProcesada.fecha_cierre && !dateFormatRegex.test(filaProcesada.fecha_cierre)) {
            throw new Error(`PR7.3: Formato de fecha inválido ('${filaProcesada.fecha_cierre}') para matrícula ${filaProcesada.matricula}. Debe ser YYYY-MM-DD.`);
        }

        processedData.push(filaProcesada as CalificacionExcel);
    }

    return processedData;
};
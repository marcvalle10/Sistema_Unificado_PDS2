import * as XLSX from 'xlsx';

// Interfaz ampliada para incluir las faltas detectadas
export interface AsistenciaDetectada {
    fecha: string; // "YYYY-MM-DD" para la BD
    tipo: 'FALTA' | 'JUSTIFICACION';
}

interface StudentExcelRow {
    expediente: string;
    nombre?: string;
    asistencias: AsistenciaDetectada[]; 
}

export const parseStudentsFile = (buffer: Buffer): StudentExcelRow[] => {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    // 1. Buscar la fila de cabecera real
    let headerRowIndex = -1;
    for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i];
        if (row.some((cell: any) => String(cell).trim().toLowerCase().includes('expediente'))) {
            headerRowIndex = i;
            break;
        }
    }

    if (headerRowIndex === -1) {
        throw new Error("No se encontró la columna 'Expediente'.");
    }

    // 2. Obtener los encabezados para detectar fechas
    const headers = rawData[headerRowIndex].map(h => String(h).trim());
    
    // Identificar índices de columnas que son fechas de asistencia
    // Buscamos formato "Asistencia (DD-MM-YYYY)" o simplemente "DD-MM-YYYY"
    const dateColumns: { index: number, dateISO: string }[] = [];
    const dateRegex = /(\d{1,2})[-/](\d{1,2})[-/](\d{4})/; // Detecta 27-11-2025 o 27/11/2025

    headers.forEach((header, index) => {
        const match = header.match(dateRegex);
        if (match) {
            // Convertir a formato ISO para la BD: YYYY-MM-DD
            // match[1] = dia, match[2] = mes, match[3] = anio
            const day = match[1].padStart(2, '0');
            const month = match[2].padStart(2, '0');
            const year = match[3];
            dateColumns.push({
                index: index,
                dateISO: `${year}-${month}-${day}`
            });
        }
    });

    // 3. Parsear datos
    const jsonData = XLSX.utils.sheet_to_json(sheet, {
        range: headerRowIndex,
        defval: ""
    });

    const estudiantes: StudentExcelRow[] = [];

    for (const row of jsonData as any[]) {
        // Normalizar claves
        const keys = Object.keys(row);
        const expedienteKey = keys.find(k => k.trim().toLowerCase() === 'expediente');
        const nombreKey = keys.find(k => k.trim().toLowerCase() === 'nombre');

        if (expedienteKey && row[expedienteKey]) {
            const expediente = String(row[expedienteKey]).trim();
            const asistencias: AsistenciaDetectada[] = [];

            //  Revisar las columnas de fecha detectadas
            dateColumns.forEach(col => {
                // Buscamos el valor usando el nombre original del header
                const headerName = headers[col.index];
                const valorCelda = String(row[headerName] || '').trim().toUpperCase();

                // Lógica de interpretación
                if (valorCelda === 'F' || valorCelda === 'X') {
                    asistencias.push({ fecha: col.dateISO, tipo: 'FALTA' });
                } else if (valorCelda === 'J') {
                    asistencias.push({ fecha: col.dateISO, tipo: 'JUSTIFICACION' });
                }
                // Si está vacío o cualquier otra cosa, es asistencia (no se guarda nada)
            });

            estudiantes.push({
                expediente,
                nombre: nombreKey ? String(row[nombreKey]).trim() : undefined,
                asistencias
            });
        }
    }

    return estudiantes;
};
import * as XLSX from 'xlsx';

export interface GradeRow {
    matricula: string; 
    ordinario?: number;
    extraordinario?: number;
    final?: number;
}

export const parseGradesFile = (buffer: Buffer): GradeRow[] => {
    // Leemos el buffer. El parser de XLSX suele detectar CSV automáticamente si el buffer es correcto.
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convertimos todo a JSON crudo (array de arrays)
    const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    // 1. Buscar la fila de encabezados
    // Buscamos filas que tengan "Matricula", "Expediente" o "Nombre"
    let headerRowIndex = -1;
    for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i];
        // Convertimos a string y minúsculas para buscar
        const rowStr = row.map(c => String(c || '').trim().toLowerCase()).join(' ');
        
        if (rowStr.includes('matricula') || rowStr.includes('expediente')) {
            headerRowIndex = i;
            break;
        }
    }

    if (headerRowIndex === -1) {
        // Fallback: Si no encuentra cabeceras claras, intentar leer desde la fila 5 (índice 4) 
        // ya que tu formato siempre empieza ahí.
        if (rawData.length > 4) {
             headerRowIndex = 4; 
        } else {
             throw new Error("No se encontró la fila de encabezados 'Matricula' en el archivo.");
        }
    }

    // 2. Parsear datos desde la fila encontrada
    const jsonData = XLSX.utils.sheet_to_json(sheet, {
        range: headerRowIndex,
        defval: ""
    });

    const calificaciones: GradeRow[] = [];

    for (const row of jsonData as any[]) {
        const keys = Object.keys(row);
        
        // Buscamos las columnas clave ignorando mayúsculas/minúsculas
        const keyMatricula = keys.find(k => k.trim().toLowerCase() === 'matricula');
        const keyExpediente = keys.find(k => k.trim().toLowerCase() === 'expediente');
        
        // Obtenemos el ID y lo limpiamos (importante: convertir a String y trim)
        let idVal = row[keyMatricula || ''] || row[keyExpediente || ''];
        
        if (idVal) {
            const idClean = String(idVal).trim();
            
            // Si el ID está vacío después de limpiar, saltamos
            if (!idClean) continue;

            const gradeData: GradeRow = {
                matricula: idClean, 
            };

            // Función segura para parsear números
            const parseNum = (keyName: string) => {
                const key = keys.find(k => k.trim().toLowerCase() === keyName.toLowerCase());
                if (!key) return undefined;
                
                const val = row[key];
                if (val === "" || val === undefined || val === null) return undefined;
                
                const num = parseFloat(String(val).trim());
                return isNaN(num) ? undefined : num;
            };

            // Mapeamos calificaciones
            gradeData.ordinario = parseNum('Ordinario');
            gradeData.extraordinario = parseNum('Extraordinario');
            gradeData.final = parseNum('Final');

            // Solo agregamos si hay al menos una calificación o si queremos validar al alumno
            // En tu caso, nos interesa actualizar 'final'
            calificaciones.push(gradeData);
        }
    }

    return calificaciones;
};
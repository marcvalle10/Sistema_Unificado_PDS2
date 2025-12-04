// src/app/lib/reports.ts

import { pool } from "@/app/lib/db";

// Constantes basadas en tu requerimiento
const CREDITOS_CARRERA = 393;
const CREDITOS_MINIMOS = Math.ceil(CREDITOS_CARRERA * 0.70); // 276 creditos

// Tipo de dato que devolverá la consulta (PR6.7)
interface EligibleStudent {
    nombre_completo: string;
    matricula: string;
    correo: string;
    creditos_aprobados: number;
    estado_academico: 'ACTIVO' | 'INACTIVO' | 'BAJA' | 'EGRESADO';
    plan_estudio_nombre: string;
    grupo_actual: string;
}

/**
 * PR6.6: Consulta directa que aplica los criterios de elegibilidad.
 */
export async function getEligibleStudents(reportType: 'Practicas Profesionales' | 'Servicio Social'): Promise<EligibleStudent[]> {
    try {
        const query = `
            SELECT
                -- PR6.7: Estructura de datos para vista previa
                a.nombre || ' ' || a.apellido_paterno || ' ' || COALESCE(a.apellido_materno, '') AS nombre_completo,
                a.matricula,
                a.correo,
                a.total_creditos AS creditos_aprobados,
                a.estado_academico,
                pe.nombre AS plan_estudio_nombre,
                (
                    -- Subconsulta para obtener el grupo actual
                    SELECT g.clave_grupo
                    FROM grupo g
                    JOIN inscripcion i ON i.periodo_id = g.periodo_id
                    WHERE i.alumno_id = a.id
                    ORDER BY g.periodo_id DESC
                    LIMIT 1
                ) AS grupo_actual
            FROM
                alumno a
            JOIN
                plan_estudio pe ON pe.id = a.plan_estudio_id
            WHERE
                -- PR6.5 (Criterio 1): Créditos aprobados (usa $2 para CREDITOS_MINIMOS)
                a.total_creditos >= $2 

                -- PR6.5 (Criterio 2): Estatus Académico (usa $1 para reportType)
                AND CASE
                    -- Criterios para Prácticas Profesionales: Estatus ACTIVO ('Regular')
                    WHEN $1 = 'Practicas Profesionales' THEN
                        a.estado_academico = 'ACTIVO'::estado_academico
                    
                    -- Criterios para Servicio Social: Estatus ACTIVO o INACTIVO ('Regular' o 'Con advertencia')
                    WHEN $1 = 'Servicio Social' THEN
                        a.estado_academico IN ('ACTIVO'::estado_academico, 'INACTIVO'::estado_academico)
                    ELSE
                        FALSE
                END
            ORDER BY
                a.apellido_paterno, a.nombre;
        `;

        const result = await pool.query(query, [reportType, CREDITOS_MINIMOS]);
        
        return result.rows as EligibleStudent[];
    } catch (error) {
        console.error(`Error al obtener alumnos elegibles para ${reportType}:`, error);
        throw new Error("Error de base de datos al generar el reporte.");
    }
}
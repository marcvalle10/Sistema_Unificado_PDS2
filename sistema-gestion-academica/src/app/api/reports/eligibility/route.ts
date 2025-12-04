import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/app/lib/db";

type ReportType = 'Practicas Profesionales' | 'Servicio Social';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const reportType = searchParams.get('type') as ReportType | null;

        // Validación del tipo de reporte
        if (!reportType || (reportType !== 'Practicas Profesionales' && reportType !== 'Servicio Social')) {
            return NextResponse.json(
                { error: "Parámetro 'type' inválido." },
                { status: 400 }
            );
        }

        // Definir porcentaje según el tipo (Ejemplo: 70% para ambos, ajustable)
        const porcentajeRequerido = 0.70;

 const query = `
            SELECT 
                a.matricula,
                a.expediente,
                -- 🟢 CAMBIO: Apellidos primero
                TRIM(a.apellido_paterno || ' ' || COALESCE(a.apellido_materno, '') || ' ' || a.nombre) AS nombre_completo,
                a.correo,
                a.total_creditos AS creditos_aprobados,
                a.estado_academico,
                pe.nombre AS plan_estudio_nombre
            FROM alumno a
            JOIN plan_estudio pe ON a.plan_estudio_id = pe.id
            WHERE 
                CAST(a.total_creditos AS NUMERIC) >= (CAST(pe.total_creditos AS NUMERIC) * $1)
                AND a.estado_academico = 'ACTIVO'
            -- Ordenar alfabéticamente
            ORDER BY a.apellido_paterno ASC, a.apellido_materno ASC, a.nombre ASC;
        `;

        const result = await pool.query(query, [porcentajeRequerido]);
        return NextResponse.json(result.rows);
        
    } catch (error) {
        console.error("Error en reporte:", error);
        return NextResponse.json({ error: "Error interno." }, { status: 500 });
    }
}
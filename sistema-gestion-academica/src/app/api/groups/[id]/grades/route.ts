import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/app/lib/db";

// Definimos el tipo de respuesta combinando datos del alumno y su calificación
interface AlumnoGrade {
    expediente: string;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    calificacion: number | null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const query = `
            SELECT 
                a.expediente,
                a.nombre,
                a.apellido_paterno,
                COALESCE(a.apellido_materno, '') as apellido_materno,
                k.calificacion
            FROM alumno a
            LEFT JOIN kardex k ON k.alumno_id = a.id 
                AND k.materia_id = (SELECT materia_id FROM grupo WHERE id = $1)
                AND k.periodo_id = (SELECT periodo_id FROM grupo WHERE id = $1)
            WHERE a.id IN (
                SELECT k2.alumno_id FROM kardex k2 JOIN grupo g ON g.id = $1 WHERE k2.materia_id = g.materia_id AND k2.periodo_id = g.periodo_id
                UNION
                SELECT ag.alumno_id FROM alumno_grupo ag WHERE ag.grupo_id = $1
            )
            ORDER BY a.apellido_paterno ASC, a.apellido_materno ASC, a.nombre ASC;
        `;

        const result = await pool.query(query, [id]);

        const alumnos: AlumnoGrade[] = result.rows.map((row: any) => ({
            expediente: row.expediente,
            nombre: row.nombre,
            apellido_paterno: row.apellido_paterno,
            apellido_materno: row.apellido_materno,
            calificacion: row.calificacion ? Number(row.calificacion) : null
        }));

        return NextResponse.json(alumnos);

    } catch (error) {
        console.error("Error obteniendo calificaciones del grupo:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
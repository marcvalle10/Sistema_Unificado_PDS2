import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/app/lib/db";
import { parseStudentsFile } from "@/app/services/excel-students.service";

export async function POST(req: NextRequest) {
    let client = null;
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const grupoId = formData.get('grupoId') as string;

        if (!file || !grupoId) {
            return NextResponse.json({ error: "Faltan datos." }, { status: 400 });
        }

        // 1. Obtener datos del grupo (para saber materia_id)
        const grupoRes = await pool.query("SELECT materia_id, periodo_id FROM grupo WHERE id = $1", [grupoId]);
        if (grupoRes.rows.length === 0) {
            return NextResponse.json({ error: "Grupo no encontrado." }, { status: 404 });
        }
        const { materia_id } = grupoRes.rows[0];
        // Asumimos un profesor genérico si no viene en sesión, 
        // o podrías pasarlo en el formData si quisieras ser estricto.
        const profesorIdGenerico = 1; 

        // 2. Procesar Excel
        const buffer = Buffer.from(await file.arrayBuffer());
        const alumnosExcel = parseStudentsFile(buffer);

        if (alumnosExcel.length === 0) {
            return NextResponse.json({ error: "No se encontraron alumnos." }, { status: 400 });
        }

        client = await pool.connect();
        await client.query("BEGIN");

        let inscritos = 0;
        let faltasRegistradas = 0;

        for (const al of alumnosExcel) {
            // A. Buscar Alumno
            const resAlumno = await client.query("SELECT id FROM alumno WHERE TRIM(expediente) = $1", [al.expediente]);

            if (resAlumno.rows.length > 0) {
                const alumnoId = resAlumno.rows[0].id;

                // B. Inscribir en grupo (si no estaba)
                const checkExist = await client.query(
                    "SELECT id FROM alumno_grupo WHERE alumno_id = $1 AND grupo_id = $2",
                    [alumnoId, grupoId]
                );

                if (checkExist.rows.length === 0) {
                    await client.query(
                        `INSERT INTO alumno_grupo (alumno_id, grupo_id, fuente, fecha_alta) VALUES ($1, $2, 'EXCEL_PROFESOR', NOW())`,
                        [alumnoId, grupoId]
                    );
                    inscritos++;
                }

                // C. 🟢 Registrar Faltas/Justificaciones detectadas
                for (const asistencia of al.asistencias) {
                    // Verificar si ya existe esa incidencia para no duplicar (mismo alumno, grupo, fecha y tipo)
                    // Usamos fecha truncada (DATE) para comparar
                    const checkIncidencia = await client.query(
                        `SELECT id FROM incidencia 
                         WHERE alumno_id = $1 AND grupo_id = $2 AND date(fecha) = $3`,
                        [alumnoId, grupoId, asistencia.fecha]
                    );

                    if (checkIncidencia.rows.length === 0) {
                        await client.query(
                            `INSERT INTO incidencia (alumno_id, profesor_id, materia_id, grupo_id, tipo, fecha, descripcion)
                             VALUES ($1, $2, $3, $4, $5, $6, 'Carga Masiva Excel')`,
                            [alumnoId, profesorIdGenerico, materia_id, grupoId, asistencia.tipo, asistencia.fecha]
                        );
                        faltasRegistradas++;
                    }
                }
            }
        }

        await client.query("COMMIT");

        return NextResponse.json({
            success: true,
            message: `Proceso completado. Nuevos inscritos: ${inscritos}. Faltas/Justificaciones registradas: ${faltasRegistradas}.`,
        });

    } catch (error: any) {
        if (client) await client.query("ROLLBACK");
        console.error("Error upload:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}
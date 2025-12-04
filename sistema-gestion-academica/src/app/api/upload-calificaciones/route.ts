import { NextRequest, NextResponse } from 'next/server';
import { pool } from "@/app/lib/db";
import { parseGradesFile } from "@/app/services/excel-grades.service";

export async function POST(req: NextRequest) {
    let client = null;
    try {
        const formData = await req.formData();
        const file = formData.get('excel') as File;
        const grupoId = formData.get('grupoId') as string;

        if (!file || !grupoId) return NextResponse.json({ mensaje: 'Faltan datos.' }, { status: 400 });

        // 1. Obtener datos del grupo
        const grupoRes = await pool.query("SELECT materia_id, periodo_id FROM grupo WHERE id = $1", [grupoId]);
        if (grupoRes.rows.length === 0) return NextResponse.json({ mensaje: 'Grupo no encontrado.' }, { status: 404 });
        
        const { materia_id, periodo_id } = grupoRes.rows[0];

        // 2. Procesar Excel
        const buffer = Buffer.from(await file.arrayBuffer());
        // Aquí usamos el nuevo servicio mejorado
        const filas = parseGradesFile(buffer);

        console.log(`Grupo: ${grupoId}, Filas encontradas en Excel: ${filas.length}`); // Log para depurar en servidor

        if (filas.length === 0) {
             return NextResponse.json({ mensaje: 'El archivo parece estar vacío o no se encontraron matrículas.' }, { status: 400 });
        }

        client = await pool.connect();
        await client.query("BEGIN");

        let actualizados = 0;
        const errores = [];

        for (const fila of filas) {
            try {
                // A. Buscar ID del alumno (Buscamos por Matricula O Expediente)
                const resAlumno = await client.query(
                    "SELECT id FROM alumno WHERE TRIM(matricula) = $1 OR TRIM(expediente) = $1",
                    [fila.matricula]
                );

                if (resAlumno.rows.length === 0) {
                    errores.push(`Matrícula/Expediente ${fila.matricula} no existe en la BD.`);
                    continue;
                }
                const alumnoId = resAlumno.rows[0].id;

                // B. Verificar calificación final
                if (fila.final === undefined) {
                    errores.push(`Alumno ${fila.matricula}: Columna 'Final' vacía.`);
                    continue;
                }

                // C. Buscar Kardex existente
                const resKardex = await client.query(
                    "SELECT id FROM kardex WHERE alumno_id=$1 AND materia_id=$2 AND periodo_id=$3",
                    [alumnoId, materia_id, periodo_id]
                );

                let kardexId;
                if (resKardex.rows.length > 0) {
                    kardexId = resKardex.rows[0].id;
                    // Actualizar
                    const estatus = fila.final >= 60 ? 'APROBADO' : 'REPROBADO';
                    await client.query(
                        "UPDATE kardex SET calificacion = $1, estatus = $2, uploadedAt = NOW() WHERE id = $3",
                        [fila.final, estatus, kardexId]
                    );
                    actualizados++;
                } else {
                    // Si no tiene kardex, intentamos crearlo (Inscripción forzosa)
                    const estatus = fila.final >= 60 ? 'APROBADO' : 'REPROBADO';
                    const nuevo = await client.query(
                        `INSERT INTO kardex (alumno_id, materia_id, periodo_id, calificacion, estatus, promedio_kardex, promedio_sem_act)
                         VALUES ($1, $2, $3, $4, $5, 0, 0) RETURNING id`,
                        [alumnoId, materia_id, periodo_id, fila.final, estatus]
                    );
                    kardexId = nuevo.rows[0].id;
                    actualizados++;
                    errores.push(`Alumno ${fila.matricula}: No estaba inscrito, se creó Kardex nuevo.`);
                }

                // D. Actualizar detalle (tabla calificacion)
                // ... (mismo código de antes para detalle)

            } catch (e: any) {
                console.error(e);
                errores.push(`Error sistema con ${fila.matricula}: ${e.message}`);
            }
        }

        await client.query("COMMIT");

        // Devolvemos el reporte completo
        return NextResponse.json({
            mensaje: `Proceso finalizado.`,
            totalActualizados: actualizados,
            totalErrores: errores.length,
            erroresList: errores // El frontend puede mostrar esto
        });

    } catch (err: any) {
        if (client) await client.query("ROLLBACK");
        console.error("Error global upload:", err);
        return NextResponse.json({ mensaje: err.message }, { status: 500 });
    } finally {
        if (client) client.release();
    }
}
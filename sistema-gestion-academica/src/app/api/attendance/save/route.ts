import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { grupoId, profesorId, faltas } = await req.json(); // 'faltas' es un array de IDs de alumnos

    if (!grupoId || !profesorId) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    // Obtener materia_id del grupo
    const grupoRes = await pool.query('SELECT materia_id FROM grupo WHERE id = $1', [grupoId]);
    if (grupoRes.rows.length === 0) {
        return NextResponse.json({ error: 'Grupo no encontrado' }, { status: 404 });
    }
    const materiaId = grupoRes.rows[0].materia_id;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insertar una incidencia tipo 'FALTA' por cada alumno marcado
      for (const alumnoId of faltas) {
        await client.query(
          `INSERT INTO incidencia 
           (alumno_id, profesor_id, materia_id, grupo_id, tipo, fecha, descripcion)
           VALUES ($1, $2, $3, $4, 'FALTA', NOW(), 'Falta injustificada')`,
          [alumnoId, profesorId, materiaId, grupoId]
        );
      }

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    return NextResponse.json({ success: true, message: 'Asistencia guardada correctamente' });

  } catch (error) {
    console.error('Error guardando asistencia:', error);
    return NextResponse.json({ error: 'Error interno al guardar' }, { status: 500 });
  }
}
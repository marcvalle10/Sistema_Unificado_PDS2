import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/app/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // 🟢 Ahora recibimos también 'profesorId'
    const { alumnoId, grupoId, cantidad, motivo, profesorId } = body; 

    if (!alumnoId || !grupoId || !cantidad || !profesorId || cantidad < 1) {
      return NextResponse.json({ error: 'Datos incompletos.' }, { status: 400 });
    }

    const grupoData = await pool.query('SELECT materia_id FROM grupo WHERE id = $1', [grupoId]);
    if (grupoData.rows.length === 0) {
      return NextResponse.json({ error: 'Grupo no encontrado' }, { status: 404 });
    }
    const materiaId = grupoData.rows[0].materia_id;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      for (let i = 0; i < cantidad; i++) {
        await client.query(
          `INSERT INTO incidencia 
           (alumno_id, profesor_id, materia_id, grupo_id, tipo, fecha, descripcion)
           VALUES ($1, $2, $3, $4, 'JUSTIFICACION', NOW(), $5)`,
          [alumnoId, profesorId, materiaId, grupoId, motivo || 'Justificación manual por profesor']
        );
      }

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    return NextResponse.json({ success: true, message: 'Faltas justificadas correctamente' });

  } catch (error) {
    console.error('Error justificando faltas:', error);
    return NextResponse.json({ error: 'Error interno al justificar las faltas' }, { status: 500 });
  }
}
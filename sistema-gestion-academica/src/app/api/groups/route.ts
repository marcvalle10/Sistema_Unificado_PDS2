import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/app/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const profesorId = searchParams.get('profesorId');

    if (!profesorId) {
      return NextResponse.json({ error: "Profesor ID es requerido." }, { status: 400 });
    }

    // Consulta con LEFT JOIN a horario para obtener hora inicio y fin
    // Tomamos el primer horario que encontremos para el grupo (LIMIT 1 en subquery o group by si fuera necesario)
    const query = `
      SELECT 
        g.id,
        g.clave_grupo AS clave,
        m.nombre AS nombre,
        p.etiqueta AS periodo,
        -- Subconsulta simple para obtener un horario formateado
        COALESCE(
          (SELECT TO_CHAR(h.hora_inicio, 'HH:MI am') || ' - ' || TO_CHAR(h.hora_fin, 'HH:MI am')
           FROM horario h WHERE h.grupo_id = g.id LIMIT 1),
          'Horario pendiente'
        ) as horario
      FROM grupo g
      JOIN materia m ON g.materia_id = m.id
      JOIN periodo p ON g.periodo_id = p.id
      JOIN asignacion_profesor ap ON g.id = ap.grupo_id
      WHERE ap.profesor_id = $1
      ORDER BY m.nombre ASC;
    `;

    const result = await pool.query(query, [profesorId]);

    const grupos = result.rows.map((row: any) => ({
      id: String(row.id),
      clave: row.clave,
      nombre: row.nombre,
      periodo: row.periodo,
      horario: row.horario
    }));

    return NextResponse.json(grupos);

  } catch (error) {
    console.error("Error en /api/groups:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
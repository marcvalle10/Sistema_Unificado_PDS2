import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/app/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const expediente = searchParams.get("expediente");
  const periodoId = searchParams.get("periodoId");

  if (!expediente || !periodoId) {
    return NextResponse.json({ error: "Faltan datos." }, { status: 400 });
  }

  try {
    const query = `
      SELECT 
        m.codigo,
        m.nombre as materia,
        m.creditos,
        k.calificacion,
        k.estatus,
        p.etiqueta as periodo_nombre
      FROM kardex k
      JOIN alumno a ON k.alumno_id = a.id
      JOIN materia m ON k.materia_id = m.id
      JOIN periodo p ON k.periodo_id = p.id
      WHERE (TRIM(a.expediente) = $1 OR TRIM(a.matricula) = $1)
        AND k.periodo_id = $2
      ORDER BY m.nombre ASC
    `;

    const result = await pool.query(query, [expediente, periodoId]);
    
    // Devolvemos también datos del alumno para el encabezado (opcional, sacado de la primera fila)
    return NextResponse.json(result.rows);

  } catch (error) {
    console.error("Error buscando calificaciones:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/app/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const grupoId = searchParams.get("grupoId");

  if (!grupoId) return NextResponse.json({ error: "Faltan datos" }, { status: 400 });

  try {
    // Contamos si hay incidencias de tipo 'ASISTENCIA' (si guardas asistencias explícitas)
    // O si hay CUALQUIER registro (faltas/asistencias) para hoy en ese grupo.
    // Asumiremos que el pase de lista genera al menos un registro si alguien faltó, 
    // o deberíamos guardar un registro de "Lista Tomada".
    
    
    const query = `
        SELECT COUNT(*) as registros 
        FROM incidencia 
        WHERE grupo_id = $1 
        AND DATE(fecha) = CURRENT_DATE
        AND (tipo = 'FALTA' OR tipo = 'ASISTENCIA' OR tipo = 'JUSTIFICACION')
    `;
    
    const result = await pool.query(query, [grupoId]);
    const yaTomada = Number(result.rows[0].registros) > 0;

    return NextResponse.json({ yaTomada });

  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
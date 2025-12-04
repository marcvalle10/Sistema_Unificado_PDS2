import { NextResponse } from "next/server";
import { pool } from "@/app/lib/db";

export async function GET() {
  try {
    const query = `
      SELECT id, etiqueta 
      FROM periodo 
      ORDER BY anio DESC, ciclo DESC
    `;
    const result = await pool.query(query);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error obteniendo periodos:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
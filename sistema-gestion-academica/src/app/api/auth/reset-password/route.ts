import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/app/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, codigo, newPassword } = await req.json();

    if (!email || !codigo || !newPassword) {
      return NextResponse.json({ error: "Faltan datos." }, { status: 400 });
    }

    // 1. Validar el código
    const result = await pool.query(
        `SELECT * FROM public.codigos_verificacion 
         WHERE email = $1 AND codigo = $2 AND tipo = 'RECUPERACION'
         AND expira_en > NOW()`, // Que no haya expirado
        [email, codigo]
    );

    if (result.rows.length === 0) {
        return NextResponse.json({ error: "Código inválido o expirado." }, { status: 400 });
    }

    // 2. Encriptar la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // 3. Actualizar contraseña del usuario
        await client.query(
            "UPDATE public.usuario SET password_hash = $1, actualizado_en = NOW() WHERE email = $2",
            [hashedPassword, email]
        );

        // 4. Borrar el código usado para que no se use dos veces
        await client.query(
            "DELETE FROM public.codigos_verificacion WHERE id = $1",
            [result.rows[0].id]
        );

        await client.query("COMMIT");
    } catch (e) {
        await client.query("ROLLBACK");
        throw e;
    } finally {
        client.release();
    }

    return NextResponse.json({ message: "Contraseña actualizada correctamente." });

  } catch (error) {
    console.error("Error en reset-password:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
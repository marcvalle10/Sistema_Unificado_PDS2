// src/app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      email?: string;
      codigo?: string;
      newPassword?: string;
    };

    const { email, codigo, newPassword } = body;

    if (!email || !codigo || !newPassword) {
      return NextResponse.json(
        { error: "Faltan datos (email, código, nueva contraseña)." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres." },
        { status: 400 }
      );
    }

    // 1. Validar el código de verificación
    const codeResult = await pool.query(
      `SELECT id, expira_en 
       FROM public.codigos_verificacion
       WHERE email = $1
         AND codigo = $2
         AND tipo = 'RECUPERACION'
         AND expira_en > NOW()
       ORDER BY creado_en DESC
       LIMIT 1`,
      [email, codigo]
    );

    if (codeResult.rowCount === 0) {
      return NextResponse.json(
        { error: "Código inválido o expirado." },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 2. Actualizar contraseña del usuario
      const passwordHash = await bcrypt.hash(newPassword, 10);

      const updateResult = await client.query(
        `UPDATE public.usuario
         SET password_hash = $1,
             actualizado_en = NOW()
         WHERE email = $2`,
        [passwordHash, email]
      );

      if (updateResult.rowCount === 0) {
        throw new Error("Usuario no encontrado al actualizar contraseña.");
      }

      // 3. Invalidar códigos usados para ese email/tipo
      await client.query(
        `DELETE FROM public.codigos_verificacion
         WHERE email = $1 AND tipo = 'RECUPERACION'`,
        [email]
      );

      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }

    return NextResponse.json({
      message: "Contraseña actualizada correctamente.",
    });
  } catch (error) {
    console.error("Error en reset-password:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}

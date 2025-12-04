// src/app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

function generateCode(): string {
  // Código numérico de 6 dígitos
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string };
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "El correo es obligatorio." },
        { status: 400 }
      );
    }

    // 1. Verificar que el usuario exista
    const userResult = await pool.query(
      `SELECT id, activo FROM public.usuario WHERE email = $1`,
      [email]
    );

    if (userResult.rowCount === 0) {
      // Por seguridad, no revelamos si existe o no
      return NextResponse.json({
        message:
          "Si el correo está registrado, se enviará un código de recuperación.",
      });
    }

    const user = userResult.rows[0];
    if (!user.activo) {
      return NextResponse.json(
        { error: "El usuario está inactivo. Contacta al administrador." },
        { status: 403 }
      );
    }

    const codigo = generateCode();
    const expiraEn = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // 2. Opcional: limpiar códigos previos del mismo tipo
      await client.query(
        `DELETE FROM public.codigos_verificacion 
         WHERE email = $1 AND tipo = 'RECUPERACION'`,
        [email]
      );

      // 3. Insertar nuevo código
      await client.query(
        `INSERT INTO public.codigos_verificacion (email, codigo, tipo, expira_en)
         VALUES ($1, $2, 'RECUPERACION', $3)`,
        [email, codigo, expiraEn]
      );

      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }

    // 4. Simulación de envío de correo (puedes ver el código en logs)
    console.log("========================================");
    console.log(`ENVIANDO CORREO A: ${email}`);
    console.log(`CÓDIGO DE RECUPERACIÓN: ${codigo}`);
    console.log("========================================");

    return NextResponse.json({
      message:
        "Si el correo está registrado, se ha enviado un código de recuperación.",
    });
  } catch (error) {
    console.error("Error en forgot-password:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}

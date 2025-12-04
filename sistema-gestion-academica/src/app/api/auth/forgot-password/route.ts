import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/app/lib/db";

// Función para generar un código numérico de 6 dígitos
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "El correo es obligatorio." }, { status: 400 });
    }

    // 1. Verificar si el usuario existe
    const userCheck = await pool.query("SELECT id FROM public.usuario WHERE email = $1", [email]);
    
    if (userCheck.rows.length === 0) {
      // Por seguridad, a veces se responde "Si el correo existe, se envió un código" 
      // para no revelar qué correos están registrados. Pero para desarrollo, puedes devolver error.
      return NextResponse.json({ error: "El correo no está registrado." }, { status: 404 });
    }

    // 2. Generar código y fecha de expiración (15 minutos)
    const codigo = generateCode();
    const expiraEn = new Date(Date.now() + 15 * 60 * 1000); // Ahora + 15 min

    // 3. Guardar en la tabla codigos_verificacion (Borramos anteriores del mismo tipo para ese email)
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        
        // Limpiar códigos viejos
        await client.query("DELETE FROM public.codigos_verificacion WHERE email = $1 AND tipo = 'RECUPERACION'", [email]);
        
        // Insertar nuevo
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

    // 4. ENVÍO DE CORREO (Simulación)
    // Como usas Auth custom, lo simulamos en consola:
    console.log("========================================");
    console.log(`ENVIANDO CORREO A: ${email}`);
    console.log(`CÓDIGO DE RECUPERACIÓN: ${codigo}`);
    console.log("========================================");

    return NextResponse.json({ message: "Código enviado correctamente." });

  } catch (error) {
    console.error("Error en forgot-password:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
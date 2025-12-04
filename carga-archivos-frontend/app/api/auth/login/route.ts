// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";

type DbUserRow = {
  usuario_id: number;
  email: string;
  password_hash: string;
  activo: boolean;
  profesor_id: number | null;
  nombre: string | null;
  apellido_paterno: string | null;
  apellido_materno: string | null;
  roles: string[] | null;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Correo y contraseña obligatorios." },
        { status: 400 }
      );
    }

    // 1. Buscar usuario, sus datos de profesor y sus roles
    const query = `
      SELECT
        u.id AS usuario_id,
        u.email,
        u.password_hash,
        u.activo,
        p.id AS profesor_id,
        p.nombre,
        p.apellido_paterno,
        p.apellido_materno,
        ARRAY_REMOVE(ARRAY_AGG(r.nombre), NULL) AS roles
      FROM public.usuario u
      LEFT JOIN public.profesor p ON p.usuario_id = u.id
      LEFT JOIN public.usuario_rol ur ON ur.usuario_id = u.id
      LEFT JOIN public.rol r ON r.id = ur.rol_id
      WHERE u.email = $1
      GROUP BY u.id, p.id, p.nombre, p.apellido_paterno, p.apellido_materno
      LIMIT 1;
    `;

    const result = await pool.query<DbUserRow>(query, [email]);

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Usuario o contraseña incorrectos." },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    if (!user.activo) {
      return NextResponse.json(
        { error: "Tu usuario está inactivo. Contacta al administrador." },
        { status: 403 }
      );
    }

    // 2. Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return NextResponse.json(
        { error: "Usuario o contraseña incorrectos." },
        { status: 401 }
      );
    }

    const roles = (user.roles ?? []).filter(Boolean);
    const allowedRoles = roles.filter((r) =>
      ["ADMINISTRADOR", "COORDINADOR"].includes(r.toUpperCase())
    );

    // 3. Validar que tenga rol permitido para Carga de Archivos
    if (allowedRoles.length === 0) {
      return NextResponse.json(
        {
          error:
            "No tienes permisos para acceder al módulo de Carga de Archivos.",
          roles,
        },
        { status: 403 }
      );
    }

    const nombreCompleto = [user.nombre, user.apellido_paterno, user.apellido_materno]
      .filter(Boolean)
      .join(" ")
      .trim();

    return NextResponse.json({
      message: "Bienvenido",
      user: {
        id: user.usuario_id,
        profesorId: user.profesor_id,
        email: user.email,
        nombre: nombreCompleto || user.email,
        roles,
        appRoles: allowedRoles, // roles válidos para este front
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}

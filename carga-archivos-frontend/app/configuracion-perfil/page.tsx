"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UniversityHeaderOnly } from "@/components/shared";

const USER_STORAGE_KEY = "userData";

type AuthUser = {
  id?: number;
  profesorId?: number | null;
  email: string;
  nombre?: string;
  roles?: string[];
  appRoles?: string[];
};

function getInitials(nombre?: string, email?: string): string {
  if (nombre && nombre.trim().length > 0) {
    const parts = nombre.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const second = parts[1]?.[0] ?? "";
    return (first + second).toUpperCase();
  }
  if (email) {
    return email[0].toUpperCase();
  }
  return "US";
}

export default function ConfiguracionPerfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(USER_STORAGE_KEY);
      if (!raw) {
        router.replace("/login");
        return;
      }

      const parsed = JSON.parse(raw) as AuthUser | null;
      if (!parsed || !parsed.email) {
        window.localStorage.removeItem(USER_STORAGE_KEY);
        router.replace("/login");
        return;
      }

      setUser(parsed);
    } catch (err) {
      console.error("Error leyendo userData en perfil:", err);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(USER_STORAGE_KEY);
      }
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#EDE9FF]">
        <p className="text-sm text-gray-600">
          Cargando información de perfil...
        </p>
      </main>
    );
  }

  const initials = getInitials(user.nombre, user.email);
  const primaryRole =
    user.appRoles?.[0] ?? user.roles?.[0] ?? "Administrador";

  const allRoles =
    user.appRoles?.length || user.roles?.length
      ? [...new Set([...(user.appRoles ?? []), ...(user.roles ?? [])])].join(
          ", "
        )
      : primaryRole;

  return (
    <div className="px-3 sm:px-6 lg:px-[90px] pt-2 bg-[#EDE9FF]">
      <div
        className="min-h-screen"
        style={{ background: "linear-gradient(to bottom, #e8e4ff, #f3f0ff)" }}
      >
        {/* Header institucional reutilizado */}
        <UniversityHeaderOnly />

        {/* Contenedor principal del módulo de perfil */}
        <main className="w-full px-3 sm:px-6 lg:px-[80px] mt-8 mb-12">
          <section className="bg-white rounded-3xl shadow-md p-6 md:p-8">
            {/* Fila superior: botón regresar */}
            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="px-4 py-2 text-xs sm:text-sm font-medium rounded-full bg-[#16469B] text-white hover:bg-[#123670] transition-colors"
              >
                Regresar al inicio
              </button>
            </div>

            {/* Bloque principal: avatar + info personal */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Avatar grande */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-[#16469B] flex items-center justify-center text-white text-4xl md:text-5xl font-semibold shadow-md">
                  {initials}
                </div>
                <button
                  type="button"
                  className="text-xs md:text-sm text-gray-600 hover:text-blue-600 transition flex items-center gap-1"
                >
                  Cambiar foto de perfil
                </button>
              </div>

              {/* Información personal */}
              <div className="flex-1 w-full md:w-auto">
                <h2
                  className="text-xl font-bold mb-4 border-b-2 pb-1"
                  style={{ borderColor: "#16469B", color: "#16469B" }}
                >
                  Información Personal
                </h2>

                <div className="space-y-1 text-gray-700 font-sans pl-1 md:pl-2">
                  <p className="font-semibold uppercase text-xs text-[#16469B]">
                    Universidad de Sonora
                  </p>

                  <p>
                    Nombre:{" "}
                    <span className="font-medium">
                      {user.nombre ?? "Sin nombre"}
                    </span>
                  </p>
                  <p>
                    ID usuario:{" "}
                    <span className="font-medium">{user.id ?? "—"}</span>
                  </p>
                  <p>
                    Correo institucional:{" "}
                    <span className="font-medium">{user.email}</span>
                  </p>
                  <p>
                    Rol principal:{" "}
                    <span className="font-medium">{primaryRole}</span>
                  </p>
                  <p>
                    Roles en el sistema:{" "}
                    <span className="font-medium">{allRoles}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Separador */}
            <hr className="my-8 border-gray-200" />

            {/* Bloque de seguridad de cuenta */}
            <section>
              <h2
                className="text-xl font-bold mb-4 border-b-2 pb-1"
                style={{ borderColor: "#16469B", color: "#16469B" }}
              >
                Seguridad de Cuenta
              </h2>

              <p className="text-sm text-gray-700">
                Última fecha/hora de inicio de sesión:{" "}
                <span className="font-medium">
                  (dato aún no registrado en este módulo)
                </span>
              </p>

              <button
                type="button"
                onClick={() => router.push("/recuperar-contrasena")}
                className="mt-4 inline-flex items-center text-sm text-[#16469B] hover:underline"
              >
                Cambiar contraseña
              </button>
            </section>
          </section>
        </main>
      </div>
    </div>
  );
}

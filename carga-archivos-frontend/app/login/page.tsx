"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui";

const USER_STORAGE_KEY = "userData"; // clave de localStorage compartida

const AMARILLO_FONDO = "#E6A425";
const AZUL_TEXTO = "#16469B";

type LoginResponse = {
  message: string;
  user: {
    id: number;
    profesorId: number | null;
    email: string;
    nombre: string;
    roles: string[];
    appRoles: string[]; // ADMINISTRADOR / COORDINADOR válidos para este front
  };
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Por favor ingresa correo y contraseña.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse | { error?: string } = await res.json();

      if (!res.ok) {
        const msg =
          "error" in data && data.error
            ? data.error
            : "Error al iniciar sesión.";
        setError(msg);
        setLoading(false);
        return;
      }

      const { user } = data as LoginResponse;

      // Guardar usuario en localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      }

      // Redirigir al dashboard principal (MainApplication en "/")
      router.push("/");
    } catch (err) {
      console.error("Error en login:", err);
      setError("Ocurrió un error inesperado. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const goToRecover = () => {
    router.push("/recuperar-contrasena");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: AMARILLO_FONDO }}
    >
      <div className="w-full max-w-md bg-white shadow-2xl rounded-3xl p-8 relative">
        {/* Logo y encabezado institucional (igual estilo que login de profesores) */}
        <div className="text-center mb-6">
          <div className="relative w-24 h-24 mx-auto mb-2">
            <Image
              src="/logounison.png"
              alt="Universidad de Sonora"
              fill
              className="object-contain"
            />
          </div>
          <h1 className="text-lg font-semibold" style={{ color: AZUL_TEXTO }}>
            UNIVERSIDAD DE SONORA
          </h1>
          <p className="font-serif italic text-xs" style={{ color: AZUL_TEXTO }}>
            “El Saber de mis Hijos hará mi Grandeza”
          </p>
          <p className="text-xs text-gray-600 mt-2">
            Sistema de Carga de Archivos
          </p>
        </div>

        {/* Título del formulario */}
        <div className="text-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800 mt-2">
            Iniciar sesión
          </h2>
        </div>

        {/* Mensaje de error */}
        {error && (
          <p className="mb-4 text-red-500 text-sm flex items-center bg-red-50 p-2 rounded-xl border border-red-100">
            <span className="text-xl mr-2">●</span>
            {error}
          </p>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Correo institucional
            </label>
            <input
              type="email"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#16469B]"
              placeholder="tucorreo@unison.mx"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#16469B]"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <div className="flex justify-end text-xs mt-1">
            <button
              type="button"
              onClick={goToRecover}
              className="text-[#16469B] hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full justify-center bg-yellow-600 hover:bg-yellow-700"
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

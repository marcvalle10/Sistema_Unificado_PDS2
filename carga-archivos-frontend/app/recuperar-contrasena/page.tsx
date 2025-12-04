"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui";

type Step = "request" | "reset" | "success";

export default function RecoverPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("request");

  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!email) {
      setError("Por favor ingresa tu correo institucional.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = (await res.json()) as { message?: string; error?: string };

      if (!res.ok) {
        setError(data.error || "No se pudo generar el código.");
      } else {
        setInfo(
          data.message ||
            "Si el correo está registrado, se ha enviado un código de recuperación."
        );
        setStep("reset");
      }
    } catch (err) {
      console.error("Error en forgot-password:", err);
      setError("Ocurrió un error inesperado. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!email || !codigo || !newPassword) {
      setError("Completa todos los campos.");
      return;
    }

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, codigo, newPassword }),
      });

      const data = (await res.json()) as { message?: string; error?: string };

      if (!res.ok) {
        setError(data.error || "No se pudo actualizar la contraseña.");
      } else {
        setInfo(data.message || "Contraseña actualizada correctamente.");
        setStep("success");
      }
    } catch (err) {
      console.error("Error en reset-password:", err);
      setError("Ocurrió un error inesperado. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 relative">
      {/* Fondo amarillo tipo login de profesores */}
      <div className="absolute inset-0 bg-[#E6A425] z-0" />

      {/* Card principal */}
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden z-10 p-8 relative">
        {/* Encabezado con logo UNISON */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 relative mb-3">
            <Image
              src="/logounison.png"
              alt="Logo Unison"
              fill
              className="object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold text-[#16469B]">
            Recuperar cuenta
          </h2>
          <p className="text-xs text-gray-600 mt-1 text-center">
            Sistema de Carga de Archivos — División de Ingeniería
          </p>
        </div>

        {/* Mensajes de error / info */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        {info && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded">
            {info}
          </div>
        )}

        {/* PASO 1: Solicitar código */}
        {step === "request" && (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <p className="text-gray-600 text-sm text-center mb-2">
              Ingresa tu correo institucional. Te enviaremos un código de
              verificación para restablecer tu contraseña.
            </p>

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

            <Button
              type="submit"
              disabled={loading}
              className="w-full justify-center bg-[#16469B] hover:bg-[#0D1D4B]"
            >
              {loading ? "Enviando código..." : "Enviar código de recuperación"}
            </Button>

            <button
              type="button"
              onClick={goToLogin}
              className="w-full text-center text-xs text-gray-500 hover:text-[#16469B] mt-3"
            >
              Cancelar y volver al inicio de sesión
            </button>
          </form>
        )}

        {/* PASO 2: Ingresar código + nueva contraseña */}
        {step === "reset" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg text-blue-800 text-xs mb-2 text-center">
              Hemos enviado un código de 6 dígitos a{" "}
              <strong>{email}</strong>. <br />
              (Revisa también la bandeja de spam)
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Código de verificación
              </label>
              <input
                type="text"
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#16469B]"
                placeholder="Código de 6 dígitos"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Nueva contraseña
              </label>
              <input
                type="password"
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#16469B]"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full justify-center bg-[#16469B] hover:bg-[#0D1D4B]"
            >
              {loading ? "Actualizando contraseña..." : "Actualizar contraseña"}
            </Button>

            <button
              type="button"
              onClick={goToLogin}
              className="w-full text-center text-xs text-gray-500 hover:text-[#16469B] mt-3"
            >
              Cancelar y volver al inicio de sesión
            </button>
          </form>
        )}

        {/* PASO 3: Éxito */}
        {step === "success" && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              ¡Contraseña actualizada!
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              Tu contraseña ha sido modificada correctamente. Ya puedes iniciar
              sesión con tus nuevas credenciales.
            </p>
            <Button
              type="button"
              onClick={goToLogin}
              className="w-full justify-center bg-[#E6B10F] text-white hover:bg-yellow-600"
            >
              Ir al inicio de sesión
            </Button>
          </div>
        )}

        {/* Link fijo al login (extra) */}
        <div className="flex justify-center mt-4">
          <button
            type="button"
            onClick={goToLogin}
            className="text-xs text-gray-500 hover:text-[#16469B] hover:underline"
          >
            Regresar al inicio de sesión
          </button>
        </div>
      </div>
    </div>
  );
}

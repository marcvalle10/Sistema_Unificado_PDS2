"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import InputField from "@/components/ui/InputField"; // Reutilizamos tu componente
import Button from "@/components/ui/Button";         // Reutilizamos tu componente

const AZUL_FONDO = "#16469B";
const DORADO = "#E6B10F";

export default function RecuperarContrasenaPage() {
  const router = useRouter();
  
  // Estados del flujo
  const [step, setStep] = useState<'EMAIL' | 'NEW_PASSWORD' | 'SUCCESS'>('EMAIL');
  
  // Datos del formulario
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Estados de UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // --- PASO 1: ENVIAR CÓDIGO ---
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error al enviar código");

      // Si todo bien, pasamos al siguiente paso
      setStep("NEW_PASSWORD");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- PASO 2: VERIFICAR CÓDIGO Y CAMBIAR PASSWORD ---
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (newPassword.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres.");
        return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, codigo, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error al actualizar contraseña");

      setStep("SUCCESS");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      {/* Fondo decorativo opcional */}
      <div className="absolute inset-0 bg-[#E6A425] z-0" />

      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden z-10 p-8 relative">
        
        {/* Encabezado */}
        <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 relative mb-3">
                <Image src="/logounison.png" alt="Logo Unison" fill className="object-contain" />
            </div>
            <h2 className="text-2xl font-bold text-[#16469B]">Recuperar Cuenta</h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        {/* --- FORMULARIO 1: SOLICITAR EMAIL --- */}
        {step === 'EMAIL' && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <p className="text-gray-600 text-sm text-center mb-4">
              Ingresa tu correo institucional. Te enviaremos un código de verificación.
            </p>
            
            <InputField 
                label="Correo Institucional" 
                type="email" 
                value={email} 
                onChange={(e: any) => setEmail(e.target.value)} 
                required
            />

            <Button type="submit" isLoading={isLoading} className="bg-[#16469B] hover:bg-[#0D1D4B]">
              Enviar Código
            </Button>
            
            <button 
                type="button" 
                onClick={() => router.push('/')}
                className="w-full text-center text-sm text-gray-500 hover:text-[#16469B] mt-4"
            >
                Cancelar y volver al login
            </button>
          </form>
        )}

        {/* --- FORMULARIO 2: INGRESAR CÓDIGO Y NUEVA CLAVE --- */}
        {step === 'NEW_PASSWORD' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg text-blue-800 text-xs mb-4 text-center">
                Se ha enviado un código a <strong>{email}</strong>
                <br/>(Revisa la consola del servidor si estás en local)
            </div>

            <InputField 
                label="Código de Verificación (6 dígitos)" 
                type="text" 
                value={codigo} 
                onChange={(e: any) => setCodigo(e.target.value)} 
                maxLength={6}
                required
            />

            <InputField 
                label="Nueva Contraseña" 
                type="password" 
                value={newPassword} 
                onChange={(e: any) => setNewPassword(e.target.value)} 
                required
            />

            <InputField 
                label="Confirmar Contraseña" 
                type="password" 
                value={confirmPassword} 
                onChange={(e: any) => setConfirmPassword(e.target.value)} 
                required
            />

            <Button type="submit" isLoading={isLoading} className="bg-[#16469B] hover:bg-[#0D1D4B]">
              Actualizar Contraseña
            </Button>
          </form>
        )}

        {/* --- ESTADO 3: ÉXITO --- */}
        {step === 'SUCCESS' && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">¡Contraseña Actualizada!</h3>
            <p className="text-gray-600 text-sm mb-6">
                Tu contraseña ha sido modificada correctamente. Ya puedes iniciar sesión con tu nueva credencial.
            </p>
            <Button onClick={() => router.push('/')} className="bg-[#E6B10F] text-white hover:bg-yellow-600">
                Ir al Login
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
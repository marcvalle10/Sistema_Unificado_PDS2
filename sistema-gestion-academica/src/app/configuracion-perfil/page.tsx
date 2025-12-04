"use client";

import { useState, useMemo, useEffect } from "react";
// Importaciones de componentes de UI
import ImageAdjustmentPage from "../../components/ui/ImageAdjustmentPage";
import ImageUploadAndAdjustModal from "../../components/ui/ImageUploadAndAdjustModal";
// Importación del nuevo modal de éxito
import SuccessConfirmationModal from "../../components/ui/SuccessConfirmationModal";

// NOTA: Si SectionTitle no existe en el proyecto, esta definición lo simula.
const SectionTitle = ({ title }: { title: string }) => (
    <h2 className="text-xl font-bold mb-4 border-b-2 pb-1" style={{ borderColor: "#16469B", color: "#16469B" }}>
        {title}
    </h2>
);

// Colores institucionales
const AZUL_MARINO = "#16469B";
const GRIS_CLARO = "#D8D8D8";

// Estado inicial por defecto (mientras carga o si no hay datos)
const InitialUserProfile = {
    nombre: "Cargando...",
    clave: "---",
    email: "---",
    puesto: "Maestro de tiempo completo", // Dato simulado (no viene en el login básico)
    campus: "Hermosillo", // Dato simulado
    phone: "6622000000", // Dato editable
};

export default function PerfilPage() {
  // 📸 ESTADOS DE IMAGEN
  const [tempFile, setTempFile] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPhotoPending, setIsPhotoPending] = useState(false);

  // ESTADOS DEL MODAL DE ÉXITO
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  //  ESTADO DEL PERFIL (Datos del usuario)
  const [userProfile, setUserProfile] = useState(InitialUserProfile);

  // Edición de Teléfono
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [draftPhone, setDraftPhone] = useState(""); // Se inicializa en el useEffect

  // Edición de Contraseña
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 1️EFECTO: CARGAR DATOS DEL USUARIO LOGUEADO
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          // Actualizamos el perfil con los datos reales de la sesión
          setUserProfile((prev) => ({
            ...prev,
            nombre: userData.nombre || "Usuario Invitado",
            email: userData.email || "correo@unison.mx",
            // Si el login devolviera 'profesorId' o 'clave', úsalo aquí:
            clave: userData.profesorId ? String(userData.profesorId) : "889977", 
            phone: prev.phone // Mantenemos el teléfono local o mock por ahora
          }));
          // Inicializamos el borrador del teléfono
          setDraftPhone(InitialUserProfile.phone);
        } catch (e) {
          console.error("Error al leer usuario:", e);
        }
      }
    }
  }, []);

  // Actualizar draftPhone cuando userProfile cambie (por la carga inicial)
  useEffect(() => {
      setDraftPhone(userProfile.phone);
  }, [userProfile.phone]);


  // Lógica para detectar si hay cambios sin guardar
  const hasPhoneChanged = draftPhone !== userProfile.phone;

  // Validación de formulario de contraseña
  const isPasswordFormValid = isEditingPassword && currentPassword && newPassword && confirmPassword && (newPassword === confirmPassword) && newPassword.length >= 6;

  // Determina si se debe mostrar el bloque de guardar cambios global (Confirmar/Cancelar)
  const hasUnsavedChanges = useMemo(() => {
    return hasPhoneChanged || isPhotoPending;
  }, [hasPhoneChanged, isPhotoPending]);


  // --- MANEJO DE LA FOTO DE PERFIL ---

  const handleFileSelected = (file: File) => {
    setTempFile(file);
    setIsModalOpen(false);
  };

  const handleSavePhoto = (finalFile: File) => {
    setTempFile(null);
    setIsPhotoPending(true);
  };

  const handleCancelAdjustment = () => {
    setTempFile(null);
  };


  // --- MANEJO DEL FORMULARIO DE CONTRASEÑA ---

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordFormValid) return;

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsEditingPassword(false);

    setSuccessMessage("La contraseña ha sido actualizada con éxito.");
    setIsSuccessModalOpen(true);
  };

  // Lógica de guardar (Confirmar cambios)
  const handleSaveChanges = () => {
    let successMsg = "Cambios guardados con éxito.";

    if (hasPhoneChanged) {
        setUserProfile(prev => ({ ...prev, phone: draftPhone }));
    }

    if (isPhotoPending) {
        successMsg = "Los cambios de perfil y la foto se han guardado con éxito.";
    }

    setIsPhotoPending(false);
    setIsEditingPhone(false);

    setSuccessMessage(successMsg);
    setIsSuccessModalOpen(true);
  };

  // Lógica de cancelar (Descartar cambios)
  const handleDiscardChanges = () => {
    setDraftPhone(userProfile.phone);
    setIsEditingPhone(false);
    setIsPhotoPending(false);
    setTempFile(null);
    setIsModalOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsEditingPassword(false);
  };

  // RENDERIZADO CONDICIONAL 1: Ajuste de Imagen
  if (tempFile) {
    return (
      <ImageAdjustmentPage
        file={tempFile}
        onSave={handleSavePhoto}
        onCancel={handleCancelAdjustment}
      />
    );
  }

  // --- Renderizado de la Vista de Perfil ---
  return (
    <div className="py-8 px-4 md:px-8 max-w-6xl mx-auto">

      {/* Modal de Carga de Imagen */}
      <ImageUploadAndAdjustModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onFileSelected={handleFileSelected}
      />

      {/* Modal de Éxito */}
      <SuccessConfirmationModal
          isOpen={isSuccessModalOpen}
          onClose={() => setIsSuccessModalOpen(false)}
          title="Actualización Completa"
          message={successMessage}
      />

      {/* Contenedor de Información Personal */}
      <div className="flex flex-col md:flex-row gap-12 items-start">

        {/* Foto de Perfil */}
        <div className="flex flex-col items-center w-full md:w-auto">
          <div
            className="w-40 h-40 rounded-full flex items-center justify-center mb-2 shadow-md"
            style={{ backgroundColor: AZUL_MARINO }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="white"
              className="w-24 h-24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="text-sm text-gray-600 hover:text-blue-600 transition flex items-center gap-1 mt-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Cambiar foto de perfil {isPhotoPending && <span className="text-red-500 text-xs">(Pendiente)</span>}
          </button>
        </div>

        {/*Detalles de Información Personal (DINÁMICO) */}
        <div className="flex-grow w-full md:w-auto">
          <SectionTitle title="Información Personal" />
          <div className="space-y-1 text-gray-700 font-sans pl-2">
            <p className="font-semibold uppercase text-xs" style={{ color: AZUL_MARINO }}>Universidad de Sonora</p>
            
            {/* Aquí usamos los datos del estado */}
            <p>Nombre: <span className="font-medium">{userProfile.nombre}</span></p>
            <p>Clave: <span className="font-medium">{userProfile.clave}</span></p>
            <p>Correo institucional: <span className="font-medium">{userProfile.email}</span></p>
            <p>Puesto: <span className="font-medium">{userProfile.puesto}</span></p>
            <p>Campus: <span className="font-medium">{userProfile.campus}</span></p>

            {/* Campo de Teléfono Editable */}
            <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                Teléfono de trabajo:

                {isEditingPhone ? (
                    <>
                        <input
                            type="tel"
                            value={draftPhone}
                            onChange={(e) => setDraftPhone(e.target.value)}
                            className={`font-medium border ${hasPhoneChanged ? 'border-yellow-500' : 'border-gray-300'} rounded px-1 w-32`}
                        />
                        {hasPhoneChanged && (
                            <button onClick={() => { setIsEditingPhone(false); setDraftPhone(userProfile.phone); }} className="text-sm text-red-500 hover:text-red-700 transition">
                                ✕
                            </button>
                        )}
                    </>
                ) : (
                    <span className={`font-medium ${hasPhoneChanged ? 'text-yellow-700' : 'text-blue-600'}`}>{userProfile.phone}</span>
                )}

                {!isEditingPhone && (
                    <button onClick={() => setIsEditingPhone(true)} className="text-sm text-gray-600 hover:text-blue-600 transition flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                )}
            </div>

          </div>
        </div>
      </div>

      <hr className="my-8" />

      {/*Seguridad de Cuenta */}
      <div className="mt-8">
        <SectionTitle title="Seguridad de Cuenta" />
        <div className="space-y-2 text-gray-700 font-sans pl-2">
            {/* La fecha podría ser también dinámica en un futuro, por ahora es estática según diseño */}
            <p className="text-sm">Última fecha/hora de inicio de sesión: <span className="font-medium">14/09/2025 a las 15:59 hrs.</span></p>

            <div className="flex flex-col">
                <button
                    onClick={() => setIsEditingPassword(prev => !prev)}
                    className="text-sm text-gray-600 hover:text-blue-600 transition flex items-center gap-1 w-fit"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    Cambiar contraseña
                </button>

                {isEditingPassword && (
                    <form onSubmit={handleUpdatePassword} className="mt-4 space-y-3 p-4 max-w-lg bg-gray-50 rounded-md border border-gray-200">
                        <div className="flex items-center">
                            <label className="w-1/3 text-sm font-medium text-gray-700">Contraseña actual:</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-2/3 p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm"
                                required
                            />
                        </div>

                        <div className="flex items-center">
                            <label className="w-1/3 text-sm font-medium text-gray-700">Contraseña nueva:</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className={`w-2/3 p-2 border rounded text-sm focus:ring-blue-500 ${newPassword.length > 0 && newPassword.length < 6 ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500`}
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="flex items-center">
                            <label className="w-1/3 text-sm font-medium text-gray-700">Confirmar:</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`w-2/3 p-2 border rounded text-sm focus:ring-blue-500 ${confirmPassword && newPassword !== confirmPassword ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500`}
                                required
                            />
                        </div>

                        <div className="flex justify-end pt-2 gap-2">
                             <button
                                type="button"
                                onClick={() => setIsEditingPassword(false)}
                                className="px-3 py-1.5 rounded text-gray-600 text-sm hover:bg-gray-200 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={!isPasswordFormValid}
                                className={`px-3 py-1.5 rounded text-white text-sm transition ${isPasswordFormValid ? 'hover:opacity-90' : 'opacity-50 cursor-not-allowed'}`}
                                style={{ backgroundColor: AZUL_MARINO }}
                            >
                                Actualizar
                            </button>
                        </div>

                        {(newPassword.length > 0 && newPassword.length < 6) && (
                            <p className="text-red-500 text-xs mt-1">La nueva contraseña debe tener al menos 6 caracteres.</p>
                        )}
                        {(confirmPassword && newPassword !== confirmPassword) && (
                            <p className="text-red-500 text-xs mt-1">La confirmación no coincide con la nueva contraseña.</p>
                        )}
                    </form>
                )}
            </div>
        </div>
      </div>

      {hasUnsavedChanges && (
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-2xl border-t border-gray-200 flex justify-end items-center z-50">
            <div className="mr-8 text-gray-700 font-medium text-sm">
                ¿Desea guardar los cambios realizados?
            </div>
            <button
                onClick={handleDiscardChanges}
                className={`px-6 py-2 rounded font-medium text-gray-700 hover:bg-gray-200 transition mr-3`}
                style={{ backgroundColor: GRIS_CLARO }}
            >
                Cancelar
            </button>
            <button
                onClick={handleSaveChanges}
                className={`px-6 py-2 rounded font-medium text-white transition hover:opacity-90`}
                style={{ backgroundColor: AZUL_MARINO }}
            >
                Confirmar
            </button>
        </div>
      )}

    </div>
  );
}
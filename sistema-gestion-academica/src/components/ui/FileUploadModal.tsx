"use client";

import { useState, useRef } from 'react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  // Esta función ahora activa la vista de ajuste, no la subida final
  onFileSelect: (file: File) => void;
};

// Colores institucionales
const AZUL_MARINO = "#16469B";
const GRIS_CLARO = "#D8D8D8";

export default function FileUploadModal({ isOpen, onClose, onFileSelect }: ModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (!isOpen) return null;

  // Lógica para abrir el explorador de archivos
  const openFileExplorer = () => {
    fileInputRef.current?.click();
  };

  // Manejador cuando se selecciona un archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
        // Al seleccionar un archivo, pasamos el control al componente padre
        onFileSelect(file);
        // Cerramos el modal inmediatamente
        onClose();
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Limpia el input
    }
    onClose();
  };

  return (
    // Overlay (Forzado a z-index muy alto para que cubra todo)
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-70">

      {/* Contenedor del Modal */}
      <div className="bg-white rounded-lg shadow-2xl w-[600px] overflow-hidden relative z-[1001]">

        {/* 🖼️ Contenido del Modal */}
        <div className="p-8 text-center" style={{ minHeight: '300px' }}>
          <p className="text-xl font-semibold mb-6" style={{ color: AZUL_MARINO }}>
            Seleccionar Nueva Foto de Perfil
          </p>

          {/* Área de Selección de Archivo */}
          <div className="bg-gray-100 border-2 border-dashed border-gray-400 p-12 flex flex-col justify-center items-center h-40">

            {/* Input de archivo oculto */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden" // Ocultamos completamente el input
            />

            {/* Texto de la funcionalidad */}
            <p className="text-gray-500 font-medium mb-4">
                Haz clic para seleccionar una imagen (JPEG, PNG).
            </p>

            {/* Botón que invoca el input file, ahora es la acción principal */}
            <button
                onClick={openFileExplorer}
                className={`px-6 py-2 rounded font-medium text-white transition hover:opacity-90`}
                style={{ backgroundColor: AZUL_MARINO }}
            >
                Seleccionar Archivo
            </button>

          </div>

        </div>

        {/* 🔽 Botones de Acción (Pie del modal) */}
        <div className="flex justify-end p-4 border-t border-gray-200 bg-gray-50 z-[1002]">
          <button
            onClick={handleCancel}
            className={`px-6 py-2 rounded font-medium text-gray-700 hover:bg-gray-200 transition mr-3`}
            style={{ backgroundColor: GRIS_CLARO }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
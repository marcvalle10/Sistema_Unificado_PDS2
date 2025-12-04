"use client";

import { useRef } from 'react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  // Esta función recibirá el archivo cuando sea seleccionado
  onFileSelected: (file: File) => void;
};

// Colores institucionales
const AZUL_MARINO = "#16469B";
const GRIS_CLARO = "#D8D8D8";

export default function ImageUploadAndAdjustModal({ isOpen, onClose, onFileSelected }: ModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Lógica para abrir el explorador de archivos al hacer clic en 'Aceptar'
  const openFileExplorer = () => {
    // Usamos el ref para simular el clic en el input de tipo file
    fileInputRef.current?.click();
  };

  // Manejador cuando se selecciona un archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
        onFileSelected(file); // 👈 **Notifica el archivo seleccionado al componente padre**
        // Nota: onClose() se llama en el padre (configuracion-perfil) después de recibir el archivo

        // Limpia el input para permitir seleccionar el mismo archivo de nuevo si es necesario
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
  };

  const handleCancel = () => {
    if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Limpia el input
    }
    onClose(); // Cierra el modal
  };

  return (
    // Overlay (z-index alto para asegurar visibilidad)
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-70">

      {/* Contenedor del Modal */}
      <div className="bg-white rounded-lg shadow-2xl w-[450px] overflow-hidden relative z-[1001]">

        {/* Contenido del Modal */}
        <div className="p-8 text-center flex flex-col items-center justify-center" style={{ minHeight: '250px' }}>

          {/* 🚨 Este es el bloque modificado para mostrar el texto descriptivo */}
          <p className="text-xl font-semibold mb-6 text-gray-700 p-8">
            (Se abre explorador de archivos
            <br />
            para seleccionar e importar foto)
          </p>

          {/* Input de archivo oculto que se activará con el botón */}
          <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden" // Es crucial que este input esté oculto
          />
        </div>

        {/* Botones de Acción */}
        <div className="flex justify-end p-4 border-t border-gray-200 bg-gray-50 z-[1002]">
          <button
            onClick={handleCancel}
            className={`px-6 py-2 rounded font-medium text-gray-700 hover:bg-gray-200 transition mr-3`}
            style={{ backgroundColor: GRIS_CLARO }}
          >
            Cancelar
          </button>
          <button
            onClick={openFileExplorer} // Este botón ahora abre el explorador
            className={`px-6 py-2 rounded font-medium text-white transition hover:opacity-90`}
            style={{ backgroundColor: AZUL_MARINO }}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
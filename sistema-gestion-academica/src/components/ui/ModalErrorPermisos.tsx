"use client";

interface ModalErrorPermisosProps {
  onClose: () => void;
}

export default function ModalErrorPermisos({ onClose }: ModalErrorPermisosProps) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-[380px] p-6 relative">
        {/* Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        {/* Encabezado */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-red-600 text-lg">!</span>
          </div>
          <h3 className="text-lg font-semibold text-[#16469B]">
            Error de permisos
          </h3>
        </div>

        {/* Mensaje */}
        <p className="text-[#16469B] text-sm mb-6">
          El expediente es válido, pero no tiene los permisos para consultarlo.
        </p>

        {/* Botón */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-[#16469B] px-4 py-2 rounded-md text-sm transition"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}

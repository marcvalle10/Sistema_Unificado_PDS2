"use client";

interface ModalConfirmacionProps {
  onClose: () => void;
}

export default function ModalConfirmacion({ onClose }: ModalConfirmacionProps) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-[350px] p-6 relative">
        {/* Botón de cierre */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        {/* Encabezado: icono + título */}
        <div className="flex items-center gap-3 mb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="green"
            className="w-7 h-7"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <h3 className="text-lg font-semibold text-[#16469B]">
            Asistencia realizada
          </h3>
        </div>

        {/* Mensaje */}
        <p className="text-[#16469B] text-sm mb-6">
          La toma de asistencia se ha realizado exitosamente.
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

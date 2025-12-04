"use client";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
};

// Colores institucionales
const AZUL_MARINO = "#16469B";

export default function SuccessConfirmationModal({ isOpen, onClose, title, message }: ModalProps) {
  if (!isOpen) return null;

  return (
    // Overlay (z-index alto para asegurar visibilidad)
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm" onClick={onClose}>

      {/* Contenedor del Modal */}
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden relative z-[1001]"
        onClick={(e) => e.stopPropagation()} // Evita que el clic en el modal cierre el modal
      >

        {/* Encabezado */}
        <div className="flex justify-between items-center p-4" style={{ backgroundColor: AZUL_MARINO }}>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition"
                aria-label="Cerrar"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        {/* Contenido del Modal */}
        <div className="p-8 text-center flex flex-col items-center justify-center">

          {/* Icono de Verificación grande */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={AZUL_MARINO} className="w-16 h-16 mb-4">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.843l-5.087 7.05-2.585-3.05a.75.75 0 10-1.116.94l3.18 3.75a.75.75 0 001.12-.032l5.63-7.814z" clipRule="evenodd" />
          </svg>

          {/* Mensaje descriptivo */}
          <p className="text-gray-700 text-lg mb-6">
            {message}
          </p>
        </div>

        {/* Botones de Acción */}
        <div className="flex justify-center p-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
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
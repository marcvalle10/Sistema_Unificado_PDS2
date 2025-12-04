"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface FileUploadProps {
  // Eliminamos los props viejos que solo controlaban estado visual
  // Agregamos los que necesitamos para la lógica real
  grupoId: string;
  onUploadSuccess?: () => void;
}

export default function FileUpload({ grupoId, onUploadSuccess }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const router = useRouter();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Permitir Excel y CSV
      if (!selectedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
        setMessage({ type: 'error', text: 'Formato no válido. Usa Excel (.xlsx) o CSV.' });
        return;
      }
      setFile(selectedFile);
      setMessage(null);
    }
  };

  const handleConfirmUpload = async () => {
    if (!file || !grupoId) return;

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('grupoId', grupoId);

      // Llamada a la API que creamos en el paso 2
      const res = await fetch('/api/groups/upload-students', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Error al subir archivo");

      setMessage({ type: 'success', text: result.message });
      
      // Éxito: Esperar un momento y ejecutar la acción siguiente
      setTimeout(() => {
          setFile(null);
          if (onUploadSuccess) {
              onUploadSuccess();
          } else {
              router.push('/inicio');
          }
      }, 2000);

    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setMessage(null);
  };

  return (
    <div className="max-w-[700px] mx-auto flex flex-col items-center font-sans">
      
      {/* Mensajes de feedback */}
      {message && (
        <div className={`w-full p-4 mb-6 rounded-md text-center border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {message.text}
        </div>
      )}

      {!file ? (
        // VISTA 1: Seleccionar Archivo
        <div className="w-full flex flex-col items-center">
          <div 
            className="border-2 border-dashed border-[#16469B]/40 rounded-xl p-12 text-center w-full max-w-[500px] hover:bg-blue-50/50 transition cursor-pointer"
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <div className="flex flex-col items-center justify-center gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-[#16469B]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <p className="text-[#16469B] font-semibold text-lg">Cargar lista de alumnos</p>
                <p className="text-gray-500 text-sm mt-1">Soporta archivos .xlsx, .xls</p>
              </div>
              <span className="bg-[#16469B] text-white py-2 px-6 rounded-lg text-sm font-medium mt-2 shadow-sm hover:bg-[#0D1D4B] transition">
                Seleccionar Archivo
              </span>
            </div>
            <input
              id="file-input"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>
      ) : (
        // VISTA 2: Confirmar Carga
        <div className="w-full max-w-[500px] bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-[#16469B] font-bold mb-6 text-lg border-b pb-2">Confirmar archivo</h3>
          
          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg mb-8 border border-gray-200">
            <div className="bg-green-100 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <div className="overflow-hidden">
                <p className="font-semibold text-gray-800 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={handleCancel}
              className="px-5 py-2.5 rounded-lg text-gray-600 font-medium hover:bg-gray-100 transition"
              disabled={uploading}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmUpload}
              disabled={uploading}
              className="bg-[#16469B] hover:bg-[#0D1D4B] text-white px-6 py-2.5 rounded-lg font-medium shadow-md transition flex items-center gap-2 disabled:opacity-70"
            >
              {uploading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Procesando...
                  </>
              ) : "Subir Alumnos"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
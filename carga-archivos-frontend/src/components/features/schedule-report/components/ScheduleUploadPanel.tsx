import React, { useState, ChangeEvent, DragEvent } from "react";

interface Props {
  setIsiFile: (f: File | null) => void;
  setPreFile: (f: File | null) => void;
  onUpload: () => void;
}

export default function ScheduleUploadPanel({
  setIsiFile,
  setPreFile,
  onUpload,
}: Props) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) {
      setSelectedFiles([]);
      setIsiFile(null);
      setPreFile(null);
      return;
    }

    const arr = Array.from(files);
    setSelectedFiles(arr);

    // Primer archivo → ISI, segundo → Prelistas (si existe)
    setIsiFile(arr[0] ?? null);
    setPreFile(arr[1] ?? null);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="border border-[#16469B] rounded-lg p-6 bg-white shadow-sm">
      <h4 className="text-base font-semibold text-[#16469B] mb-4">
        Cargar archivo(s) de horarios
      </h4>

      <div
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl px-4 py-8 transition-colors ${
          dragActive
            ? "border-[#0C3A5B] bg-blue-50/40"
            : "border-gray-300 bg-gray-50/40"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <svg
          className="w-10 h-10 text-[#0C3A5B] mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v12m0 0l-4-4m4 4l4-4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
          />
        </svg>

        <p className="text-sm text-gray-700 text-center">
          Arrastra y suelta tus archivos aquí
          <br />
          <span className="font-semibold">o haz clic para seleccionarlos</span>
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Se permiten 1 o 2 archivos .xlsx / .xls (ISI y/o Prelistas)
        </p>

        <input
          type="file"
          multiple
          accept=".xlsx,.xls"
          onChange={handleChange}
          className="mt-4 text-sm"
        />

        {/* Lista de archivos seleccionados */}
        <div className="mt-4 w-full">
          {selectedFiles.length === 0 ? (
            <p className="text-xs text-gray-500 text-center">
              Ningún archivo seleccionado.
            </p>
          ) : (
            <ul className="text-xs text-gray-700 space-y-1">
              {selectedFiles.map((file, idx) => (
                <li key={idx} className="flex justify-between">
                  <span className="truncate max-w-[70%]">{file.name}</span>
                  <span className="ml-2 text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Botón Subir */}
        <button
          type="button"
          onClick={onUpload}
          className="mt-6 px-8 py-2 rounded-3xl bg-[#0C3A5B] text-white text-sm font-semibold hover:bg-[#06263B]"
        >
          Subir
        </button>
      </div>
    </div>
  );
}

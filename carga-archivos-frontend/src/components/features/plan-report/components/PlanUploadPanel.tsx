import React, { useState, ChangeEvent, DragEvent } from "react";

interface Props {
  setFile: (f: File | null) => void;
  onUpload: () => void;
  loading?: boolean;
}

export default function PlanUploadPanel({
  setFile,
  onUpload,
  loading = false,
}: Props) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      alert("Solo se aceptan archivos PDF de planes de estudio.");
      return;
    }

    setSelectedFile(file);
    setFile(file);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      alert("Solo se aceptan archivos PDF de planes de estudio.");
      return;
    }

    setSelectedFile(file);
    setFile(file);
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-dashed border-gray-300 p-6 flex flex-col items-center justify-center text-center">
      <div
        className={`w-full max-w-xl border-2 border-dashed rounded-2xl p-8 mx-auto transition-colors ${
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center">
          <svg
            className="w-12 h-12 mb-3 text-[#16469B]"
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

          <p className="text-sm text-gray-700">
            Arrastra y suelta el PDF del <strong>plan de estudios</strong> aquí
            <br />
            <span className="font-semibold">o haz clic para seleccionarlo</span>
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Solo se admite un archivo <strong>.pdf</strong> por carga.
          </p>

          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleChange}
            className="mt-4 text-sm"
          />

          {selectedFile && (
            <p className="mt-3 text-xs text-gray-600">
              Archivo seleccionado:{" "}
              <span className="font-medium">{selectedFile.name}</span>
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onUpload}
          disabled={!selectedFile || loading}
          className="mt-6 px-8 py-2 rounded-3xl bg-[#0C3A5B] text-white text-sm font-semibold hover:bg-[#06263B] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Procesando..." : "Subir y procesar"}
        </button>
      </div>
    </div>
  );
}

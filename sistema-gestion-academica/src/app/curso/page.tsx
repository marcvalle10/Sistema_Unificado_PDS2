"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import FileUpload from "@/components/ui/FileUpload";

function CursoContent() {
  const searchParams = useSearchParams();
  const grupoId = searchParams.get('grupoId');
  const router = useRouter();

  if (!grupoId) {
      return <div className="p-10 text-red-500">Error: No se especificó el grupo. Vuelva al inicio.</div>;
  }

  return (
    <div className="p-10 max-w-4xl mx-auto">
      {/* Título principal */}
      <h2
        className="text-2xl font-sans font-bold text-[#16469B] mb-2"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        Cargar Lista de Asistencia
      </h2>
      
      <p className="text-gray-600 mb-8 text-[15px] leading-relaxed">
         Sube el archivo Excel con la lista oficial de alumnos para asignarlos al <strong>Grupo {grupoId}</strong>.
         El sistema detectará automáticamente los expedientes.
      </p>

      {/* Componente de carga */}
      <FileUpload 
        grupoId={grupoId} 
        onUploadSuccess={() => {
            // Al terminar, redirigir a la vista de información para ver la lista ya cargada
            router.push(`/curso/informacion?grupoId=${grupoId}`);
        }}
      />
    </div>
  );
}

export default function CursoPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center">Cargando...</div>}>
            <CursoContent />
        </Suspense>
    );
}
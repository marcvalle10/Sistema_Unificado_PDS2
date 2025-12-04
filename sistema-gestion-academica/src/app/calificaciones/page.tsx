// src/app/calificaciones/page.tsx
'use client';

import { useRouter } from 'next/navigation';

export default function CalificacionesPage() {
  const router = useRouter();

  // Redirigimos automáticamente a "consultar-calificaciones"
  router.push('/calificaciones/consultar-calificaciones');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">Redirigiendo a Consultar Calificaciones...</p>
    </div>
  );
}
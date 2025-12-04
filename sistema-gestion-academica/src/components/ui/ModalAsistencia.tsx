"use client";

import { useState, useEffect } from "react";

interface Alumno {
  id: number;
  expediente: string;
  nombreCompleto: string;
}

interface ModalAsistenciaProps {
  onClose: () => void;
  onConfirm: () => void;
  alumnos: Alumno[];
  grupoId: string;
  profesorId: string;
}

export default function ModalAsistencia({ onClose, onConfirm, alumnos, grupoId, profesorId }: ModalAsistenciaProps) {
  // Inicializamos asumiendo que todos asisten
  const [asistencias, setAsistencias] = useState<Record<number, boolean>>(
    alumnos.reduce((acc, curr) => ({ ...acc, [curr.id]: true }), {})
  );
  
  const [isSaving, setIsSaving] = useState(false);
  const [yaTomadaHoy, setYaTomadaHoy] = useState(false); // Estado de bloqueo
  const [checking, setChecking] = useState(true);

  // Fecha formateada para mostrar
  const fechaHoy = new Date().toLocaleDateString('es-MX', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // 1. Verificar si ya se tomó lista hoy al abrir el modal
  useEffect(() => {
    const checkStatus = async () => {
        try {
            const res = await fetch(`/api/attendance/check-status?grupoId=${grupoId}`);
            const data = await res.json();
            if (data.yaTomada) {
                setYaTomadaHoy(true);
            }
        } catch (e) {
            console.error("Error verificando estatus", e);
        } finally {
            setChecking(false);
        }
    };
    checkStatus();
  }, [grupoId]);

  const toggle = (id: number) => {
    if (yaTomadaHoy) return; // Bloquear cambios si ya se tomó
    setAsistencias(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleGuardar = async () => {
    setIsSaving(true);
    const faltas = alumnos.filter(a => asistencias[a.id] === false).map(a => a.id);

    try {
        const res = await fetch('/api/attendance/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ grupoId, profesorId, faltas })
        });

        if (!res.ok) throw new Error("Error al guardar");
        onConfirm(); 
    } catch (error) {
        alert("Error al guardar.");
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 backdrop-blur-sm">
      <div className="bg-white w-[800px] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Encabezado con Fecha */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-[#F5F7FA]">
          <div>
              <h3 className="text-xl font-bold text-[#16469B]">Pase de Lista</h3>
              {/* 🟢 Muestra la fecha del día */}
              <p className="text-sm text-gray-600 capitalize">{fechaHoy}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Aviso de Bloqueo */}
        {yaTomadaHoy && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mx-6 mt-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-amber-700">
                            <strong>Aviso:</strong> Ya se ha registrado actividad de asistencia para este grupo el día de hoy. 
                            El pase de lista está bloqueado para evitar duplicados. Si necesitas corregir, usa la opción de justificar o modifica el Excel.
                        </p>
                    </div>
                </div>
            </div>
        )}

        {/* Tabla */}
        <div className="px-6 py-4 flex-1 overflow-y-auto">
          {checking ? (
              <p className="text-center py-10 text-gray-500">Verificando fecha...</p>
          ) : (
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-100 text-gray-600 sticky top-0 shadow-sm z-10">
                  <tr>
                    <th className="px-4 py-3 text-left rounded-tl-lg">Expediente</th>
                    <th className="px-4 py-3 text-left">Alumno</th>
                    <th className="px-4 py-3 text-center rounded-tr-lg">Asistencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {alumnos.map((alumno, i) => (
                    <tr key={alumno.id} className={`hover:bg-blue-50 transition ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                      <td className="px-4 py-3 font-mono text-blue-600 font-medium">{alumno.expediente}</td>
                      <td className="px-4 py-3 text-gray-800">{alumno.nombreCompleto}</td>
                      <td className="px-4 py-3 text-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={asistencias[alumno.id] ?? true} 
                                onChange={() => toggle(alumno.id)}
                                disabled={yaTomadaHoy} // 🟢 Deshabilitado si ya se tomó
                                className="sr-only peer"
                            />
                            <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${yaTomadaHoy ? 'opacity-50 cursor-not-allowed' : 'peer-checked:bg-[#16469B]'}`}></div>
                            <span className="ml-3 text-xs font-medium text-gray-500">
                                {asistencias[alumno.id] ? 'Presente' : 'Falta'}
                            </span>
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
            <button 
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition shadow-sm"
            >
                Cancelar
            </button>
            {!yaTomadaHoy && (
                <button
                  onClick={handleGuardar}
                  disabled={isSaving || checking}
                  className="px-6 py-2 bg-[#16469B] text-white font-semibold rounded-lg hover:bg-[#0D1D4B] transition shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? "Guardando..." : "Confirmar Asistencia"}
                </button>
            )}
        </div>
      </div>
    </div>
  );
}
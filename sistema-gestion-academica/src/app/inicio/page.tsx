"use client";

import { useState, useEffect } from "react";
import SectionTitle from "@/components/ui/SectionTitle";
import Checkbox from "@/components/ui/Checkbox";
import CardMateria from "@/components/ui/CardMateria";
import dynamic from "next/dynamic";

// CORRECCIÓN ROBUSTA:
// 1. Usamos .then para devolver 'default as any' (satisface la carga dinámica).
// 2. Casteamos el resultado final a 'any' (satisface el uso en el JSX).
const DatePicker = dynamic(
  () => import("react-datepicker").then((mod) => mod.default as any),
  { ssr: false }
) as any;

import "react-datepicker/dist/react-datepicker.css";
import "@/app/globals.css";

// Definimos la interfaz del Grupo que viene de la API
interface Grupo {
  id: string;
  clave: string;
  nombre: string;
  periodo: string;
  horario: string;
}

export default function InicioPage() {
  const [nombreProfesor, setNombreProfesor] = useState<string>("");
  const [grupos, setGrupos] = useState<Grupo[]>([]); // Estado para grupos reales
  const [loadingGrupos, setLoadingGrupos] = useState(true);

  // Mocks de avisos (se pueden dejar así por ahora)
  const [avisos, setAvisos] = useState([
    { id: 1, texto: "Alerta por faltas - Revisar expedientes", checked: true },
    { id: 2, texto: "Subir calificaciones parciales", checked: false },
  ]);
  const [fecha, setFecha] = useState<Date | null>(new Date());

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStored = localStorage.getItem("user");
      
      if (userStored) {
        try {
          const userObj = JSON.parse(userStored);
          setNombreProfesor(userObj.nombre || "Usuario");

          // FETCH DE GRUPOS REALES
          if (userObj.profesorId) {
            fetch(`/api/groups?profesorId=${userObj.profesorId}`)
              .then(res => res.json())
              .then(data => {
                if (Array.isArray(data)) {
                  setGrupos(data);
                }
              })
              .catch(err => console.error("Error cargando grupos:", err))
              .finally(() => setLoadingGrupos(false));
          }
        } catch (error) {
          console.error("Error al leer datos del usuario:", error);
        }
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-white p-8 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-10 relative">
        <div className="absolute top-[3.5rem] left-0 right-0 h-[2px] bg-[#16469B] -z-0 opacity-20 md:opacity-100" />

        <div className="flex-1 z-10">
          <div className="bg-white pr-4 inline-block mb-8">
            <h2 className="text-2xl md:text-3xl font-sans text-[#16469B] font-semibold">
                Bienvenido Prof. {nombreProfesor || "..."}
            </h2>
          </div>

          {/* Avisos */}
          <div className="mt-4">
              <SectionTitle title="Nuevos Avisos Importantes" />
              <div className="bg-[#F0F0F0] p-6 rounded-lg shadow-inner mb-10 max-h-60 overflow-y-auto border border-gray-200">
                {avisos.map((aviso) => (
                  <div key={aviso.id} className="-mb-2">
                      <Checkbox
                          label={aviso.texto}
                          checked={aviso.checked}
                          onChange={() => setAvisos(prev => prev.map(a => a.id === aviso.id ? { ...a, checked: !a.checked } : a))}
                      />
                  </div>
                ))}
              </div>
          </div>

          <div className="h-[1px] bg-[#16469B] w-full my-8 opacity-30 md:hidden" />

          {/* Sección de Materias (REAL) */}
          <div>
            <div className="flex items-baseline justify-between mb-4">
                <SectionTitle title="Materias Actuales" />
                {grupos.length > 0 && (
                  <p className="text-sm text-[#16469B] font-bold bg-blue-50 px-3 py-1 rounded-full">
                      {grupos[0].periodo}
                  </p>
                )}
            </div>

            {loadingGrupos ? (
              <p className="text-gray-500">Cargando materias asignadas...</p>
            ) : grupos.length === 0 ? (
              <p className="text-gray-500 italic">No tiene grupos asignados este periodo.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {grupos.map((g) => (
                    <CardMateria
                        key={g.id}
                        id={g.id}
                        grupo={g.clave} // Usamos la clave del grupo (ej: 01, 02)
                        materia={g.nombre}
                        clave="UNISON" // O puedes mapear g.clave si la tienes
                        horario={g.horario}
                    />
                  ))}
              </div>
            )}

            <p className="text-sm text-gray-500 mt-6 italic flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Seleccione un grupo para ver lista de alumnos y tomar asistencia
            </p>
          </div>
        </div>

        {/* Calendario */}
        <div className="md:w-[300px] mt-8 md:mt-14 flex flex-col items-center md:items-end z-10">
          <div className="sticky top-10 bg-white p-2 rounded-xl shadow-lg border border-gray-100">
            <h4 className="text-[#16469B] font-bold text-center mb-2">Calendario Escolar</h4>
            <div className="custom-datepicker-wrapper">
                <DatePicker selected={fecha} onChange={(date: Date | null) => setFecha(date)} inline />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
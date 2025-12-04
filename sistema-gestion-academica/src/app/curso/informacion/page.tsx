"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ModalAsistencia from "@/components/ui/ModalAsistencia";
import ModalConfirmacion from "@/components/ui/ModalConfirmacion";
import * as XLSX from 'xlsx'; 
import { UploadCloud, Download } from "lucide-react";

interface AlumnoInfo {
  id: number;
  expediente: string;
  matricula: string;
  nombreCompleto: string;
  correo: string;
  estadoAcademico: string;
  faltas: number;
  permitidas: string;
  promedio: number | string;
}

// Nueva interfaz para los detalles del encabezado
interface GroupDetails {
  materia: string;
  grupo: string;
  aula: string;
  horario: string;
}

function CursoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const grupoId = searchParams.get("grupoId");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [alumnos, setAlumnos] = useState<AlumnoInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profesorId, setProfesorId] = useState<string>("");
  
  // Estado para guardar los detalles del encabezado
  const [groupDetails, setGroupDetails] = useState<GroupDetails | null>(null);

  // 1. Fetch de Alumnos (Existente)
  const fetchAlumnos = async () => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
        setError("No hay sesión activa.");
        setLoading(false);
        return;
    }
    
    const user = JSON.parse(storedUser);
    setProfesorId(user.profesorId);

    try {
      setLoading(true);
      const res = await fetch(`/api/student-groups?grupoId=${grupoId}&profesorId=${user.profesorId}`);
      
      if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Error al cargar alumnos");
      }
      
      const data = await res.json();
      
      const alumnosMapeados = data.map((a: any) => ({
          ...a,
          faltas: Number(a.faltas) || 0,
          permitidas: `${Number(a.faltas) || 0}/14`,
          promedio: 0
      }));
      
      setAlumnos(alumnosMapeados);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Nuevo Fetch para Detalles del Grupo (Encabezado)
  const fetchGroupDetails = async () => {
    try {
      const res = await fetch(`/api/groups/${grupoId}/details`);
      if (res.ok) {
        const data = await res.json();
        setGroupDetails(data);
      }
    } catch (e) {
      console.error("Error cargando detalles del grupo", e);
    }
  };

  useEffect(() => {
    if (grupoId) {
        fetchAlumnos();
        fetchGroupDetails(); // Llamamos al nuevo fetch
    }
  }, [grupoId]);

  const handleConfirmarAsistencia = () => {
    setIsModalOpen(false);
    setIsConfirmOpen(true);
    fetchAlumnos();
  };

  // 3. Función de Descarga Actualizada (Con Encabezado)
  const handleDescargarLista = () => {
    if (alumnos.length === 0) return;

    // Obtener mes actual en español y mayúsculas
    const fechaObj = new Date();
    const mesActual = fechaObj.toLocaleString('es-MX', { month: 'long' }).toUpperCase();
    const fechaHoy = fechaObj.toLocaleDateString('es-MX');

    // Preparar los datos de la tabla (FILAS DE ALUMNOS)
    const datosTabla = alumnos.map(a => ({
        Expediente: a.expediente,
        Nombre: a.nombreCompleto,
        "Correo Institucional": a.correo,
        "Faltas Acumuladas": a.faltas,
        [`Asistencia (${fechaHoy})`]: "", 
        "Observaciones": ""
    }));

    // Crear libro de trabajo vacío
    const workbook = XLSX.utils.book_new();

    // Crear hoja vacía
    const worksheet = XLSX.utils.json_to_sheet([]); 

    // --- A. AGREGAR ENCABEZADOS (Filas A1, A2, A3) ---
    // Usamos 'aoa_to_sheet' (Array of Arrays) para escribir celdas específicas al inicio
    const encabezados = [
        [`Lista de Asistencia del mes de ${mesActual}`], // A1
        [`Materia: ${groupDetails?.materia || ''}   Grupo: ${groupDetails?.grupo || ''}   Lugar: ${groupDetails?.aula || ''}`], // A2
        [`${groupDetails?.horario || ''}`], // A3
        [""] // A4 (Espacio vacío)
    ];

    // Escribimos los encabezados empezando en A1
    XLSX.utils.sheet_add_aoa(worksheet, encabezados, { origin: "A1" });

    // --- B. AGREGAR TABLA DE ALUMNOS ---
    // Escribimos la tabla empezando en la fila A5 (origin: "A5")
    XLSX.utils.sheet_add_json(worksheet, datosTabla, { origin: "A5" });

    // Ajustar anchos de columna (opcional)
    worksheet['!cols'] = [
        { wch: 15 }, // Expediente
        { wch: 40 }, // Nombre
        { wch: 30 }, // Correo
        { wch: 15 }, // Faltas
        { wch: 20 }, // Asistencia
        { wch: 30 }  // Observaciones
    ];

    // Guardar
    XLSX.utils.book_append_sheet(workbook, worksheet, "Lista");
    XLSX.writeFile(workbook, `Lista_${groupDetails?.materia.split(' ')[0]}_${mesActual}.xlsx`);
  };

  if (!grupoId) return <div className="p-10 text-red-500">Error: Grupo no especificado.</div>;

  return (
    <div className="p-10 font-sans text-[#16469B]">
      {/* Encabezado Visual en la Página */}
      <div className="flex flex-col gap-1 mb-6">
        <h2 className="text-2xl font-bold">Información del curso</h2>
        {groupDetails && (
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200 mt-2">
                <p><strong>Materia:</strong> {groupDetails.materia} &nbsp;|&nbsp; <strong>Grupo:</strong> {groupDetails.grupo}</p>
                <p><strong>Horario:</strong> {groupDetails.horario.replace('Horario: ', '')} &nbsp;|&nbsp; <strong>Aula:</strong> {groupDetails.aula}</p>
            </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md border border-red-200">
            {error}
        </div>
      )}

      {/* Botonera */}
      <div className="flex justify-end gap-3 mb-4 flex-wrap">
        <button
          onClick={handleDescargarLista}
          disabled={loading || alumnos.length === 0}
          className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 font-semibold px-4 py-2 rounded transition shadow-sm disabled:opacity-50"
        >
          <Download size={18} />
          Descargar Lista
        </button>

        <button
          onClick={() => router.push(`/curso?grupoId=${grupoId}`)}
          className="flex items-center gap-2 bg-white text-[#16469B] hover:bg-gray-50 font-semibold px-4 py-2 rounded transition border border-[#16469B]"
        >
          <UploadCloud size={18} />
          {alumnos.length === 0 ? "Cargar Lista Inicial" : "Actualizar / Agregar Alumnos"}
        </button>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#16469B] hover:bg-[#E6B10F] text-white font-semibold px-4 py-2 rounded transition shadow-md disabled:opacity-50"
          disabled={loading || alumnos.length === 0}
        >
          Pase de lista (Web)
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200">
        <table className="min-w-full text-sm text-center border-collapse">
          <thead>
            <tr className="bg-[#E6E6E6] text-[#16469B] font-semibold">
              <th className="py-3 px-4">Expediente</th>
              <th className="py-3 px-4 text-left">Nombre</th>
              <th className="py-3 px-4">Faltas</th>
              <th className="py-3 px-4">Faltas Permitidas</th>
              <th className="py-3 px-4">Promedio</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
                <tr><td colSpan={5} className="py-8 text-gray-500">Cargando alumnos...</td></tr>
            ) : alumnos.length === 0 && !error ? (
                <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400">
                        No hay alumnos inscritos. Carga la lista inicial.
                    </td>
                </tr>
            ) : (
                alumnos.map((a, index) => (
                <tr key={a.expediente} className={`border-t ${index % 2 === 0 ? "bg-white" : "bg-[#F3F3F3]"}`}>
                    <td 
                        className="py-3 px-4 text-blue-700 hover:text-[#E6B10F] cursor-pointer font-medium"
                        onClick={() => router.push(`/alumno/${a.expediente}`)}
                    >
                        {a.expediente}
                    </td>
                    <td className="py-3 px-4 text-left text-gray-800">{a.nombreCompleto}</td>
                    <td className="py-3 px-4 flex items-center justify-center gap-2">
                        <span className={`inline-block w-3 h-3 rounded-full ${a.faltas === 0 ? "bg-green-500" : a.faltas <= 4 ? "bg-yellow-400" : "bg-red-500"}`}></span>
                        {a.faltas}
                    </td>
                    <td className="py-3 px-4 text-gray-700">{a.permitidas}</td>
                    <td className="py-3 px-4 font-semibold text-gray-700">{a.promedio}</td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      <button onClick={() => router.back()} className="mt-6 bg-[#BFBFBF] text-[#16469B] font-semibold px-6 py-2 rounded hover:opacity-90">
        Atrás
      </button>

      {isModalOpen && (
        <ModalAsistencia
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmarAsistencia}
          alumnos={alumnos}
          grupoId={grupoId}
          profesorId={profesorId}
        />
      )}
      {isConfirmOpen && <ModalConfirmacion onClose={() => setIsConfirmOpen(false)} />}
    </div>
  );
}

export default function InformacionCursoPage() {
    return (
        <Suspense fallback={<div className="p-10">Cargando...</div>}>
            <CursoContent />
        </Suspense>
    );
}
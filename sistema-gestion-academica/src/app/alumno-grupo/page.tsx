'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import { Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation'; // Importar hook de params

interface Grupo { 
    id: string;
    clave: string; 
    nombre: string; 
}

interface AlumnoGrupo {
    expediente: string;
    matricula: string;
    nombreCompleto: string;
    correo: string;
    estadoAcademico: string;
}

// Componente interno que usa useSearchParams (necesario para Suspense)
function AlumnosContent() {
    const searchParams = useSearchParams();
    const grupoIdParam = searchParams.get('grupoId'); // Obtener ID de la URL

    const [grupos, setGrupos] = useState<Grupo[]>([]);
    const [grupoId, setGrupoId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingGrupos, setIsLoadingGrupos] = useState(true);
    const [alumnos, setAlumnos] = useState<AlumnoGrupo[]>([]);
    const [filtroTexto, setFiltroTexto] = useState<string>('');
    const [hasConsultado, setHasConsultado] = useState(false);

    // 1. Cargar grupos
    useEffect(() => {
        const fetchGrupos = async () => {
            try {
                const res = await fetch('/api/groups'); 
                const data: Grupo[] = await res.json();
                setGrupos(data);
                
                // Lógica de selección inicial
                if (grupoIdParam) {
                    // Si viene de la redirección, usamos ese ID
                    setGrupoId(grupoIdParam);
                    // Activamos la bandera para que el useEffect de abajo dispare la consulta
                    setHasConsultado(true); 
                } else if (data.length > 0) {
                    setGrupoId(data[0].id);
                }
            } catch (e) {
                console.error("Error al cargar grupos", e);
            } finally {
                setIsLoadingGrupos(false);
            }
        };
        fetchGrupos();
    }, [grupoIdParam]);

    // 2. Función consultar (API)
    const consultar = async (id: string) => {
        if (!id) return;
        
        setIsLoading(true);
        setAlumnos([]);
        try {
            const res = await fetch(`/api/student-groups?grupoId=${id}`);
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Error al cargar datos.');
            }
            const data: AlumnoGrupo[] = await res.json();
            setAlumnos(data);
        } catch (err: any) {
            alert(err.message || "Error cargando alumnos.");
        } finally {
            setIsLoading(false);
        }
    };

    // 3. Efecto automático: Si hay grupoId y se marcó 'hasConsultado' (o viene por URL), consultamos
    useEffect(() => {
        if (grupoId && hasConsultado) {
            consultar(grupoId);
        }
    }, [grupoId, hasConsultado]);

    // Manejador manual del botón
    const handleManualConsultar = () => {
        setHasConsultado(true);
        consultar(grupoId);
    };

    const alumnosFiltrados = useMemo(() => {
        if (!filtroTexto) return alumnos;
        const texto = filtroTexto.toLowerCase();
        return alumnos.filter(alumno => 
            alumno.nombreCompleto.toLowerCase().includes(texto) ||
            alumno.expediente.toLowerCase().includes(texto)
        );
    }, [alumnos, filtroTexto]);

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Lista de Alumnos por Grupo</h1>

            {/* Filtros */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">Grupo Asignado</label>
                        <select
                            value={grupoId}
                            onChange={(e) => {
                                setGrupoId(e.target.value);
                                setHasConsultado(false); // Reseteamos para obligar clic en Consultar si cambia manual
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-72"
                            disabled={isLoading || isLoadingGrupos}
                        >
                            {isLoadingGrupos ? (
                                <option>Cargando...</option>
                            ) : (
                                grupos.map((g) => (
                                    <option key={g.id} value={g.id}>({g.clave}) - {g.nombre}</option>
                                ))
                            )}
                        </select>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleManualConsultar}
                            disabled={isLoading || isLoadingGrupos || !grupoId}
                            className="inline-flex items-center gap-2 py-2 px-6 rounded-md font-medium transition disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700"
                        >
                            <Search size={16} />
                            {isLoading ? 'Cargando...' : 'Consultar Lista'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabla */}
            {alumnos.length > 0 && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden p-6 animate-in fade-in">
                    <div className="mb-4">
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Filtrar Rápido</label>
                        <input
                            type="text"
                            value={filtroTexto}
                            onChange={(e) => setFiltroTexto(e.target.value)}
                            placeholder="Nombre o expediente..."
                            className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-96"
                        />
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {['Expediente', 'Matrícula', 'Nombre', 'Correo', 'Estado'].map((th) => (
                                        <th key={th} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{th}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {alumnosFiltrados.map((alumno) => (
                                    <tr key={alumno.expediente}>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{alumno.expediente}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{alumno.matricula}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{alumno.nombreCompleto}</td>
                                        <td className="px-6 py-4 text-sm text-blue-600">{alumno.correo}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${alumno.estadoAcademico === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {alumno.estadoAcademico}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

// Página principal envuelta en Suspense (Requisito de Next.js para useSearchParams)
export default function AlumnosPorGrupoPage() {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <Suspense fallback={<div className="p-10 text-center">Cargando buscador...</div>}>
                <AlumnosContent />
            </Suspense>
        </div>
    );
}
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, Users, Calendar, AlertTriangle, Search } from 'lucide-react';

const FONDO_CLARO = "#F5F0FF";

type FiltroSeleccionado = 'Expediente' | 'Grupo' | 'Semestre';

// Tipos
type GrupoOption = {
  id: number;
  clave: string;
  nombre: string;
};

type PeriodoOption = {
  id: number;
  etiqueta: string;
};

// Resultado general (usado para Grupo)
type AlumnoResultado = {
  expediente: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  calificacion: number | null;
};

// Resultado específico (usado para Semestre)
type MateriaResultado = {
  codigo: string;
  materia: string;
  creditos: number;
  calificacion: number | null;
  estatus: string;
  periodo_nombre: string;
};

export default function ConsultarCalificaciones() {
  const [filtro, setFiltro] = useState<FiltroSeleccionado>('Expediente');
  const router = useRouter();

  // Estados Inputs
  const [expediente, setExpediente] = useState('');
  const [grupoSeleccionado, setGrupoSeleccionado] = useState('');
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(''); // Nuevo para semestre
  
  // Estados Datos
  const [listaGrupos, setListaGrupos] = useState<GrupoOption[]>([]);
  const [listaPeriodos, setListaPeriodos] = useState<PeriodoOption[]>([]); // Nuevo lista periodos
  const [resultadosTabla, setResultadosTabla] = useState<AlumnoResultado[] | null>(null);
  const [resultadosSemestre, setResultadosSemestre] = useState<MateriaResultado[] | null>(null); // Nuevo resultados

  // UI
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState<'success' | 'error' | null>(null);
  const [mensajeError, setMensajeError] = useState('');

  // 1. Efecto para cargar datos iniciales según filtro
  useEffect(() => {
    // Cargar Grupos
    if (filtro === 'Grupo') {
      const fetchGrupos = async () => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) return;
        try {
          const user = JSON.parse(storedUser);
          const res = await fetch(`/api/groups?profesorId=${user.profesorId}`);
          if (res.ok) setListaGrupos(await res.json());
        } catch (error) { console.error(error); }
      };
      fetchGrupos();
    }
    
    // Cargar Periodos (Nuevo)
    if (filtro === 'Semestre') {
        const fetchPeriodos = async () => {
            try {
                const res = await fetch('/api/periods');
                if (res.ok) setListaPeriodos(await res.json());
            } catch (e) { console.error(e); }
        };
        fetchPeriodos();
    }
  }, [filtro]);

  const handleFiltroClick = (f: FiltroSeleccionado) => {
    setFiltro(f);
    setExpediente('');
    setGrupoSeleccionado('');
    setPeriodoSeleccionado('');
    setResultadosTabla(null);
    setResultadosSemestre(null);
    setMensajeError('');
    setModalVisible(null);
  };

  // --- LÓGICA 1: EXPEDIENTE ---
  const handleConsultarExpediente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expediente.trim() || !/^[a-zA-Z0-9]+$/.test(expediente)) {
        setMensajeError('Ingrese un expediente válido.');
        setModalVisible('error');
        return;
    }
    setLoading(true);
    setTimeout(() => {
        setLoading(false);
        router.push(`/alumno/${expediente}`);
    }, 1000);
  };

  // --- LÓGICA 2: GRUPO ---
  const handleConsultarGrupo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grupoSeleccionado) {
        setMensajeError('Selecciona un grupo.');
        setModalVisible('error');
        return;
    }
    setLoading(true);
    setResultadosTabla(null);
    try {
      const res = await fetch(`/api/groups/${grupoSeleccionado}/grades`);
      if (!res.ok) throw new Error('Error al consultar grupo');
      setResultadosTabla(await res.json());
    } catch (err: any) {
      setMensajeError(err.message);
      setModalVisible('error');
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA 3: SEMESTRE (NUEVA) ---
  const handleConsultarSemestre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expediente.trim() || !periodoSeleccionado) {
        setMensajeError('Ingrese expediente y seleccione un periodo.');
        setModalVisible('error');
        return;
    }
    setLoading(true);
    setResultadosSemestre(null);
    
    try {
        const res = await fetch(`/api/students/grades-by-period?expediente=${expediente}&periodoId=${periodoSeleccionado}`);
        if (!res.ok) throw new Error("Error al consultar semestre");
        const data = await res.json();
        setResultadosSemestre(data);
    } catch (err: any) {
        setMensajeError(err.message);
        setModalVisible('error');
    } finally {
        setLoading(false);
    }
  };

  // Estilos
  const commonClasses = "bg-white p-8 rounded-xl shadow-lg mt-6 max-w-3xl mx-auto border border-gray-200";
  const labelClasses = "block text-sm font-semibold text-gray-700 mb-2";
  const inputClasses = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700";
  const buttonClasses = "w-full py-3 mt-6 bg-[#16469B] hover:bg-[#0f357a] text-white font-bold rounded-lg transition-colors shadow-md flex justify-center items-center";

  // --- FORMULARIOS ---
  const renderFormulario = useCallback(() => {
    switch (filtro) {
      case 'Expediente':
        return (
          <div className={commonClasses}>
            <h3 className="text-xl font-bold mb-6 text-[#16469B]">Buscar por Expediente</h3>
            <form onSubmit={handleConsultarExpediente}>
              <div className="mb-2">
                <label className={labelClasses}>Número de Expediente</label>
                <input type="text" value={expediente} onChange={(e) => setExpediente(e.target.value)} placeholder="Ej: EXP10001" className={inputClasses} />
              </div>
              <button type="submit" className={buttonClasses} disabled={loading}>{loading ? 'Buscando...' : 'Consultar'}</button>
            </form>
          </div>
        );
      case 'Grupo':
        return (
          <div className={commonClasses}>
            <h3 className="text-xl font-bold mb-6 text-[#16469B]">Buscar por Grupo</h3>
            <form onSubmit={handleConsultarGrupo}>
              <div>
                <label className={labelClasses}>Selecciona un Grupo</label>
                <select className={inputClasses} value={grupoSeleccionado} onChange={(e) => setGrupoSeleccionado(e.target.value)}>
                  <option value="">-- Mis Grupos --</option>
                  {listaGrupos.map((g) => (<option key={g.id} value={g.id}>{g.clave ? `(${g.clave}) ` : ''}{g.nombre}</option>))}
                </select>
              </div>
              <button type="submit" className={buttonClasses} disabled={loading}>{loading ? 'Cargando...' : 'Ver Lista'}</button>
            </form>
          </div>
        );
      case 'Semestre':
        return (
          <div className={commonClasses}>
            <h3 className="text-xl font-bold mb-6 text-[#16469B]">Historial por Semestre</h3>
            <form onSubmit={handleConsultarSemestre}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClasses}>Expediente del Alumno</label>
                    <input type="text" value={expediente} onChange={(e) => setExpediente(e.target.value)} placeholder="Ej: EXP10001" className={inputClasses} />
                  </div>
                  <div>
                    <label className={labelClasses}>Periodo / Semestre</label>
                    <select className={inputClasses} value={periodoSeleccionado} onChange={(e) => setPeriodoSeleccionado(e.target.value)}>
                        <option value="">-- Seleccionar --</option>
                        {listaPeriodos.map(p => (
                            <option key={p.id} value={p.id}>{p.etiqueta}</option>
                        ))}
                    </select>
                  </div>
              </div>
              <button type="submit" className={buttonClasses} disabled={loading}>{loading ? 'Buscando...' : 'Consultar Semestre'}</button>
            </form>
          </div>
        );
      default: return null;
    }
  }, [filtro, expediente, grupoSeleccionado, periodoSeleccionado, listaGrupos, listaPeriodos, loading]);

  // --- TABLAS ---
  const renderResultados = () => {
    // 1. Tabla para GRUPO
    if (filtro === 'Grupo' && resultadosTabla) {
        if (resultadosTabla.length === 0) return <div className="mt-8 text-center text-gray-500">No hay alumnos.</div>;
        return (
            <div className="max-w-5xl mx-auto mt-10 bg-white rounded-xl shadow-xl overflow-hidden">
                <div className="bg-[#16469B] p-4 text-white font-bold flex gap-2"><Users/> Alumnos del Grupo</div>
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr><th className="px-6 py-3">Expediente</th><th className="px-6 py-3">Nombre</th><th className="px-6 py-3 text-center">Calificación</th><th className="px-6 py-3 text-center">Estatus</th></tr>
                    </thead>
                    <tbody>
                        {resultadosTabla.map(a => (
                            <tr key={a.expediente} className="border-t hover:bg-gray-50">
                                <td className="px-6 py-3 font-mono text-blue-800">{a.expediente}</td>
                                <td className="px-6 py-3">{a.apellido_paterno} {a.apellido_materno} {a.nombre}</td>
                                <td className="px-6 py-3 text-center font-bold">{a.calificacion ?? '-'}</td>
                                <td className="px-6 py-3 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs text-white ${Number(a.calificacion) >= 60 ? 'bg-green-600' : 'bg-red-500'}`}>{Number(a.calificacion) >= 60 ? 'Aprobado' : 'Reprobado'}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    // 2. Tabla para SEMESTRE (Nuevo)
    if (filtro === 'Semestre' && resultadosSemestre) {
        if (resultadosSemestre.length === 0) return <div className="mt-8 text-center text-gray-500">No se encontraron materias para este alumno en el periodo seleccionado.</div>;
        return (
            <div className="max-w-5xl mx-auto mt-10 bg-white rounded-xl shadow-xl overflow-hidden">
                <div className="bg-[#16469B] p-4 text-white font-bold flex justify-between">
                    <span className="flex gap-2"><Calendar/> Boleta del Periodo</span>
                    <span className="bg-blue-800 px-3 py-1 rounded text-sm text-blue-200">Exp: {expediente}</span>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Código</th>
                            <th className="px-6 py-3">Materia</th>
                            <th className="px-6 py-3 text-center">Créditos</th>
                            <th className="px-6 py-3 text-center">Calificación</th>
                            <th className="px-6 py-3 text-center">Estatus</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resultadosSemestre.map((m, i) => (
                            <tr key={i} className="border-t hover:bg-gray-50">
                                <td className="px-6 py-3 font-mono text-gray-600">{m.codigo}</td>
                                <td className="px-6 py-3 font-medium text-gray-800">{m.materia}</td>
                                <td className="px-6 py-3 text-center">{m.creditos}</td>
                                <td className="px-6 py-3 text-center font-bold text-lg">{m.calificacion ?? '-'}</td>
                                <td className="px-6 py-3 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${m.estatus === 'APROBADO' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                                        {m.estatus}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }
    return null;
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: FONDO_CLARO }}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-2 text-[#16469B]">Consultar Calificaciones</h2>
        <p className="text-gray-600 mb-8 text-lg">Seleccione el filtro de consulta:</p>

        {/* BOTONES FILTRO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {['Expediente', 'Grupo', 'Semestre'].map((f) => (
                <button key={f} onClick={() => handleFiltroClick(f as FiltroSeleccionado)} 
                    className={`group relative flex flex-col items-start p-6 rounded-xl border-2 transition-all duration-200 text-left h-40 ${filtro === f ? 'bg-white border-blue-500 ring-4 ring-blue-100 shadow-xl' : 'bg-white border-gray-200 hover:border-blue-300'}`}>
                    {f === 'Expediente' && <User className={`w-10 h-10 mb-3 ${filtro === f ? 'text-[#16469B]' : 'text-[#FFD100]'}`} />}
                    {f === 'Grupo' && <Users className={`w-10 h-10 mb-3 ${filtro === f ? 'text-[#16469B]' : 'text-[#FFD100]'}`} />}
                    {f === 'Semestre' && <Calendar className={`w-10 h-10 mb-3 ${filtro === f ? 'text-[#16469B]' : 'text-[#FFD100]'}`} />}
                    <span className="text-xl font-bold text-[#16469B]">Por {f}</span>
                </button>
            ))}
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">{renderFormulario()}</div>
        {renderResultados()}

        {modalVisible === 'error' && (
             <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
                <div className="bg-white rounded-xl p-6 shadow-2xl max-w-sm w-full">
                    <h3 className="text-red-600 font-bold flex items-center gap-2 mb-4"><AlertTriangle/> Error</h3>
                    <p>{mensajeError}</p>
                    <button onClick={() => setModalVisible(null)} className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg font-bold">Cerrar</button>
                </div>
             </div>
        )}
      </div>
    </div>
  );
}
"use client";

import React, { useState, useEffect } from 'react';
import { UploadCloud, Download, CheckCircle, AlertTriangle, Loader2, XCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

const AZUL_UNISON = "#16469B";
const DORADO_UNISON = "#FFD100";

interface Grupo {
  id: string;
  clave: string;
  nombre: string;
  periodo: string;
}

export default function SubirCalificacionesPage() {
  // Estados
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [grupoId, setGrupoId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Estado Modal
  const [modal, setModal] = useState<{ show: boolean, type: 'success'|'error'|'loading', msg: string, details?: any }>({
      show: false, type: 'loading', msg: '' 
  });

  // 1. Cargar Grupos del Profesor
  useEffect(() => {
    const userStored = localStorage.getItem("user");
    if (userStored) {
      const user = JSON.parse(userStored);
      if (user.profesorId) {
        fetch(`/api/groups?profesorId=${user.profesorId}`)
          .then(res => res.json())
          .then(data => { if(Array.isArray(data)) setGrupos(data); });
      }
    }
  }, []);

  // 2. Descargar Plantilla (Con Alumnos del Grupo)
  const handleDescargarPlantilla = async () => {
    if (!grupoId) {
        alert("Selecciona un grupo primero.");
        return;
    }

    // A. Obtener detalles del grupo (para el encabezado)
    const resDetalles = await fetch(`/api/groups/${grupoId}/details`);
    const detalles = await resDetalles.json();

    // B. Obtener alumnos del grupo (para pre-llenar la lista)
    const user = JSON.parse(localStorage.getItem("user") || '{}');
    const resAlumnos = await fetch(`/api/student-groups?grupoId=${grupoId}&profesorId=${user.profesorId}`);
    const alumnos = await resAlumnos.json();

    // C. Generar Excel
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([]);

    // Encabezados Estéticos
    const headers = [
        [`Acta de Calificaciones`],
        [`Materia: ${detalles.materia}   Grupo: ${detalles.grupo}`],
        [`Horario: ${detalles.horario.replace('Horario: ', '')}`],
        [""] // Espacio
    ];
    XLSX.utils.sheet_add_aoa(ws, headers, { origin: "A1" });

    // Tabla de Datos
    const data = alumnos.map((a: any) => ({
        Matricula: a.matricula,
        Nombre: a.nombreCompleto,
        Ordinario: "", // Vacío para llenar
        Extraordinario: "",
        Final: ""      // Vacío para llenar
    }));

    XLSX.utils.sheet_add_json(ws, data, { origin: "A5" });

    // Ancho de columnas
    ws['!cols'] = [{ wch: 15 }, { wch: 40 }, { wch: 10 }, { wch: 15 }, { wch: 10 }];

    XLSX.utils.book_append_sheet(wb, ws, "Calificaciones");
    XLSX.writeFile(wb, `Calificaciones_Gpo${detalles.grupo}.xlsx`);
  };

  // 3. Subir Archivo
  const handleUpload = async () => {
    if (!file || !grupoId) return;

    setModal({ show: true, type: 'loading', msg: 'Procesando calificaciones...' });

    const formData = new FormData();
    formData.append('excel', file);
    formData.append('grupoId', grupoId);

    try {
        const res = await fetch('/api/upload-calificaciones', {
            method: 'POST',
            body: formData
        });
        const result = await res.json();

        if (res.ok) {
            setModal({ 
                show: true, 
                type: 'success', 
                msg: `Se actualizaron ${result.totalActualizados} registros correctamente.` 
            });
            setFile(null);
        } else {
            throw new Error(result.mensaje);
        }
    } catch (error: any) {
        setModal({ show: true, type: 'error', msg: error.message || "Error al subir." });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        
        <h1 className="text-2xl font-bold text-[#16469B] mb-6">Subir Calificaciones</h1>

        {/* 1. Selector de Grupo */}
        <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Selecciona el Grupo</label>
            <select 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                value={grupoId}
                onChange={(e) => setGrupoId(e.target.value)}
            >
                <option value="">-- Seleccionar --</option>
                {grupos.map(g => (
                    <option key={g.id} value={g.id}>{g.clave} - {g.nombre}</option>
                ))}
            </select>
        </div>

        {/* 2. Área de Descarga de Plantilla */}
        {grupoId && (
            <div className="mb-8 bg-blue-50 p-4 rounded-lg border border-blue-100 flex justify-between items-center animate-in fade-in">
                <div>
                    <p className="font-semibold text-blue-900">Plantilla del Grupo</p>
                    <p className="text-sm text-blue-700">Descarga la lista oficial de alumnos para llenar las calificaciones.</p>
                </div>
                <button 
                    onClick={handleDescargarPlantilla}
                    className="flex items-center gap-2 bg-white text-[#16469B] border border-[#16469B] px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                    <Download size={18} /> Descargar Excel
                </button>
            </div>
        )}

        {/* 3. Área de Carga */}
        <div className={`border-2 border-dashed rounded-xl p-10 text-center transition-all ${grupoId ? 'border-gray-300 hover:bg-gray-50' : 'opacity-50 pointer-events-none'}`}>
            <input 
                type="file" 
                id="fileInput" 
                className="hidden" 
                accept=".xlsx, .xls" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            
            {!file ? (
                <div onClick={() => document.getElementById('fileInput')?.click()} className="cursor-pointer">
                    <UploadCloud className="w-16 h-16 mx-auto text-[#16469B] mb-3" />
                    <p className="text-gray-600 font-medium">Click para seleccionar archivo de calificaciones</p>
                    <p className="text-xs text-gray-400 mt-1">Formato .xlsx</p>
                </div>
            ) : (
                <div>
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <span className="font-bold text-gray-800">{file.name}</span>
                        <button onClick={() => setFile(null)} className="text-red-500 hover:text-red-700"><XCircle size={20}/></button>
                    </div>
                    <button 
                        onClick={handleUpload}
                        className="bg-[#16469B] text-white px-8 py-2 rounded-lg font-bold hover:bg-[#0f357a] transition shadow-md"
                    >
                        Confirmar y Subir
                    </button>
                </div>
            )}
        </div>

      </div>

      {/* MODAL DE ESTADO */}
      {modal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full text-center">
                {modal.type === 'loading' && <Loader2 className="w-12 h-12 mx-auto text-blue-600 animate-spin mb-4" />}
                {modal.type === 'success' && <CheckCircle className="w-12 h-12 mx-auto text-green-600 mb-4" />}
                {modal.type === 'error' && <AlertTriangle className="w-12 h-12 mx-auto text-red-600 mb-4" />}
                
                <h3 className="text-xl font-bold mb-2">
                    {modal.type === 'loading' ? 'Cargando...' : modal.type === 'success' ? '¡Éxito!' : 'Error'}
                </h3>
                <p className="text-gray-600 mb-6">{modal.msg}</p>
                
                {modal.type !== 'loading' && (
                    <button 
                        onClick={() => setModal({ ...modal, show: false })}
                        className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 w-full font-medium"
                    >
                        Cerrar
                    </button>
                )}
            </div>
        </div>
      )}
    </div>
  );
}
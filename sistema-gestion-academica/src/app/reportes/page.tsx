'use client';

import { useState, useCallback } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Tipo de dato del alumno (Actualizado con correo)
interface EligibleStudent {
  nombre_completo: string;
  matricula: string;
  correo: string;
  creditos_aprobados: number;
  estado_academico: 'ACTIVO' | 'INACTIVO' | 'BAJA' | 'EGRESADO';
  plan_estudio_nombre: string;
  grupo_actual: string;
}

const REPORT_TYPES = ['Practicas Profesionales', 'Servicio Social'] as const;
type ReportType = typeof REPORT_TYPES[number];

export default function ReportesPage() {
  const [selectedReportType, setSelectedReportType] = useState<ReportType>('Servicio Social');
  const [students, setStudents] = useState<EligibleStudent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<EligibleStudent | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [kardexAverage] = useState(90); // Mock por ahora

  //  Obtener datos del reporte desde API
  const handleGenerateReport = useCallback(async () => {
    if (!selectedReportType) return;

    setIsLoading(true);
    setError(null);
    setStudents([]);
    setSelectedStudent(null);
    setPdfPreviewUrl(null);

    try {
      const res = await fetch(`/api/reports/eligibility?type=${selectedReportType}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Error al cargar el reporte: ${res.status}`);
      }
      const data: EligibleStudent[] = await res.json();
      setStudents(data);
    } catch (err: any) {
      setError(err.message || 'Error desconocido al generar el reporte.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedReportType]);

  const isCandidate = (student: EligibleStudent) => {
    // Esto es visual, la API ya filtra, pero mantenemos la lógica por si acaso
    const CREDITOS_CARRERA = 393;
    const CREDITOS_MINIMOS = Math.ceil(CREDITOS_CARRERA * 0.7);
    return student.creditos_aprobados >= CREDITOS_MINIMOS;
  };

  // --- CONFIGURACIÓN COMÚN DEL PDF ---
  const setupPDF = (doc: jsPDF) => {
    let yOffset = 15;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('UNIVERSIDAD DE SONORA', 105, yOffset, { align: 'center' });
    yOffset += 7;

    doc.setFontSize(10);
    doc.text(`Reporte de Elegibilidad - ${selectedReportType}`, 105, yOffset, { align: 'center' });
    yOffset += 5;

    doc.setFontSize(8);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, 200, 10, { align: 'right' });
    yOffset += 10;

    doc.setFontSize(10);
    doc.text('Plan de Estudio Base: IS-UNISON (393 Créditos)', 14, yOffset);
    yOffset += 5;
    doc.text('Créditos Mínimos Requeridos (70%): 275 Créditos', 14, yOffset);
    return yOffset + 10;
  };

  const getTableData = () => {
    const columns = [
      'Nombre del Alumno',
      'Expediente',
      'Correo', 
      'Carrera',
      'Créditos',
      'Promedio',
    ];

    const rows = students.map((student) => [
      student.nombre_completo,
      student.matricula,
      student.correo, 
      student.plan_estudio_nombre,
      student.creditos_aprobados.toString(),
      kardexAverage.toString(),
    ]);

    return { columns, rows };
  };

  //  Genera vista previa del PDF
  const generatePDFPreview = useCallback(() => {
    if (students.length === 0) {
      alert('No hay alumnos para exportar.');
      return;
    }

    const doc = new jsPDF('p', 'mm', 'a4');
    const startY = setupPDF(doc);
    const { columns, rows } = getTableData();

    autoTable(doc, {
      startY: startY,
      head: [columns],
      body: rows,
      theme: 'striped',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [59, 130, 246] }, // Azul Unison
      margin: { left: 10, right: 10 },
    });

    const blob = doc.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    setPdfPreviewUrl(blobUrl);
  }, [students, selectedReportType, kardexAverage]);

  //  Descargar PDF
  const downloadPDF = useCallback(() => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const startY = setupPDF(doc);
    const { columns, rows } = getTableData();

    autoTable(doc, {
      startY: startY,
      head: [columns],
      body: rows,
      theme: 'striped',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 10, right: 10 },
    });

    const fileName = `Reporte_${selectedReportType.replace(/\s/g, '_')}.pdf`;
    doc.save(fileName);
  }, [students, selectedReportType, kardexAverage]);

  //  Render Vista Previa
  if (pdfPreviewUrl) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4">Vista Previa del PDF</h1>
        <iframe
          src={pdfPreviewUrl}
          className="w-full max-w-4xl h-[80vh] border-2 border-gray-300 rounded-md shadow-lg"
        />
        <div className="mt-4 flex space-x-4">
          <button onClick={downloadPDF} className="py-2 px-6 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
            Descargar PDF
          </button>
          <button onClick={() => setPdfPreviewUrl(null)} className="py-2 px-6 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition">
            ← Volver
          </button>
        </div>
      </div>
    );
  }

  //  Render Detalle Alumno
  if (selectedStudent) {
    const candidateStatus = isCandidate(selectedStudent) ? 'Sí es candidato' : 'No es candidato';
    const statusColor = isCandidate(selectedStudent) ? 'text-green-600' : 'text-red-600';

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Detalle de Candidato</h1>
          <div className="flex items-start space-x-8">
            <div className="w-32 h-32 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-4xl text-purple-600 font-bold">{selectedStudent.nombre_completo.charAt(0)}</span>
            </div>
            <div className="space-y-3 flex-1">
              <h2 className="text-xl font-bold text-gray-900">{selectedStudent.nombre_completo}</h2>
              <p className="text-gray-600">Expediente: <span className="font-medium">{selectedStudent.matricula}</span></p>
              <p className="text-gray-600">Correo: <span className="font-medium text-blue-600">{selectedStudent.correo}</span></p> {/* 🟢 Muestra correo */}
              <p className="text-gray-600">Carrera: <span className="font-medium">{selectedStudent.plan_estudio_nombre}</span></p>
              <p className="text-gray-600">
                Progreso: <span className="font-medium">{selectedStudent.creditos_aprobados} Créditos ({Math.round((selectedStudent.creditos_aprobados / 393) * 100)}%)</span>
              </p>
              <p className={`font-bold text-lg ${statusColor}`}>Estado: {candidateStatus}</p>
              <button onClick={() => setSelectedStudent(null)} className="mt-4 py-2 px-6 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition">
                ← Atrás
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista Principal
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Reportes Académicos</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex space-x-4 items-end">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Tipo de Reporte</label>
              <select
                value={selectedReportType}
                onChange={(e) => setSelectedReportType(e.target.value as ReportType)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                {REPORT_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleGenerateReport}
              disabled={isLoading}
              className={`py-2 px-6 rounded-md font-medium transition disabled:opacity-50 ${selectedReportType ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
            >
              {isLoading ? 'Consultando...' : 'Consultar'}
            </button>
          </div>
        </div>

        <div className="mt-8">
          {error && (
            <div className="text-center p-4 text-red-600 border border-red-300 bg-red-50 rounded-md mb-6">{error}</div>
          )}

          {students.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.map((student) => (
                  <div
                    key={student.matricula}
                    onClick={() => setSelectedStudent(student)}
                    className="p-4 rounded-lg shadow-md cursor-pointer transition transform hover:scale-[1.02] bg-white border border-gray-200 hover:border-blue-300"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 flex items-center justify-center bg-purple-200 text-purple-800 font-bold rounded-full shrink-0">
                        {student.nombre_completo.charAt(0).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-semibold truncate" title={student.nombre_completo}>{student.nombre_completo}</p>
                        <p className="text-xs text-gray-500">{student.matricula}</p>
                        <p className="text-xs text-blue-600 truncate">{student.correo}</p> {/* 🟢 Correo visible */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={generatePDFPreview}
                  className="py-2 px-4 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Vista Previa / Descargar PDF
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
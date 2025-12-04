import React from "react";
import { AttendanceRecord } from "@/types";

interface AttendanceTableProps {
  records: AttendanceRecord[];
  onEdit?: (record: AttendanceRecord) => void;
  onDelete?: (record: AttendanceRecord) => void;
}

const SortIcon: React.FC = () => (
  <svg className="w-3 h-4 cursor-pointer" viewBox="0 0 12 16" fill="none">
    <path d="M6 1L11.1962 5.5H0.803848L6 1Z" fill="white" />
    <path d="M6 15L0.803848 10.5H11.1962L6 15Z" fill="white" />
  </svg>
);

export default function AttendanceTable({
  records,
  onEdit,
  onDelete,
}: AttendanceTableProps) {
  const formatDateTime = (value: string | null) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full table-fixed min-w-[1500px]">
        {/* Encabezado estilo Histórico / Roles */}
        <thead className="bg-[#4A5568]">
          <tr className="flex w-full">
            <th className="w-[110px] px-2 py-3 text-left text-xs font-normal text-white flex items-center flex-shrink-0">
              <div className="flex items-center justify-between w-full">
                <span>Periodo</span>
                <SortIcon />
              </div>
            </th>

            <th className="w-[110px] px-2 py-3 text-left text-xs font-normal text-white flex items-center flex-shrink-0">
              <div className="flex items-center justify-between w-full">
                <span>Código</span>
                <SortIcon />
              </div>
            </th>

            <th className="flex-1 px-2 py-3 text-left text-xs font-normal text-white flex items-center">
              <div className="flex items-center justify-between w-full">
                <span>Materia</span>
                <SortIcon />
              </div>
            </th>

            <th className="w-[90px] px-2 py-3 text-left text-xs font-normal text-white flex items-center flex-shrink-0">
              <div className="flex items-center justify-between w-full">
                <span>Grupo</span>
                <SortIcon />
              </div>
            </th>

            <th className="w-[130px] px-2 py-3 text-left text-xs font-normal text-white flex items-center flex-shrink-0">
              <div className="flex items-center justify-between w-full">
                <span>Matrícula</span>
                <SortIcon />
              </div>
            </th>

            <th className="w-[260px] px-2 py-3 text-left text-xs font-normal text-white flex items-center flex-shrink-0">
              <div className="flex items-center justify-between w-full">
                <span>Alumno</span>
                <SortIcon />
              </div>
            </th>

            <th className="w-[150px] px-2 py-3 text-left text-xs font-normal text-white flex items-center flex-shrink-0">
              <div className="flex items-center justify-between w-full">
                <span>Fecha alta</span>
                <SortIcon />
              </div>
            </th>

            <th className="w-[110px] px-2 py-3 text-left text-xs font-normal text-white flex items-center flex-shrink-0">
              <div className="flex items-center justify-between w-full">
                <span>Fuente</span>
                <SortIcon />
              </div>
            </th>

            <th className="w-[260px] px-2 py-3 text-left text-xs font-normal text-white flex items-center flex-shrink-0">
              <div className="flex items-center justify-between w-full">
                <span>Archivo origen</span>
                <SortIcon />
              </div>
            </th>

            <th className="w-[120px] px-2 py-3 text-center text-xs font-normal text-white flex items-center justify-center flex-shrink-0">
              <span>Acciones</span>
            </th>
          </tr>
        </thead>

        {/* Cuerpo estilo Histórico */}
        <tbody className="bg-white">
          {records.length === 0 ? (
            <tr className="flex w-full">
              <td
                className="px-4 py-6 text-center text-sm text-gray-500 flex-1"
                colSpan={10}
              >
                No hay registros de asistencia para los filtros seleccionados.
              </td>
            </tr>
          ) : (
            records.map((r, idx) => (
              <tr
                key={`${r.periodo}-${r.codigo_materia}-${r.grupo}-${r.matricula}-${idx}`}
                className={`flex w-full ${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-gray-100 border-b border-gray-200`}
              >
                <td className="w-[110px] px-2 py-2 flex items-center flex-shrink-0">
                  <span className="text-xs text-[#3B5571] truncate">
                    {r.periodo}
                  </span>
                </td>

                <td className="w-[110px] px-2 py-2 flex items-center flex-shrink-0">
                  <span className="text-xs text-[#3B5571] truncate">
                    {r.codigo_materia}
                  </span>
                </td>

                <td className="flex-1 px-2 py-2 flex items-center">
                  <span className="text-xs text-[#3B5571] truncate">
                    {r.nombre_materia}
                  </span>
                </td>

                <td className="w-[90px] px-2 py-2 flex items-center flex-shrink-0">
                  <span className="text-xs text-[#3B5571] truncate">
                    {r.grupo}
                  </span>
                </td>

                <td className="w-[130px] px-2 py-2 flex items-center flex-shrink-0">
                  <span className="text-xs text-[#3B5571] truncate">
                    {r.matricula}
                  </span>
                </td>

                <td className="w-[260px] px-2 py-2 flex items-center flex-shrink-0">
                  <span className="text-xs text-[#3B5571] truncate">
                    {r.nombre_alumno} {r.apellido_paterno}{" "}
                    {r.apellido_materno ?? ""}
                  </span>
                </td>

                <td className="w-[150px] px-2 py-2 flex items-center flex-shrink-0">
                  <span className="text-xs text-[#3B5571] truncate">
                    {formatDateTime(r.fecha_alta)}
                  </span>
                </td>

                <td className="w-[110px] px-2 py-2 flex items-center flex-shrink-0">
                  <span className="text-xs text-[#3B5571] truncate">
                    {r.fuente}
                  </span>
                </td>

                <td className="w-[260px] px-2 py-2 flex flex-col justify-center flex-shrink-0">
                  <span className="text-xs text-[#3B5571] truncate">
                    {r.nombre_archivo ?? "—"}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {formatDateTime(r.fecha_archivo)}
                  </span>
                </td>

                <td className="w-[110px] px-3 py-2 flex items-center justify-center">
                  <div className="flex space-x-1">
                    {onEdit && (
                      <button
                        type="button"
                        className="text-[#3B5571] hover:text-blue-700 p-1"
                        onClick={() => onEdit(r)}
                        aria-label="Editar relación de asistencia"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                    )}

                    {onDelete && (
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-800 p-1"
                        onClick={() => onDelete(r)}
                        aria-label="Eliminar relación de asistencia"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4
                            a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>

              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

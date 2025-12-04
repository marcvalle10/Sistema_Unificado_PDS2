import React from "react";
import { ScheduleRecord } from "@/types";

interface Props {
  records: ScheduleRecord[];
  onEdit: (record: ScheduleRecord) => void;
  onDelete: (record: ScheduleRecord) => void;
}

const SortIcon: React.FC = () => (
  <svg className="w-3 h-4 cursor-pointer" viewBox="0 0 12 16" fill="none">
    <path d="M6 1L11.1962 5.5H0.803848L6 1Z" fill="white" />
    <path d="M6 15L0.803848 10.5H11.1962L6 15Z" fill="white" />
  </svg>
);

export default function ScheduleTable({ records, onEdit, onDelete }: Props) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full table-fixed min-w-[1500px]">
        {/* Encabezado estilo Histórico */}
        <thead className="bg-[#4A5568]">
          <tr className="flex w-full">
            <th className="w-[110px] px-3 py-3 text-left text-xs font-normal text-white flex items-center flex-shrink-0">
              <div className="flex items-center justify-between w-full">
                <span>Periodo</span>
                <SortIcon />
              </div>
            </th>

            <th className="w-[110px] px-3 py-3 text-left text-xs font-normal text-white flex items-center flex-shrink-0">
              <div className="flex items-center justify-between w-full">
                <span>Código</span>
                <SortIcon />
              </div>
            </th>

            <th className="flex-1 px-3 py-3 text-left text-xs font-normal text-white flex items-center">
              <div className="flex items-center justify-between w-full">
                <span>Materia</span>
                <SortIcon />
              </div>
            </th>

            <th className="w-[80px] px-3 py-3 text-left text-xs font-normal text-white flex items-center flex-shrink-0">
              <div className="flex items-center justify-between w-full">
                <span>Grupo</span>
                <SortIcon />
              </div>
            </th>

            <th className="w-[120px] px-3 py-3 text-left text-xs font-normal text-white flex items-center flex-shrink-0">
              <div className="flex items-center justify-between w-full">
                <span>Núm. empleado</span>
                <SortIcon />
              </div>
            </th>

            <th className="w-[160px] px-3 py-3 text-left text-xs font-normal text-white flex items-center flex-shrink-0">
              <div className="flex items-center justify-between w-full">
                <span>Nombre profesor</span>
                <SortIcon />
              </div>
            </th>

            <th className="w-[140px] px-3 py-3 text-left text-xs font-normal text-white flex items-center flex-shrink-0">
              <div className="flex items-center justify-between w-full">
                <span>Apellido paterno</span>
                <SortIcon />
              </div>
            </th>

            <th className="w-[140px] px-3 py-3 text-left text-xs font-normal text-white flex items-center flex-shrink-0">
              <div className="flex items-center justify-between w-full">
                <span>Apellido materno</span>
                <SortIcon />
              </div>
            </th>

            <th className="w-[80px] px-3 py-3 text-left text-xs font-normal text-white flex items-center flex-shrink-0">
              <div className="flex items-center justify-between w-full">
                <span>Día</span>
                <SortIcon />
              </div>
            </th>

            <th className="w-[100px] px-3 py-3 text-left text-xs font-normal text-white flex items-center flex-shrink-0">
              <div className="flex items-center justify-between w-full">
                <span>Hora inicio</span>
                <SortIcon />
              </div>
            </th>

            <th className="w-[100px] px-3 py-3 text-left text-xs font-normal text-white flex items-center flex-shrink-0">
              <div className="flex items-center justify-between w-full">
                <span>Hora fin</span>
                <SortIcon />
              </div>
            </th>

            <th className="w-[100px] px-3 py-3 text-left text-xs font-normal text-white flex items-center flex-shrink-0">
              <div className="flex items-center justify-between w-full">
                <span>Aula</span>
                <SortIcon />
              </div>
            </th>

            <th className="w-[80px] px-3 py-3 text-center text-xs font-normal text-white flex items-center justify-center flex-shrink-0">
              <div className="flex items-center justify-between w-full">
                <span>Cupo</span>
                <SortIcon />
              </div>
            </th>

            {/* Acciones */}
            <th className="w-[120px] px-3 py-3 text-center text-xs font-normal text-white flex items-center justify-center flex-shrink-0">
              <span>Acciones</span>
            </th>
          </tr>
        </thead>

        {/* Cuerpo */}
        <tbody className="bg-white">
          {records.length > 0 ? (
            records.map((r, idx) => (
              <tr
                key={`${r.periodo}-${r.codigo_materia}-${r.grupo}-${idx}`}
                className={`flex w-full ${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-gray-100 border-b border-gray-200`}
              >
                <td className="w-[110px] px-3 py-2 flex items-center flex-shrink-0">
                  <span className="text-xs text-[#3B5571] truncate">
                    {r.periodo}
                  </span>
                </td>

                <td className="w-[110px] px-3 py-2 flex items-center flex-shrink-0">
                  <span className="text-xs text-[#3B5571] truncate">
                    {r.codigo_materia}
                  </span>
                </td>

                <td className="flex-1 px-3 py-2 flex items-center">
                  <span className="text-xs text-[#3B5571] truncate">
                    {r.nombre_materia}
                  </span>
                </td>

                <td className="w-[80px] px-3 py-2 flex items-center flex-shrink-0">
                  <span className="text-xs text-[#3B5571] truncate">
                    {r.grupo}
                  </span>
                </td>

                <td className="w-[120px] px-3 py-2 flex items-center flex-shrink-0">
                  <span className="text-xs text-[#3B5571] truncate">
                    {r.num_empleado ?? "-"}
                  </span>
                </td>

                <td className="w-[160px] px-3 py-2 flex items-center flex-shrink-0">
                  <span className="text-xs text-[#3B5571] truncate">
                    {r.profesor_nombre ?? "-"}
                  </span>
                </td>

                <td className="w-[140px] px-3 py-2 flex items-center flex-shrink-0">
                  <span className="text-xs text-[#3B5571] truncate">
                    {r.profesor_apellido_paterno ?? "-"}
                  </span>
                </td>

                <td className="w-[140px] px-3 py-2 flex items-center flex-shrink-0">
                  <span className="text-xs text-[#3B5571] truncate">
                    {r.profesor_apellido_materno ?? "-"}
                  </span>
                </td>

                <td className="w-[80px] px-3 py-2 flex items-center flex-shrink-0">
                  <span className="text-xs text-[#3B5571] truncate">
                    {r.dia_semana}
                  </span>
                </td>

                <td className="w-[100px] px-3 py-2 flex items-center flex-shrink-0">
                  <span className="text-xs text-[#3B5571] truncate">
                    {r.hora_inicio}
                  </span>
                </td>

                <td className="w-[100px] px-3 py-2 flex items-center flex-shrink-0">
                  <span className="text-xs text-[#3B5571] truncate">
                    {r.hora_fin}
                  </span>
                </td>

                <td className="w-[100px] px-3 py-2 flex items-center flex-shrink-0">
                  <span className="text-xs text-[#3B5571] truncate">
                    {r.aula}
                  </span>
                </td>

                <td className="w-[80px] px-3 py-2 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-[#3B5571] truncate">
                    {r.cupo ?? "-"}
                  </span>
                </td>

                {/* Columna de acciones con iconos, igual concepto que Attendance */}
                <td className="w-[120px] px-3 py-2 flex items-center justify-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    aria-label="Editar horario"
                    className="p-1.5 rounded-full border border-gray-300 hover:bg-gray-100 flex items-center justify-center"
                    onClick={() => onEdit(r)}
                  >
                    {/* Icono lápiz */}
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

                  <button
                    type="button"
                    aria-label="Eliminar horario"
                    className="p-1.5 rounded-full border border-red-200 text-red-600 hover:bg-red-50 flex items-center justify-center"
                    onClick={() => onDelete(r)}
                  >
                    {/* Icono bote de basura */}
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
                </td>
              </tr>
            ))
          ) : (
            <tr className="flex w-full">
              <td
                className="px-4 py-6 text-center text-sm text-gray-500 flex-1"
                colSpan={15}
              >
                No hay horarios para los filtros seleccionados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

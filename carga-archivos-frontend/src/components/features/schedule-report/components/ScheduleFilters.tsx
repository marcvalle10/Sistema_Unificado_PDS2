import React from "react";

interface Props {
  search: string;
  periodo: string;
  onSearchChange: (v: string) => void;
  onPeriodoChange: (v: string) => void;
}

export default function ScheduleFilters({
  search,
  periodo,
  onSearchChange,
  onPeriodoChange
}: Props) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-4">
      <input
        type="text"
        placeholder="Buscar materia, código, grupo o profesor..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full p-2 border rounded"
      />

      <select
        value={periodo}
        onChange={(e) => onPeriodoChange(e.target.value)}
        className="p-2 border rounded"
      >
        <option value="">Todos los periodos</option>
        <option value="2025-1">2025-1</option>
        <option value="2025-2">2025-2</option>
      </select>
    </div>
  );
}

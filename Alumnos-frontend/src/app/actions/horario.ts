"use server";

import type { ScheduleCourse, ScheduleData } from "@/types/academico";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...init,
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Error ${res.status}: ${msg || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

const toHHMM = (t: string) =>
  t && t.match(/(\d{2}):(\d{2})/) ? t.slice(0, 5) : t;

const normalizePeriodLabel = (etq?: string | null) =>
  etq ? etq.trim() : "----";

export async function getSchedule(expediente: string): Promise<ScheduleData> {
  if (!expediente) throw new Error("Expediente requerido");

  const q = `?studentId=${encodeURIComponent(expediente)}`;

  type Summary = {
    status: string;
    type: string;
    periodLabel: string;
  };

  type RawRow = {
    id: number;
    materiaId: number;
    materiaCodigo: string;
    materiaNombre: string;
    estatus: string;
    periodo: string;

    diaSemana?: number | null;
    horaInicio?: string | null;
    horaFin?: string | null;
    aula?: string | null;
    profesor?: string | null;
  };

  const [summary, rows] = await Promise.all([
    fetchJSON<Summary>(`/horario/summary${q}`),
    fetchJSON<RawRow[]>(`/horario/list${q}`),
  ]);

  const courses: ScheduleCourse[] = (rows ?? []).map((r, index) => ({
    id: String(r.id ?? index),
    code: String(r.materiaCodigo),
    name: String(r.materiaNombre),

    status: String(r.estatus ?? "").toUpperCase(),
    period: String(r.periodo ?? ""),

    day: r.diaSemana ?? undefined,
    startTime: r.horaInicio ? toHHMM(String(r.horaInicio)) : undefined,
    endTime: r.horaFin ? toHHMM(String(r.horaFin)) : undefined,
    classroom: r.aula ?? undefined,
    professor: r.profesor ?? undefined,
  }));

  const data: ScheduleData = {
    student: {
      status: String(summary?.status ?? "—"),
      type: String(summary?.type ?? "—"),
      currentSemester: normalizePeriodLabel(summary?.periodLabel),
    },
    courses,
  };

  return data;
}

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getGrades } from "@/app/actions/calificacion";
import type { GradesPayload, GradeRecord, CourseStatus } from "@/types/academico";

/* ----------------- utilidades de estado y colores ----------------- */
function statusFromRecord(r: GradeRecord): CourseStatus {
  if (r.status === "dropped") return "dropped";
  if (r.status === "in_progress") return "in_progress";
  if (typeof r.grade === "number") return r.grade >= 60 ? "passed" : "failed";
  return "not_taken";
}
function bgForStatus(s: CourseStatus) {
  switch (s) {
    case "passed": return "bg-[#5FD05F]";
    case "failed": return "bg-[#F05C5C]";
    case "dropped": return "bg-[#FFE45C]";
    case "in_progress": return "bg-[#5C85F0]";
    default: return "bg-white";
  }
}
function borderForStatus(s: CourseStatus) {
  switch (s) {
    case "passed": return "ring-1 ring-[#2B9A2B]";
    case "failed": return "ring-1 ring-[#B83434]";
    case "dropped": return "ring-1 ring-[#C8A200]";
    case "in_progress": return "ring-1 ring-[#2C55A6]";
    default: return "ring-1 ring-slate-300";
  }
}

/* ----------------- tarjeta de materia ----------------- */
function CourseCard({
  code, name, credits, status,
}: { code: string; name: string; credits?: number | null; status: CourseStatus }) {
  return (
    <div className={`rounded-md shadow-sm overflow-hidden ${bgForStatus(status)} ${borderForStatus(status)}`}>
      <div className="flex items-center justify-between px-2 py-1 bg-black/10 text-[11px] font-semibold">
        <span className="uppercase tracking-wide">Clave</span>
        <span>{code}</span>
      </div>
      <div className="px-2 py-2 text-[13px] leading-snug font-medium">{name}</div>
      <div className="flex items-center justify-between px-2 py-1 bg-black/10 text-[11px]">
        <span className="uppercase tracking-wide">Créditos</span>
        <span className="font-semibold">{credits ?? 0}</span>
      </div>
    </div>
  );
}

/* ----------------- leyenda ----------------- */
function SubjectsLegendInline() {
  const Item = ({ c, t }: { c: string; t: string }) => (
    <div className="flex items-center gap-2">
      <span className={`inline-block h-3.5 w-6 rounded ${c} ring-1 ring-slate-300`} />
      <span className="text-xs text-slate-700">{t}</span>
    </div>
  );
  return (
    <div className="grid gap-1.5 text-xs">
      <Item c="bg-white" t="La materia no se ha cursado" />
      <Item c="bg-[#FFE45C]" t="La materia fue dada de baja holaassssssyaaa" />
      <Item c="bg-[#5C85F0]" t="La materia se está cursando" />
      <Item c="bg-[#F05C5C]" t="La materia reprobada" />
      <Item c="bg-[#5FD05F]" t="La materia aprobada" />
    </div>
  );
}

/* ----------------- cálculo de estado/semestre ----------------- */
function computeStatusIndex(payload: GradesPayload) {
  const hist = new Map(payload.history.map(h => [h.code, h]));
  const curr = new Map(payload.enrolled.map(e => [e.code, e]));
  return (planItem: { code: string; suggestedTerm?: number | null; semester?: number | null; }) => {
    let status: CourseStatus = "not_taken";
    let semester = planItem.suggestedTerm ?? planItem.semester ?? payload.currentSemester ?? 1;

    if (curr.has(planItem.code)) {
      status = "in_progress";
      semester = curr.get(planItem.code)!.semester ?? payload.currentSemester ?? semester;
    } else if (hist.has(planItem.code)) {
      const h = hist.get(planItem.code)!;
      status = statusFromRecord(h);
      semester = h.semester ?? semester;
    }
    return { status, semester: Math.max(1, semester || 1) };
  };
}

/* ----------------- formulario expediente (si falta en URL) ----------------- */
function ExpedienteForm({ onSubmit }: { onSubmit: (exp: string) => void }) {
  const [exp, setExp] = useState("");
  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => { e.preventDefault(); if (exp.trim()) onSubmit(exp.trim()); }}
    >
      <input
        value={exp}
        onChange={(e) => setExp(e.target.value)}
        className="px-3 py-2 rounded-md border w-64"
        placeholder="Expediente (ej. 123456)"
        autoFocus
      />
      <button className="px-4 py-2 rounded-md bg-sky-700 text-white">Ver mapa</button>
    </form>
  );
}

/* ----------------- página ----------------- */
export default function MapaPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const expedienteParam = sp.get("expediente")?.trim() ?? "";

  const [payload, setPayload] = useState<GradesPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = async (exp: string) => {
    setLoading(true);
    setErr(null);
    try {
      const data = await getGrades(exp);
      setPayload(data);
    } catch (e: any) {
      setErr(e?.message ?? "Error al cargar");
      setPayload(null);
    } finally {
      setLoading(false);
    }
  };

  // si viene ?expediente=..., cargar automáticamente
  useEffect(() => {
    if (expedienteParam) load(expedienteParam);
  }, [expedienteParam]);

  // si no hay expediente en URL, mostrar formulario
  if (!expedienteParam) {
    return (
      <main className="w-full mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold mb-3">Mapa de materias</h1>
        <p className="text-slate-600 mb-4">Ingresa el expediente para consultar el plan y el historial.</p>
        <ExpedienteForm onSubmit={(exp) => router.push(`?expediente=${encodeURIComponent(exp)}`)} />
      </main>
    );
  }

  if (loading || !payload) {
    return (
      <main className="w-full mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
        {loading ? "Cargando…" : (err ? <span className="text-red-600">{err}</span> : "Sin datos")}
      </main>
    );
  }

  const statusResolver = computeStatusIndex(payload);

  const bySem = useMemo(() => {
    const bucket = new Map<number, Array<{ code: string; name: string; credits?: number | null; status: CourseStatus }>>();
    for (const p of payload.plan) {
      const { status, semester } = statusResolver(p);
      if (!bucket.has(semester)) bucket.set(semester, []);
      bucket.get(semester)!.push({
        code: p.code,
        name: p.name,
        credits: (p as any).credits ?? (p as any).creditos ?? null,
        status,
      });
    }
    for (const [, arr] of bucket) arr.sort((a, b) => a.code.localeCompare(b.code));
    return bucket;
  }, [payload]);

  const maxSem = Math.max(8, ...Array.from(bySem.keys()));

  return (
    <main className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-end justify-between mb-4">
        <h1 className="text-2xl font-bold">Mapa de materias</h1>
        <div className="text-slate-600 text-sm">
          <span className="font-semibold">Plan de estudios: </span>{payload.student.planYear || "—"}
        </div>
      </div>

      <div className="flex gap-6">
        <aside className="shrink-0">
          <div className="rounded-lg border bg-white p-3 shadow-sm w-[220px]">
            <div className="text-sm font-semibold mb-2">Código de colores</div>
            <SubjectsLegendInline />
          </div>
        </aside>

        <section className="relative w-full overflow-x-auto">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent" />

          <div className="min-w-[1200px] grid grid-flow-col auto-rows-min gap-x-4"
               style={{ gridTemplateColumns: `repeat(${maxSem}, 260px)` }}>
            {Array.from({ length: maxSem }).map((_, i) => {
              const sem = i + 1;
              const list = bySem.get(sem) ?? [];
              return (
                <div key={sem} className="rounded-xl border bg-white shadow-sm overflow-hidden">
                  <div className="px-3 py-2 bg-slate-200 text-sm font-semibold text-slate-800 sticky top-0">
                    Semestre {sem}
                  </div>
                  <div className="p-3 grid gap-2">
                    {list.length === 0 ? (
                      <div className="text-xs text-slate-500">Sin materias</div>
                    ) : (
                      list.map((c) => (
                        <CourseCard
                          key={c.code}
                          code={c.code}
                          name={c.name}
                          credits={c.credits}
                          status={c.status}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-slate-600">
          Alumno: <span className="font-semibold">{payload.student.name}</span> · Estatus: {payload.student.status}
        </div>
        <div className="text-right text-slate-600">
          <span className="font-semibold">Plan de estudios: </span>{payload.student.planYear || "—"}
        </div>
      </div>
    </main>
  );
}

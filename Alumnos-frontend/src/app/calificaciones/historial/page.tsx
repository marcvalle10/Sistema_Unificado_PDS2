"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { getGrades } from "@/app/actions/calificacion";
import type { GradesPayload, GradeRecord, CourseStatus } from "@/types/academico";

/* ------------ Helpers ------------ */
function termOrder(s?: string | null): number {
    if (!s) return 999999;
    const [yearStr, termStr] = s.split("-");
    const year = Number(yearStr) || 0;
    const term = Number(termStr) || 0;
    return year * 10 + term;   // 2024-2 -> 20242, 2025-1 -> 20251
}


function statusFromRecord(r: GradeRecord): CourseStatus {
    return (r.status as CourseStatus) ?? "not_taken";
}



function rowBg(s: CourseStatus) {
    switch (s) {
        case "passed": return "bg-[#A2E6A2]";
        case "failed": return "bg-[#FE8B8B]";
        case "dropped": return "bg-[#FFF58A]";
        case "in_progress": return "bg-[#A2BBE6]";
        default: return "bg-white";
    }
}

function badge(s: CourseStatus) {
    switch (s) {
        case "passed": return "bg-[#3ACB3A]";
        case "failed": return "bg-[#FD0505]";
        case "dropped": return "bg-[#FFF046]";
        case "in_progress": return "bg-[#3A6FCB]";
        default: return "bg-[#FFFFFF] ring-1 ring-gray-300";
    }
}

function avgOf(rows: (GradeRecord & { status: CourseStatus })[]): string {
    const nums = rows
        .map(r =>
            r.grade !== null && r.grade !== undefined
                ? Number(r.grade)
                : NaN
        )
        .filter(n => !Number.isNaN(n));

    if (!nums.length) return "-";
    return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2);
}


/* ------------ Page ------------ */
export default function HistorialPage() {
    const [payload, setPayload] = useState<GradesPayload | null>(null);
    const [mode, setMode] = useState<"global" | "inscritas" | "semestre">("global");
    const [semesterOpen, setSemesterOpen] = useState(false);
    const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
    const [expediente, setExpediente] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const exp =
                    typeof window !== "undefined"
                        ? window.localStorage.getItem("expediente")
                        : null;

                if (!exp) {
                    console.error("No hay expediente en localStorage");
                    return;
                }

                setExpediente(exp);
                const data = await getGrades(exp);
                setPayload(data);
            } catch (err) {
                console.error(err);
            }
        })();
    }, []);

    const allRows = useMemo(() => {
        if (!payload) return [] as (GradeRecord & { status: CourseStatus })[];

        const rowsMap = new Map<string, GradeRecord & { status: CourseStatus }>();

        // 1) Base: todo el historial (kárdex)
        for (const r of payload.history) {
            const row: GradeRecord & { status: CourseStatus } = {
                ...r,
                status: (r.status as CourseStatus) ?? "not_taken",
            };

            const existing = rowsMap.get(r.code);
            // si una materia aparece varias veces, nos quedamos con la más reciente
            if (!existing || termOrder(row.semester) >= termOrder(existing.semester)) {
                rowsMap.set(r.code, row);
            }
        }

        // 2) Inscritas: sobreescriben el estado a "in_progress"
        for (const r of payload.enrolled) {
            const row: GradeRecord & { status: CourseStatus } = {
                ...r,
                status: "in_progress",
            };
            rowsMap.set(r.code, row);
        }

        // 3) Plan: materias que nunca han aparecido (no cursadas aún)
        for (const ps of payload.plan) {
            if (!rowsMap.has(ps.code)) {
                rowsMap.set(ps.code, {
                    code: ps.code,
                    name: ps.name,
                    group: null,
                    semester: (ps as any).suggestedTerm ?? null,
                    grade: null,
                    status: "not_taken",
                } as GradeRecord & { status: CourseStatus });
            }
        }

        const rows = Array.from(rowsMap.values());

        // Ordenar por periodo (2022-1, 2022-2, 2023-1, ...) y luego por clave
        return rows.sort(
            (a, b) =>
                termOrder(a.semester) - termOrder(b.semester) ||
                a.code.localeCompare(b.code)
        );
    }, [payload]);


    const semesters = useMemo(() => {
        const s = new Set<string>();
        for (const r of allRows) {
            if (r.semester) {
                s.add(r.semester);          // aquí guardamos "2024-2", "2025-1", etc.
            }
        }
        const list = Array.from(s).sort(
            (a, b) => termOrder(a) - termOrder(b)
        );

        if (list.length && selectedSemester == null) {
            setSelectedSemester(list[list.length - 1]); // el más reciente
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
        return list;
    }, [allRows.length]);


    const visible = useMemo(() => {
        if (mode === "inscritas") {
            return allRows.filter(r => r.status === "in_progress");
        }
        if (mode === "semestre") {
            return allRows.filter(
                r => r.semester === selectedSemester
            );
        }

        return allRows;
    }, [allRows, mode, selectedSemester]);

    if (!payload) {
        return <div className="px-6 py-8">Cargando…</div>;
    }

    return (
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-black">
            {/* 0) Título de la página con líneas amarillas */}
            <PageTitle>Materias cursadas</PageTitle>

            {/* 1) Encabezado: información del alumno */}
            <div className="flex flex-col gap-3 w-full sm:flex-row sm:items-end sm:justify-between">
                <div className="grid items-center justify-center gap-3 w-3/5 h-full">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="h-14 w-14 rounded-full bg-gray-200" />
                            {/* Matrícula grande (expediente) */}
                            <h1 className="text-2xl font-bold tracking-tight">
                                {expediente ?? "XXXX XXXX XXXX XXXX"}
                            </h1>
                        </div>
                        {/* Nombre del alumno */}
                        <div className="ml-16 text-sm text-gray-700">
                            {payload.student.name}
                        </div>
                    </div>
                </div>

                <div className="ml-auto w-fit space-y-4">
                    <div className="font-bold w-full">Promedio</div>
                    <div className="w-full flex flex-wrap gap-3">
                        <KV
                            label="Promedio general"
                            value={payload.globalAverage.toFixed(2)}
                        />
                        <KV
                            label="Promedio anterior"
                            value={payload.kardexAverage.toFixed(2)}
                        />
                        <KV
                            label="Periodo actual"
                            value={payload.currentPeriod || "—"}
                        />
                        <KV
                            label="Estatus"
                            value={payload.student.status}
                        />
                        <KV
                            label="Plan de estudios"
                            value={String(payload.student.planYear)}
                        />
                        <KV
                            label="Tipo"
                            value={payload.student.type}
                        />
                    </div>
                </div>
            </div>

            {/* 2) Barra de filtros (entre info y tabla) */}
            <div className="mt-6">
                <div className="grid grid-cols-3 gap-4 max-w-2xl">
                    {/* Global */}
                    <Tab
                        active={mode === "global"}
                        onClick={() => setMode("global")}
                    >
                        Global
                    </Tab>

                    {/* Inscritas */}
                    <Tab
                        active={mode === "inscritas"}
                        onClick={() => setMode("inscritas")}
                    >
                        Inscritas
                    </Tab>

                    {/* Semestre + Dropdown */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => {
                                setMode("semestre");
                                setSemesterOpen(o => !o);
                            }}
                            className={`w-full inline-flex items-center justify-between gap-2 rounded-md px-6 py-3 text-base font-semibold transition
                                ${mode === "semestre"
                                    ? "bg-[#1E3A8A] text-white shadow-md"
                                    : "bg-[#F1F1F1] text-gray-700 hover:bg-[#E5E5E5]"
                                }`}
                        >
                            <span>Semestre</span>
                            <ChevronDown className="h-4 w-4" />
                        </button>

                        {mode === "semestre" && semesterOpen && (
                            <ul className="absolute z-10 mt-2 w-full bg-white border rounded-md shadow">
                                {semesters.length ? (
                                    semesters.map(s => (
                                        <li key={s}>
                                            <button
                                                className="w-full text-left px-4 py-2 hover:bg-gray-50"
                                                onClick={() => {
                                                    setSelectedSemester(s);
                                                    setSemesterOpen(false);
                                                }}
                                            >
                                                Semestre {s}
                                            </button>
                                        </li>
                                    ))
                                ) : (
                                    <li className="px-4 py-2 text-sm text-gray-500">
                                        Sin semestres
                                    </li>
                                )}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {/* 3) Tabla */}
            <div className="mt-4 overflow-hidden rounded-md shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full table-fixed border-collapse">
                        <colgroup>
                            <col className="w-20" />
                            <col />
                            <col className="w-1/6" />
                            <col className="w-1/6" />
                            <col className="w-1/6" />
                        </colgroup>

                        <thead className="bg-gray-200">
                            <tr className="text-sm font-bold text-[#525252]">
                                <th className="px-4 py-2 text-left">Clave</th>
                                <th className="px-4 py-2 text-left">Nombre</th>
                                <th className="px-4 py-2 text-left">Estado</th>
                                <th className="px-4 py-2 text-left">Semestre</th>
                                <th className="px-4 py-2 text-left">
                                    Calificación
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {visible.map(r => (
                                <tr
                                    key={`${r.code}-${r.semester ?? "na"}`}
                                    className={`align-middle ${rowBg(r.status)}`}
                                >
                                    <td className="px-0 py-0">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`h-full w-2 ${badge(
                                                    r.status
                                                )}`}
                                            />
                                            <span className="px-3 py-2 text-sm font-semibold inline-block">
                                                {r.code}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        {r.name}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        {r.group ?? "—"}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        {r.semester ?? "—"}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        {(() => {
                                            const g =
                                                r.grade !== null && r.grade !== undefined
                                                    ? Number(r.grade)
                                                    : NaN;

                                            if (!Number.isNaN(g)) return g;
                                            if (r.status === "dropped") return "Baja";
                                            return "—";
                                        })()}
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 4) Promedio de la vista + leyenda */}
            <div className="mt-4 flex flex-wrap items-center gap-6">
                <div className="text-sm text-gray-700">
                    Promedio de la vista:{" "}
                    <span className="font-semibold">
                        {avgOf(visible)}
                    </span>
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                    <Legend
                        color="bg-white ring-1 ring-gray-300"
                        label="No cursada"
                    />
                    <Legend
                        color="bg-[#A2E6A2]"
                        label="Aprobada"
                    />
                    <Legend
                        color="bg-[#FE8B8B]"
                        label="Reprobada"
                    />
                    <Legend
                        color="bg-[#FFF58A]"
                        label="Baja"
                    />
                    <Legend
                        color="bg-[#A2BBE6]"
                        label="En curso"
                    />
                </div>
            </div>
        </main>
    );
}

/* ------------ Subcomponentes ------------ */
function PageTitle({ children }: { children: React.ReactNode }) {
    return (
        <div className="mb-3">
            <div className="flex items-center gap-2">
                <span className="h-1 w-6 bg-yellow-500 rounded-sm" />
                <h2 className="text-2xl font-extrabold">{children}</h2>
                <span className="flex-1 h-1 bg-yellow-500 rounded-sm" />
            </div>
        </div>
    );
}

function KV({ label, value }: { label?: string; value: string }) {
    return (
        <div className="text-sm border-2 rounded-md border-[#ddd] p-3 shadow-sm min-w-40">
            <div className="flex gap-2">
                {label ? (
                    <span className="font-semibold text-black">
                        {label}:
                    </span>
                ) : null}
                <span>{value}</span>
            </div>
        </div>
    );
}

function Legend({ color, label }: { color: string; label: string }) {
    return (
        <div className="flex items-center gap-2">
            <span className={`inline-block h-4 w-6 rounded ${color}`} />
            <span className="text-gray-700">{label}</span>
        </div>
    );
}

/** Botón de pestaña ancho y uniforme */
function Tab({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full min-w-[160px] px-6 py-3 text-base font-semibold rounded-md transition-all duration-150
                ${active
                    ? "bg-[#1E3A8A] text-white shadow-md"
                    : "bg-[#F1F1F1] text-gray-700 hover:bg-[#E5E5E5]"
                }`}
        >
            {children}
        </button>
    );
}

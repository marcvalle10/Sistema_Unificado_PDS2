"use client";

import { useEffect, useState } from "react";
import {
    fetchMapaByExpediente,
    type MapaResult,
    type Status,
    type Subject,
    type SemesterColumn,
} from "@/app/actions/mapa";

const STATUS_STYLES: Record<
    Status,
    { bg: string; border: string; text: string }
> = {
    approved: {
        bg: "bg-[#6FB162]",
        border: "border-[black]",
        text: "text-[#164b12]",
    },
    withdrawn: {
        bg: "bg-[#F5CF50]",
        border: "border-[black]",
        text: "text-[#6b4a00]",
    },
    in_progress: {
        bg: "bg-[#55A4D9]",
        border: "border-[black]",
        text: "text-[#122a57]",
    },
    failed: {
        bg: "bg-[#ED5656]",
        border: "border-[black]",
        text: "text-[#5d1515]",
    },
    not_taken: {
        bg: "bg-[#FFFFFF]",
        border: "border-[black]",
        text: "text-[#3a3a3a]",
    },
};

export function MapaClient() {
    const [data, setData] = useState<MapaResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const expediente = window.localStorage.getItem("expediente");

        if (!expediente) {
            setError("No se encontró el expediente en este dispositivo.");
            setLoading(false);
            return;
        }

        fetchMapaByExpediente(expediente)
            .then((res) => setData(res))
            .catch((err: any) => {
                console.error("Error cargando mapa:", err);
                setError(
                    err?.message ?? "Ocurrió un error al cargar el mapa de materias."
                );
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <main className="mx-auto w-full max-w-7xl px-4 md:px-6">
                <div className="h-1.5 w-full bg-[#E6B10F] mb-6" />
                <h1 className="text-3xl md:text-[40px] font-extrabold text-[#2A3A5A] tracking-wide">
                    Mapa de materias
                </h1>
                <p className="mt-6 text-sm text-gray-600">Cargando mapa de materias…</p>
            </main>
        );
    }

    if (error || !data) {
        return (
            <main className="mx-auto w-full max-w-7xl px-4 md:px-6">
                <div className="h-1.5 w-full bg-[#E6B10F] mb-6" />
                <h1 className="text-3xl md:text-[40px] font-extrabold text-[#2A3A5A] tracking-wide">
                    Mapa de materias
                </h1>
                <p className="mt-6 text-sm text-red-700">
                    {error ?? "No se pudo cargar el mapa de materias."}
                </p>
            </main>
        );
    }

    // Ya viene tipado como SemesterColumn[]
    const planColumns: SemesterColumn[] = data.semestres;

    return (
        <main className="mx-auto w-full max-w-7xl px-4 md:px-6">
            {/* Barra dorada superior */}
            <div className="h-1.5 w-full bg-[#E6B10F] mb-6" />

            {/* Título */}
            <h1 className="text-3xl md:text-[40px] font-extrabold text-[#2A3A5A] tracking-wide">
                Mapa de materias
            </h1>

            {/* Contenido */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
                {/* Leyenda */}
                <Legend />

                {/* Grid de semestres */}
                <div className="overflow-x-auto">
                    <div className="min-w-[900px]">
                        <div
                            className="grid gap-4"
                            style={{
                                gridTemplateColumns: `repeat(${planColumns.length}, minmax(220px, 1fr))`,
                            }}
                        >
                            {planColumns.map((col) => (
                                <div key={col.semestre} className="space-y-3">
                                    <div className="text-sm font-semibold text-[#2A3A5A]">
                                        {col.semestre === 0
                                            ? "Optativas"
                                            : `Semestre ${col.semestre}`}
                                    </div>
                                    {col.materias.map((m) => (
                                        <CardMateria key={m.code} s={m} />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>


            {/* Pie de página con plan */}
            <div className="mt-16 flex w-full items-center justify-center gap-6">
                <div className="h-1.5 flex-1 max-w-[250px] bg-[#E6B10F]" />
                <div className="text-2xl md:text-3xl font-extrabold text-[#2A3A5A] whitespace-nowrap">
                    Plan de estudios: <span className="font-black">{data.planLabel}</span>
                </div>
                <div className="h-1.5 flex-1 max-w-[250px] bg-[#E6B10F]" />
            </div>


        </main>
    );
}

/* ---------- Auxiliares ---------- */

function Legend() {
    return (
        <aside className="rounded-lg border bg-white shadow-sm p-4 h-fit">
            <div className="text-sm font-semibold mb-3 text-[#2A3A5A]">
                Código de colores
            </div>
            <ul className="space-y-2 text-sm">
                <LegendRow colorClass="bg-[#6fb162]" label="La materia fue aprobada" />
                <LegendRow colorClass="bg-[#f0b41f]" label="La materia fue dada de baja" />
                <LegendRow colorClass="bg-[#2f6bd9]" label="La materia se está cursando" />
                <LegendRow
                    colorClass="bg-[#e24e4e]"
                    label="La materia fue reprobada"
                />
                <LegendRow
                    colorClass="bg-[#ddd]"
                    label="La materia aún no ha sido cursada"
                />
            </ul>
        </aside>
    );
}

function LegendRow({ colorClass, label }: { colorClass: string; label: string }) {
    return (
        <li className="flex items-center gap-3">
            <span className={`inline-block h-3 w-5 rounded-sm ${colorClass}`} />
            <span className="text-gray-800">{label}</span>
        </li>
    );
}

function CardMateria({ s }: { s: Subject }) {
    const style = STATUS_STYLES[s.status];

    return (
        <div
            className={`rounded-md border ${style.border} ${style.bg} shadow-sm h-32`}
        >
            <div className="grid grid-rows-[auto_1fr_auto] h-full">
                {/* Clave */}
                <div className="flex items-center gap-2 border-b px-2 py-1 text-[11px] uppercase tracking-wide font-semibold text-[#2A3A5A]/80">
                    <span className="opacity-80">Clave</span>
                    <span className="px-1.5 py-0.5 rounded bg-white/70 border text-[#2A3A5A]">
                        {s.code}
                    </span>
                </div>

                {/* Nombre */}
                <div className={`px-3 py-2 text-[13px] font-semibold leading-snug ${style.text}`}>
                    {s.name}
                </div>

                {/* Créditos */}
                <div className="border-t px-3 py-2 text-[11px]">
                    <div className="flex items-center justify-between">
                        <span className="uppercase opacity-80">Créditos</span>
                        <span className="inline-flex h-6 min-w-[1.75rem] items-center justify-center rounded bg-white/70 px-2 font-bold text-[#2A3A5A]">
                            {s.credits}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

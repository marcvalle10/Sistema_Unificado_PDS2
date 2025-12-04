"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "lucide-react";
import { CheckCircle2, XCircle } from "lucide-react";
import { getCredits, type CreditsData } from "@/app/actions/creditos";
import { Stars } from "@/components/creditos/stars";
import { BoolRow } from "@/components/creditos/boolRow";



export default function CreditosPage() {
    const [data, setData] = useState<CreditsData | null>(null);

    useEffect(() => { (async () => setData(await getCredits()))(); }, []);

    const computed = useMemo(() => {
        if (!data) return { missing: 0, pct: 0, totalStars: 0, stars: [] as StarState[] };
        const missing = Math.max(data.required - data.current, 0);
        const pct = Math.min((data.current / data.required) * 100, 100);

        const totalStars = data.english.scale ?? Math.max(data.english.requiredLevel + 2, data.english.currentLevel);
        const stars: StarState[] = Array.from({ length: totalStars }, (_, i) => {
            const n = i + 1;
            if (n <= data.english.currentLevel && n <= data.english.requiredLevel) return "met";
            if (n <= data.english.currentLevel && n > data.english.requiredLevel) return "extra";
            return "missing";
        });

        return { missing, pct, totalStars, stars };
    }, [data]);

    if (!data) return <div className="px-6 py-8">Cargando...</div>

    return (
        <main className="max-w-6wl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-black">
            {/* Titulo con barra amarrilla */}
            <section className="mb-4">
                <div className="flex items-center gap-3">
                    <div className="flex w-1/10 h-1 bg-[#E6B10F]" />
                    <h1 className="text-2xl text-[#525252] font-extrabold">Información general</h1>
                    <div className="h-1 flex-1 rounded bg-[#E6B10F]" />
                </div>
            </section>

            <section className="grid items-center justify-center grid-cols-1 md:grid-cols-2 gap-6 ml-20">
                {/* Creditos */}
                <Card>
                    <CardHeader>Creditos</CardHeader>
                    <div className="p-2 space-y-2">
                        <KV label="Creditos actuales:" value={data.current} />
                        <KV label="Creditos faltantes:" value={computed.missing} />
                    </div>
                </Card>

                {/* Validaciones */}
                <Card>
                    <CardHeader>Validación de requisitos</CardHeader>

                    <BoolRow
                        label="Servicio social"
                        help={
                            data.socialServiceFulFilled
                                ? "Cumples con los requisitos"
                                : "No cumples con los requisitos"
                        }
                        ok={data.socialServiceFulFilled}
                        current={data.current}
                        required={data.required}
                    />

                    <BoolRow
                        label="Prácticas profesionales"
                        help={
                            data.professionalPracticeFulFilled
                                ? "Cumples con los requisitos"
                                : "No cumples con los requisitos"
                        }
                        ok={data.professionalPracticeFulFilled}
                        current={data.current}
                        required={data.required}
                    />

                    <BoolRow
                        label="Movilidad (intercambio estudiantil)"
                        help={
                            data.mobility
                                ? "Cumples con los requisitos"
                                : "No cumples con los requisitos"
                        }
                        ok={data.mobility}
                    // aquí normalmente NO mostramos (276/393),
                    // por eso no pasamos current/required
                    />
                </Card>


                {/* Progreso para titulacion */}
                <Card>
                    <CardHeader>Progreso hacia titulacion</CardHeader>
                    <div className="p-4">
                        <div className="relative h-6 rounded-full bg-[#FFFFFF] overflow-hidden">
                            <div className="absolute left-0 top-0 h-full bg-black"
                                style={{ width: `${computed.pct}%` }}
                                aria-valuemax={100}
                                aria-valuemin={0}
                                aria-valuenow={Math.round(computed.pct)}
                                role="progressbar"
                            />
                        </div>
                        <div className="mt-2 flex justify-between text-sm">
                            <span>0</span>
                            <span>{data.required}</span>
                        </div>
                    </div>
                </Card>
                

                <Card>
                    <CardHeader>Nivel de ingles</CardHeader>
                    <div className="flex items-center justify-center pb-2 pt-2">
                        <p className="text-bold">Requisitos minimos: <span>{data.english.requiredLevel} niveles</span></p>
                    </div>

                    <div className="flex items-center justify-center gap-2 pb-1">
                        <Stars
                            value={data.english.currentLevel}
                            required={data.english.requiredLevel}
                            max={data.english.scale ?? 7}
                            size={32}
                        />
                    </div>


                    <div className="flex items-center justify-center mt-2 pb-1 text-[9px] space-x-4">
                        <LegendDot className="bg-[#E6B10F]" label="Requisito cumplido" />
                        <LegendDot className="bg-[#E6730F]" label="Extra" />
                        <LegendDot className="bg-[#767676]" label="Faltante" />
                    </div>
                </Card>
            </section>
        </main>
    );
}

type StarState = "met" | "extra" | "missing";

function Card({ children }: { children: React.ReactNode }) {
    return <section className="rounded-lg border bg-white shadow-sm w-full max-w-[500px] mx-auto h-auto">{children}</section>
}

function CardHeader({ children }: { children: React.ReactNode }) {
    return (
        <div className="px-4 py-2 bg-[#C3C3C2] font-semibold rounded-t-lg">
            {children}
        </div>
    );
}

function KV({ label, value }: { label: string; value: number | string }) {
    return (
        <div className="flex items-center justify-between">
            <span className="font-semibold text-black">{label}</span>
            <span className="text-black text-bold">{value}</span>
        </div>
    );
}

function ReqRow({ title, ok, okText, badText }: { title: string; ok: boolean; okText: string; badText: string }) {
    return (
        <div className="pl-4 pr-4 pt-1 pb-2">
            <div className="font-semibold">{title}</div>
            <div className="flex items-center gap-2">
                {ok ? <CheckCircle2 className="h-5 w-5 text-[#6FB162]" /> : <XCircle className="h-5 w-5 text-[#B16262]" />}
                <span className="text-black">{ok ? okText : badText}</span>
            </div>
        </div>
    );
}

function LegendDot({ className, label }: { className: string; label: string }) {
    return (
        <span className="inline-flex items-center gap-1">
            <span className={`inline-block h-3 w-3 rounded-full ${className}`} />
            {label}
        </span>
    );
}
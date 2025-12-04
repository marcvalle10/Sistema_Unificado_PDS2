"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { SectionRow } from "@/components/ui/sectionRow";
import { Stars } from "@/components/ui/stars";
import { BoolRow } from "@/components/ui/boolRow";
import { Summary, getUserSummary } from "@/app/actions/headerAlumno";
import { openSummarySSE } from "@/app/actions/sse";
import { useRouter, useSearchParams } from "next/navigation"; // Agregamos useSearchParams

type User = {
    name: string;
    expediente: string;
    promedioGeneral: number;
    promedioAnterior: number;
    creditosActuales: number;
    totalCreditos: number;
    porcentajeAvance: number;
    servicioSocialHabilitado: boolean;
    practicasProfesionalesHabilitado: boolean;
    nivelIngles: number;
};

function mapSummaryToUser(s: Summary): User {
    return {
        name: s.name,
        expediente: s.expediente,
        promedioGeneral: s.promedioGeneral,
        promedioAnterior: s.promedioAnterior,
        creditosActuales: s.creditosActuales,
        totalCreditos: s.totalCreditos,
        porcentajeAvance: s.porcentajeAvance,
        servicioSocialHabilitado: s.servicioSocialHabilitado,
        practicasProfesionalesHabilitado: s.practicasProfesionalesHabilitado,
        nivelIngles: s.nivelIngles,
    };
}

export default function Header({ locked = false }: { locked?: boolean }) {
    const router = useRouter();
    const searchParams = useSearchParams(); // Hook para leer URL
    
    const [open, setOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [isLocked, setIsLocked] = useState(locked);
    const ref = useRef<HTMLDivElement>(null);
    const sseCloseRef = useRef<(() => void) | null>(null);

    // Cierra dropdown al click fuera
    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (!ref.current) return;
            if (!ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, []);

    // MODIFICACIÓN
    useEffect(() => {
        // 1. Prioridad: Expediente en URL
        const expedienteUrl = searchParams.get("expediente");
        
        // 2. Respaldo: LocalStorage
        const expedienteLocal = (typeof window !== "undefined" && localStorage.getItem("expediente")) || "";

        // Elegimos el correcto
        const expediente = expedienteUrl || expedienteLocal;

        if (!expediente) return;

        // Si vino de URL, actualizamos el local para consistencia
        if (expedienteUrl && typeof window !== "undefined") {
            localStorage.setItem("expediente", expedienteUrl);
        }

        // 1) Fetch inicial
        getUserSummary(expediente)
            .then((s) => {
                if (s) {
                    setUser(mapSummaryToUser(s));
                    setIsLocked(false);
                    window.dispatchEvent(new CustomEvent("app:unlocked"));
                }
            })
            .catch(() => { });

        // 2) SSE
        const close = openSummarySSE(
            expediente,
            (s) => {
                setUser(mapSummaryToUser(s));
                setIsLocked(false);
                window.dispatchEvent(new CustomEvent("app:unlocked"));
            },
            () => { }
        );

        sseCloseRef.current = close;
        return () => close?.();
    }, [searchParams]); //  Agregamos dependencia para que reaccione al cambio de URL

    const handleLogout = () => {
        sseCloseRef.current?.();
        sseCloseRef.current = null;
        setUser(null);
        setIsLocked(true);
        setOpen(false);

        if (typeof window !== "undefined") {
            localStorage.removeItem("expediente");
            window.dispatchEvent(new CustomEvent("app:locked"));
            window.location.href = "/kardex";
            return;
        }
    };



    return (
        <header className="bg-white">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-6">
                <div className="flex items-center gap-15">
                    {/* Logo */}
                    <div className="flex items-center gap-4 md:gap-6">
                        <div className="relative h-14 w-14 md:h-20 md:w-16">
                            <Image
                                src="/logo-unison.png"
                                alt="Logo UNISON"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    </div>
                    {/* Título */}
                    <div className="leading-tight">
                        <h1 className="font-bentham text-xl md:text-2xl tracking-wide text-[#16469B]">
                            UNIVERSIDAD DE SONORA
                        </h1>
                        <p className="font-bentham text-[12px] md:text-[13px] text-[#16469B]">
                            "El Saber de mis Hijos Hará mi Grandeza"
                        </p>
                    </div>
                </div>

                {/* Chip de usuario */}
                <div className="relative" ref={ref}>
                    <div className="flex items-stretch rounded-2xl border border-gray-300/70 bg-white shadow-sm">
                        {/* Botón principal (avatar + nombre + chevron) */}
                        <button
                            onClick={() => setOpen((v) => !v)}
                            className="flex items-center gap-3 px-3 py-2"
                            aria-expanded={open}
                            aria-haspopup="menu"
                        >
                            <Image src="/avatar.svg" alt="avatar" width={32} height={32} />
                            <div className="leading-tight text-left">
                                <div className="text-sm font-semibold text-[#000000]">
                                    {isLocked ? "Usuario" : user?.name ?? "Usuario"}
                                </div>
                                <div className="text-[11px] text-[#000000]">
                                    {isLocked ? "*********" : user?.expediente ?? "*********"}
                                </div>
                            </div>
                            <ChevronDown className="ml-1 h-5 w-5 text-gray-500" />
                        </button>

                        {/* Botón salir SOLO cuando hay información */}
                        {!isLocked && user && (
                            <>
                                <div className="w-px bg-gray-200 my-1" />
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="flex items-center justify-center px-3"
                                    title="Cerrar sesión"
                                >
                                    <Image
                                        src="/salir.svg"
                                        alt="Cerrar sesión"
                                        width={20}
                                        height={20}
                                    />
                                </button>
                            </>
                        )}
                    </div>

                    {open && (
                        <div
                            role="menu"
                            className="absolute right-0 z-50 mt-2 overflow-hidden rounded-lg bg-white shadow-xl"
                        >
                            {isLocked || !user ? (
                                // Shimmer bloqueado (estado imagen 1)
                                <div className="animate-pulse p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-gray-200" />
                                        <div className="flex-1">
                                            <div className="h-3 w-40 rounded bg-gray-200" />
                                            <div className="mt-2 h-2 w-28 rounded bg-gray-200" />
                                        </div>
                                    </div>
                                    <div className="mt-4 space-y-3">
                                        <div className="h-3 w-56 rounded bg-gray-200" />
                                        <div className="h-3 w-52 rounded bg-gray-200" />
                                        <div className="h-3 w-64 rounded bg-gray-200" />
                                        <div className="h-3 w-40 rounded bg-gray-200" />
                                    </div>
                                </div>
                            ) : (
                                // Tarjeta resumen (estado imagen 2)
                                <div className="divide-y divide-gray-100 text-sm w-65">
                                    <SectionRow
                                        className="bg-[#E8E8E8]"
                                        label="Promedio general"
                                        help="Acumulado"
                                        value={user.promedioGeneral.toFixed(2)}
                                    />
                                    <SectionRow
                                        label="Promedio anterior"
                                        help="Semestre anterior"
                                        value={user.promedioAnterior.toFixed(2)}
                                    />
                                    <div className="bg-[#E8E8E8] px-4 py-3">
                                        <div className="mb-1 font-semibold text-[#000000]">
                                            Progreso hacia titulacion:
                                        </div>
                                        <div className="relative h-3 w-full rounded-full bg-gray-200">
                                            <div
                                                className="absolute left-0 top-0 h-3 rounded-full bg-[#6FB162]"
                                                style={{
                                                    width: `${Math.max(
                                                        0,
                                                        Math.min(100, user.porcentajeAvance)
                                                    )}%`,
                                                }}
                                            />
                                        </div>
                                        <div className="mt-1 flex items-center justify-between text-[11px] text-gray-600">
                                            <span>0</span>
                                            <span>{user.totalCreditos}</span>
                                        </div>
                                    </div>
                                    <SectionRow
                                        label="Créditos actuales"
                                        help="Acumulados"
                                        value={user.creditosActuales.toString()}
                                    />
                                    <BoolRow
                                        label="Servicio social"
                                        help={
                                            user.servicioSocialHabilitado
                                                ? "Cumples con los requisitos"
                                                : "No cumples con los requisitos"
                                        }
                                        ok={user.servicioSocialHabilitado}
                                    />
                                    <BoolRow
                                        label="Prácticas profesionales"
                                        help={
                                            user.practicasProfesionalesHabilitado
                                                ? "Cumples con los requisitos"
                                                : "No cumples con los requisitos"
                                        }
                                        ok={user.practicasProfesionalesHabilitado}
                                    />
                                    <div className="px-4 py-3 bg-[#E8E8E8]">
                                        <div className="font-semibold text-[#000000]">
                                            Nivel de Inglés:
                                        </div>
                                        <Stars value={user.nivelIngles} required={5} max={7} size={28} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="h-2 w-full bg-[#E6B10F]" />
        </header>
    );
}

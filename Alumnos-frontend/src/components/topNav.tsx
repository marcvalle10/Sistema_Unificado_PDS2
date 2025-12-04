"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, LayoutGrid } from "lucide-react";

type NavItem = {
    label: string;
    href: string;
    children?: { label: string; href: string }[];
}

const NAV: NavItem[] = [
    { label: "Carga de archivos", href: "/kardex" },
    { label: "Horario", href: "/horario" },
    {
        label: "Calificaciones",
        href: "/calificaciones",
        children: [
            { label: "Historial de materias cursadas", href: "/calificaciones/historial" },
            { label: "Mapa de materias", href: "/calificaciones/mapa" },
        ],
    },
    { label: "Créditos", href: "/creditos" },
];

export default function TopNav({ locked: initialLocked = false }: { locked?: boolean }){
    const pathname = usePathname();
    const[locked, setLocked] = useState(initialLocked);
    const[openKey, setOpenKey] = useState<string | null>(null);
    const ref = useRef<HTMLDivElement>(null);

    // Cerrar al hacer click fuera
    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpenKey(null);
        };
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, []);

    // Cerrar menu al cambiar de ruta
    useEffect(() => setOpenKey(null), [pathname]);

    useEffect(() => {
        const unlockHandler = () => setLocked(false);
        window.addEventListener("app:unlocked", unlockHandler);
        return () => window.removeEventListener("app:unlocked", unlockHandler);
    }, []);

    return (
        <nav className="bg-[#16469B] text-white">
            <div className="mx-auto w-full max-w-7xl px-4 md:px-6" ref={ref}>
                <div className="relative flex items-stretch ">
                    {NAV.map((item) => {
                        const isParentActive = pathname?.startsWith(item.href);
                        const isOpen = openKey === item.href;
                        const hasMenu = !!item.children?.length;

                        const isUpload = item.href === "/kardex";
                        const disabled = locked  && !isUpload;

                        const baseClasses = [
                            "flex h-14 items-center justify-center gap-2 rounded-t-md px-4 text-sm font-semibold transition",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                            disabled ? "opacity-50 cursor-not-allowed" : isParentActive ? "bg-white/10" : "hover:bg-white/10",
                        ].join(" ");

                        return(
                            <div key={item.href} className="relative basis-0 grow">
                                {disabled ? (
                                    <span className={baseClasses}>
                                        <span>{item.label}</span>
                                        {hasMenu && (isOpen ? (<ChevronUp className="h-4 w-4" />) : (<ChevronDown className="h-4 w-4" />))}
                                    </span>
                                ): (
                                    <Link href={item.href} className={baseClasses}
                                    onMouseEnter={ () => hasMenu && setOpenKey(item.href)}
                                    onFocus={() => hasMenu && setOpenKey(item.href)}
                                    onClick={(e) => {
                                        if (hasMenu) {
                                            e.preventDefault();
                                            setOpenKey(isOpen ? null : item.href);
                                        }
                                    }}
                                    aria-haspopup={hasMenu ? "menu" : undefined}
                                    aria-expanded={hasMenu ? isOpen : undefined}>
                                        <span>{item.label}</span>
                                        {hasMenu && (isOpen ? (<ChevronUp className="h-4 w-4" />) : (<ChevronDown className="h-4 w-4" />))}
                                    </Link>
                                )}

                                {!disabled && hasMenu && (
                                    <div onMouseLeave={() => setOpenKey(null)}
                                        className={[
                                            "absolute left-0 right-0 z-30 pt-1 transition",
                                        isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
                                    ].join(" ")}>
                                        <div className="mx-auto w-80 overflow-hidden rounded-md border-blue-200 bg-[#17306E] shadow-lg p-2">
                                            {item.children!.map((child) => {
                                                const activeChild = pathname?.startsWith(child.href);
                                                return (
                                                    <Link key={child.href} href={child.href} className={[
                                                        "block px-4 py-2 text-sm rounded-md transition mx-1 my-1",
                                                        "hover:border-2 hover:border-white hover:bg-white/10",
                                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                                                        activeChild ? "border-2 border-white bg-white/10" : "hover:bg-white/10",
                                                    ].join(" ")}>
                                                        {child.label}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}

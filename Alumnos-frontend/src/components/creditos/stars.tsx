"use client";

import Image from "next/image";

type StarsProps = {
    value: number;      // niveles cursados
    required?: number;  // nivel mínimo requerido
    max?: number;       // total de estrellas (7 por defecto)
    size?: number;      // tamaño en px
    className?: string;
};

export function Stars({
    value,
    required = 5,
    max = 7,
    size = 64,
    className = "",
}: StarsProps) {
    const done = Math.max(0, Math.min(value, max));
    const req  = Math.max(0, Math.min(required, max));
    const items = Array.from({ length: max }, (_, i) => i + 1);

    const srcFor = (n: number) => {
        if (n <= done) return n <= req ? "/stars-yellow.svg" : "/stars_orange.svg";
        return "/stars_gray.svg";
    };

    const altFor = (n: number) => {
        if (n <= done)
            return n <= req
                ? `Nivel ${n}: cursado (requerido)`
                : `Nivel ${n}: cursado extra`;
        return `Nivel ${n}: pendiente`;
    };

    return (
        <div className={`flex ${className}`}>
            {items.map((n) => (
                <Image
                    key={n}
                    src={srcFor(n)}
                    alt={altFor(n)}
                    width={size}
                    height={size}
                />
            ))}
        </div>
    );
}

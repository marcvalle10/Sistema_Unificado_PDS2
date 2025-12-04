import Image from "next/image";

type StarsProps = {
    value: number; // niveles cursados
    required?: number; // nivel minimo requerido
    max?: number; // 7
    size?: number; // 32
    className?: string;
};

export function Stars({ value, required = 5, max = 7, size = 32, className = "" }: StarsProps) {
    const done = Math.max(0, Math.min(value, max));
    const req = Math.max(0, Math.min(required, max));
    const items = Array.from({ length: max }, (_, i) => i+1);

    const srcFor = (n: number) => {
        if (n <= done) return n <= req ? "/stars-yellow.svg" : "/stars_orange.svg";
        return "/stars_gray.svg";
    };

    const altFor = (n: number) => {
        if (n <= done) return n <= req ? `Nivel ${n}: cursado (requerido)` : `Nivel ${n} cursado (extra)`;
        return `Nivel ${n}: pendiente`;
    };

    return (
        <div className={`mt-1 flex gap-1 ${className}`}>
            {items.map((n) => (
                <Image key={n} src={srcFor(n)} alt={altFor(n)} width={size} height={size} />
            ))}
        </div>
    );
}
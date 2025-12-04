"use client";

import Image from "next/image";

type BoolRowProps = {
    label: string;
    help: string;
    ok: boolean;
    current?: number;   // créditos actuales (para mostrar 276/393)
    required?: number;  // créditos requeridos
};

export function BoolRow({ label, help, ok, current, required }: BoolRowProps) {
    const img = ok ? "/ok.svg" : "/failed.svg";
    const alt = ok ? "check icon" : "failed icon";
    const bg = label === "Servicio social" ? "bg-[#E8E8E8]" : "";

    const ratio =
        current != null && required != null ? `(${current}/${required})` : null;

    return (
        <div className={`flex items-center justify-between px-4 py-3 ${bg}`}>
            <div>
                <div className="flex items-baseline gap-1">
                    <span className="font-semibold text-[#000000]">
                        {label}
                    </span>
                    {ratio && (
                        <span className="text-[10px] text-gray-500">
                            {ratio}
                        </span>
                    )}
                </div>
                <div className="mt-[2px] text-[11px] text-gray-600">
                    {help}
                </div>
            </div>

            <Image src={img} alt={alt} width={24} height={24} />
        </div>
    );
}

// import { CheckCircle2, XCircle } from "lucide-react";
import Image from "next/image";

export function BoolRow({ label, help, ok }: { label: string; help: string; ok: boolean }) {
    // const Icon = ok? CheckCircle2 : XCircle;
    // const color = ok ? "text-emerald-600" : "text-rose-600";
    const img = ok ? "/ok.svg" : "/failed.svg";
    const alt = ok ? "check icon" : "failed icon";
    const bg = label === "Servicio social" ? "bg-[#E8E8E8]" : "";
    return (
        <div className={`flex items-center justify-between px-4 py-3 ${bg}`}>
            <div>
                <div className="font-semibold text-[#000000]">{label}</div>
                <div className="text-[11px] text-gray-600">{help}</div>
            </div>
            <Image src={img} alt={alt} width={32} height={32} />
            {/* <Icon className={`h-7 w-7 ${color}`} /> */}
        </div>
    );
}
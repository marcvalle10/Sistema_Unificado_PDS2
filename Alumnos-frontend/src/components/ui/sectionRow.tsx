import { ReactNode } from "react";

type Props = {label: string; help?: string; value: ReactNode; className?: string};

export function SectionRow({ label, help, value, className = "" }: Props) {
    return (
        <div className={`grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 ${className}`}>
            <div>
                <div className="font-bold text-[#000000]">{label}:</div>
                {help && <div className="text-[11px] text-gray-600">{help}</div>}
            </div>
            <div className="text-right text-xl font-bold text-gray-900">{value}</div>
        </div>
    );
}
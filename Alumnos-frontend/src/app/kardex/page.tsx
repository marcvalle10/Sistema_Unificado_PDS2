"use client"; 

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import KardexUpload from "@/components/kardex/kardexUpload";
import { getKardexHistory } from "../actions/kardex";
import { getUserSummary } from "../actions/me";
import BroadcastUserSummary from "@/components/kardex/broadcastUserSummary";

// Componente interno que maneja la lógica
function KardexContent() {
    const searchParams = useSearchParams();
    const expedienteUrl = searchParams.get("expediente");

    const [history, setHistory] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initData = async () => {
            setLoading(true);
            
            // 1. Gestión del Expediente
            // Si viene en URL, ese MANDA y actualiza el localStorage
            let expedienteFinal = null;
            
            if (expedienteUrl) {
                if (typeof window !== "undefined") {
                    localStorage.setItem("expediente", expedienteUrl);
                }
                expedienteFinal = expedienteUrl;
            } else {
                // Si no, leemos del local (flujo normal de alumno)
                if (typeof window !== "undefined") {
                    expedienteFinal = localStorage.getItem("expediente");
                }
            }

            try {
                // 2. Cargar Historial (Usando el expediente correcto)
                // Si hay expediente, lo pasamos a la función (asumiendo que tu action lo soporta o lee del local)
                // NOTA: Si tu getKardexHistory lee cookies, aquí hay un truco:
                // Debemos asegurarnos que getKardexHistory acepte expediente como argumento opcional.
                // Si no lo acepta, el componente KardexUpload lo hará por su cuenta, 
                // así que aquí podemos pasar un array vacío para no estorbar.
                
                if (expedienteFinal) {
                     const hist = await getKardexHistory(expedienteFinal).catch(() => []);
                     setHistory(hist);
                } else {
                     // Intento carga normal (cookie)
                     const hist = await getKardexHistory().catch(() => []);
                     setHistory(hist);
                }

                // 3. Cargar Resumen de Usuario
                const sum = await getUserSummary().catch(() => null);
                setSummary(sum);

            } catch (error) {
                console.error("Error cargando datos iniciales:", error);
            } finally {
                setLoading(false);
            }
        };

        initData();
    }, [expedienteUrl]); // Se re-ejecuta si cambia la URL

    return (
        <main className="w-full mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
            {/* Solo mostramos el resumen si existe */}
            {summary && <BroadcastUserSummary summary={summary} />}

            <section>
                {loading ? (
                   <div className="p-10 text-center text-gray-500">Cargando historial...</div>
                ) : (
                   <KardexUpload 
                      maxSizeMB={5} 
                      initialHistory={history} 
                      // Pasamos el expediente explícitamente para forzar al componente a usarlo
                      forcedExpediente={expedienteUrl} 
                   />
                )}
            </section>
        </main>
    );
}

export default function KardexPage() {
    return (
        <Suspense fallback={<div className="p-6">Cargando...</div>}>
            <KardexContent />
        </Suspense>
    );
}
// src/app/actions/mapa.ts

export type Status =
    | "approved"     // aprobada
    | "withdrawn"    // dada de baja
    | "in_progress"  // se está cursando
    | "failed"       // reprobada
    | "not_taken";   // no cursada

type BackendSubject = {
    code: string;
    name: string;
    credits: number;
    status: Status;
};

type BackendSemester = {
    semestre: number;
    materias: BackendSubject[];
};

type BackendMapaResponse = {
    planNombre: string;      // ej. "INGENIERÍA EN SISTEMAS DE INFORMACIÓN"
    planVersion: string;     // ej. "2182"
    totalSemestres: number;  // ej. 8
    semestres: BackendSemester[];
};

export type Subject = {
    code: string;
    name: string;
    credits: number;
    status: Status;
};

export type SemesterColumn = {
    semestre: number;
    materias: Subject[];
};

export type MapaResult = {
    planLabel: string;
    totalSemestres: number;
    semestres: SemesterColumn[];
};


const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.API_BASE_URL ??
    "http://localhost:3001";

export async function fetchMapaByExpediente(
    expediente: string
): Promise<MapaResult> {
    const trimmed = expediente.trim();
    if (!trimmed) {
        throw new Error("Expediente requerido para cargar el mapa de materias");
    }

    const url = new URL("/mapa", API_BASE_URL);
    url.searchParams.set("expediente", trimmed);

    const res = await fetch(url.toString(), {
        cache: "no-store",
    });

    if (!res.ok) {
        if (res.status === 404) {
            console.warn(
                "No se encontró información de mapa para este expediente:",
                trimmed
            );
            return {
                planLabel: "Sin mapa disponible",
                totalSemestres: 0,
                semestres: [],
            };
        }
        throw new Error(`Error al consultar el mapa (${res.status})`);
    }

    const data = (await res.json()) as BackendMapaResponse;

    const semestres: SemesterColumn[] = data.semestres as SemesterColumn[];

    // const planLabel = [data.planNombre, data.planVersion].filter(Boolean).join(" ");

    let planLabel = data.planVersion ?? "—";

    if (planLabel === "2182") {
        planLabel = "2018";
    } else if (planLabel === "2252") {
        planLabel = "2025";
    }


    return {
        planLabel,
        totalSemestres: data.totalSemestres,
        semestres,
    };
}

import { apiFetch } from "./header";

export type Summary = {
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



export async function getUserSummary(expediente: string): Promise<Summary | null> {
    const url = `/users/summary?expediente=${encodeURIComponent(expediente)}`;
    const res = await apiFetch(url);
    const data = await res.json();
    return data ?? null;
}

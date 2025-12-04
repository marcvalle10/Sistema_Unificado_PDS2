import { AppDataSource } from "../config/data-source";
import { Alumno } from "../entities/Alumno";
import { PlanEstudio } from "../entities/PlanEstudio";
import type { Course } from "../data/Course";

// Plan 2018-2 (2182)
import { PLAN_ISI } from "../data/plan-isi-2182";
import { MAPA_ISI_SUGERIDO } from "../data/mapa-isi-2182";

// Plan 2025-2 (2252) 
let PLAN_ISI_2252: Course[] | null = null;
let MAPA_ISI_SUGERIDO_2252: Record<string, number> | null = null;

// Plan 2032 
let PLAN_ISI_2032: Course[] | null = null;
let MAPA_ISI_SUGERIDO_2032: Record<string, number> | null = null;

try {
    PLAN_ISI_2252 = require("../data/plan-isi-2252").PLAN_ISI_2252;
    MAPA_ISI_SUGERIDO_2252 = require("../data/mapa-isi-2252").MAPA_ISI_SUGERIDO_2252;
} catch (err) {
    console.warn("Archivos para el plan 2252 NO encontrados. Solo estará disponible el mapa 2182 (y otros planes que sí tengan archivo).");
}

try {
    PLAN_ISI_2032 = require("../data/plan-isi-2032").PLAN_ISI_2032;
    MAPA_ISI_SUGERIDO_2032 = require("../data/mapa-isi-2032").MAPA_ISI_SUGERIDO_2032;
} catch (err) {
    console.warn("Archivos para el plan 2032 NO encontrados. Agrega data/plan-isi-2032.ts y data/mapa-isi-2032.ts para habilitarlo.");
}

export type MapaStatus =
    | "approved"
    | "withdrawn"
    | "in_progress"
    | "failed"
    | "not_taken";

export type MapaSubjectDTO = {
    code: string;
    name: string;
    credits: number;
    status: MapaStatus;
};

export type MapaSemesterDTO = {
    semestre: number;  // 1..N, 0 = eje E / optativas
    materias: MapaSubjectDTO[];
};

export type MapaResponseDTO = {
    planNombre: string;
    planVersion: string;
    totalSemestres: number;
    semestres: MapaSemesterDTO[];
};

export async function getMapaByExpediente(
    expediente: string
): Promise<MapaResponseDTO | null> {
    const alumnoRepo = AppDataSource.getRepository(Alumno);
    const planRepo = AppDataSource.getRepository(PlanEstudio);

    const alumno = await alumnoRepo.findOne({
        where: { expediente: expediente.trim() },
    });
    if (!alumno) return null;

    const plan = await planRepo.findOne({
        where: { id: alumno.plan_estudio_id },
    });
    if (!plan) {
        throw new Error(`Plan de estudios no encontrado para alumno ${expediente}`);
    }

    const planVersion = String(plan.version).trim();

    let courses: Course[];
    let semesterMap: Record<string, number>;

    switch (planVersion) {
        case "2182":
            courses = PLAN_ISI;
            semesterMap = MAPA_ISI_SUGERIDO;
            break;

        case "2252":
            if (!PLAN_ISI_2252 || !MAPA_ISI_SUGERIDO_2252) {
                throw new Error(
                    `El plan de estudio 2252 existe en la BD, pero NO existen sus archivos de definición en el backend. ` +
                    `Agrega: data/plan-isi-2252.ts y data/mapa-isi-2252.ts`
                );
            }
            courses = PLAN_ISI_2252;
            semesterMap = MAPA_ISI_SUGERIDO_2252;
            break;

        case "2032":
            if (!PLAN_ISI_2032 || !MAPA_ISI_SUGERIDO_2032) {
                throw new Error(
                    `El plan de estudio 2032 existe en la BD, pero NO existen sus archivos de definición en el backend. ` +
                    `Agrega: data/plan-isi-2032.ts y data/mapa-isi-2032.ts`
                );
            }
            courses = PLAN_ISI_2032;
            semesterMap = MAPA_ISI_SUGERIDO_2032;
            break;

        default:
            throw new Error(
                `Plan de estudios no soportado para mapa de materias: versión ${planVersion}`
            );
    }

    // --- 1) Obtener estatus crudos desde kárdex (BD) ---
    type RawRow = { codigo: string; estatus: string };

    const rawRows: RawRow[] = await AppDataSource.manager.query(
        `
      SELECT m.codigo, k.estatus
      FROM kardex k
      JOIN alumno a ON a.id = k.alumno_id
      JOIN materia m ON m.id = k.materia_id
      WHERE a.expediente = $1
    `,
        [expediente.trim()]
    );

    const statusMap = new Map<string, string[]>();

    for (const row of rawRows) {
        const key = (row.codigo ?? "").trim();
        const prev = statusMap.get(key) ?? [];
        prev.push((row.estatus ?? "").trim().toUpperCase());
        statusMap.set(key, prev);
    }

    function computeStatusFromRaw(rawStatuses?: string[]): MapaStatus {
        if (!rawStatuses || rawStatuses.length === 0) return "not_taken";

        const s = rawStatuses.map(v => v.toUpperCase());

        if (s.includes("INSCRITO") || s.includes("INS")) return "in_progress";
        if (s.some(v => ["APROBADA", "ACREDITADA", "PARCIALMENTE_ACREDITADA"].includes(v)))
            return "approved";
        if (s.some(v => ["BAJA_VOLUNTARIA", "BAJA", "BAJA_DEFINITIVA"].includes(v)))
            return "withdrawn";
        if (s.some(v => ["NO_ACREDITADA", "REPROBADA", "NO_APROBADA"].includes(v)))
            return "failed";

        return "not_taken";
    }

    // --- 2) Construir el mapa de materias por semestre SOLO con los archivos ---
    const semMap = new Map<number, MapaSubjectDTO[]>();

    for (const c of courses) {
        const code = (c.code ?? "").trim();
        if (!code) continue;

        // Semestre definido por el mapa sugerido y eje
        let sem = c.eje === "E" ? 0 : semesterMap[code];

        // Si el archivo no tiene semestre para esa materia (y no es eje E), la ignoramos
        if (!sem && sem !== 0) continue;

        const subject: MapaSubjectDTO = {
            code,
            name: c.name,
            credits: c.credits,
            status: computeStatusFromRaw(statusMap.get(code)), // ESTATUS desde BD
        };

        if (!semMap.has(sem)) semMap.set(sem, []);
        semMap.get(sem)!.push(subject);
    }

    // --- 3) Ordenar semestres: 1..N, luego 0 (optativas/eje E) ---
    const semestres = Array.from(semMap.entries())
        .sort(([a], [b]) => (a === 0 ? 999 : a) - (b === 0 ? 999 : b))
        .map(([semestre, materias]) => ({
            semestre,
            materias: materias.sort((a, b) => a.code.localeCompare(b.code)),
        }));

    return {
        planNombre: plan.nombre,
        planVersion,
        totalSemestres: plan.semestres_sugeridos,
        semestres,
    };
}

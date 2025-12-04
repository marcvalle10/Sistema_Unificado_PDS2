import { AppDataSource } from "../config/data-source";
import { Alumno } from "../entities/Alumno";
import { PlanEstudio } from "../entities/PlanEstudio";

// --- Tipo que exporta el backend hacia el front ---
export type UserSummary = {
    name: string;
    expediente: string;
    promedioGeneral: number;
    promedioAnterior: number;
    creditosActuales: number;
    totalCreditos: number; // créditos totales del plan (para la barra 0–393)
    porcentajeAvance: number;
    servicioSocialHabilitado: boolean;
    practicasProfesionalesHabilitado: boolean;
    nivelIngles: number;
};

// --- Servicio principal ---
export async function getUserSummaryByExpediente(
    expediente: string
): Promise<UserSummary | null> {
    const alumnoRepo = AppDataSource.getRepository(Alumno);
    const planRepo = AppDataSource.getRepository(PlanEstudio);

    // 1) Alumno
    const alumno = await alumnoRepo.findOne({ where: { expediente } });
    if (!alumno) return null;

    // 2) Plan de estudios
    const planId =
        (alumno as any).plan_estudio_id ?? (alumno as any).planEstudioId ?? null;

    const plan = planId
        ? await planRepo.findOne({ where: { id: planId } })
        : null;

    const totalCreditosPlan = plan?.total_creditos ?? 0;
    const creditosServicio = plan?.creditos_servicio ?? 0;
    const creditosPracticas = plan?.creditos_practicas ?? 0;

    // 3) Promedios guardados en la tabla alumno
    const promedioGeneral =
        alumno.promedio_general != null ? Number(alumno.promedio_general) : 0;

    const promedioAnterior =
        alumno.promedio_periodo != null
            ? Number(alumno.promedio_periodo)
            : promedioGeneral;

    // 4) Créditos actuales del alumno
    const creditosActuales =
        alumno.total_creditos != null ? Number(alumno.total_creditos) : 0;

    // 5) Avance real con base en el plan
    const totalCreditos =
        totalCreditosPlan > 0 ? totalCreditosPlan : creditosActuales;

    const porcentajeAvance =
        totalCreditos > 0 ? (creditosActuales / totalCreditos) * 100 : 0;

    // 6) Requisitos de servicio social y prácticas
    const servicioSocialHabilitado =
        creditosServicio > 0 ? creditosActuales >= creditosServicio : false;

    const practicasProfesionalesHabilitado =
        creditosPracticas > 0 ? creditosActuales >= creditosPracticas : false;

    const nivelIngles = alumno.nivel_ingles_actual != null ? Number(alumno.nivel_ingles_actual) : 0;

    // 7) Nombre para UI
    const name = [
        alumno.nombre,
        alumno.apellido_paterno,
        alumno.apellido_materno,
    ]
        .filter(Boolean)
        .join(" ")
        .trim();

    return {
        name,
        expediente: alumno.expediente,
        promedioGeneral,
        promedioAnterior,
        creditosActuales,
        totalCreditos,
        porcentajeAvance,
        servicioSocialHabilitado,
        practicasProfesionalesHabilitado,
        nivelIngles 
    };
}

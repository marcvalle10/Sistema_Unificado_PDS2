import { supabase } from "@/lib/supabase";
import { HistoricalRecord } from "@/types/historical";

// Fila que viene de la tabla alumno + relación plan_estudio
type PlanEstudioRow = {
  id: number;
  nombre: string;
  version: string;
};

// Fila que viene de la tabla alumno + relación plan_estudio
export type AlumnoRow = {
  id: number;
  matricula: string;
  expediente: string | null;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  correo: string | null;
  estado_academico: string;
  nivel_ingles_actual: string | null;
  plan_estudio_id: number;
  total_creditos: number | null;
  sexo: string | null;
  fecha_nacimiento: string | null;
  tipo_alumno: string | null;
  promedio_general: number | null;
  promedio_periodo: number | null;
  materias_aprobadas: number | null;
  materias_reprobadas: number | null;
  periodo_inicio: number | null;
  acta_examen_profesional: string | null;
  constancia_exencion_examen_profesional: string | null;
  fecha_titulacion: string | null;
  creditos_culturest: number | null;
  creditos_deportes: number | null;

 
  plan?: PlanEstudioRow | PlanEstudioRow[] | null;
};



// Datos recibidos desde el modal (puedes añadir aquí más campos si los necesitas)
export type HistoricalFormData = Partial<HistoricalRecord> & {
  planEstudioId?: number;
};

/**
 * Mapea una fila de alumno (BD) a HistoricalRecord (front).
 */
export function mapAlumnoToHistorical(alumno: AlumnoRow): HistoricalRecord {
  const nombreCompleto = `${alumno.nombre} ${alumno.apellido_paterno ?? ""} ${
    alumno.apellido_materno ?? ""
  }`.trim();

  const estado: "ACTIVO" | "INACTIVO" =
    alumno.estado_academico === "INACTIVO" ? "INACTIVO" : "ACTIVO";

  // 🔍 Normalizamos el plan: puede venir como objeto o como arreglo
  let planLabel = "";

  if (Array.isArray(alumno.plan)) {
    const p = alumno.plan[0];
    if (p) {
      planLabel = `${p.nombre} ${p.version}`;
    }
  } else if (alumno.plan) {
    // caso: viene como objeto simple
    planLabel = `${alumno.plan.nombre} ${alumno.plan.version}`;
  } else {
    // (opcional) último fallback: al menos mostramos el id
    // planLabel = `Plan ${alumno.plan_estudio_id}`;
  }

  return {
    id: alumno.id,
    matricula: alumno.matricula,
    expediente: alumno.expediente ?? "",
    nombre: nombreCompleto,
    apellidoPaterno: alumno.apellido_paterno,
    apellidoMaterno: alumno.apellido_materno,
    email: alumno.correo ?? "",

    estadoAcademico: estado,
    nivelIngles: alumno.nivel_ingles_actual ?? "",
    planEstudios: planLabel,              // 👈 AHORA SÍ VIENE LLENO
    sexo: alumno.sexo ?? "",

    creditos: alumno.total_creditos ?? 0,
    fechaNacimiento: alumno.fecha_nacimiento,
    tipoAlumno: alumno.tipo_alumno ?? "",

    promedioGeneral: alumno.promedio_general,
    promedioPeriodo: alumno.promedio_periodo,

    materiasAprobadas: alumno.materias_aprobadas ?? 0,
    materiasReprobadas: alumno.materias_reprobadas ?? 0,
    periodoInicio: alumno.periodo_inicio ?? 0,

    actaExamenProfesional: alumno.acta_examen_profesional,
    constanciaExencionExamenProfesional:
      alumno.constancia_exencion_examen_profesional,
    fechaTitulacion: alumno.fecha_titulacion,
    creditosCulturest: alumno.creditos_culturest ?? 0,
    creditosDeportes: alumno.creditos_deportes ?? 0,
  };
}


/**
 * Prepara el payload para insert/update en la tabla alumno.
 */
export function mapFormToAlumnoPayload(data: HistoricalFormData) {
  // Si quisieras manejar nombre/apellidos separado, aquí es donde se hace;
  // por ahora asumimos que 'nombre' ya viene como nombre completo.
  const apellidoPaterno =
    data.apellidoPaterno && data.apellidoPaterno.trim().length > 0
      ? data.apellidoPaterno
      : "PENDIENTE"; // para no violar el NOT NULL

  return {
    matricula: data.matricula ?? "",
    expediente: data.expediente ?? null,
    nombre: data.nombre ?? "",
    apellido_paterno: apellidoPaterno,
    apellido_materno: data.apellidoMaterno ?? null,
    correo: data.email ?? null,
    estado_academico: data.estadoAcademico ?? "ACTIVO",
    nivel_ingles_actual: data.nivelIngles ?? null,
    plan_estudio_id: data.planEstudioId ?? 1,
    total_creditos: data.creditos ?? 0,
    sexo: data.sexo ?? null,
    fecha_nacimiento: data.fechaNacimiento ?? null,
    tipo_alumno: data.tipoAlumno ?? null,
    promedio_general: data.promedioGeneral ?? null,
    promedio_periodo: data.promedioPeriodo ?? null,
    materias_aprobadas: data.materiasAprobadas ?? 0,
    materias_reprobadas: data.materiasReprobadas ?? 0,
    periodo_inicio: data.periodoInicio ?? null,
    acta_examen_profesional: data.actaExamenProfesional ?? null,
    constancia_exencion_examen_profesional:
      data.constanciaExencionExamenProfesional ?? null,
    fecha_titulacion: data.fechaTitulacion ?? null,
    creditos_culturest: data.creditosCulturest ?? 0,
    creditos_deportes: data.creditosDeportes ?? 0,
  };
}

/**
 * Lee todos los alumnos (reporte histórico).
 */
export async function fetchHistoricalStudents(): Promise<HistoricalRecord[]> {
  const { data, error } = await supabase
  .from("alumno")
  .select(
    `
      id,
      matricula,
      expediente,
      nombre,
      apellido_paterno,
      apellido_materno,
      correo,
      estado_academico,
      nivel_ingles_actual,
      plan_estudio_id,
      total_creditos,
      sexo,
      fecha_nacimiento,
      tipo_alumno,
      promedio_general,
      promedio_periodo,
      materias_aprobadas,
      materias_reprobadas,
      periodo_inicio,
      acta_examen_profesional,
      constancia_exencion_examen_profesional,
      fecha_titulacion,
      creditos_culturest,
      creditos_deportes,
      plan:plan_estudio (
        id,
        nombre,
        version
      )
    `
  )
  .order("nombre");


  if (error) {
    console.error("Error al obtener alumnos:", error);
    throw error;
  }

  const rows = (data ?? []) as AlumnoRow[];
  return rows.map((row) => mapAlumnoToHistorical(row));
}

/**
 * Crea un nuevo alumno.
 */
export async function createHistoricalStudent(
  formData: HistoricalFormData
): Promise<HistoricalRecord> {
  const payload = mapFormToAlumnoPayload(formData);

  const { data, error } = await supabase
    .from("alumno")
    .insert([payload])
    .select(
      `
      id,
      matricula,
      expediente,
      nombre,
      apellido_paterno,
      apellido_materno,
      correo,
      estado_academico,
      nivel_ingles_actual,
      plan_estudio_id,
      total_creditos,
      sexo,
      fecha_nacimiento,
      tipo_alumno,
      promedio_general,
      promedio_periodo,
      materias_aprobadas,
      materias_reprobadas,
      periodo_inicio,
      acta_examen_profesional,
      constancia_exencion_examen_profesional,
      fecha_titulacion,
      creditos_culturest,
      creditos_deportes,
      plan:plan_estudio (
        id,
        nombre,
        version
      )
    `
    )
    .single();

  if (error) {
    console.error("Error al crear alumno:", error);
    throw error;
  }

  return mapAlumnoToHistorical(data as AlumnoRow);
}

/**
 * Actualiza un alumno existente.
 */
export async function updateHistoricalStudent(
  id: number,
  formData: HistoricalFormData
): Promise<HistoricalRecord> {
  const payload = mapFormToAlumnoPayload(formData);

  const { data, error } = await supabase
    .from("alumno")
    .update(payload)
    .eq("id", id)
    .select(
      `
      id,
      matricula,
      expediente,
      nombre,
      apellido_paterno,
      apellido_materno,
      correo,
      estado_academico,
      nivel_ingles_actual,
      plan_estudio_id,
      total_creditos,
      sexo,
      fecha_nacimiento,
      tipo_alumno,
      promedio_general,
      promedio_periodo,
      materias_aprobadas,
      materias_reprobadas,
      periodo_inicio,
      acta_examen_profesional,
      constancia_exencion_examen_profesional,
      fecha_titulacion,
      creditos_culturest,
      creditos_deportes,
      plan:plan_estudio (
        id,
        nombre,
        version
      )
    `
    )
    .single();

  if (error) {
    console.error("Error al actualizar alumno:", error);
    throw error;
  }

  return mapAlumnoToHistorical(data as AlumnoRow);
}

/**
 * Elimina un alumno.
 */
export async function deleteHistoricalStudent(id: number): Promise<void> {
  const { error } = await supabase.from("alumno").delete().eq("id", id);

  if (error) {
    console.error("Error al eliminar alumno:", error);
    throw error;
  }
}

// ===== Aliases para compatibilidad con el hook useReports =====

export async function getStudents(): Promise<HistoricalRecord[]> {
  return fetchHistoricalStudents();
}

export async function editStudent(
  id: number,
  data: Partial<HistoricalRecord>
): Promise<HistoricalRecord> {
  return updateHistoricalStudent(id, data);
}

export async function deleteStudent(id: number): Promise<void> {
  return deleteHistoricalStudent(id);
}

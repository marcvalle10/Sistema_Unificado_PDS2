import { AppDataSource } from "../config/data-source";

export type SummaryOut = {
  status: string;
  type: string;
  periodLabel: string;
};

export type RawRow = {
  materiaCodigo: string;
  materiaNombre: string;
  estatus: string;
  periodo: string;
  diaSemana: number | null;
  horaInicio: string | null;
  horaFin: string | null;
  aula: string | null;
};

type AlumnoRow = {
  id: number;
  estadoAcademico: string | null;
  tipoAlumno: string | null;
};

type PeriodoInfo = {
  id: number;
  etiqueta: string;
};

type PeriodoRow = {
  id: number;
  etiqueta: string;
};

/* ───────────────── helpers ───────────────── */

async function getAlumnoByExpediente(
  expediente: string
): Promise<AlumnoRow | null> {
  const rows = await AppDataSource.manager.query(
    `
    SELECT
      id,
      estado_academico::text AS "estadoAcademico",
      tipo_alumno            AS "tipoAlumno"
    FROM alumno
    WHERE expediente = $1
    LIMIT 1
    `,
    [expediente.trim()]
  );

  return rows[0] ?? null;
}

/**
 * Último periodo donde el alumno tiene materias con estatus INSCRITO.
 * Lo usamos tanto para el header como para filtrar las materias/horarios.
 */
async function getUltimoPeriodoInscrito(expediente: string): Promise<PeriodoRow | null> {
  const rows = await AppDataSource.manager.query(
    `
    SELECT
      p.id,
      p.etiqueta
    FROM kardex k
    JOIN periodo p ON p.id = k.periodo_id
    JOIN alumno a  ON a.id = k.alumno_id
    WHERE a.expediente = $1
      AND UPPER(TRIM(k.estatus)) = 'INSCRITO'
    ORDER BY p.anio DESC, p.ciclo DESC, p.id DESC
    LIMIT 1
    `,
    [expediente.trim()]
  );

  return rows[0] ?? null;
}

/* ───────────────── services públicos ───────────────── */

/** Header del front: estatus, tipo, periodo */
export async function getHorarioSummaryService(
  expediente: string
): Promise<SummaryOut> {
  if (!expediente) throw new Error("Expediente requerido");

  const alumno = await getAlumnoByExpediente(expediente);
  if (!alumno) throw new Error("Alumno no encontrado");

  const periodo = await getUltimoPeriodoInscrito(expediente);

  return {
    status: alumno.estadoAcademico ?? "—",
    type: alumno.tipoAlumno ?? "—",
    periodLabel: periodo?.etiqueta ?? "----",
  };
}

/**
 * Lista de materias INSCRITAS del alumno en su último periodo.
 * Si la materia tiene grupo+horario en ese periodo, se devuelve el horario real.
 * Si NO tiene horario, se devuelve la materia con diaSemana/horaInicio/horaFin/aula = null,
 * para que el front pueda "inventar" la disposición visual, pero sin perder la materia.
 */
export async function getHorarioListService(
  expediente: string
): Promise<RawRow[]> {
  if (!expediente) throw new Error("Expediente requerido");

  const periodo = await getUltimoPeriodoInscrito(expediente);
  if (!periodo) {
    return [];
  }

  const rows = await AppDataSource.manager.query(
    `
    WITH materias_inscritas AS (
      SELECT 
        k.materia_id,
        k.periodo_id,
        m.codigo AS "materiaCodigo",
        m.nombre AS "materiaNombre",
        k.estatus,
        p.etiqueta AS "periodo"
      FROM kardex k
      JOIN materia m ON m.id   = k.materia_id
      JOIN periodo p ON p.id   = k.periodo_id
      JOIN alumno a  ON a.id   = k.alumno_id
      WHERE a.expediente = $1
        AND p.id          = $2
        AND UPPER(TRIM(k.estatus)) = 'INSCRITO'
    )
    SELECT
      mi."materiaCodigo",
      mi."materiaNombre",
      mi.estatus,
      mi."periodo",
      h.dia_semana                     AS "diaSemana",
      to_char(h.hora_inicio,'HH24:MI') AS "horaInicio",
      to_char(h.hora_fin,  'HH24:MI')  AS "horaFin",
      h.aula                           AS "aula"
    FROM materias_inscritas mi
    LEFT JOIN grupo g
      ON g.materia_id = mi.materia_id
     AND g.periodo_id = mi.periodo_id
    LEFT JOIN horario h
      ON h.grupo_id = g.id
    ORDER BY
      h.dia_semana NULLS LAST,
      h.hora_inicio NULLS LAST,
      mi."materiaCodigo"
    `,
    [expediente.trim(), periodo.id]
  );

  return rows as RawRow[];
}

import { AppDataSource } from "../config/data-source";

export type CourseStatus =
  | "passed"
  | "failed"
  | "in_progress"
  | "dropped"
  | "not_taken";

export interface GradeRecord {
  code: string;
  name: string;
  group: string | null;
  semester: string | null;
  grade: number | null;
  status: CourseStatus;        // 'passed' | 'failed' | 'dropped' | 'in_progress' | 'not_taken'
}


export interface Course {
  code: string;
  name: string;
  suggestedTerm: number | null;
  creditos: number;
}

export interface SummaryDTO {
  student: {
    name: string;
    planYear: string | number;
    type: string;
    status: string;
  };
  currentPeriod: string;
  currentSemester: number;
  kardexAverage: number;
  globalAverage: number;
}

export async function summaryByExpediente(
  expediente: string
): Promise<SummaryDTO> {
  const sql = `
    WITH a AS (
      SELECT
        a.id,
        a.expediente,
        a.nombre,
        a.apellido_paterno,
        a.apellido_materno,
        a.plan_estudio_id,
        a.estado_academico,
        a.tipo_alumno,
        a.promedio_general,
        a.promedio_periodo
      FROM alumno a
      WHERE a.expediente = $1
    ),

    -- Último periodo con materias INSCRITAS en el kárdex (lo que tú llamas "periodo actual")
    active_kx AS (
      SELECT MAX(k.periodo_id) AS periodo_id
      FROM kardex k
      JOIN a ON a.id = k.alumno_id
      WHERE k.estatus IN ('INSCRITO', 'CURSANDO')
    ),

    -- Última inscripción en la tabla inscripcion (por si la usas en otros casos)
    last_ins AS (
      SELECT i.periodo_id
      FROM inscripcion i
      JOIN a ON a.id = i.alumno_id
      WHERE i.estatus = 'INSCRITO'
      ORDER BY i.fecha_alta DESC
      LIMIT 1
    ),

    -- Último registro de kárdex con promedios precalculados (por compatibilidad)
    last_kx AS (
      SELECT
        MAX(k.periodo_id)       AS periodo_id,
        MAX(k.promedio_kardex)  AS kardex_average,
        MAX(k.promedio_sem_act) AS current_semester
      FROM kardex k
      JOIN a ON a.id = k.alumno_id
    ),

    -- Periodo a usar:
    -- 1) primero el de materias INSCRITAS en kárdex (active_kx)
    -- 2) si no hay, el de la tabla inscripcion (last_ins)
    -- 3) si tampoco, el último periodo del kárdex (last_kx)
    periodo_actual AS (
      SELECT COALESCE(ak.periodo_id, li.periodo_id, lk.periodo_id) AS periodo_id
      FROM active_kx ak
      FULL JOIN last_ins li ON TRUE
      FULL JOIN last_kx lk  ON TRUE
    ),

    p AS (
      SELECT
        p.id,
        p.etiqueta AS current_period
      FROM periodo p
      JOIN periodo_actual pa ON pa.periodo_id = p.id
    ),

    plan AS (
      SELECT version AS plan_year
      FROM plan_estudio
      WHERE id = (SELECT plan_estudio_id FROM a)
    )

    SELECT
      TRIM(a.nombre || ' ' || a.apellido_paterno || ' ' || COALESCE(a.apellido_materno, '')) AS full_name,
      a.estado_academico AS status,
      COALESCE(a.tipo_alumno, 'Regular')                                                      AS tipo_alumno,
      (SELECT plan_year      FROM plan LIMIT 1)                                               AS plan_year,
      (SELECT current_period FROM p    LIMIT 1)                                               AS current_period,

      -- 🔹 Promedio del periodo (lo usamos como "Promedio anterior")
      COALESCE(a.promedio_periodo, lk.current_semester, 0)                                   AS periodo_average,

      -- 🔹 Promedio general del kárdex
      COALESCE(a.promedio_general, lk.kardex_average, 0)                                     AS kardex_average
    FROM a
    LEFT JOIN last_kx lk ON TRUE
  `;

  const rows: any[] = await AppDataSource.query(sql, [expediente]);
  const r = rows[0] ?? {};

  return {
    student: {
      name: String(r.full_name ?? "—"),
      planYear: String(r.plan_year ?? "—"),
      type: String(r.tipo_alumno ?? "Regular"),
      status: String(r.status ?? "ACTIVO"),
    },
    currentPeriod: String(r.current_period ?? ""),
    currentSemester: 0,
    kardexAverage: Number(r.kardex_average ?? 0),           // Promedio general
    globalAverage: Number(r.periodo_average ?? 0),          // Promedio anterior
  };
}


export async function historyByExpediente(
  expediente: string
): Promise<GradeRecord[]> {
  const sql = `
    SELECT
      m.codigo                AS code,
      m.nombre                AS name,
      k.e2                    AS "group",
      p.etiqueta                 AS semester,
      k.calificacion::numeric AS grade,
      CASE
        WHEN k.estatus IN ('APROBADA', 'ACREDITADA') THEN 'passed'
        WHEN k.estatus IN ('REPROBADA')             THEN 'failed'
        WHEN k.estatus IN ('BAJA_VOLUNTARIA','BAJA') THEN 'dropped'
        WHEN k.estatus IN ('INSCRITO','CURSANDO')   THEN 'in_progress'
        ELSE 'not_taken'
      END                     AS status
    FROM kardex k
    JOIN alumno a  ON a.id = k.alumno_id
    JOIN materia m ON m.id = k.materia_id
    JOIN periodo p ON p.id = k.periodo_id
    WHERE a.expediente = $1
    ORDER BY p.anio, p.ciclo, m.codigo;
  `;
  return AppDataSource.query(sql, [expediente]);
}


export async function enrolledByExpediente(
  expediente: string
): Promise<GradeRecord[]> {
  const sql = `
    WITH a AS (
      SELECT id
      FROM alumno
      WHERE expediente = $1
    ),
    last_ins AS (
      SELECT i.periodo_id
      FROM inscripcion i
      JOIN a ON a.id = i.alumno_id
      WHERE i.estatus = 'INSCRITO'
      ORDER BY i.fecha_alta DESC
      LIMIT 1
    )
    SELECT
      m.codigo                AS code,
      m.nombre                AS name,
      k.e2                    AS "group",
      p.etiqueta                 AS semester,
      k.calificacion::numeric AS grade,
      'in_progress'           AS status
    FROM kardex k
    JOIN a          ON a.id = k.alumno_id
    JOIN materia m  ON m.id = k.materia_id
    JOIN periodo p  ON p.id = k.periodo_id
    WHERE k.periodo_id = (SELECT periodo_id FROM last_ins)
      AND k.estatus IN ('INSCRITO','CURSANDO')  -- según tus valores reales
    ORDER BY m.codigo;
  `;
  return AppDataSource.query(sql, [expediente]);
}


export async function planByExpediente(
  expediente: string
): Promise<Course[]> {
  const sql = `
    SELECT
      m.codigo   AS code,
      m.nombre   AS name,
      NULL::int  AS "suggestedTerm",
      m.creditos AS creditos
    FROM materia m
    JOIN alumno a ON a.plan_estudio_id = m.plan_estudio_id
    WHERE a.expediente = $1
    ORDER BY m.codigo;
  `;
  return AppDataSource.query(sql, [expediente]);
}

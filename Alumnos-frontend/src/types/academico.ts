// app/types/academico.ts

/* ────────────── Calificaciones ────────────── */

export type CourseStatus =
  | "not_taken"
  | "passed"
  | "failed"
  | "dropped"
  | "in_progress";

export type Course = {
  code: string;
  name: string;
  credits: number;
  eje?: "C" | "B" | "P" | "I" | "E";
  prereq?: string[];
  semester?: number;
  suggestedTerm?: number;
};

export type GradeRecord = {
  code: string;
  name: string;
  group?: string | null;
  semester?: string | null;
  grade?: number | null;
  status?: CourseStatus;
};

export type GradesPayload = {
  student: { name: string; planYear: string; type: string; status: string };
  currentPeriod: string;
  currentSemester: number;
  kardexAverage: number;
  globalAverage: number;
  plan: Course[];
  history: GradeRecord[];
  enrolled: GradeRecord[];
};

/* ────────────── Horarios ────────────── */

/**
 * Cada bloque o clase dentro del horario.
 */
export interface ScheduleCourse {
  id: string;
  code: string;
  name: string;
  status: string;   // "INSCRITO"
  period: string;   // ej. "2025-2"
}

export interface ScheduleData {
  student: {
    status: string;
    type: string;
    currentSemester: string;
  };
  courses: ScheduleCourse[];
}

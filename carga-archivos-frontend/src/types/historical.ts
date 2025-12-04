export interface HistoricalRecord {
  id: number;

  /** Identificación principal */
  matricula: string;
  expediente: string;

  /** Nombre completo */
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string | null;

  /** Contacto */
  email: string;

  /** Estado del alumno */
  estadoAcademico: "ACTIVO" | "INACTIVO";

  /** Inglés (nivel_ingles_actual) */
  nivelIngles: string;

  /** Plan de estudios (se usa la etiqueta, no el ID) */
  planEstudios: string;

  /** Sexo */
  sexo: string;

  /** Créditos totales */
  creditos: number;

  /** Fecha nacimiento */
  fechaNacimiento: string | null;

  /** Tipo alumno */
  tipoAlumno: string;

  /** Promedios */
  promedioGeneral: number | null;
  promedioPeriodo: number | null;

  /** Historial académico */
  materiasAprobadas: number;
  materiasReprobadas: number;
  periodoInicio: number | null;

  /** Documentos de titulación */
  actaExamenProfesional?: string | null;
  constanciaExencionExamenProfesional?: string | null;
  fechaTitulacion?: string | null;

  /** Créditos extracurriculares */
  creditosCulturest: number;
  creditosDeportes: number;
}

export interface FileHistoryRecord {
  id: number;
  date: string;
  filename: string;
  status: "ERROR" | "CANCELADO" | "COMPLETADO" | "PENDIENTE";
}

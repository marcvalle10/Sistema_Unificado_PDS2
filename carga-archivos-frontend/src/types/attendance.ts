export interface AttendanceRecord {
  periodo: string;
  codigo_materia: string;
  nombre_materia: string;
  grupo: string;

  matricula: string;
  expediente: string | null;

  nombre_alumno: string;
  apellido_paterno: string;
  apellido_materno: string | null;

  fecha_alta: string; // ISO
  fuente: string;

  archivo_id: number | null;
  nombre_archivo: string | null;
  fecha_archivo: string | null; // ISO
}

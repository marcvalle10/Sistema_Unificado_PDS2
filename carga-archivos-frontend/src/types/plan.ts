export interface PlanRecord {
  id: number; // id de la materia
  codigo: string;
  nombre_materia: string;
  creditos: number;
  tipo: string; // OBLIGATORIA / OPTATIVA / etc

  plan_id: number;
  plan_nombre: string;
  plan_version: string;
  plan_total_creditos?: number | null;
  plan_semestres_sugeridos?: number | null;
}

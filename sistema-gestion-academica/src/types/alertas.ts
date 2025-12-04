export type Semaforo = 'ok' | 'warning' | 'danger';

export interface Grupo {
  id: string;        // UUID o id numérico
  clave: string;     // p.ej. "MAT101"
  nombre: string;    // p.ej. "grupo 1"
}

export interface AlumnoFaltas {
  expediente: string;
  nombreCompleto: string;
  faltas: number;           // faltas acumuladas
  faltasPermitidas: number; // límite (p.ej. 14)
}

export interface AlertasQuery {
  grupoId: string;
}

export const getSemaforo = (faltas: number, permitidas: number): Semaforo => {
  if (permitidas <= 0) return 'ok';
  const ratio = faltas / permitidas;
  if (ratio >= 0.75) return 'danger';
  if (ratio >= 0.5) return 'warning';
  return 'ok';
};

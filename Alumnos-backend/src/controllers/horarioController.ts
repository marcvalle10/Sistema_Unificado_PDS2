import { Request, Response } from "express";
import {
  getHorarioSummaryService,
  getHorarioListService,
} from "../services/horarioService";

export async function getHorarioSummary(req: Request, res: Response) {
  try {
    const studentId = String(req.query.studentId ?? "").trim();
    if (!studentId) {
      return res.status(400).json({ error: "Parámetro studentId requerido" });
    }

    const summary = await getHorarioSummaryService(studentId);
    return res.json(summary);

  } catch (err: any) {
    console.error("[GET /horario/summary] Error:", err);

    const message = err instanceof Error ? err.message : "Error interno";
    const status =
      message === "Alumno no encontrado" ? 404 : 500;

    return res.status(status).json({ error: message });
  }
}


export async function getHorarioList(req: Request, res: Response) {
  try {
    const studentId = String(req.query.studentId ?? "").trim();
    if (!studentId) {
      return res.status(400).json({ error: "Parámetro studentId requerido" });
    }

    const rows = await getHorarioListService(studentId);
    return res.json(rows);

  } catch (err: any) {
    console.error("[GET /horario/list] Error:", err);

    const message = err instanceof Error ? err.message : "Error interno";
    const status =
      message === "Alumno no encontrado" ? 404 : 500;

    return res.status(status).json({ error: message });
  }
}

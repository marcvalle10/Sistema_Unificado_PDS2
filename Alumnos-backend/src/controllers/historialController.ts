import { Request, Response } from "express";
import * as svc from "../services/historialService";

function readExpediente(req: Request): string {
  const id = String(req.query.studentId ?? "").trim();
  if (!id) {
    throw new Error("Falta query ?studentId=<expediente>.");
  }
  return id;
}

export async function getSummary(req: Request, res: Response) {
  try {
    const expediente = readExpediente(req);
    const data = await svc.summaryByExpediente(expediente);

    return res.json(data);
  } catch (err: any) {
    return res
      .status(400)
      .json({ error: err.message ?? "Error interno en /historial/summary" });
  }
}

export async function getHistory(req: Request, res: Response) {
  try {
    const expediente = readExpediente(req);
    const rows = await svc.historyByExpediente(expediente);

    return res.json(rows);
  } catch (err: any) {
    return res
      .status(400)
      .json({ error: err.message ?? "Error interno en /historial/history" });
  }
}

export async function getEnrolled(req: Request, res: Response) {
  try {
    const expediente = readExpediente(req);
    const rows = await svc.enrolledByExpediente(expediente);

    return res.json(rows);
  } catch (err: any) {
    return res
      .status(400)
      .json({ error: err.message ?? "Error interno en /historial/enrolled" });
  }
}
export async function getPlan(req: Request, res: Response) {
  try {
    const expediente = readExpediente(req);
    const rows = await svc.planByExpediente(expediente);

    return res.json(rows);
  } catch (err: any) {
    return res
      .status(400)
      .json({ error: err.message ?? "Error interno en /historial/plan" });
  }
}

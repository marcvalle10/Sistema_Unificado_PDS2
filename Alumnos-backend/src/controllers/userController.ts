import { Request, Response } from "express";
import { getUserSummaryByExpediente } from "../services/userSummary";

export const userController = {
    summary: async (req: Request, res: Response) => {
        try {
            const expediente = String(req.query.expediente ?? "").trim();
            if (!expediente) return res.status(400).json({ error: "expediente requerido" });

            const summary = await getUserSummaryByExpediente(expediente);
            if (!summary) return res.status(404).json({ error: "alumno no encontrado" });

            res.json(summary);
        } catch (e: any) {
            console.error("summary error:", e);
            res.status(500).json({ error: "error interno" });
        }
    }
};

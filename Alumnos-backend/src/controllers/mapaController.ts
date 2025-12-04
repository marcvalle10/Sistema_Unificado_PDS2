import { Request, Response } from "express";
import { getMapaByExpediente } from "../services/mapaService";

export const mapaController = {
  byExpediente: async (req: Request, res: Response) => {
    try {
      const expediente = String(req.query.expediente ?? "").trim();
      if (!expediente) {
        return res.status(400).json({ error: "expediente requerido" });
      }

      const mapa = await getMapaByExpediente(expediente);
      if (!mapa) {
        return res
          .status(404)
          .json({ error: "alumno no encontrado para ese expediente" });
      }

      res.json(mapa);
    } catch (err: any) {
      console.error("mapa error:", err);
      res.status(500).json({ error: "error interno" });
    }
  },
};

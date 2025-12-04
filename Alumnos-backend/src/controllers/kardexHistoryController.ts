import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { ArchivoCargado } from "../entities/ArchivoCargado";

type KardexStatus = "valid" | "rejected" | "processing";
type Row = { id: number; uploadedAt: string; filename: string; status: KardexStatus };

const mapEstado = (estado: string | null | undefined): KardexStatus => {
    switch ((estado ?? "").toUpperCase()) {
        case "COMPLETADO": return "valid";
        case "ERROR": return "rejected";
        case "PENDIENTE": default: return "processing";
    }
};

export const kardexHistoryController = {
    byExpediente: async (req: Request, res: Response) => {
        try {
            const expediente = String(req.query.expediente ?? "").trim();
            if (!expediente) return res.status(400).json({ error: "expediente requerido" });

            const repo = AppDataSource.getRepository(ArchivoCargado);
            const items = await repo.createQueryBuilder("a")
                .where("a.tipo = :tipo", { tipo: "KARDEX" })
                .andWhere("a.expediente = :expediente", { expediente })
                .orderBy("a.fecha", "DESC")
                .limit(50)
                .getMany();

            const rows: Row[] = items.map(i => ({
                id: i.id,
                uploadedAt: i.fecha?.toISOString?.() ?? new Date().toISOString(),
                filename: i.nombre_archivo ?? i.stored_name ?? "kardex.pdf",
                status: mapEstado(i.estado_proceso),
            }));

            res.json(rows);
        } catch (e) {
            console.error("history error:", e);
            res.status(500).json({ error: "error interno" });
        }
    }
};

import { Router } from "express";
import { mapaController } from "../controllers/mapaController";

const r = Router();

// GET /mapa?expediente=222202156
r.get("/", mapaController.byExpediente);

export default r;

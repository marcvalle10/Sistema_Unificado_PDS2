import { Router } from "express";
import * as ctrl from "../controllers/historialController";

const router = Router();

// GET /historial/summary?studentId=EXP
router.get("/summary", ctrl.getSummary);

// GET /historial/history?studentId=EXP
router.get("/history", ctrl.getHistory);

// GET /historial/enrolled?studentId=EXP
router.get("/enrolled", ctrl.getEnrolled);

// GET /historial/plan?studentId=EXP
router.get("/plan", ctrl.getPlan);

export default router;

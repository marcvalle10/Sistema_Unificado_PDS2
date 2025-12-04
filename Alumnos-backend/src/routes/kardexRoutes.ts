import { Router } from "express";
import { uploadKardex } from "../middlewares/kardexMiddleware";
import { kardexController } from "../controllers/kardexController";
import { kardexHistoryController } from "../controllers/kardexHistoryController";

const router = Router();

router.post("/upload", uploadKardex, kardexController.uploadFile);

router.get("/history", kardexHistoryController.byExpediente);

export default router;
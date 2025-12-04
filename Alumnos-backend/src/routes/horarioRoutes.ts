import { Router } from "express";
import { getHorarioSummary, getHorarioList } from "../controllers/horarioController";

const r = Router();

// GET /horario/summary?studentId=EXP
r.get("/summary", getHorarioSummary);

// GET /horario/list?studentId=EXP
r.get("/list", getHorarioList);

export default r;

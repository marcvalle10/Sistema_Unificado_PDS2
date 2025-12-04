import { Router } from "express";
import { userController } from "../controllers/userController";
const r = Router();

r.get("/summary", userController.summary); // ?expediente=222202156
export default r;

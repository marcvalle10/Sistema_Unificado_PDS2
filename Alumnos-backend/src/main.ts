import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import kardexRoutes from './routes/kardexRoutes';
import userRoutes from "./routes/userRoutes";
import { sseHandler } from './realtime/sse';
import historialRoutes from './routes/historialRoutes';
import horarioRoutes from './routes/horarioRoutes';
import mapaRoutes from "./routes/mapaRoutes";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Rutas y lógica de la aplicación
app.use("/kardex", kardexRoutes);
app.use("/users", userRoutes);
app.use("/historial", historialRoutes);
app.use("/horario", horarioRoutes);
app.use("/mapa", mapaRoutes);
app.get("/realtime/sse", sseHandler);

export default app;
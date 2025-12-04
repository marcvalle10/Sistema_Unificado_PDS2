import { Request, Response } from "express";
import { getUserSummaryByExpediente } from "../services/userSummary";

type Client = { id: string; res: Response };
const clientsByKey = new Map<string, Client[]>();

export async function sseHandler(req: Request, res: Response) {
    const canal = String(req.query.canal ?? "anon");

    res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
    });
    res.write(`event: ping\ndata: "connected"\n\n`);

    try {
        const summary = await getUserSummaryByExpediente(canal);
        if (summary) {
            res.write(`event: snapshot\n`);
            res.write(`data: ${JSON.stringify({ ok: true, summary })}\n\n`);
        }
    } catch (e) {
    }

    const client: Client = { id: Math.random().toString(36).slice(2), res };
    const list = clientsByKey.get(canal) ?? [];
    list.push(client);
    clientsByKey.set(canal, list);

    req.on("close", () => {
        const arr = clientsByKey.get(canal) ?? [];
        clientsByKey.set(canal, arr.filter(c => c.id !== client.id));
    });
}

export function sseEmit(canal: string, event: string, payload: any) {
    const clients = clientsByKey.get(canal) ?? [];
    const data = typeof payload === "string" ? payload : JSON.stringify(payload);
    for (const c of clients) {
        c.res.write(`event: ${event}\n`);
        c.res.write(`data: ${data}\n\n`);
    }
}

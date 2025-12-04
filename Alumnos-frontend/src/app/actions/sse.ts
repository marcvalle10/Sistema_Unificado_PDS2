export function openSummarySSE(
    expediente: string,
    onSummary: (s: any) => void,
    onError?: (e: any) => void
) {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
    const es = new EventSource(`${base}/realtime/sse?canal=${encodeURIComponent(expediente)}`);

    const handler = (ev: MessageEvent) => {
        try {
            const payload = JSON.parse(ev.data);
            if (payload?.ok && payload.summary) onSummary(payload.summary);
        } catch (e) {
            onError?.(e);
        }
    };

    es.addEventListener("snapshot", handler); 
    es.addEventListener("finish", handler);

    es.onerror = (e) => onError?.(e);
    return () => es.close();
}

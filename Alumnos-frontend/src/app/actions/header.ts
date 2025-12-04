// Reutilízala en todas tus acciones
export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export async function apiFetch(path: string, init: RequestInit = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        cache: "no-store",
        headers: {
            "Content-Type": "application/json",
            ...(init.headers || {}),
        },
        ...init,
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`API ${path} ${res.status} ${text}`);
    }
    return res;
}

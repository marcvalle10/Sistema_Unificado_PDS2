const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export type KardexStatus = "valid" | "rejected" | "processing";

export interface KardexItem {
    id: string | number;
    uploadedAt: string;
    filename: string;
    status: KardexStatus;
}

async function handleError(res: Response): Promise<never> {
    let message = `HTTP ${res.status}`;
    try {
        const data = await res.json();
        message = data?.message || message;
    } catch {
        try {
            const t = await res.text();
            if (t) message = t;
        } catch { }
    }
    if (res.status === 413) {
        message = "El archivo excede el tamaño permitido por el servidor.";
    }
    throw new Error(message);
}

export async function uploadKardex(file: File) {
    const form = new FormData();
    form.append("file", file);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 180_000); // 60s timeout

    try {
        const res = await fetch(`${BASE}/kardex/upload`, {
            method: "POST",
            body: form,
            cache: "no-store",
            signal: controller.signal,
        });

        const data = await res.json();

        if (!res.ok) {
            console.error("Error al subir Kardex:", data);
            throw new Error(data?.message || "Error al cargar el archivo");
        }

        if (data?.summary?.expediente) {
            const expediente = String(data.summary.expediente).trim();

            if (typeof window !== "undefined") {
                localStorage.setItem("expediente", expediente);

                window.dispatchEvent(
                    new CustomEvent("user:summary", { detail: data.summary })
                );
            }

            console.log("Kardex subido correctamente para expediente:", expediente);
        }

        return data;
    } catch (error: any) {
        if (error.name === "AbortError") {
            throw new Error("Tiempo de espera agotado al subir el archivo.");
        }
        console.error("Error general en uploadKardex:", error);
        throw error;
    } finally {
        clearTimeout(timeout);
    }
}


export async function getKardexHistory(expediente?: string): Promise<KardexItem[]> {
  const exp =
    (expediente ?? (typeof window !== "undefined" ? localStorage.getItem("expediente") || "" : "")).trim();

  if (!exp) return [];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000); // 60s

  try {
    const res = await fetch(`${BASE}/kardex/history?expediente=${encodeURIComponent(exp)}`, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });

    if (res.status === 404) return [];
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("Error al obtener historial:", res.status, text);
      throw new Error("No se pudo cargar el historial.");
    }

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((row: any) => ({
      id: row.id ?? `${row.filename ?? "kardex"}.${row.uploadedAt ?? Date.now()}`,
      uploadedAt: row.uploadedAt ?? new Date().toISOString(),
      filename: row.filename ?? "kardex.pdf",
      status: (row.status as KardexStatus) ?? "processing",
    })) as KardexItem[];
  } catch (error: any) {
    if (error?.name === "AbortError") {
      throw new Error("Tiempo de espera agotado al obtener el historial.");
    }
    console.error("Error general en getKardexHistory:", error);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
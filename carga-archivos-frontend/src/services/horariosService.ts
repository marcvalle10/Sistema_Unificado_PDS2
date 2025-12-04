import { ScheduleRecord } from "@/types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface HorariosResumen {
  gruposUpsert?: number;
  horariosUpsert?: number;
  profCre?: number;
  profUpd?: number;
  // Permite campos adicionales sin recurrir a 'any'
  [key: string]: unknown;
}

export interface HorariosHistorialItem {
  id: number;
  fecha: string; // ISO string
  nombre_archivo: string;
  estado: string;
}

// ==== Helpers de fetch tipados ====

async function safeJson<T>(resp: Response): Promise<T> {
  const data = (await resp.json()) as unknown;
  return data as T;
}

/**
 * Sube los archivos de horarios:
 *  - isi: Excel de horarios ISI (opcional)
 *  - prelistas: Excel de prelistas (opcional)
 *
 * El backend responde algo como:
 * {
 *   ok: true,
 *   isi?: { archivoId: number; hash: string },
 *   prelistas?: { archivoId: number; hash: string }
 * }
 */
type UploadResponse = {
  ok?: boolean;
  isi?: { archivoId?: number; hash?: string };
  prelistas?: { archivoId?: number; hash?: string };
};

export async function uploadHorarios(
  isiFile?: File | null,
  preFile?: File | null
): Promise<{ archivoIdISI?: number; archivoIdPrelistas?: number }> {
  const formData = new FormData();

  if (isiFile) {
    formData.append("isi", isiFile);
  }
  if (preFile) {
    formData.append("prelistas", preFile);
  }

  const resp = await fetch(`${API_BASE}/horarios/upload`, {
    method: "POST",
    body: formData,
  });

  if (!resp.ok) {
    throw new Error("Error al subir archivos de horarios");
  }

  const json = await safeJson<UploadResponse>(resp);

  return {
    archivoIdISI: json.isi?.archivoId,
    archivoIdPrelistas: json.prelistas?.archivoId,
  };
}

/**
 * Procesa los horarios previamente subidos.
 *
 * Body:
 * {
 *   archivoIdISI?: number;
 *   archivoIdPrelistas?: number;
 * }
 *
 * Respuesta:
 * { ok: boolean; resumen: HorariosResumen }
 */
type ProcesarResponse = {
  ok?: boolean;
  resumen?: HorariosResumen;
  error?: string;
};

export async function procesarHorarios(
  archivoIdISI?: number,
  archivoIdPrelistas?: number,
  periodoEtiqueta?: string
): Promise<{ resumen: HorariosResumen }> {
  const payload: {
    archivoIdISI?: number;
    archivoIdPrelistas?: number;
    periodoEtiqueta?: string;
  } = {};

  if (typeof archivoIdISI === "number") {
    payload.archivoIdISI = archivoIdISI;
  }
  if (typeof archivoIdPrelistas === "number") {
    payload.archivoIdPrelistas = archivoIdPrelistas;
  }
  if (periodoEtiqueta && periodoEtiqueta.trim()) {
    payload.periodoEtiqueta = periodoEtiqueta.trim();
  }

  const resp = await fetch(`${API_BASE}/horarios/procesar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // 👇 Leemos el body SOLO UNA VEZ
  const rawBody = await resp.text();

  if (!resp.ok) {
    let backendMsg: string | undefined;

    // Intentar parsear JSON { error: "..."}
    try {
      const parsed = JSON.parse(rawBody) as { error?: string; message?: string };
      backendMsg = parsed.error || parsed.message;
    } catch {
      // si no es JSON, usamos el texto literal
      backendMsg = rawBody;
    }

    throw new Error(
      backendMsg && backendMsg.trim().length > 0
        ? backendMsg
        : "Error al procesar horarios (respuesta no exitosa)"
    );
  }

  // Si llegó aquí, es 2xx; parseamos el JSON desde el texto
  let json: ProcesarResponse;
  try {
    json = JSON.parse(rawBody) as ProcesarResponse;
  } catch {
    throw new Error("Respuesta inválida del servidor al procesar horarios.");
  }

  if (!json.resumen) {
    return { resumen: {} };
  }

  return { resumen: json.resumen };
}


/**
 * Obtiene el historial de cargas de horarios.
 *
 * GET /horarios/historial?limit=50
 *
 * Respuesta:
 * {
 *   ok: boolean;
 *   items: { id, fecha, nombre_archivo, estado }[]
 * }
 */
type HistorialResponse = {
  ok?: boolean;
  items?: HorariosHistorialItem[];
};

export async function getHorariosHistorial(
  limit = 50
): Promise<HorariosHistorialItem[]> {
  const url = new URL(`${API_BASE}/horarios/historial`);
  url.searchParams.set("limit", String(limit));

  const resp = await fetch(url.toString(), {
    method: "GET",
  });

  if (!resp.ok) {
    throw new Error("Error al obtener historial de horarios");
  }

  const json = await safeJson<HistorialResponse>(resp);

  return Array.isArray(json.items) ? json.items : [];
}

/**
 * Utilidad opcional para obtener horarios crudos desde /horarios/resumen
 * (por si en algún lado se quiere usar este servicio en lugar de scheduleService).
 */
type HorariosResumenResponse = {
  ok?: boolean;
  items?: ScheduleRecord[];
};

export async function getHorariosDesdeHorariosService(): Promise<ScheduleRecord[]> {
  const resp = await fetch(`${API_BASE}/horarios/resumen`, {
    method: "GET",
  });

  if (!resp.ok) {
    throw new Error("Error al obtener horarios");
  }

  const json = await safeJson<HorariosResumenResponse>(resp);

  if (Array.isArray(json.items)) {
    return json.items;
  }

  return [];
}

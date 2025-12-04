"use client";

import React, { useRef, useState, useMemo, useEffect } from "react";
import { CheckCircle2, AlertCircle, XCircle, FileWarning, Eye, CalendarDays, LogOut } from "lucide-react";
import { uploadKardex, getKardexHistory } from "@/app/actions/kardex";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

export type KardexStatus = "valid" | "rejected" | "processing";
export interface KardexItem { id: string | number; uploadedAt: string; filename: string; status: KardexStatus }

type Props = {
  maxSizeMB?: number;
  acceptMime?: string;
  initialHistory?: KardexItem[];
  showAfterUploadOnly?: boolean;
  forcedExpediente?: string | null; //cambio
};

type LocalStatus = "idle" | "ready" | "uploading" | "processing" | "success" | "error";

export default function KardexUpload({
  maxSizeMB = 5,
  acceptMime = "application/pdf",
  initialHistory = [],
  showAfterUploadOnly = false,
  forcedExpediente = null, //cambio
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<LocalStatus>("idle");
  const [progress, setProgress] = useState<number>(0);
  const [rows, setRows] = useState<KardexItem[]>([]);
  const [hasUploaded, setHasUploaded] = useState<boolean>(false);
  const [dragOver, setDragOver] = useState(false);
  const [expediente, setExpediente] = useState<string | null>(null);

  const [modal, setModal] = useState<{
    open: boolean;
    variant: "success" | "error";
    title: string;
    message: string;
    reloadOnClose?: boolean;
  }>({
    open: false,
    variant: "success",
    title: "",
    message: "",
    reloadOnClose: false,
  });



useEffect(() => {
    setRows(initialHistory);
  }, [initialHistory]);

  // Carga inicial del expediente y historial
useEffect(() => {
    // 1. Determinar cuál usar (Prop > LocalStorage)
    let currentExp = forcedExpediente;
    
    if (!currentExp && typeof window !== "undefined") {
        currentExp = localStorage.getItem("expediente");
    }

    setExpediente(currentExp);

    // 2. Si hay expediente, cargar datos frescos
    if (currentExp) {
        if (typeof window !== "undefined") {
             localStorage.setItem("expediente", currentExp); // Asegurar persistencia
        }
        
        // Llamada para actualizar la tabla
        getKardexHistory(currentExp)
            .then((data) => {
                setRows(data);
                console.log("Historial actualizado para:", currentExp);
            })
            .catch((err) => console.error("Error fetching history:", err));
    }
  }, [forcedExpediente]); // Se ejecuta si el padre manda uno nuevo

  const inputRef = useRef<HTMLInputElement>(null);

  const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    const f = e.dataTransfer.files?.[0];
    if (!f) return;

    const isPdf = f.type === acceptMime || f.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setModal({
        open: true,
        variant: "error",
        title: "Error",
        message: "Solo se permite subir archivos PDF.",
        reloadOnClose: false,
      });
      return;
    }

    handleSelect(f);
  };

  const handleSelect = (f: File) => {
    setFile(f);
    setStatus("ready");
    setProgress(0);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleSelect(f);
  };

  const simulateProgress = async (to: number, step = 8, delay = 80) =>
    new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        setProgress((p) => {
          const next = Math.min(p + step, to);
          if (next >= to) {
            clearInterval(interval);
            setTimeout(resolve, delay);
          }
          return next;
        });
      }, delay);
    });

  const constraints = useMemo(() => ({
    maxSizeBytes: maxSizeMB * 1024 * 1024,
    acceptMime,
  }), [maxSizeMB, acceptMime]);

  const validations = useMemo(() => {
    const extOk = !!file && file.name.toLowerCase().endsWith(".pdf");
    const mimeOk = !!file && (!!constraints.acceptMime ? file.type === constraints.acceptMime : true);
    const sizeOk = !!file && file.size <= constraints.maxSizeBytes;
    const nameOk = !!file && /^[^<>:"/\\|?*]+\.pdf$/i.test(file.name);
    return { extOk, mimeOk, sizeOk, nameOk };
  }, [file, constraints]);

  const refreshHistory = async () => {
    const expedienteValue = typeof window !== "undefined" ? localStorage.getItem("expediente") : null;
    if (!expedienteValue) return;
    try {
      const hist = await getKardexHistory(expedienteValue);
      setRows(hist);
    } catch { }
  };

  const doUpload = async (f: File): Promise<boolean> => {
    if (status === "uploading" || status === "processing") return false;

    setStatus("uploading");
    setProgress(5);
    try {
      await simulateProgress(85);
      const res = await uploadKardex(f);
      await simulateProgress(100, 4, 50);

      setStatus("success");
      setHasUploaded(true);

      const expedienteValue =
        typeof window !== "undefined" ? localStorage.getItem("expediente") : null;
      setExpediente(expedienteValue);

      setFile(null);
      if (inputRef.current) inputRef.current.value = "";

      await refreshHistory();

      setModal({
        open: true,
        variant: "success",
        title: "Carga exitosa",
        message: res.message || "El kardex fue validado y agregado correctamente.",
        reloadOnClose: true,
      });

      return true;   // ✅ éxito
    } catch (err: any) {
      setStatus("error");
      setStatus("error");
      setModal({
        open: true,
        variant: "error",
        title: "Error",
        message: "Se detectaron inconsistencias o datos duplicados. Revisa el PDF seleccionado.",
        reloadOnClose: false,
      });

      await refreshHistory();
      return false;  // ❌ fallo
    }
  };


  const handleConfirm = async () => {
    if (!file) return;
    if (!validations.extOk || !validations.sizeOk || !validations.nameOk) {
      setModal({
        open: true,
        variant: "error",
        title: "Error",
        message: "El archivo no cumple con las validaciones necesarias.",
      });
      return;
    }

    await doUpload(file);
  };

  const handleModalAccept = () => {
    if (modal.reloadOnClose) {
      window.location.reload();     // 👈 recarga solo en éxito
    } else {
      setModal((m) => ({ ...m, open: false }));
    }
  };


  const showHistory = !showAfterUploadOnly || hasUploaded || rows.length > 0;
  const hasValidExpediente = !!expediente;

  return (
    <div className="w-full mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* IZQUIERDA */}
        <div className="space-y-4">
          {/* Banner informativo */}
          <div className="rounded-md bg-[#2D9D8E] text-white px-4 py-3 shadow">
            <p className="text-sm">
              Debes subir tu kardex cada semestre para mantener tu información actualizada y que pueda consultarse sin problemas.
            </p>
          </div>

          {/* Estado del componente según si ya tiene expediente */}
          {hasValidExpediente ? (
            /* ESTADO: Ya tiene kardex cargado */
            <div className="rounded-2xl border border-dashed p-6 shadow-sm border-sky-500">
              <div className="flex flex-col items-center justify-center gap-4 p-6">
                <div className="rounded-full flex items-center justify-center">
                  <Image src="/check-circle.svg" alt="success" width={128} height={128} />
                </div>

                <div className="text-center space-y-3">
                  <p className="text-lg font-semibold text-black">Tu kardex ya ha sido agregado</p>
                  <p className="text-sm text-gray-600">
                    Para cargar nuevamente un kardex, finaliza la sesión.
                  </p>
                </div>
              </div>
            </div>
          ) : (


            /* ESTADO: Puede subir kardex */
            <>
              {/* Dropzone */}
              <div
                className={`rounded-2xl border border-dashed p-6 shadow-sm ${dragOver ? "border-sky-500 bg-sky-50" : "border-sky-400/70 bg-white"}`}
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                style={{ borderColor: "#56A1C6" }}
              >
                <div className="flex flex-col items-center justify-center gap-4 p-6">
                  <Image src="/upload-file.svg" alt="upload file" width={72} height={72} />
                  <div className="text-center space-y-1">
                    <p className="text-base font-medium text-black">Arrastra tu archivo aquí</p>
                    <p className="text-sm text-black">o haz click para seleccionarlo</p>
                  </div>

                  <button
                    onClick={() => inputRef.current?.click()}
                    className="mt-2 h-10 px-6 rounded-full bg-[#E6B10F] text-black font-bold hover:brightness-110 transition"
                  >
                    Subir
                  </button>

                  <input ref={inputRef} type="file" accept={acceptMime} onChange={onInputChange} className="hidden" />
                  <p className="text-xs mt-2 text-black">Formatos permitidos: PDF (máx. {maxSizeMB}MB)</p>

                  {file && (
                    <div className="mt-3 text-xs">
                      <div className="text-black"><span className="font-bold">Archivo:</span> {file.name}</div>
                      <div className="text-black"><span className="font-bold">Tamaño:</span> {(file.size / (1024 * 1024)).toFixed(2)} MB</div>
                    </div>
                  )}
                </div>

                {/* Validaciones */}
                {file && (
                  <div className="mt-6 grid gap-3">
                    <div className="text-sm font-medium text-black">Validaciones</div>
                    <ul className="grid grid-cols-2 gap-2 text-sm text-black">
                      <CheckItem ok={validations.extOk} label="Extensión .pdf" />
                      <CheckItem ok={validations.sizeOk} label={`≤ ${maxSizeMB} MB`} />
                      <CheckItem ok={validations.nameOk} label="Nombre válido" />
                    </ul>
                  </div>
                )}

                {/* Progreso */}
                {(status === "uploading" || status === "processing") && (
                  <div className="mt-6 w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div className="h-full bg-[#16469B] transition-all" style={{ width: `${progress}%` }} />
                  </div>
                )}
              </div>

              <div className="flex justify-center pt-3">
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!file || status === "uploading" || status === "processing"}
                  className="h-10 px-5 rounded-md bg-[#C3C3C2] text-black font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirmar kardex
                </button>
              </div>
            </>
          )}
        </div>

        {/* DERECHA: Historial */}
        {showHistory && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-black font-semibold text-xl">
              <Image src="/Archive.svg" alt="Ícono de kardex" width={32} height={32} />
              <h3>Historial de archivos</h3>
            </div>

            <div className="rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-black border-collapse table-fixed">
                  <thead>
                    <tr className="bg-[#16469B] text-white text-left">
                      <th className="w-[180px] px-4 py-3 font-semibold">Fecha de carga</th>
                      <th className="px-4 py-3 font-semibold">Nombre del archivo</th>
                      <th className="w-[120px] px-4 py-3 font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center py-4 text-gray-500">
                          Aún no has subido ningún kardex.
                        </td>
                      </tr>
                    ) : (
                      rows.map((r, idx) => {
                        const bg = idx % 2 === 0 ? "bg-white" : "bg-gray-50";
                        const statusColor =
                          r.status === "valid" ? "text-[#2E7D32]" :
                            r.status === "rejected" ? "text-[#C62828]" : "text-[#F9A825]";
                        const statusLabel =
                          r.status === "valid" ? "Válido" :
                            r.status === "rejected" ? "Rechazado" : "Procesando";

                        return (
                          <tr key={String(r.id ?? `${r.filename}-${r.uploadedAt}`)} className={`${bg} border-b border-gray-200`}>
                            <td className="w-[180px] px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4 text-gray-500" />
                                <CalendarDays className="h-4 w-4 text-gray-400" />
                                <span>
                                  {r.uploadedAt
                                    ? new Date(r.uploadedAt).toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "2-digit" })
                                    : "-"}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-medium truncate" title={r.filename ?? "—"}>
                              {r.filename ?? "—"}
                            </td>
                            <td className={`w-[120px] px-4 py-3 font-semibold ${statusColor}`}>{statusLabel}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL */}
      {modal.open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative h-full flex items-center justify-center p-4">
            <div className="rounded-xl shadow-xl w-[min(92vw,560px)] bg-white">
              <div className="flex items-center justify-between mb-2 bg-[#C3C3C2] rounded-t-xl pb-3">
                <div className="flex items-center justify-between rounded-t-xl px-4 pt-3">
                  <div className="flex items-center gap-2 text-lg font-semibold text-black">
                    {modal.variant === "success" ? (
                      <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                    ) : (
                      <AlertCircle className="h-8 w-8 text-red-600" />
                    )}
                    <span>{modal.title}</span>
                  </div>
                </div>
                <button
                  onClick={() => setModal((m) => ({ ...m, open: false }))}
                  className="text-black/70 hover:text-black mt-3 mr-3"
                  aria-label="Cerrar"
                >
                  <XCircle className="h-8 w-8" />
                </button>
              </div>
              <div className="px-4 py-3 text-sm text-black leading-relaxed pb-5">{modal.message}</div>
              <div className="flex justify-end px-4 pb-3">
                <button
                  onClick={handleModalAccept}
                  className="h-8 px-4 rounded-md bg-[#C3C3C2] text-black shadow-sm ring-1 ring-black/10 hover:bg-[#bdbdbd]"
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* --- Subcomponentes --- */

function CheckItem({ ok, label }: { ok: boolean; label: string }) {
  const Icon = ok ? CheckCircle2 : FileWarning;
  const color = ok ? "text-emerald-700" : "text-amber-600";
  return (
    <li className="flex items-center gap-2 text-black">
      <Icon className={`h-4 w-4 ${color}`} />
      <span className="text-black">{label}</span>
    </li>
  );
}
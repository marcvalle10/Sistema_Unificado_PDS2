import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { runPythonKardex } from "../utils/runPythonKardex";
import { AppDataSource } from "../config/data-source";
import { ArchivoCargado } from "../entities/ArchivoCargado";
import { AuditoriaCargas } from "../entities/AuditoriaCargas";
import { ingestarKardex } from "../services/ingestaKardex";
import { sha256File } from "../utils/fileHash";
import { getUserSummaryByExpediente } from "../services/userSummary";
import { sseEmit } from "../realtime/sse";
import { Alumno } from "../entities/Alumno";
import { sendKardexUploadEmail } from "../services/emailService";
import type { UserSummary } from "../services/userSummary";

export const kardexController = {
    uploadFile: async (req: Request, res: Response) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: "No se recibio ningun archivo." });
            }

            const absPath = path.resolve(req.file.path);
            const usuario = (req as any).user?.email ?? "anon";
            const nombreArchivo = req.file.originalname;
            const hash = await sha256File(absPath);

            const archivoRepo = AppDataSource.getRepository(ArchivoCargado);
            const auditRepo = AppDataSource.getRepository(AuditoriaCargas);

            const archivo = await archivoRepo.save(
                archivoRepo.create({
                    tipo: "KARDEX",
                    nombre_archivo: nombreArchivo,
                    stored_name: req.file.filename,
                    mime_type: req.file.mimetype,
                    size_bytes: req.file.size,
                    storage_path: `/uploads/${req.file.filename}`,
                    hash,
                    usuario,
                    estado_proceso: "PENDIENTE",
                }) as ArchivoCargado
            );

            await auditRepo.save(
                auditRepo.create({
                    archivo_id: archivo.id,
                    etapa: "UPLOAD",
                    estado: "OK",
                    detalle: `Guardado como ${req.file.filename}`,
                })
            );

            const py = await runPythonKardex(absPath);
            if (!py?.ok) {
                await auditRepo.save(
                    auditRepo.create({
                        archivo_id: archivo.id,
                        etapa: "PARSE",
                        estado: "ERROR",
                        detalle: py?.error || "Formato de Kárdex no reconocido",
                    })
                );
                await archivoRepo.update(archivo.id, { estado_proceso: "ERROR" });

                return res.status(400).json({
                    status: "error",
                    isValid: false,
                    message: [py?.error || "Formato de Kárdex no reconocido"],
                    file: {
                        name: req.file.originalname,
                        path: `/uploads/${req.file.filename}`,
                    },
                });
            }

            await auditRepo.save(
                auditRepo.create({
                    archivo_id: archivo.id,
                    etapa: "PARSE",
                    estado: "OK",
                    detalle: `Materias: ${py.materias?.length ?? 0}`,
                })
            );

            const expedienteCanal = String(py.alumno.expediente).trim();
            await archivoRepo.update(archivo.id, { expediente: expedienteCanal });

            try {
                const archivosPrevios = await archivoRepo.find({
                    where: {
                        expediente: expedienteCanal,
                        tipo: "KARDEX",
                    },
                });

                for (const prev of archivosPrevios) {
                    // No borrar el archivo recién subido
                    if (prev.id === archivo.id) continue;

                    const storagePath =
                        (prev as any).storage_path ?? (prev as any).storagePath;

                    if (!storagePath) continue;

                    const relative = storagePath.startsWith("/")
                        ? `.${storagePath}`
                        : storagePath;

                    const absolutePath = path.resolve(process.cwd(), relative);

                    try {
                        await fs.promises.unlink(absolutePath);
                        console.log(
                            "Kárdex anterior eliminado:",
                            absolutePath
                        );
                    } catch (err: any) {
                        if (err?.code !== "ENOENT") {
                            console.warn(
                                "No se pudo eliminar archivo de kárdex anterior:",
                                absolutePath,
                                err
                            );
                        }
                    }
                }
            } catch (cleanupErr) {
                console.warn(
                    "Error limpiando archivos anteriores de kárdex para expediente",
                    expedienteCanal,
                    cleanupErr
                );
            }

            let ingestaResultado: any;
            try {
                ingestaResultado = await ingestarKardex(py);



                await auditRepo.save(
                    auditRepo.create({
                        archivo_id: archivo.id,
                        etapa: "INGESTA",
                        estado: "OK",
                        detalle: JSON.stringify({
                            alumnoId: ingestaResultado?.alumnoId,
                            planId: ingestaResultado?.planId,
                        }),
                    })
                );
                await archivoRepo.update(archivo.id, { estado_proceso: "COMPLETADO" });

                try {
                    const expediente = String(py.alumno.expediente).trim();
                    const alumnoRepo = AppDataSource.getRepository(Alumno);
                    const alumno = await alumnoRepo.findOne({ where: { expediente } });

                    if (alumno?.correo) {
                        await sendKardexUploadEmail({
                            to: alumno.correo,
                            nombreAlumno: alumno.nombre,
                            expediente,
                        });
                    } else {
                        console.warn(`No se encontró correo para el expediente ${expediente}`);
                    }
                } catch (mailError) {
                    console.error("Error enviando correo de kárdex:", mailError);
                }


            } catch (e: any) {
                await auditRepo.save(
                    auditRepo.create({
                        archivo_id: archivo.id,
                        etapa: "INGESTA",
                        estado: "ERROR",
                        detalle: e?.message?.substring(0, 800) || "Error en ingesta",
                    })
                );
                await archivoRepo.update(archivo.id, { estado_proceso: "ERROR" });

                try {
                    const canal = String(py?.alumno?.expediente ?? "").trim();
                    if (canal) sseEmit(canal, "finish", { ok: false, error: "Error al insertar datos del Kardex." });
                } catch { }

                return res.status(500).json({ status: "error", message: "Error al insertar datos del Kardex." });
            }

            let summary: UserSummary | null = null;
            const canal = String(py.alumno.expediente).trim();
            try {
                summary = await getUserSummaryByExpediente(canal);

                setTimeout(() => {
                    sseEmit(canal, "finish", { ok: true, summary });
                }, 10);

            } catch (e) {
                console.error("Error obteniendo summary:", e);
            }


            return res.status(200).json({
                status: "uploaded",
                isValid: true,
                message: "Kardex cargado e insertado correctamente.",
                alumno: py.alumno,
                resumen: py.resumen,
                materiasCount: py.materias?.length ?? 0,
                file: {
                    name: req.file.originalname,
                    storedName: req.file.filename,
                    path: `/uploads/${req.file.filename}`,
                    mimeType: req.file.mimetype,
                    sizeBytes: req.file.size,
                    hash,
                },
                ingesta: ingestaResultado,
                summary, // <- nombre, expediente, promedioGeneral, promedioAnterior, creditosActuales, etc.
            });
        } catch (error) {
            console.error("Error al subir el archivo: ", error);
            return res.status(500).json({ error: "Error interno al subir el archivo" });
        }
    },
};
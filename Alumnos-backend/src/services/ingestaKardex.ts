import { AppDataSource } from "../config/data-source";
import { Alumno } from "../entities/Alumno";
import { Materia } from "../entities/Materia";
import { PlanEstudio } from "../entities/PlanEstudio";
import { Periodo } from "../entities/Periodo";
import { Kardex } from "../entities/Kardex";
import { EntityManager } from "typeorm";


type KardexMateria = {
    cr: number;
    codigo: string;
    nombre: string;
    e1: string | null;
    e2: string | null;
    ord: number | null;
    reg: number | null;
    cic: string;
    periodo: string | null; // "2024-2"
    inscripciones: number | null;
    reprobaciones: number | null;
    bajas: number | null;
};

type KardexPayload = {
    ok: boolean;
    alumno: {
        fecha: string;
        programa: string;
        plan: string;
        unidad: string;
        expediente: string;
        alumno: string;
        estatus: string;
        ingles?: {
            estado: string;
            nivel: number;
            maximo_pdf: number;
            requerido_carrera: number;
            maximo_carrera: number;
            cumple_requisito: boolean;
        };
    };
    materias: KardexMateria[];
    resumen?: {
        promedios?: Record<string, number>;
        creditos?: Record<string, number>;
        materias?: Record<string, number>;
    };
};

/** ---------- Helpers generales ---------- **/

const NFC = (s: string) =>
    (s ?? "").normalize("NFC").replace(/\s+/g, " ").trim();


/**
 * Normaliza el código de materia a 5 dígitos:
 * - Quita espacios
 * - Se queda solo con dígitos
 * - Quita ceros a la izquierda
 * - Rellena a la izquierda hasta llegar a 5 dígitos
 *
 * Ejemplos:
 *   "0123"   -> "00123"
 *   "00123"  -> "00123"
 *   "123"    -> "00123"
 *   "43002"  -> "43002"
 */
function normalizeMateriaCodigo(raw: string): string {
    const trimmed = (raw ?? "").trim();
    if (!trimmed) {
        throw new Error("Código de materia vacío en payload de kárdex");
    }

    // Nos quedamos solo con dígitos por seguridad
    const digits = trimmed.replace(/\D+/g, "");
    if (!digits) {
        throw new Error(`Código de materia inválido (no numérico): "${raw}"`);
    }

    // Si el código viene de 6+ dígitos, por ahora lo respetamos tal cual
    if (digits.length > 5) {
        return digits;
    }

    // Quitamos ceros a la izquierda y luego rellenamos a 5
    const withoutLeadingZeros = digits.replace(/^0+/, "");
    const base = withoutLeadingZeros || "0";

    return base.padStart(5, "0");
}

/**
 * Decode de CIC consistente con el script de Python:
 *  2222 -> 2022-2
 *  2231 -> 2023-1
 *  2232 -> 2023-2
 *  2241 -> 2024-1
 *  2251 -> 2025-1
 */
const decodeCIC = (cic: string) => {
    const str = String(cic ?? "").trim();
    if (!/^\d{4}$/.test(str)) throw new Error(`CIC inválido: ${cic}`);
    const a = parseInt(str[0], 10);
    const c = parseInt(str[2], 10);
    const d = parseInt(str[3], 10);
    const anio = 2000 + (10 * a + c);
    const ciclo = d;
    return { anio, ciclo, etiqueta: `${anio}-${ciclo}` };
};

// Split muy simple: "NOMBRES APELLIDO_P APELLIDO_M"
const splitNombre = (full: string) => {
    const p = NFC(full).split(" ");
    if (p.length < 2) return { nombre: full, ap: "", am: "" };
    const am = p.pop() as string;
    const ap = p.pop() as string;
    const nombre = p.join(" ");
    return { nombre, ap, am };
};

/**
 * Dado un renglón de materia del Kardex, determina:
 *  - calificación numérica (si aplica)
 *  - estatus textual para la tabla kardex
 */
function mapCalificacionYEstado(m: KardexMateria): {
    calificacion: number | null;
    estatus: string;
} {
    const ord = typeof m.ord === "number" ? m.ord : null;
    const reg = typeof m.reg === "number" ? m.reg : null;
    const e1 = (m.e1 || "").toUpperCase().trim();
    const e2 = (m.e2 || "").toUpperCase().trim();
    const bajas = m.bajas ?? 0;

    // Calificación numérica final: preferimos REG sobre ORD
    let finalGrade: number | null = null;
    if (reg !== null) finalGrade = reg;
    else if (ord !== null) finalGrade = ord;

    // ---------- 1) BAJA VOLUNTARIA ----------
    if (bajas > 0 || e2 === "BV") {
        return {
            calificacion: finalGrade,
            estatus: "BAJA_VOLUNTARIA",
        };
    }

    // ---------- 2) PARCIALMENTE ACREDITADA ----------
    // En el PDF se ve "PARC.ACRED"; en el JSON suele quedar como e1="PAR." y e2="ACRED"
    const esParcialmenteAcreditada =
        (e1.startsWith("PAR") && e2.includes("ACRED")) ||
        e2.includes("PARC.ACRED");

    if (esParcialmenteAcreditada) {
        return {
            calificacion: null,
            estatus: "PARCIALMENTE_ACREDITADA",
        };
    }

    // ---------- 3) ACREDITADA (sin nota numérica clásica) ----------
    if (e2.includes("ACRED") || e1.includes("ACRED")) {
        return {
            calificacion: null,
            estatus: "ACREDITADA",
        };
    }

    // ---------- 4) INSCRITO (grupo 1 o 2) ----------
    if (e2 === "1" || e2 === "2") {
        return {
            calificacion: null,
            estatus: "INSCRITO",
        };
    }

    // ---------- 5) CASO RARO: e2 = A sin número ----------
    if (finalGrade === null && e2 === "A") {
        return {
            calificacion: null,
            estatus: "APROBADA",
        };
    }

    // ---------- 6) LÓGICA ORDINARIO / EXTRAORDINARIO (> 60) ----------
    // Regla:
    // - Si ord > 60  -> aprobada (y reg no existe en tu caso)
    // - Si ord <= 60 o null:
    //     - Si reg > 60 -> aprobada
    //     - Si reg no existe o <= 60 -> reprobada
    if (ord !== null || reg !== null) {
        let aprobada = false;

        if (ord !== null && ord > 60) {
            // Aprobó por ordinario (en este escenario reg nunca existe)
            aprobada = true;
        } else if (reg !== null && reg > 60) {
            // No pasó ordinario (o no existe), pero sí extraordinario
            aprobada = true;
        }

        if (aprobada) {
            return {
                calificacion: finalGrade,
                estatus: "APROBADA",
            };
        } else {
            return {
                calificacion: finalGrade,
                estatus: "REPROBADA",
            };
        }
    }

    // ---------- 7) Si no hay nada que nos diga qué pasó ----------
    return {
        calificacion: null,
        estatus: "SIN_CALIFICACION",
    };
}

function extraerPromediosDesdePayload(payload: KardexPayload): {
    promedioKardex: number | null;
    promedioUltimoPeriodo: number | null;
} {
    const mapa = payload.resumen?.promedios ?? {};

    const promedioKardex =
        mapa["kardex"] ??
        mapa["KARDEX"] ??
        null;

    const periodos: Array<{ etiqueta: string; anio: number; ciclo: number; valor: number }> = [];

    for (const [clave, valor] of Object.entries(mapa)) {
        if (!/^\d{4}-\d$/.test(clave)) continue;      // Solo claves de tipo 2025-1
        if (typeof valor !== "number") continue;

        const [anioStr, cicloStr] = clave.split("-");
        const anio = parseInt(anioStr, 10);
        const ciclo = parseInt(cicloStr, 10);

        if (!Number.isNaN(anio) && !Number.isNaN(ciclo)) {
            periodos.push({ etiqueta: clave, anio, ciclo, valor });
        }
    }

    let promedioUltimoPeriodo: number | null = null;

    if (periodos.length > 0) {
        periodos.sort((a, b) => (a.anio - b.anio) || (a.ciclo - b.ciclo));
        promedioUltimoPeriodo = periodos[periodos.length - 1].valor;
    }

    return { promedioKardex, promedioUltimoPeriodo };
}

function extraerCreditosAprobadosDesdePayload(payload: KardexPayload): number | null {
    const creditos = payload.resumen?.creditos;
    if (!creditos) return null;

    const aprRaw = (creditos as any)["APR"] ?? (creditos as any)["apr"];

    if (typeof aprRaw === "number") {
        return aprRaw;
    }

    if (typeof aprRaw === "string" && aprRaw.trim() !== "" && !Number.isNaN(Number(aprRaw))) {
        return Number(aprRaw);
    }

    return null;
}


/** ---------- ensures / upserts con EntityManager ---------- **/

async function ensurePlanEstudio(
    manager: EntityManager,
    version: string,
    nombrePrograma: string
) {
    const repo = manager.getRepository(PlanEstudio);

    let plan = await repo.findOne({ where: { version } });

    if (!plan) {
        throw new Error(
            `El plan de estudios ${version} (${nombrePrograma}) no existe en la tabla plan_estudio. ` +
            `Debes registrarlo manualmente antes de cargar un kárdex de este plan.`
        );
    }

    const needsServicio = plan.creditos_servicio == null;
    const needsPracticas = plan.creditos_practicas == null;

    if ((needsServicio || needsPracticas) && plan.total_creditos > 0) {
        const set70 = Math.ceil(plan.total_creditos * 0.70);

        if (needsServicio) {
            plan.creditos_servicio = set70;
        }
        if (needsPracticas) {
            plan.creditos_practicas = set70;
        }

        plan = await repo.save(plan);
    }

    return plan;
}


async function ensurePeriodo(
    manager: EntityManager,
    materia: KardexMateria
) {
    let etiqueta: string;
    let anio: number;
    let ciclo: number;

    if (materia.periodo) {
        etiqueta = materia.periodo.trim();
        const [anioStr, cicloStr] = etiqueta.split("-");
        anio = parseInt(anioStr, 10);
        ciclo = parseInt(cicloStr, 10);
    } else {
        const decoded = decodeCIC(materia.cic);
        etiqueta = decoded.etiqueta;
        anio = decoded.anio;
        ciclo = decoded.ciclo;
    }

    const repo = manager.getRepository(Periodo);
    let periodo = await repo.findOne({ where: { etiqueta } });
    if (!periodo) {
        periodo = repo.create({
            anio,
            ciclo,
            etiqueta,
            fecha_inicio: `${anio}-01-01`,
            fecha_fin: `${anio}-12-31`,
        });
        periodo = await repo.save(periodo);
    }
    return periodo;
}

async function ensureMateria(
    manager: EntityManager,
    m: KardexMateria,
    planId: number
) {
    const repo = manager.getRepository(Materia);
    // let materia = await repo.findOne({ where: { codigo: m.codigo.trim() } }); // código único global

    const codigoNormalizado = normalizeMateriaCodigo(m.codigo);

    // Buscar por el código normalizado (único global)
    let materia = await repo.findOne({
        where: { codigo: codigoNormalizado },
    });

    if (!materia) {
        materia = repo.create({
            codigo: codigoNormalizado,
            nombre: NFC(m.nombre),
            creditos: m.cr ?? 0,
            tipo: "OBLIGATORIA",
            plan_estudio_id: planId,
        });
        materia = await repo.save(materia);
    } else {
        materia.nombre = NFC(m.nombre);
        materia.creditos = m.cr ?? materia.creditos;
        await repo.save(materia);
    }
    return materia;
}

async function ensureAlumno(
    manager: EntityManager,
    expediente: string,
    fullName: string,
    planId: number,
    estado: string
) {
    const repo = manager.getRepository(Alumno);
    let alumno = await repo.findOne({ where: { expediente } });
    if (!alumno) {
        const { nombre, ap, am } = splitNombre(fullName);
        alumno = repo.create({
            matricula: expediente,
            expediente,
            nombre,
            apellido_paterno: ap,
            apellido_materno: am,
            correo: `a${expediente}@unison.mx`, 
            estado_academico: estado === "A" ? "ACTIVO" : "INACTIVO",
            plan_estudio_id: planId,
            total_creditos: 0,
        });
        alumno = await repo.save(alumno);
    } else {
        alumno.plan_estudio_id = planId;
        alumno.estado_academico = estado === "A" ? "ACTIVO" : alumno.estado_academico;
        await repo.save(alumno);
    }
    return alumno;
}


function cuentaComoAprobada(
    estatus: string | null,
    calificacion: number | null
): boolean {
    const est = (estatus || "").toUpperCase().trim();

    if (!est && calificacion == null) return false;

    if (["BAJA_VOLUNTARIA", "INSCRITO", "SIN_CALIFICACION", "REPROBADA"].includes(est)) {
        return false;
    }

    if (est.includes("ACRED")) return true;

    if (est === "APROBADA") return true;

    if (calificacion != null && calificacion > 60) {
        return true;
    }

    return false;
}

async function recalcularTotalesAlumno(alumnoId: number, trx: EntityManager): Promise<number> {
    const kardexRepo = trx.getRepository(Kardex);

    const rows = await kardexRepo
        .createQueryBuilder("k")
        .innerJoin(Materia, "m", "m.id = k.materia_id")
        .select([
            "k.calificacion AS calificacion",
            "k.estatus      AS estatus",
            "m.creditos     AS creditos",
        ])
        .where("k.alumno_id = :alumnoId", { alumnoId })
        .getRawMany<{
            calificacion: string | number | null;
            estatus: string | null;
            creditos: string | number;
        }>();

    let total = 0;

    for (const r of rows) {
        const cal =
            r.calificacion == null
                ? null
                : typeof r.calificacion === "number"
                    ? r.calificacion
                    : Number(r.calificacion);

        const cred =
            typeof r.creditos === "number"
                ? r.creditos
                : Number(r.creditos);

        if (cuentaComoAprobada(r.estatus, cal)) {
            total += cred;
        }
    }

    await trx.getRepository(Alumno).update(alumnoId, { total_creditos: total });

    return total;
}


/** ---------- API principal: ingesta ---------- **/

export async function ingestarKardex(payload: KardexPayload) {
    if (!payload?.ok) throw new Error("Payload inválido");

    return AppDataSource.transaction(async (trx) => {
        const expediente = payload.alumno.expediente.trim();
        const planVersion = payload.alumno.plan.trim();
        const programa = payload.alumno.programa;

        const plan = await ensurePlanEstudio(trx, planVersion, programa);

        const alumno = await ensureAlumno(
            trx,
            expediente,
            payload.alumno.alumno,
            plan.id,
            payload.alumno.estatus
        );

        if (payload.alumno.ingles?.nivel != null) {
            const alumnoRepo = trx.getRepository(Alumno);
            alumno.nivel_ingles_actual = String(payload.alumno.ingles.nivel);
            await alumnoRepo.save(alumno);
        }

        const kardexRepo = trx.getRepository(Kardex);

                for (const m of payload.materias) {
            const periodo = await ensurePeriodo(trx, m);
            const materia = await ensureMateria(trx, m, plan.id);

            const { calificacion, estatus } = mapCalificacionYEstado(m);
            const e2Raw = (m.e2 || "").toUpperCase().trim() || null;

            let row = await kardexRepo.findOne({
                where: {
                    alumno_id: alumno.id,
                    materia_id: materia.id,
                    periodo_id: periodo.id,
                },
            });

            if (!row) {
                row = kardexRepo.create({
                    alumno_id: alumno.id,
                    materia_id: materia.id,
                    periodo_id: periodo.id,
                    calificacion,
                    estatus,
                    e2: e2Raw,
                    promedio_kardex: 0,
                    promedio_sem_act: 0,
                    filename: null,
                });
            } else {
                row.calificacion = calificacion;
                row.estatus = estatus;
                row.e2 = e2Raw;
            }

            await kardexRepo.save(row);
        }

        // 1) Recalcular desde BD (respaldo / debug)
        const totalCreditosRecalc = await recalcularTotalesAlumno(alumno.id, trx);

        // 2) Intentar usar los créditos aprobados que ya vienen en el JSON del kárdex
        const creditosDesdePayload = extraerCreditosAprobadosDesdePayload(payload);

        const totalCreditosFinal = creditosDesdePayload ?? totalCreditosRecalc;

        // (opcional) Log para ver diferencias mientras depuras
        if (
            creditosDesdePayload != null &&
            creditosDesdePayload !== totalCreditosRecalc
        ) {
            console.warn("Diferencia entre créditos del Kárdex y cálculo local:", {
                desdeResumen: creditosDesdePayload,
                desdeBD: totalCreditosRecalc,
            });
        }

        const { promedioKardex, promedioUltimoPeriodo } =
            extraerPromediosDesdePayload(payload);

        const alumnoRepo = trx.getRepository(Alumno);
        const updateData: any = {
            // siempre dejamos en el alumno lo que diga el kárdex (o el cálculo local si no viene)
            total_creditos: totalCreditosFinal,
        };

        if (promedioKardex !== null) {
            updateData.promedio_general = promedioKardex;
        }

        if (promedioUltimoPeriodo !== null) {
            updateData.promedio_periodo = promedioUltimoPeriodo;
        }

        if (Object.keys(updateData).length > 0) {
            await alumnoRepo.update(alumno.id, updateData);
        }

        return {
            ok: true,
            alumnoId: alumno.id,
            planId: plan.id,
            materiasProcesadas: payload.materias.length,
            totalCreditosAprobados: totalCreditosFinal,
        };

    });
}

"use client";

import { useEffect, useState } from "react";
import { getSchedule } from "../actions/horario";

export interface ScheduleCourse {
    id: string;
    code: string;
    name: string;
    day?: number;
    startTime?: string;
    endTime?: string;
    classroom?: string;
    professor?: string;
    status?: string;
    period?: string;
}

export interface ScheduleData {
    student: {
        status: string;
        type: string;
        currentSemester: string;
    };
    courses: ScheduleCourse[];
}

const TIME_SLOTS = [
    { start: "07:00", end: "08:00" },
    { start: "08:00", end: "09:00" },
    { start: "09:00", end: "10:00" },
    { start: "10:00", end: "11:00" },
    { start: "11:00", end: "12:00" },
    { start: "12:00", end: "13:00" },
    { start: "13:00", end: "14:00" },
    { start: "14:00", end: "15:00" },
    { start: "15:00", end: "16:00" },
    { start: "16:00", end: "17:00" },
    { start: "17:00", end: "18:00" },
    { start: "18:00", end: "19:00" },
    { start: "19:00", end: "20:00" },
    { start: "20:00", end: "21:00" },
];

const DAYS = [
    { id: 1, name: "Lunes" },
    { id: 2, name: "Martes" },
    { id: 3, name: "Miércoles" },
    { id: 4, name: "Jueves" },
    { id: 5, name: "Viernes" },
];

const toMinutes = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
};

const COLOR_VARIANTS = [
    ["bg-[#77AC5E]", "border-[#77AC5E]", "text-[#000000]", "text-[#000000]"],
    ["bg-[#5EACA8]", "border-[#5EACA8]", "text-[#000000]", "text-[#000000]"],
    ["bg-[#755EAC]", "border-[#755EAC]", "text-[#000000]", "text-[#000000]"],
    ["bg-[#5E74AC]", "border-[#5E74AC]", "text-[#000000]", "text-[#000000]"],
    ["bg-[#A85EAC]", "border-[#A85EAC]", "text-[#000000]", "text-[#000000]"],
    ["bg-[#A85EAC]", "border-[#A85EAC]", "text-[#000000]", "text-[#000000]"],
    ["bg-[#A9AC5E]", "border-[#A9AC5E]", "text-[#000000]", "text-[#000000]"],
];

const pickColor = (key: string) => {
    let h = 0;
    for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
    return COLOR_VARIANTS[h % COLOR_VARIANTS.length];
};

function formatSemester(label: string): string {
    if (!label) return "----";
    const t = label.trim();

    const m = t.match(/^(\d{4})\s*[- ]\s*(\d)$/);
    if (m) return `${m[1]} - ${m[2]}`;

    if (/^\d{4}$/.test(t)) {
        const year = `20${t.slice(0, 2)}`;
        const period = t.slice(2);
        const sem = period === "11" || period === "12" ? "1" : "2";
        return `${year} - ${sem}`;
    }

    return t;
}

/**
 * Si hay materias con horario real (day + start/end), se usan tal cual.
 * Si ninguna tiene horario → apilamos las materias de 7–8, 8–9, etc.
 */
function buildCoursesForRender(courses: ScheduleCourse[]) {
    if (!courses || courses.length === 0) {
        return { coursesForRender: [] as ScheduleCourse[], isFallback: false };
    }

    const hasRealSchedule = courses.some(
        (c) => c.day !== undefined && c.startTime && c.endTime
    );

    if (hasRealSchedule) {
        return { coursesForRender: courses, isFallback: false };
    }

    const sorted = [...courses].sort((a, b) => a.code.localeCompare(b.code));

    const coursesWithSlots = sorted.map((course, index) => {
        const slot = TIME_SLOTS[index % TIME_SLOTS.length];
        return {
            ...course,
            startTime: slot.start,
            endTime: slot.end,
        };
    });

    return { coursesForRender: coursesWithSlots, isFallback: true };
}

export default function HorariosPage() {
    const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const expediente =
                    typeof window !== "undefined"
                        ? localStorage.getItem("expediente")
                        : null;
                if (!expediente) {
                    setLoading(false);
                    return;
                }
                const data = await getSchedule(expediente);
                setScheduleData(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen grid place-items-center bg-gray-50">
                <p className="text-gray-600">Cargando horarios…</p>
            </div>
        );
    }

    if (!scheduleData) {
        return (
            <div className="min-h-screen grid place-items-center bg-gray-50">
                <p className="text-red-600">No fue posible cargar el horario.</p>
            </div>
        );
    }

    const { student, courses } = scheduleData;
    const { coursesForRender, isFallback } = buildCoursesForRender(courses);

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Título */}
            <section className="mb-4">
                <div className="flex items-center gap-3">
                    <div className="flex w-1/10 h-1 bg-[#E6B10F]" />
                    <h1 className="text-2xl text-[#525252] font-extrabold">
                        Consulta de Horarios
                    </h1>
                    <div className="h-1 flex-1 rounded bg-[#E6B10F]" />
                </div>
            </section>

            {/* Chip gris con info del alumno */}
            <div className="mb-6 inline-flex flex-wrap items-center gap-3 rounded-full bg-[#E0E0E0] px-4 py-2 text-sm text-[#3F3F3F]">
                <span className="font-semibold">Semestre:</span>
                <span>{formatSemester(student.currentSemester)}</span>

                <span className="ml-4 font-semibold">Estatus:</span>
                <span>{student.status}</span>

                <span className="ml-4 font-semibold">Tipo de alumno:</span>
                <span>{student.type}</span>
            </div>

            {/* Tabla de horarios */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm w-full">
                <table className="w-full table-fixed border-collapse">
                    <colgroup>
                        <col style={{ width: "88px" }} />
                        <col style={{ width: "calc((100% - 88px)/5)" }} />
                        <col style={{ width: "calc((100% - 88px)/5)" }} />
                        <col style={{ width: "calc((100% - 88px)/5)" }} />
                        <col style={{ width: "calc((100% - 88px)/5)" }} />
                        <col style={{ width: "calc((100% - 88px)/5)" }} />
                    </colgroup>

                    <thead className="sticky top-0 z-10">
                        <tr className="bg-[#D9D9D9] text-[#525252]">
                            <th className="px-1 py-2 text-[13px] font-semibold border-r border-gray-700 whitespace-nowrap text-center">
                                Hora
                            </th>
                            {DAYS.map((d) => (
                                <th
                                    key={d.id}
                                    className="px-3 py-2 text-center text-[13px] font-semibold border-r border-[#777777] last:border-r-0"
                                >
                                    {d.name}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {TIME_SLOTS.map((slot) => (
                            <tr
                                key={slot.start}
                                className="border-b border-gray-200 last:border-b-0"
                            >
                                {/* Columna de hora */}
                                <td className="px-1 py-2 text-[12px] font-medium text-[#000000] bg-gray-50 border-r whitespace-nowrap text-center">
                                    {slot.start} - {slot.end}
                                </td>

                                {DAYS.map((day) => {
                                    const courseAtSlot = coursesForRender.find(
                                        (c) => c.startTime === slot.start
                                    );

                                    /* ───── Fallback: repetir tarjeta en TODAS las columnas ───── */
                                    if (isFallback) {
                                        if (!courseAtSlot) {
                                            return (
                                                <td
                                                    key={`fallback-empty-${day.id}-${slot.start}`}
                                                    className="px-2 py-2 border-r last:border-r-0 align-top text-xs h-[70px]"
                                                />
                                            );
                                        }

                                        const [bg, border, title, text] = pickColor(
                                            courseAtSlot.code
                                        );

                                        return (
                                            <td
                                                key={`fallback-${day.id}-${slot.start}`}
                                                className="px-2 py-2 border-r last:border-r-0 align-top text-xs h-[70px]"
                                            >
                                                <div
                                                    className={`${bg} ${border} rounded-lg border px-3 py-2 shadow-sm w-full h-full flex flex-col justify-center`}
                                                >
                                                    <div
                                                        className={`font-semibold text-[13px] truncate ${title}`}
                                                    >
                                                        {courseAtSlot.name}
                                                    </div>
                                                    <div className={`text-[11px] ${text}`}>
                                                        {courseAtSlot.code}
                                                        {courseAtSlot.period && (
                                                            <> · {courseAtSlot.period}</>
                                                        )}
                                                    </div>
                                                    <div className="flex justify-between text-[10px] text-[#000000] mt-1">
                                                        <span>
                                                            {slot.start}–{slot.end}
                                                        </span>
                                                        {courseAtSlot.status && (
                                                            <span>{courseAtSlot.status}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        );
                                    }

                                    /* ───── Modo con horario real ───── */
                                    const starters = coursesForRender.filter(
                                        (c) =>
                                            c.day === day.id &&
                                            c.startTime === slot.start &&
                                            c.startTime &&
                                            c.endTime
                                    );

                                    const coveredByPrev = coursesForRender.some((c) => {
                                        if (c.day !== day.id) return false;
                                        if (!c.startTime || !c.endTime) return false;
                                        if (c.startTime === slot.start) return false;
                                        const slotStart = toMinutes(slot.start);
                                        const cStart = toMinutes(c.startTime);
                                        const cEnd = toMinutes(c.endTime);
                                        return slotStart >= cStart && slotStart < cEnd;
                                    });

                                    if (coveredByPrev) return null;

                                    if (starters.length === 0) {
                                        return (
                                            <td
                                                key={`${day.id}-${slot.start}`}
                                                className="px-2 py-2 border-r last:border-r-0 align-top text-xs h-[70px]"
                                            />
                                        );
                                    }

                                    const rowSpan = Math.max(
                                        1,
                                        TIME_SLOTS.filter((s) => {
                                            const s1 = toMinutes(s.start);
                                            const s2 = toMinutes(s.end);
                                            const cStart = starters[0].startTime
                                                ? toMinutes(starters[0].startTime!)
                                                : 0;
                                            const cEnd = starters[0].endTime
                                                ? toMinutes(starters[0].endTime!)
                                                : 0;
                                            return s1 >= cStart && s2 <= cEnd;
                                        }).length
                                    );

                                    return (
                                        <td
                                            key={`${day.id}-${slot.start}`}
                                            className="px-2 py-2 border-r last:border-r-0 align-top text-xs h-[70px]"
                                            rowSpan={rowSpan}
                                        >
                                            {starters.map((course) => {
                                                const [bg, border, title, text] = pickColor(
                                                    course.code
                                                );
                                                return (
                                                    <div
                                                        key={course.id}
                                                        className={`${bg} ${border} rounded-lg border px-3 py-2 shadow-sm w-full h-full flex flex-col justify-center`}
                                                    >
                                                        <div
                                                            className={`font-semibold text-[13px] truncate ${title}`}
                                                        >
                                                            {course.name}
                                                        </div>
                                                        <div className={`text-[11px] ${text}`}>
                                                            {course.code}
                                                            {course.period && <> · {course.period}</>}
                                                        </div>
                                                        <div className="flex justify-between text-[10px] text-[#000000] mt-1">
                                                            {course.startTime && course.endTime && (
                                                                <span>
                                                                    {course.startTime}–{course.endTime}
                                                                </span>
                                                            )}
                                                            {course.status && <span>{course.status}</span>}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}

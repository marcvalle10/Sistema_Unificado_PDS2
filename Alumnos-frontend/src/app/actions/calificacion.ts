"use client";

import type { GradesPayload, GradeRecord, Course } from "@/types/academico";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
    console.log("API_BASE:", API_BASE, "path:", path);
    const res = await fetch(`${API_BASE}${path}`, {
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        // credentials: "include",
        ...init,
    });

    if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(`Error ${res.status}: ${msg || res.statusText}`);
    }

    return (res.json() as Promise<T>);
}

export async function getGrades(expediente: string): Promise<GradesPayload> {
    if (!expediente) {
        throw new Error("Expediente requerido");
    }

    const q = `?studentId=${encodeURIComponent(expediente)}`;

    // Fetch en paralelo a los 4 endpoints del backend
    const [summary, history, enrolled, plan] = await Promise.all([
        fetchJSON<{
            student: { name: string; planYear: string | number; type: string; status: string };
            currentPeriod: string;
            currentSemester: number;
            kardexAverage: number;
            globalAverage: number;
        }>(`/historial/summary${q}`),

        fetchJSON<GradeRecord[]>(`/historial/history${q}`),

        fetchJSON<GradeRecord[]>(`/historial/enrolled${q}`),

        fetchJSON<Course[]>(`/historial/plan${q}`)
    ]);

    // Normalize + build payload for the frontend
    return {
        student: {
            name: String(summary.student.name),
            planYear: String(summary.student.planYear),
            type: String(summary.student.type),
            status: String(summary.student.status),
        },
        currentPeriod: String(summary.currentPeriod),
        currentSemester: Number(summary.currentSemester),
        kardexAverage: Number(summary.kardexAverage),
        globalAverage: Number(summary.globalAverage),

        plan: Array.isArray(plan) ? plan : [],
        history: Array.isArray(history) ? history : [],
        enrolled: Array.isArray(enrolled) ? enrolled : [],
    };
}

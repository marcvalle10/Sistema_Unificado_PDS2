"use client";
import { use, useEffect } from "react";

export default function BroadcastUserSummary({ summary }: { summary: any }) {
    useEffect(() => {
        window.dispatchEvent(new CustomEvent("user:summary", { detail:summary }));
    }, [summary]);
    return null;
}
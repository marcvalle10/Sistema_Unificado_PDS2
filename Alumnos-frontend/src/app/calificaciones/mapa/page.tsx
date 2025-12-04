import type { Metadata } from "next";
import { MapaClient } from "./MapaClient";

export const metadata: Metadata = {
    title: "Mapa de materias",
    description: "Mapa de materias del plan de estudios",
};

export default function Page() {
    return <MapaClient />; 
}

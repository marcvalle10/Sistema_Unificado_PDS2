"use client";

import { useState } from "react";
import Link from "next/link"; 

interface CardMateriaProps {
  id: string; // Nuevo prop para el ID real
  clave: string;
  grupo: string; // Cambiado a string porque en BD la clave puede ser texto
  materia: string;
  horario: string;
}

export default function CardMateria({
  id,
  clave,
  grupo,
  materia,
  horario,
}: CardMateriaProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    // Redirige a la vista de información pasando el ID del grupo por URL
    <Link href={`/curso/informacion?grupoId=${id}`}>
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          p-3 rounded-md shadow-sm text-center cursor-pointer
          transition-all duration-300 ease-in-out
          font-sans font-medium tracking-wide
          flex flex-col justify-center h-full min-h-[140px]
          ${isHovered ? "bg-[#E6B10F] text-white" : "bg-[#16469B] text-white"}
        `}
        style={{
          fontFamily: "Inter, sans-serif",
          margin: "0 auto",
        }}
      >
        <p className="font-bold text-lg mb-1">{clave}</p>
        <p className="text-sm opacity-90">Gpo: {grupo}</p>
        <p className="text-sm font-semibold my-2 leading-tight">{materia}</p>
        <p className="text-xs mt-auto pt-2 border-t border-white/20">{horario}</p>
      </div>
    </Link>
  );
}
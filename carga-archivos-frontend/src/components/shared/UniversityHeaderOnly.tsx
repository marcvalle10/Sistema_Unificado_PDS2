// src/components/shared/UniversityHeaderOnly.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Bentham } from "next/font/google";

const bentham = Bentham({
  weight: "400",
  subsets: ["latin"],
});

const USER_STORAGE_KEY = "userData";

type AuthUser = {
  nombre?: string;
  email?: string;
  roles?: string[];
  appRoles?: string[];
};

function getInitials(nombre?: string, email?: string): string {
  if (nombre && nombre.trim().length > 0) {
    const parts = nombre.trim().split(/\s+/);
    const f = parts[0]?.[0] ?? "";
    const s = parts[1]?.[0] ?? "";
    return (f + s).toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return "US";
}

export function UniversityHeaderOnly() {
  const router = useRouter();

  // Leer userData una sola vez al montar (lado cliente)
  const [initials] = useState<string>(() => {
    if (typeof window === "undefined") return "US";

    try {
      const raw = window.localStorage.getItem(USER_STORAGE_KEY);
      if (!raw) return "US";

      const user = JSON.parse(raw) as AuthUser;
      return getInitials(user.nombre, user.email);
    } catch {
      return "US";
    }
  });


  return (
    <div className="bg-white border-t-[6px] border-b-[6px] border-[#16469B]">
      <div className="flex flex-col sm:flex-row items-center justify-between px-3 sm:px-6 py-3 sm:py-2">
        {/* IZQUIERDA - Logo + textos */}
        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="relative">
            <Image
              src="/logo.png"
              alt="Universidad de Sonora"
              width={75}
              height={75}
              className="w-12 h-12 sm:w-15 sm:h-15 lg:w-[110px] lg:h-[110px] rounded-full object-cover"
              priority
            />
          </div>
          <div className="text-center sm:text-left px-8 space-x-6 leading-10">
            <h1
              className={`text-lg sm:text-2xl lg:text-3xl font-extrabold text-[#16469B] ${bentham.className} tracking-wider`}
            >
              UNIVERSIDAD DE SONORA
            </h1>
            <p
              className={`text-xs sm:text-xl text-[#16469B] italic font-semibold ${bentham.className} tracking-wider`}
            >
              El Saber de mis Hijos hará mi Grandeza
            </p>
          </div>
        </div>

        {/* DERECHA - Avatar */}
        <div className="flex flex-col items-center sm:items-end gap-2 mt-3 mr-4 sm:mr-4 sm:mt-0">
          {/* Avatar → configuración de perfil */}
          <button
            onClick={() => router.push("/configuracion-perfil")}
            className="w-8 h-8 sm:w-[3.7rem] sm:h-[3.7rem] bg-[#E6B10F] rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-xl shadow-md hover:opacity-90 transition"
            aria-label="Ver perfil"
          >
            {initials}
          </button>

        </div>
      </div>
    </div>
  );
}

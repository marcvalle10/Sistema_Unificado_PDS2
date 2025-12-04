// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MainApplication } from "@/components/MainApplication";

type StoredUserData = {
  id?: number;
  email: string;
  roles?: string[];
  nombre?: string;
};

export default function HomePage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    try {
      const raw =
        typeof window !== "undefined"
          ? localStorage.getItem("userData")
          : null;

      if (!raw) {
        router.replace("/login");
        return;
      }

      const parsed = JSON.parse(raw) as StoredUserData | null;

      if (!parsed || !parsed.email) {
        localStorage.removeItem("userData");
        router.replace("/login");
        return;
      }
    } catch (error) {
      console.error("Error al leer la sesión del usuario:", error);
      localStorage.removeItem("userData");
      router.replace("/login");
      return;
    } finally {
      setCheckingSession(false);
    }
  }, [router]);

  if (checkingSession) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f3f4f6]">
        <p className="text-sm text-gray-600">
          Verificando sesión, por favor espera...
        </p>
      </main>
    );
  }

  return <MainApplication />;
}

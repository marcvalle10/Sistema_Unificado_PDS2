"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export type StoredUserData = {
  id?: number;
  email: string;
  roles?: string[];
  nombre?: string;
};

export function useRequireAuth() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUserData | null>(null);
  const [loading, setLoading] = useState(true);

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

      setUser(parsed);
    } catch (error) {
      console.error("Error al leer la sesión del usuario:", error);
      localStorage.removeItem("userData");
      router.replace("/login");
      return;
    } finally {
      setLoading(false);
    }
  }, [router]);

  return { user, loading };
}

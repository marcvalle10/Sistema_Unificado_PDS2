"use client";

import { useRouter } from "next/navigation";

export function useLogout() {
  const router = useRouter();

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("userData");
    }
    router.replace("/login");
  };

  return logout;
}

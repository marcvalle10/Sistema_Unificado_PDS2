"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Inter, Roboto } from "next/font/google";
import Image from "next/image";
import "./globals.css";
import NavBar from "../components/NavBar";

// --- Definiciones de fuentes ---
const inter = Inter({ subsets: ["latin"] });
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500"] });

// --- Paleta de colores ---
const AZUL_MARINO = "#16469B";
const DORADO = "#E6B10F";
const FONDO = "#EDE9FF"; 

// Definición de tipo para el usuario
interface UserData {
  nombre: string;
  email: string;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userData, setUserData] = useState<UserData | null>(null);
  
  const pathname = usePathname();
  const router = useRouter();

  // Rutas sin NavBar
  const ROUTES_WITHOUT_NAVBAR = ['/', '/login', '/registro', '/recuperar-contrasena'];
  const shouldRenderNavbar = !ROUTES_WITHOUT_NAVBAR.includes(pathname);

  // 1️⃣ Cargar datos del usuario al montar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUserData(JSON.parse(storedUser));
        } catch (e) {
          console.error("Error leyendo usuario", e);
        }
      }
    }
  }, []);

  return (
    <html lang="es">
      <body className={inter.className}>
        <div
          className="min-h-screen flex justify-center py-10"
          style={{ backgroundColor: FONDO }}
        >
          <div className="bg-white max-w-[1200px] w-full mx-auto rounded-xl shadow-lg overflow-hidden min-h-[800px]">
            
            {/* Franja superior azul */}
            <div
              style={{ backgroundColor: AZUL_MARINO }}
              className="h-[8px] w-full"
            />

            {shouldRenderNavbar && (
              <>
                {/* --- HEADER BLANCO (SOLO LOGO) --- */}
                <header className="bg-white shadow-sm relative z-20">
                  <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
                    
                    {/* Logo + Textos */}
                    <div className="flex items-center gap-6">
                      <div className="w-[80px] h-[80px] relative">
                        <Image
                          src="/logounison.png"
                          alt="Logo Universidad de Sonora"
                          fill
                          className="object-contain"
                          priority
                        />
                      </div>

                      <div className="leading-snug">
                        <h1
                          className="uppercase tracking-wide font-semibold"
                          style={{
                            color: AZUL_MARINO,
                            fontSize: "24px",
                            lineHeight: "1.2",
                          }}
                        >
                          UNIVERSIDAD DE SONORA
                        </h1>
                        <p
                          className="font-serif italic text-[14px]"
                          style={{ color: AZUL_MARINO }}
                        >
                          El Saber de mis Hijos hará mi Grandeza
                        </p>
                      </div>
                    </div>

                    {/* 🟢 SE ELIMINARON LOS ÍCONOS DE USUARIO Y CAMPANA DE AQUÍ */}
                    
                  </div>
                </header>

                {/* --- NAVBAR AMARILLA --- */}
                <NavBar
                  className={`${roboto.className} text-white h-16 flex items-center shadow-sm font-medium text-[17px]`}
                  azul={AZUL_MARINO}
                  dorado={DORADO}
                />
              </>
            )}

            {/* Contenido dinámico */}
            <main className="p-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
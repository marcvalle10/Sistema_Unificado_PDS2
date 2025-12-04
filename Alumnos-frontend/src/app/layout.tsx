import type { Metadata } from "next";
import { Bentham, Anek_Devanagari } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import TopNav from "@/components/topNav";
import { getKardexHistory } from "./actions/kardex";

export const metadata: Metadata = {
  title: "Sistema de Alumnos",
  description: "Panel de Alumnos - UniSon",
}

const bentham = Bentham({ weight: "400", subsets: ["latin"], variable: "--font-bentham" });
const anek = Anek_Devanagari({ subsets: ["latin"], variable: "--font-anek" });

export default async function RootLayout({ children,}: Readonly<{ children: React.ReactNode; }>) {
  let locked = true;
  try{
    const items = await getKardexHistory();
    locked = !(Array.isArray(items) && items.length > 0);
  } catch(e){
    locked = true;
  }

  return (
    <html lang="es">
      <body className={`min-h-dvh bg-[#E6B10F] text-gray-900 ${bentham.variable} ${anek.variable} font-anek`}>
        <div className="h-1.5 w-full bg-[#E4B32D]" />
        <Header locked={locked} />
        <TopNav locked={locked} />
        <main className="mx-auto w-full max-w-7xl px-4 pb-10 pt-6 md:px-6">
          {children}
        </main>
      </body>
    </html>
  );
}

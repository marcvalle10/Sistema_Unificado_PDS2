"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";

interface Alerta {
  id: number;
  nombre: string;
  materia: string;
  faltas: number;
  tipo: 'REPROBADO' | 'CRITICO' | 'ADVERTENCIA';
}

export default function NotificationBell() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Obtener ID del profesor y cargar alertas
    const fetchAlertas = async () => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return;
        const user = JSON.parse(storedUser);

        try {
            const res = await fetch(`/api/attendance/alerts?profesorId=${user.profesorId}`);
            if (res.ok) {
                const data = await res.json();
                setAlertas(data);
            }
        } catch (e) {
            console.error("Error cargando notificaciones", e);
        }
    };

    fetchAlertas();

    // Cierra el menú si clicas fuera
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* Icono de Campana */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white hover:bg-white/10 rounded-full transition"
      >
        <Bell className="w-6 h-6" />
        
        {/* Badge Rojo con contador */}
        {alertas.length > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full border-2 border-[#E6B10F]">
                {alertas.length}
            </span>
        )}
      </button>

      {/* Menú Desplegable */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-50 border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-700">Notificaciones</h3>
                <span className="text-xs text-gray-500">{alertas.length} alertas</span>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
                {alertas.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-sm">
                        No hay alertas pendientes.
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {alertas.map((alerta, idx) => (
                            <li key={idx} className="px-4 py-3 hover:bg-gray-50 transition">
                                <div className="flex justify-between items-start">
                                    <p className="text-sm font-bold text-gray-800 line-clamp-1">{alerta.nombre}</p>
                                    {alerta.tipo === 'CRITICO' && <span className="bg-red-100 text-red-800 text-[10px] px-2 py-0.5 rounded-full font-bold">¡A 1 falta!</span>}
                                    {alerta.tipo === 'ADVERTENCIA' && <span className="bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded-full font-bold">Riesgo</span>}
                                    {alerta.tipo === 'REPROBADO' && <span className="bg-gray-100 text-gray-800 text-[10px] px-2 py-0.5 rounded-full font-bold">Sin derecho</span>}
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">{alerta.materia}</p>
                                <p className="text-xs text-gray-600 mt-1">
                                    Tiene <strong className="text-gray-900">{alerta.faltas}</strong> faltas acumuladas.
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
      )}
    </div>
  );
}
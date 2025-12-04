"use client";

import { useState, useRef, useEffect, useCallback } from "react";
// Se asume que este componente está disponible o se puede simular
// Si no existe, puedes definirlo en un archivo separado como SectionTitle.tsx
const SectionTitle = ({ title }: { title: string }) => (
    <h2 className="text-xl font-bold mb-4 border-b-2 pb-1" style={{ borderColor: "#16469B", color: "#16469B" }}>
        {title}
    </h2>
);


type AdjustmentProps = {
    file: File;
    onSave: (finalFile: File) => void;
    onCancel: () => void;
};

// Colores institucionales
const AZUL_MARINO = "#16469B";
const GRIS_CLARO = "#D8D8D8";

export default function ImageAdjustmentPage({ file, onSave, onCancel }: AdjustmentProps) {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [scale, setScale] = useState(1);
    const [imagePos, setImagePos] = useState({ x: 0, y: 0 }); // Posición (simulada) de la imagen
    const containerRef = useRef<HTMLDivElement>(null);

    // Cargar la imagen del archivo
    useEffect(() => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setImageSrc(reader.result as string);
        };
        reader.readAsDataURL(file);
    }, [file]);

    // Función simulada para generar el archivo final (en una app real, esto usaría Canvas para el recorte)
    const handleSave = () => {
        // En una aplicación real, aquí se usaría un Canvas o librería de cropper
        // para obtener el blob/file real de la zona recortada.
        // Simulamos la creación de un nuevo archivo para el flujo de la aplicación.
        const croppedFile = new File([file], `cropped_${file.name}`, { type: file.type });
        onSave(croppedFile);
    };

    // Lógica simulada de arrastre (drag)
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        const startX = e.clientX;
        const startY = e.clientY;
        const startPos = imagePos;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;

            // Lógica de límites simplificada para simular movimiento
            const newX = startPos.x + dx;
            const newY = startPos.y + dy;

            setImagePos({ x: newX, y: newY });
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [imagePos]);

    if (!imageSrc) {
        return <div className="p-12 text-center text-gray-500">Cargando imagen...</div>;
    }

    return (
        <div className="py-8 min-h-screen flex flex-col items-center bg-gray-50">

            <div className="max-w-4xl w-full mx-auto">
                <SectionTitle title="Ajustar y Recortar Foto de Perfil" />
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 max-w-4xl w-full flex flex-col items-center">

                <p className="text-gray-600 mb-6 text-sm text-center">
                    Arrastra y haz zoom para encuadrar tu imagen dentro del círculo.
                </p>

                {/* 🖼️ Área de Cropping (Marco Circular) */}
                <div
                    ref={containerRef}
                    className="relative w-80 h-80 overflow-hidden rounded-full border-4 border-dashed"
                    style={{ borderColor: AZUL_MARINO, boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)' }}
                >
                    {/* Contenedor de la Imagen para arrastrar */}
                    <div
                        className="w-full h-full relative cursor-grab active:cursor-grabbing"
                        onMouseDown={handleMouseDown}
                        // Soporte para Touch (arrastre)
                        onTouchStart={(e) => {
                            // Simular handleMouseDown para touch
                            const touch = e.touches[0];
                            handleMouseDown({
                                clientX: touch.clientX,
                                clientY: touch.clientY
                            } as any);
                        }}
                    >
                        {/* Imagen que se mueve y escala */}
                        <img
                            src={imageSrc}
                            alt="Preview de la imagen a recortar"
                            // Estilo dinámico para posición y zoom
                            style={{
                                transform: `scale(${scale}) translate(${imagePos.x / scale}px, ${imagePos.y / scale}px)`,
                                transformOrigin: '0 0',
                                position: 'absolute',
                                width: '100%',
                                height: 'auto',
                                minHeight: '100%',
                                pointerEvents: 'none', // Importante para que el arrastre funcione en el DIV padre
                            }}
                            className="object-cover w-full h-full"
                        />
                    </div>
                </div>

                {/* 🔎 Slider de Zoom */}
                <div className="mt-8 w-full max-w-sm">
                    <label htmlFor="zoom-slider" className="block text-sm font-medium text-gray-700 mb-2">
                        Zoom ({Math.round(scale * 100)}%)
                    </label>
                    <input
                        id="zoom-slider"
                        type="range"
                        min="1"
                        max="3"
                        step="0.1"
                        value={scale}
                        onChange={(e) => setScale(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg"
                    />
                </div>

                {/* Botones de Acción */}
                <div className="mt-10 flex justify-end w-full max-w-sm">
                    <button
                        onClick={onCancel}
                        className={`px-6 py-2 rounded font-medium text-gray-700 hover:bg-gray-200 transition mr-3`}
                        style={{ backgroundColor: GRIS_CLARO }}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className={`px-6 py-2 rounded font-medium text-white transition hover:opacity-90`}
                        style={{ backgroundColor: AZUL_MARINO }}
                    >
                        Guardar Foto
                    </button>
                </div>
            </div>
        </div>
    );
}
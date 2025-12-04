import { FileHistoryRecord } from "@/types/historical";
import { supabase } from "@/lib/supabase";

export async function getFiles(): Promise<FileHistoryRecord[]> {
  const { data, error } = await supabase
    .from("archivo_cargado")
    .select("id,fecha,nombre_archivo,estado_proceso")
    .order("fecha");
  if (error) {
    console.error("Error al obtener archivos:", error);
    throw error;
  }
  return data.map((archivo) => ({
    id: archivo.id,
    date: new Date(archivo.fecha).toLocaleDateString("es-MX"),
    filename: archivo.nombre_archivo,
    status: archivo.estado_proceso,
  }));
}

export async function deleteFile(fileId: number): Promise<void> {
  const { error } = await supabase
    .from("archivo_cargado")
    .delete()
    .eq("id", fileId);

  if (error) {
    console.error("Error al eliminar archivo:", error);
    throw error;
  }
}

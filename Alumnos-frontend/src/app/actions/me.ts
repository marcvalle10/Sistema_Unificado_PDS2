export async function getUserSummary() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me/summary`, {
        cache: "no-store",
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error ("Error al obtener el resumen del usuario");
    return res.json();
}
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function redirectMiddleware(req: NextRequest){
    const { pathname } = req.nextUrl;

    // Rutas permitidas aun con lock
    const allowedWHenLocked = ["/kardex",];
    const isAllowed = allowedWHenLocked.some( (p) => pathname.startsWith(p) );
    if (isAllowed) return NextResponse.next();

    try {
        const res = await fetch(`${API_BASE}/kardex/history`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("mala conexion");
        const items = (await res.json()) as any[];
        const hasKardex = Array.isArray(items) && items.length > 0;
        if (!hasKardex) {
            const url = req.nextUrl.clone();
            url.pathname = "/kardex";
            return NextResponse.redirect(url);
        }
    } catch {
        const url = req.nextUrl.clone();
        url.pathname = "/kardex";
        return NextResponse.redirect(url);
    }
    
    return NextResponse.next();
}

import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    // console.log("Middleware dijalankan!");
    const token = request.cookies.get("token")?.value;
    const url = new URL(request.url);

    const isAuthPage = url.pathname.startsWith("/login");
    const isProtectedPage = url.pathname.startsWith("/dashboard");

    if (url.pathname === "/") {
        return NextResponse.redirect(new URL(token ? "/dashboard" : "/login", request.url));
    }

    if (token && isAuthPage) {
        const valid = await isTokenValid(token, request);
        if (valid) return NextResponse.redirect(new URL("/dashboard", request.url));

        return clearTokenAndContinue(request);
    }

    if (isProtectedPage) {
        if (!token) return NextResponse.redirect(new URL("/login", request.url));

        const valid = await isTokenValid(token, request);
        if (!valid) {
            const res = NextResponse.redirect(new URL("/login", request.url));
            res.cookies.delete("token");
            res.cookies.delete("session_key");
            return res;
        }
    }

    return NextResponse.next();
}

async function isTokenValid(token: string, request: NextRequest): Promise<boolean> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });
        return res.ok;
    } catch {
        return false;
    }
}

function clearTokenAndContinue(request: NextRequest) {
    const res = NextResponse.next();
    res.cookies.delete("token");
    res.cookies.delete("session_key");
    return res;
}

export const config = {
    matcher: ["/dashboard/:path*", "/login", "/"],
};
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    console.log("Middleware dijalankan!");

    const token = request.cookies.get("playpro_academy_session");
    const url = new URL(request.url);

    console.log("token : ", token);

    if (url.pathname === "/") {
        if (token) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        return NextResponse.redirect(new URL("/login", request.url));
    }

    const isAuthPage = url.pathname.startsWith("/login");
    const isProtectedPage = url.pathname.startsWith("/dashboard");

    if (token && isAuthPage) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (!token && isProtectedPage) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    // matcher: ["/dashboard/:path*", "/login", "/"],
};
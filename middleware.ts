// middleware.ts

import { NextRequest, NextResponse } from "next/server";

type SessionShape = {
    role?: string;
    user?: {
        role?: string;
    };
};
const PUBLIC_ROUTES = ["/", "/login", "/register", "/class-programs", "/about-us", "/membership-package", "/schedules-booking", "/coach-list", "/gallery-activities"];
const AUTH_ROUTES = ["/login", "/register"];
const SESSION_COOKIE = "session_key";

function getRoleFromCookie(request: NextRequest): string | null {
    const raw = request.cookies.get(SESSION_COOKIE)?.value;

    if (!raw) return null;
    try {
        const session: SessionShape = JSON.parse(raw);

        const role = session?.role ?? session?.user?.role;

        return typeof role === "string"
            ? role.toLowerCase()
            : null;
    } catch (err) {
        return null;
    }
}

function isPublicRoute(pathname: string) {
    return PUBLIC_ROUTES.some((route) => pathname === route);
}

function isAllowed(role: string, pathname: string) {

    // ADMIN
    if (role === "admin") {
        return true;
    }

    // COACH
    if (role === "coach") {
        return (
            pathname.startsWith("/dashboard") ||
            pathname.startsWith("/attendance-reports")
        );
    }

    // PARENT
    if (role === "parent") {
        return pathname.startsWith("/dashboard");
    }

    return false;
}

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const role = getRoleFromCookie(request);

    // Route publik selalu boleh diakses, baik login maupun belum login
    if (isPublicRoute(pathname)) {
        // kalau sudah login dan buka login/register, redirect ke dashboard
        if (role && AUTH_ROUTES.includes(pathname)) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }

        return NextResponse.next();
    }

    // Belum login
    if (!role) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Sudah login tapi buka login/register
    if (AUTH_ROUTES.includes(pathname)) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Route non-public tetap dicek role
    const allowed = isAllowed(role, pathname);

    if (!allowed) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
    ],
};
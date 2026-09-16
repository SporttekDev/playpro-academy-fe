// app/api/cms/[...slug]/route.ts
// Proxy ke backend content service — API key hanya ada di server, tidak pernah expose ke browser

import { NextRequest, NextResponse } from "next/server";

const CONTENT_API_URL = process.env.CONTENT_API_URL!;
const CONTENT_API_KEY = process.env.CONTENT_API_KEY!;
const CONTENT_COMPANY_DOMAIN = process.env.CONTENT_COMPANY_DOMAIN!;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string[] }> }
) {
    try {
        const { slug } = await params;
        const slugPath = slug.join("/");

        const search = request.nextUrl.searchParams.toString();
        const query = search ? `?${search}` : "";

        // Content service route sekarang:
        // GET /api/public/contents
        // GET /api/public/contents/{slugs}
        const contentApiUrl = `${CONTENT_API_URL}/api/public/${slugPath}${query}`;

        const res = await fetch(contentApiUrl, {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "X-API-KEY": CONTENT_API_KEY,
                "X-Company-Domain": CONTENT_COMPANY_DOMAIN,
            },
            next: { revalidate: 60 },
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json(data, { status: res.status });
        }

        return NextResponse.json(data, {
            status: 200,
            headers: {
                "Cache-Control": "s-maxage=60, stale-while-revalidate=300",
            },
        });
    } catch (err) {
        console.error("[Content Proxy] Error:", err);
        return NextResponse.json(
            { success: false, message: "Proxy error", error: String(err) },
            { status: 500 }
        );
    }
}
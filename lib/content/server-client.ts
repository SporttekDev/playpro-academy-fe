// lib/content/server-client.ts
// HANYA untuk Server Component / generateMetadata — jangan pernah diimport dari client component

import "server-only";
import { ContentItem } from "./client";

const CONTENT_API_URL = process.env.CONTENT_API_URL!;
const CONTENT_API_KEY = process.env.CONTENT_API_KEY!;
const CONTENT_COMPANY_DOMAIN = process.env.CONTENT_COMPANY_DOMAIN!;

async function fetchContentDirect<T>(path: string): Promise<T> {
    const url = `${CONTENT_API_URL}/api/public/${path}`;
    try {
        const res = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                "X-API-KEY": CONTENT_API_KEY,
                "X-Company-Domain": CONTENT_COMPANY_DOMAIN,
            },
            next: { revalidate: 60 },
            signal: AbortSignal.timeout(10000),
        });

        if (!res.ok) {
            const errBody = await res.text().catch(() => "");
            console.error(
                `[fetchContentDirect] FAILED ${res.status} for URL: ${url} | Body: ${errBody}`
            );
            throw new Error(`CMS error: ${res.status} ${res.statusText}`);
        }

        const json = await res.json();
        return json.data;
    } catch (err) {
        console.error(`[fetchContentDirect] EXCEPTION for URL: ${url}`, err);
        throw err;
    }
}

export async function resolveContentServer(
    slugs: string[],
    contentType?: string
): Promise<ContentItem> {
    const path = slugs.filter(Boolean).join("/");
    const params = new URLSearchParams();
    if (contentType) params.set("content_type", contentType);
    return fetchContentDirect(
        `contents/${path}${params.toString() ? `?${params}` : ""}`
    );
}

export async function listContentsServer(
    contentType: string,
    options?: { rootOnly?: boolean }
): Promise<ContentItem[]> {
    const params = new URLSearchParams({ content_type: contentType });
    if (options?.rootOnly) params.set("root_only", "true");
    return fetchContentDirect<ContentItem[]>(`contents?${params}`);
}
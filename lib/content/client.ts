// lib/content/client.ts
// Fetch via Next.js proxy route — API key tidak pernah expose ke browser

export type ContentItem = {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    body: string | null;
    cover_image_url: string | null;
    display_order: number;
    is_published: boolean;
    published_at: string | null;
    content_type: {
        slug: string;
        display_name: string;
    };
    attributes: Record<string, unknown>;
    children?: ContentItem[];
    created_at: string;
    updated_at: string;
};

type ContentResponse<T> = {
    success: boolean;
    message: string;
    data: T;
};

async function fetchContentProxy<T>(path: string): Promise<T> {
    const res = await fetch(`/api/cms/${path}`, {
        headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
            err?.message ?? `CMS error: ${res.status} ${res.statusText}`
        );
    }

    const json: ContentResponse<T> = await res.json();
    return json.data;
}

/**
 * Resolve content by slug chain via proxy.
 *
 * @example
 * resolveContent(["berita"], "article")
 * resolveContent(["berita", "tips-latihan-badminton"], "article")
 */
export async function resolveContent(
    slugs: string[],
    contentType?: string
): Promise<ContentItem> {
    const path = slugs.filter(Boolean).join("/");

    const params = new URLSearchParams();

    if (contentType) {
        params.set("content_type", contentType);
    }

    return fetchContentProxy(
        `contents/${path}${params.toString() ? `?${params}` : ""}`
    );
}

/**
 * List contents by content_type slug via proxy.
 *
 * @example
 * listContents("article", { rootOnly: true })
 */
export async function listContents(
    contentType: string,
    options?: { rootOnly?: boolean }
): Promise<ContentItem[]> {
    const params = new URLSearchParams({ content_type: contentType });
    if (options?.rootOnly) params.set("root_only", "true");

    return fetchContentProxy<ContentItem[]>(`contents?${params}`);
}
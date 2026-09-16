const ASSET_BASE_URL = process.env.NEXT_PUBLIC_CONTENT_ASSET_URL ?? "";
const FALLBACK_IMAGE = "/images/galleries/gallery-1.png";

export function resolveImageUrl(path: string | null, fallback: string = FALLBACK_IMAGE): string {
    if (!path) return fallback;
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
        return path;
    }
    return `${ASSET_BASE_URL}/storage/${path}`;
}
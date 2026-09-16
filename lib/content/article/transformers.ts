import { ContentItem } from "../client";
import { Article, ArticleAttributes } from "./types";

const WORDS_PER_MINUTE = 200;
const EXCERPT_FALLBACK_LENGTH = 160;
const FALLBACK_IMAGE = "/images/galleries/gallery-1.png"; // sesuaikan asset placeholder
const ASSET_BASE_URL = process.env.NEXT_PUBLIC_CONTENT_ASSET_URL ?? "";

function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function estimateReadTime(body: string): number {
    const wordCount = stripHtml(body).split(" ").filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

export function formatArticleDate(iso: string | null): string {
    if (!iso) return "";
    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(new Date(iso));
}

function toDisplayCategory(slug?: string): string {
    if (!slug) return "Uncategorized";
    return slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function resolveImageUrl(path: string | null): string {
    if (!path) return FALLBACK_IMAGE;
    // sudah absolute URL atau path lokal Next.js
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
        return path;
    }
    // path relatif dari storage Laravel, contoh: "article/slug/file.webp"
    return `${ASSET_BASE_URL}/storage/${path}`;
}


export function mapContentToArticle(content: ContentItem): Article {
    const attrs = (content.attributes ?? {}) as ArticleAttributes;
    const body = content.body ?? "";
    const plainBody = stripHtml(body);

    return {
        ...content,
        excerpt: content.excerpt ?? plainBody.slice(0, EXCERPT_FALLBACK_LENGTH),
        body,
        cover_image_url: resolveImageUrl(content.cover_image_url),
        category: attrs.category ?? null,
        categoryLabel: attrs.category_label ?? toDisplayCategory(attrs.category),
        readTimeMinutes: attrs.read_time_minutes ?? estimateReadTime(body),
        publishedAtLabel: formatArticleDate(content.published_at),
    };
}
import { ContentItem } from "../client";
import { Article, ArticleAttributes } from "./types";
import { resolveImageUrl } from "../resolve-image-url";

const WORDS_PER_MINUTE = 200;
const EXCERPT_FALLBACK_LENGTH = 160;

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
        timeZone: "Asia/Jakarta", 
    }).format(new Date(iso));
}

function toDisplayCategory(slug?: string): string {
    if (!slug) return "Uncategorized";
    return slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
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
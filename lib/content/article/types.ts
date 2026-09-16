import { ContentItem } from "../client";

export type ArticleAttributes = {
    category?: string;
    category_label?: string;
    read_time_minutes?: number;
};

export type Article = Omit<ContentItem, "excerpt" | "body"> & {
    excerpt: string;
    body: string;
    cover_image_url: string; // dijamin selalu string (di-fallback di transformer)
    category: string | null;
    categoryLabel: string;
    readTimeMinutes: number;
    publishedAtLabel: string;
};
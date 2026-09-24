"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { listContents, resolveContent } from "../client";
import { mapContentToArticle } from "./transformers";
import { Article } from "./types";

const PAGE_SIZE = 6;

export function useArticles() {
    const [allArticles, setAllArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [category, setCategory] = useState<string | null>(null);
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    const fetchArticles = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const contents = await listContents("article");
            setAllArticles(contents.map(mapContentToArticle));
        } catch (err) {
            console.error("Failed to fetch articles:", err);
            setError("Gagal memuat artikel");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    // Featured = artikel dengan display_order terkecil, TIDAK terpengaruh filter kategori.
    // Backend sudah orderBy('display_order') lebih dulu, jadi allArticles[0] sudah pasti yang terkecil.
    const featured = allArticles[0] ?? null;

    // Sisa artikel (di luar featured) yang jadi sumber untuk grid + filter kategori
    const restArticles = useMemo(
        () => allArticles.slice(featured ? 1 : 0),
        [allArticles, featured]
    );

    const categories = useMemo(() => {
        const unique = new Set(
            restArticles.map((a) => a.category).filter((c): c is string => Boolean(c))
        );
        return Array.from(unique);
    }, [restArticles]);

    const filtered = useMemo(() => {
        if (!category) return restArticles;
        return restArticles.filter((a) => a.category === category);
    }, [restArticles, category]);

    const setCategoryFilter = useCallback((next: string | null) => {
        setCategory(next);
        setVisibleCount(PAGE_SIZE);
    }, []);

    const loadMore = useCallback(() => {
        setVisibleCount((prev) => prev + PAGE_SIZE);
    }, []);

    return {
        featured,
        articles: filtered.slice(0, visibleCount),
        categories,
        activeCategory: category,
        setCategory: setCategoryFilter,
        isLoading,
        error,
        hasMore: visibleCount < filtered.length,
        loadMore,
        refetch: fetchArticles,
    };
}


export function useArticle(slug: string) {
    const [article, setArticle] = useState<Article | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchArticle = useCallback(async () => {
        if (!slug) return;
        try {
            setIsLoading(true);
            setError(null);
            const content = await resolveContent([slug], "article");
            setArticle(mapContentToArticle(content));
        } catch (err) {
            console.error("Failed to fetch article:", err);
            setError("Artikel tidak ditemukan");
        } finally {
            setIsLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        fetchArticle();
    }, [fetchArticle]);

    return { article, isLoading, error, refetch: fetchArticle };
}

export function useLatestArticles(limit: number = 4) {
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchArticles = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const contents = await listContents("article");
            setArticles(contents.map(mapContentToArticle).slice(0, limit));
        } catch (err) {
            console.error("Failed to fetch latest articles:", err);
            setError("Gagal memuat artikel");
        } finally {
            setIsLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    return { articles, isLoading, error };
}
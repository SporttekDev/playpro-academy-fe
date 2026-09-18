"use client";

import { useCallback, useEffect, useState } from "react";
import { listContents } from "../client";
import { mapContentToPromo } from "./transformers";
import { PromoItem } from "./types";

export function usePromos() {
    const [promos, setPromos] = useState<PromoItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPromos = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const contents = await listContents("promo");
            setPromos(contents.map(mapContentToPromo));
        } catch (err) {
            console.error("Failed to fetch promos:", err);
            setError("Gagal memuat promo");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPromos();
    }, [fetchPromos]);

    return { promos, isLoading, error, refetch: fetchPromos };
}
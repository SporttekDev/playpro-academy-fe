"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { listPublicSchedules } from "./client";
import { mapRawToScheduleItem } from "./transformers";
import { ScheduleItem } from "./types";

export function useSchedules() {
    const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSchedules = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const raw = await listPublicSchedules();
            setSchedules(raw.map(mapRawToScheduleItem));
        } catch (err) {
            console.error("Failed to fetch schedules:", err);
            setError("Gagal memuat jadwal");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSchedules();
    }, [fetchSchedules]);

    const categories = useMemo(() => {
        const unique = new Map<string, string>();
        schedules.forEach((s) => unique.set(s.categoryName.toLowerCase(), s.categoryName));
        return Array.from(unique.entries()).map(([key, label]) => ({ key, label }));
    }, [schedules]);

    return { schedules, categories, isLoading, error, refetch: fetchSchedules };
}
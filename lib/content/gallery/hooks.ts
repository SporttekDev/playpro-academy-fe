"use client";

import { useCallback, useEffect, useState } from "react";
import { listContents } from "../client";
import { mapContentToGalleryPhoto } from "./transformers";
import { GalleryPhoto } from "./types";

export function useGalleryPhotos() {
    const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPhotos = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const contents = await listContents("gallery");
            setPhotos(contents.map(mapContentToGalleryPhoto));
        } catch (err) {
            console.error("Failed to fetch gallery photos:", err);
            setError("Gagal memuat galeri");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPhotos();
    }, [fetchPhotos]);

    return { photos, isLoading, error, refetch: fetchPhotos };
}
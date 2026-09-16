// lib/laravel/shared/gallery.ts
// Util bersama untuk extract & sanitize gallery dari LaravelContent.
// Dipakai oleh portfolio transformer maupun service transformer.

import { CarouselItem } from "@/components/ui/CarouselContent";
import { LaravelContent } from "../client";
import { getImageUrl } from "../image";

/**
 * Extract & sanitize attributes.gallery jadi CarouselItem[].
 * Fallback ke cover_image_url tunggal jika gallery kosong/tidak valid,
 * dan fallback ke static image jika cover_image_url pun tidak ada.
 */
export function extractGallery(content: LaravelContent): CarouselItem[] {
  const rawGallery = content.attributes?.gallery;

  if (Array.isArray(rawGallery) && rawGallery.length > 0) {
    const items = rawGallery
      .filter((url): url is string => typeof url === "string")
      .map((url) => ({
        image: getImageUrl(url),
        alt: content.title,
      }))
      // buang item yang gagal resolve jadi fallback statis ganda
      .filter((item) => item.image !== "/images/fallback-picture.svg");

    if (items.length > 0) {
      return items;
    }
  }

  // Fallback 1: pakai cover_image_url tunggal kalau ada
  if (content.cover_image_url) {
    return [
      {
        image: getImageUrl(content.cover_image_url),
        alt: content.title,
      },
    ];
  }

  // Fallback 2: static fallback image
  return [
    {
      image: "/images/fallback-picture.svg",
      alt: content.title,
    },
  ];
}

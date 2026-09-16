import { ContentItem } from "../client";
import { resolveImageUrl } from "../resolve-image-url";
import { GalleryPhoto } from "./types";

export function mapContentToGalleryPhoto(content: ContentItem): GalleryPhoto {
    return {
        id: content.id,
        title: content.title,
        slug: content.slug,
        imageUrl: resolveImageUrl(content.cover_image_url),
        displayOrder: content.display_order,
    };
}
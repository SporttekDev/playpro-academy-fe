import { ContentItem } from "../client";
import { resolveImageUrl } from "../resolve-image-url";
import { PROMO_ICONS, PROMO_THEMES, DEFAULT_ICON_KEY, DEFAULT_THEME_KEY } from "./presets";
import { PromoAttributes, PromoItem } from "./types";

export function mapContentToPromo(content: ContentItem): PromoItem {
    const attrs = (content.attributes ?? {}) as PromoAttributes;

    return {
        id: content.id,
        title: content.title,
        description: content.excerpt ?? "",
        imageUrl: resolveImageUrl(content.cover_image_url),
        icon: PROMO_ICONS[attrs.icon ?? ""] ?? PROMO_ICONS[DEFAULT_ICON_KEY],
        theme: PROMO_THEMES[attrs.accent_color ?? ""] ?? PROMO_THEMES[DEFAULT_THEME_KEY],
        dateLabel: attrs.date_label ?? "",
        isFeatured: attrs.is_featured === "true",
        ctaType: attrs.cta_type === "link" ? "link" : "whatsapp",
        ctaLabel: attrs.cta_label ?? "Learn More",
        ctaHref: attrs.cta_href ?? "#",
        whatsappMessage: attrs.whatsapp_message ?? `Halo admin PlayPro Academy, saya tertarik dengan promo ${content.title}.`,
    };
}
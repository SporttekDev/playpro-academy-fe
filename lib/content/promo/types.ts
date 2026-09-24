import type { LucideIcon } from "lucide-react";

export type PromoAttributes = {
    icon?: string;
    accent_color?: string;
    date_label?: string;
    is_featured?: string;
    cta_type?: "whatsapp" | "link";
    cta_label?: string;
    cta_href?: string;
    whatsapp_message?: string;
};

export type PromoAccentTheme = {
    badge: string;      // border + bg untuk badge tipe
    badgeText: string;  // warna teks badge
    card: string;       // border + bg untuk card & dot timeline
};

export type PromoItem = {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    icon: LucideIcon;
    theme: PromoAccentTheme;
    dateLabel: string;
    isFeatured: boolean;
    ctaType: "whatsapp" | "link";
    ctaLabel: string;
    ctaHref: string;
    whatsappMessage: string;
};
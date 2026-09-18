import { Sparkles, Trophy, TicketPercent, type LucideIcon } from "lucide-react";
import type { PromoAccentTheme } from "./types";

export const PROMO_ICONS: Record<string, LucideIcon> = {
    sparkles: Sparkles,
    trophy: Trophy,
    ticket: TicketPercent,
};

export const PROMO_THEMES: Record<string, PromoAccentTheme> = {
    blue: {
        badge: "bg-blue-50 border-blue-200",
        badgeText: "text-blue-600",
        card: "bg-blue-50 border-blue-200",
    },
    amber: {
        badge: "bg-amber-50 border-amber-200",
        badgeText: "text-amber-600",
        card: "bg-amber-50 border-amber-200",
    },
    emerald: {
        badge: "bg-emerald-50 border-emerald-200",
        badgeText: "text-emerald-600",
        card: "bg-emerald-50 border-emerald-200",
    },
};

export const DEFAULT_ICON_KEY = "sparkles";
export const DEFAULT_THEME_KEY = "blue";
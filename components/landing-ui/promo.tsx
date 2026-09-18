"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import {
    ArrowRight,
    CalendarDays,
    Sparkles,
    TicketPercent,
    Trophy,
    type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { WhatsAppButton } from "./whatsapp-button"
import { usePromos } from "@/lib/content/promo/hooks"
import { PromoItem } from "@/lib/content/promo/types"

// ─── Types ───────────────────────────────────────────────────────────────────


// ─── Sub-components ──────────────────────────────────────────────────────────

function TimelineDot({
    accent,
    accentText,
    icon: Icon,
    isLast,
}: {
    accent: string
    accentText: string
    icon: LucideIcon
    isLast: boolean
}) {
    const reduceMotion = useReducedMotion()

    return (
        <div className="relative flex flex-col items-center" aria-hidden="true">
            <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{
                    duration: 0.25,
                    ease: "easeOut",
                }}
                className={`
          z-10 flex h-10 w-10 shrink-0 items-center justify-center
          rounded-full border-4 border-white shadow-md
          sm:h-12 sm:w-12 ${accent}
        `}
            >
                <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${accentText}`} />
            </motion.div>

            {!isLast && (
                <motion.div
                    initial={{ scaleY: 0.2, opacity: 0.4 }}
                    whileInView={{ scaleY: 1, opacity: 1 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{
                        duration: reduceMotion ? 0 : 0.3,
                        ease: "easeOut",
                    }}
                    style={{ transformOrigin: "top" }}
                    className="mt-1 w-0.5 flex-1 bg-slate-200"
                />
            )}
        </div>
    )
}

function TimelineCard({
    promo,
    isLast,
}: {
    promo: PromoItem
    isLast: boolean
}) {
    const Icon = promo.icon
    const reduceMotion = useReducedMotion()

    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            whileHover={
                reduceMotion
                    ? undefined
                    : { y: -4, transition: { duration: 0.16, ease: "easeOut" } }
            }
            className="flex gap-4 sm:gap-6 lg:gap-8"
        >
            <TimelineDot
                accent={promo.theme.card}
                accentText={promo.theme.badgeText}
                icon={Icon}
                isLast={isLast}
            />

            <div
                className={`
                    group mb-8 flex flex-1 overflow-hidden
                    rounded-[1.5rem] border bg-white shadow-sm
                    transition-all duration-300
                    hover:shadow-xl
                    sm:rounded-[2rem] ${promo.theme.card}
                `}
            >
                <div className="relative hidden w-36 shrink-0 overflow-hidden sm:block sm:w-44 md:w-56">
                    <Image
                        src={promo.imageUrl}
                        alt={promo.title}
                        fill
                        priority={promo.isFeatured}
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                </div>

                <div className="flex flex-1 flex-col justify-center p-4 sm:p-6">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <span
                            className={`
                                inline-flex items-center gap-1.5 rounded-full
                                border px-2.5 py-1 text-xs font-semibold
                                ${promo.theme.badge} ${promo.theme.badgeText}
                            `}
                        >
                            <Icon aria-hidden="true" className="h-3 w-3" />
                            {promo.isFeatured ? "Limited Promo" : "Promo"}
                        </span>

                        {promo.dateLabel && (
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                                <CalendarDays aria-hidden="true" className="h-3 w-3" />
                                {promo.dateLabel}
                            </span>
                        )}
                    </div>

                    <h3 className="mt-2.5 text-base font-bold text-slate-900 sm:mt-3 sm:text-lg md:text-xl">
                        {promo.title}
                    </h3>

                    <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:mt-1.5 sm:text-sm">
                        {promo.description}
                    </p>

                    {promo.ctaType === "whatsapp" ? (
                        <div className="mt-3 sm:mt-4">
                            <WhatsAppButton
                                size="sm"
                                phone="+6282131111549"
                                message={promo.whatsappMessage}
                                label={promo.ctaLabel}
                            />
                        </div>
                    ) : (
                        <Link
                            href={promo.ctaHref}
                            aria-label={`Pelajari lebih lanjut tentang ${promo.title}`}
                            className={`
                                mt-3 inline-flex w-fit items-center gap-1.5
                                text-xs font-semibold transition-all duration-300
                                hover:gap-2.5 sm:mt-4 sm:text-sm
                                ${promo.theme.badgeText}
                            `}
                        >
                            {promo.ctaLabel}
                            <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                        </Link>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

function PromoCardSkeleton({ isLast }: { isLast: boolean }) {
    return (
        <div className="flex animate-pulse gap-4 sm:gap-6 lg:gap-8">
            <div className="flex flex-col items-center">
                <div className="h-10 w-10 rounded-full bg-slate-200 sm:h-12 sm:w-12" />
                {!isLast && <div className="mt-1 w-0.5 flex-1 bg-slate-100" />}
            </div>
            <div className="mb-8 flex flex-1 overflow-hidden rounded-[1.5rem] border border-slate-100 bg-white sm:rounded-[2rem]">
                <div className="hidden w-36 shrink-0 bg-slate-200 sm:block sm:w-44 md:w-56" />
                <div className="flex flex-1 flex-col justify-center gap-2 p-4 sm:p-6">
                    <div className="h-4 w-24 rounded-full bg-slate-200" />
                    <div className="h-5 w-40 rounded bg-slate-200" />
                    <div className="h-3 w-full rounded bg-slate-200" />
                </div>
            </div>
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PromoSection() {
    const reduceMotion = useReducedMotion()
    const { promos, isLoading, error } = usePromos()

    return (
        <motion.section
            aria-label="Promo dan Event PlayPro Academy"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.18 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative overflow-hidden py-16 sm:py-24"
        >
            {/* Background */}
            <div aria-hidden="true" className="absolute inset-0 -z-10">
                <motion.div
                    animate={
                        reduceMotion
                            ? undefined
                            : {
                                y: [0, -10, 0],
                                x: [0, 4, 0],
                            }
                    }
                    transition={
                        reduceMotion
                            ? undefined
                            : {
                                duration: 10,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }
                    }
                    className="absolute bottom-[-120px] right-[-120px] h-[320px] w-[320px] rounded-full bg-secondary/10 blur-3xl"
                />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="mx-auto max-w-3xl text-center"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary sm:px-4 sm:py-2 sm:text-sm">
                        <Sparkles aria-hidden="true" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        Promo & Events
                    </div>

                    <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:mt-5 sm:text-4xl md:text-5xl">
                        Event dan Promo
                        <span className="text-primary"> Terbaru</span>
                    </h2>

                    <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:mt-5 sm:text-base md:text-lg">
                        Ikuti berbagai promo spesial dan event menarik dari PlayPro
                        Academy untuk pengalaman olahraga terbaik anak Anda.
                    </p>
                </motion.div>

                <div
                    role="list"
                    aria-label="Daftar promo dan event"
                    className="mx-auto mt-12 max-w-4xl sm:mt-16"
                >
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <PromoCardSkeleton key={i} isLast={i === 2} />
                        ))
                    ) : error ? (
                        <p className="text-center text-red-500">{error}</p>
                    ) : promos.length === 0 ? (
                        <p className="text-center text-slate-500">Belum ada promo saat ini.</p>
                    ) : (
                        promos.map((promo, index) => (
                            <div key={promo.id} role="listitem">
                                <TimelineCard
                                    promo={promo}
                                    isLast={index === promos.length - 1}
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </motion.section>
    )
}
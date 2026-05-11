"use client"

import Image from "next/image"
import Link from "next/link"
import {
    ArrowRight,
    CalendarDays,
    Sparkles,
    TicketPercent,
    Trophy,
    type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"

// ─── Types ───────────────────────────────────────────────────────────────────

interface PromoItem {
    title: string
    description: string
    image: string
    type: string
    date: string
    icon: LucideIcon
    accent: string
    accentText: string
    isFeatured?: boolean
    ctaLabel?: string
    ctaHref?: string
}

// ─── Data ────────────────────────────────────────────────────────────────────

const promoList: PromoItem[] = [
    {
        title: "Free Trial Class",
        description:
            "Ajak anak mencoba pengalaman latihan seru bersama coach profesional PlayPro Academy secara GRATIS.",
        image: "https://images.unsplash.com/photo-1680024436315-fb06267264b2?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
        type: "Limited Promo",
        date: "Until 31 May 2026",
        icon: Sparkles,
        accent: "bg-blue-50 border-blue-200",
        accentText: "text-blue-600",
        isFeatured: true,
        ctaLabel: "Register Now",
        ctaHref: "/free-trial",
    },
    {
        title: "Holiday Sports Camp",
        description: "Aktivitas olahraga seru selama liburan sekolah.",
        image: "https://images.unsplash.com/photo-1717584146940-118a65525da8?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
        type: "Event",
        date: "15 June 2026",
        icon: Trophy,
        accent: "bg-amber-50 border-amber-200",
        accentText: "text-amber-600",
        ctaLabel: "Learn More",
        ctaHref: "/events",
    },
    {
        title: "Early Bird Membership",
        description: "Potongan harga spesial untuk member baru.",
        image: "https://images.unsplash.com/photo-1633715151359-6fe04c8a0af5?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=3000",
        type: "Promo",
        date: "Limited Time",
        icon: TicketPercent,
        accent: "bg-emerald-50 border-emerald-200",
        accentText: "text-emerald-600",
        ctaLabel: "Learn More",
        ctaHref: "/events",
    },
]

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
    return (
        <div className="relative flex flex-col items-center" aria-hidden="true">
            <div
                className={`
          z-10 flex h-10 w-10 shrink-0 items-center justify-center
          rounded-full border-4 border-white shadow-md
          sm:h-12 sm:w-12 ${accent}
        `}
            >
                <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${accentText}`} />
            </div>
            {!isLast && <div className="mt-1 w-0.5 flex-1 bg-slate-200" />}
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

    return (
        <div className="flex gap-4 sm:gap-6 lg:gap-8">
            {/* Timeline Dot */}
            <TimelineDot
                accent={promo.accent}
                accentText={promo.accentText}
                icon={Icon}
                isLast={isLast}
            />

            {/* Card */}
            <div
                className={`
          group mb-8 flex flex-1 overflow-hidden
          rounded-[1.5rem] border bg-white shadow-sm
          transition-all duration-300
          hover:-translate-y-1 hover:shadow-xl
          sm:rounded-[2rem] ${promo.accent}
        `}
            >
                {/* Image */}
                <div className="relative hidden w-36 shrink-0 overflow-hidden sm:block sm:w-44 md:w-56">
                    <Image
                        src={promo.image}
                        alt={promo.title}
                        fill
                        priority={promo.isFeatured}
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col justify-center p-4 sm:p-6">
                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <span
                            className={`
                inline-flex items-center gap-1.5 rounded-full
                border px-2.5 py-1 text-xs font-semibold
                ${promo.accent} ${promo.accentText}
              `}
                        >
                            <Icon aria-hidden="true" className="h-3 w-3" />
                            {promo.type}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                            <CalendarDays aria-hidden="true" className="h-3 w-3" />
                            {promo.date}
                        </span>
                    </div>

                    {/* Title */}
                    <h3 className="mt-2.5 text-base font-bold text-slate-900 sm:mt-3 sm:text-lg md:text-xl">
                        {promo.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:mt-1.5 sm:text-sm">
                        {promo.description}
                    </p>

                    {/* CTA */}
                    {promo.isFeatured ? (
                        <div className="mt-3 sm:mt-4">
                            <Button size="sm" asChild>
                                <Link href={promo.ctaHref ?? "/events"}>
                                    {promo.ctaLabel}
                                    <ArrowRight aria-hidden="true" className="ml-1.5 h-3.5 w-3.5" />
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <Link
                            href={promo.ctaHref ?? "/events"}
                            aria-label={`Pelajari lebih lanjut tentang ${promo.title}`}
                            className={`
                mt-3 inline-flex w-fit items-center gap-1.5
                text-xs font-semibold transition-all duration-300
                hover:gap-2.5 sm:mt-4 sm:text-sm
                ${promo.accentText}
              `}
                        >
                            {promo.ctaLabel}
                            <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PromoSection() {
    return (
        <section
            aria-label="Promo dan Event PlayPro Academy"
            className="relative overflow-hidden py-16 sm:py-24"
        >
            {/* Background */}
            <div aria-hidden="true" className="absolute inset-0 -z-10">
                <div className="absolute bottom-[-120px] right-[-120px] h-[320px] w-[320px] rounded-full bg-secondary/10 blur-3xl" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mx-auto max-w-3xl text-center">
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
                </div>

                {/* Timeline */}
                <div
                    role="list"
                    aria-label="Daftar promo dan event"
                    className="mx-auto mt-12 max-w-4xl sm:mt-16"
                >
                    {promoList.map((promo, index) => (
                        <div key={promo.title} role="listitem">
                            <TimelineCard
                                promo={promo}
                                isLast={index === promoList.length - 1}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
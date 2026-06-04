"use client"

import Image from "next/image"
import Link from "next/link"

import {
    CalendarDays,
    ArrowRight,
    Sparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"

// ─── Data ────────────────────────────────────────────────────────────────────

const articles = [
    {
        title: "PlayPro Academy Hadir di Bandung!",
        description:
            "Cabang ke-8 resmi hadir di Bandung dengan program multisport untuk toddler dan junior bersama coach profesional.",
        image:
            "/images/galleries/gallery-2.png",
        date: "26 April 2026",
        category: "New Branch",
        href: "/gallery-activities/playpro-bandung",
    },
    {
        title: "Special Class Kini Hadir Handball",
        description:
            "Eksplorasi olahraga baru seperti hockey, baseball, hingga handball dalam program Special Class PlayPro Academy.",
        image:
            "/images/galleries/gallery-1.png",
        date: "12 May 2026",
        category: "Special Class",
        href: "/gallery-activities/special-class",
    },
    {
        title: "Mengapa Multisport Penting untuk Toddler?",
        description:
            "Pendekatan multisport membantu perkembangan motorik, fokus, dan koordinasi anak sejak usia dini.",
        image:
            "/images/galleries/gallery-4.png",
        date: "08 May 2026",
        category: "Parent Insights",
        href: "/gallery-activities/multisport-toddler",
    },
    {
        title: "Holiday Sports Camp 2026",
        description:
            "Program liburan interaktif penuh aktivitas olahraga menyenangkan untuk meningkatkan teamwork dan confidence anak.",
        image:
            "/images/galleries/gallery-6.png",
        date: "01 June 2026",
        category: "Event",
        href: "/gallery-activities/holiday-camp",
    },
]

// ─── Card ────────────────────────────────────────────────────────────────────

function ArticleCard({
    article,
}: {
    article: (typeof articles)[0]
}) {
    return (
        <article
            className="
        group relative overflow-hidden rounded-[2.2rem]
        border border-white/40 bg-white
        shadow-[0_20px_70px_rgba(15,23,42,0.08)]
        transition-all duration-500
        hover:-translate-y-2 hover:shadow-[0_30px_90px_rgba(15,23,42,0.14)]
      "
        >
            {/* Image */}
            <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="
            object-cover transition-transform duration-700
            group-hover:scale-105
          "
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/5" />

                {/* Floating Category */}
                <div className="absolute left-5 top-5 z-10">
                    <div
                        className="
              inline-flex items-center gap-2 rounded-full
              border border-white/20 bg-white/15
              px-4 py-2 text-xs font-semibold text-white
              backdrop-blur-md
            "
                    >
                        <Sparkles className="h-3.5 w-3.5" />
                        {article.category}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="absolute inset-x-0 bottom-0 z-10 p-6 md:p-7">

                {/* Date */}
                <div className="flex items-center gap-2 text-sm text-white/70">
                    <CalendarDays className="h-4 w-4" />
                    {article.date}
                </div>

                {/* Title */}
                <h3
                    className="
            mt-3 text-2xl font-extrabold leading-tight
            tracking-tight text-white
          "
                >
                    {article.title}
                </h3>

                {/* Description */}
                <p
                    className="
            mt-3 line-clamp-3 text-sm leading-relaxed
            text-white/80
          "
                >
                    {article.description}
                </p>

                {/* Read More */}
                <div className="mt-5">
                    <Link
                        href={article.href}
                        className="
              inline-flex items-center gap-2 text-sm font-semibold
              text-white transition-all duration-300
              hover:gap-3
            "
                    >
                        Read Story
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </article>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ActivitiesSection() {
    return (
        <section className="relative overflow-hidden py-24">

            {/* Background */}
            <div className="absolute inset-0 -z-10">

                {/* Blur */}
                <div className="absolute left-[-140px] top-[-140px] h-[360px] w-[360px] rounded-full bg-primary/10 blur-3xl" />

                <div className="absolute bottom-[-160px] right-[-160px] h-[380px] w-[380px] rounded-full bg-secondary/10 blur-3xl" />

                {/* Grid */}
                <div
                    className="
            absolute inset-0 opacity-[0.03]
            [background-image:linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)]
            [background-size:48px_48px]
          "
                />
            </div>

            <div className="container mx-auto px-4">

                {/* Header */}
                <div className="mx-auto max-w-3xl text-center">

                    <div
                        className="
              inline-flex items-center gap-2 rounded-full
              border border-primary/10 bg-primary/5
              px-4 py-2 text-sm font-medium text-primary
            "
                    >
                        <Sparkles className="h-4 w-4" />
                        Gallery & Activities
                    </div>

                    <h2
                        className="
              mt-5 text-4xl font-extrabold tracking-tight
              text-slate-900 md:text-5xl
            "
                    >
                        Cerita &
                        <span className="text-primary">
                            {" "}Aktivitas Terbaru
                        </span>
                    </h2>

                    <p
                        className="
              mt-5 text-lg leading-relaxed text-slate-600
            "
                    >
                        Dokumentasi perjalanan, event, dan perkembangan anak-anak
                        bersama PlayPro Academy dalam suasana yang aktif,
                        positif, dan penuh semangat.
                    </p>
                </div>

                {/* Carousel */}
                <div className="mt-16">

                    <Carousel
                        opts={{
                            align: "start",
                            loop: true,
                        }}
                        className="w-full"
                    >

                        {/* Navigation Desktop */}
                        <div className="mb-8 hidden justify-end gap-3 md:flex">
                            <CarouselPrevious className="static translate-y-0 rounded-2xl border-slate-200 bg-white shadow-sm hover:bg-slate-50" />

                            <CarouselNext className="static translate-y-0 rounded-2xl border-slate-200 bg-white shadow-sm hover:bg-slate-50" />
                        </div>

                        {/* Content */}
                        <CarouselContent className="-ml-6">
                            {articles.map((article) => (
                                <CarouselItem
                                    key={article.title}
                                    className="
                    pl-6 sm:basis-1/2 xl:basis-1/3
                  "
                                >
                                    <ArticleCard article={article} />
                                </CarouselItem>
                            ))}
                        </CarouselContent>

                        {/* Navigation Mobile */}
                        <div className="mt-8 flex justify-center gap-3 md:hidden">
                            <CarouselPrevious className="static translate-y-0" />
                            <CarouselNext className="static translate-y-0" />
                        </div>
                    </Carousel>
                </div>

                {/* CTA */}
                <div className="mt-16 flex justify-center">
                    <Button
                        size="lg"
                        className="rounded-2xl px-7"
                        asChild
                    >
                        <Link href="/gallery-activities">
                            Explore All Activities
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}
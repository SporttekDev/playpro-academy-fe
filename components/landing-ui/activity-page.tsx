"use client"

import Image from "next/image"
import Link from "next/link"

import {
    ArrowRight,
    CalendarDays,
    Clock3,
    Sparkles,
    Trophy,
    Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────

const featuredArticle = {
    title: "PlayPro Academy Hadir di Bandung!",
    excerpt:
        "Cabang ke-8 resmi hadir di Kota Bandung dengan program multisport premium untuk anak usia 2–14 tahun.",
    image:
        "/images/galleries/gallery-3.png",
    category: "Expansion News",
    date: "26 April 2026",
    readTime: "5 min read",
}

const articles = [
    {
        title: "Special Class Kini Hadir dengan Handball",
        excerpt:
            "Program eksplorasi olahraga baru untuk anak-anak yang ingin mencoba tantangan berbeda.",
        image:
            "/images/galleries/gallery-1.png",
        category: "Special Class",
        date: "18 May 2026",
    },
    {
        title: "Mengapa Toddler Butuh Multisport?",
        excerpt:
            "Fondasi perkembangan motorik, fokus, dan kepercayaan diri anak dimulai dari multisport.",
        image:
            "/images/galleries/gallery-4.png",
        category: "Parent Education",
        date: "10 May 2026",
    },
    {
        title: "Holiday Sports Camp 2026",
        excerpt:
            "Program liburan interaktif dengan berbagai aktivitas olahraga seru bersama coach profesional.",
        image:
            "/images/galleries/gallery-6.png",
        category: "Events",
        date: "02 May 2026",
    },
]

const galleryImages = [
    // "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1200&auto=format&fit=crop",
    // "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop",
    // "https://images.unsplash.com/photo-1547347298-4074fc3086f0?q=80&w=1200&auto=format&fit=crop",
    "/images/galleries/gallery-7.png",
    "/images/galleries/gallery-2.png",
    "/images/galleries/gallery-3.png",
    "/images/galleries/gallery-4.png",
    "/images/galleries/gallery-5.png",
    "/images/galleries/gallery-1.png",
    "/images/galleries/gallery-6.png",
    // "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?q=80&w=1200&auto=format&fit=crop",
    // "https://images.unsplash.com/photo-1511886929837-354d827aae26?q=80&w=1200&auto=format&fit=crop",
]

const timeline = [
    {
        title: "Bandung Branch Opening",
        date: "April 2026",
        description:
            "PlayPro Academy resmi membuka cabang ke-8 di Bandung.",
    },
    {
        title: "Special Class Launch",
        date: "May 2026",
        description:
            "Program Hockey, Baseball, Athletics, dan Handball mulai dibuka.",
    },
    {
        title: "Holiday Sports Camp",
        date: "June 2026",
        description:
            "Camp olahraga interaktif untuk toddler dan junior.",
    },
]

const parentBenefits = [
    {
        title: "Motor Skill Development",
        description:
            "Melatih koordinasi tubuh, keseimbangan, dan kemampuan motorik anak.",
        icon: Trophy,
    },
    {
        title: "Confidence Building",
        description:
            "Membantu anak lebih percaya diri dan aktif bersosialisasi.",
        icon: Users,
    },
    {
        title: "Fun Learning Experience",
        description:
            "Program latihan dikemas fun dan suportif sesuai usia anak.",
        icon: Sparkles,
    },
]

// ─────────────────────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────────────────────

function SectionBadge({ children }: { children: React.ReactNode }) {
    return (
        <div
            className="
        inline-flex items-center gap-2 rounded-full
        border border-primary/10 bg-primary/5
        px-4 py-2 text-sm font-medium text-primary
      "
        >
            <Sparkles className="h-4 w-4" />
            {children}
        </div>
    )
}

function ArticleCard({
    article,
}: {
    article: {
        title: string
        excerpt: string
        image: string
        category: string
        date: string
    }
}) {
    return (
        <article
            className="
        group overflow-hidden rounded-[2rem]
        border border-slate-200/70 bg-white
        shadow-sm transition-all duration-300
        hover:-translate-y-1 hover:shadow-2xl
      "
        >
            <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                <div className="absolute left-5 top-5">
                    <span
                        className="
              rounded-full bg-white/90 px-3 py-1
              text-xs font-semibold text-slate-800
              backdrop-blur-md
            "
                    >
                        {article.category}
                    </span>
                </div>
            </div>

            <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <CalendarDays className="h-4 w-4" />
                    {article.date}
                </div>

                <h3 className="mt-4 text-xl font-bold leading-tight text-slate-900">
                    {article.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {article.excerpt}
                </p>

                <Link
                    href="/activities"
                    className="
            mt-5 inline-flex items-center gap-2
            text-sm font-semibold text-primary
            transition-all duration-300 hover:gap-3
          "
                >
                    Read Article
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        </article>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function GalleryActivitiesPage() {
    return (
        <main className="relative overflow-hidden bg-white">

            {/* Background Blur */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute left-[-120px] top-[-120px] h-[320px] w-[320px] rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute bottom-[-120px] right-[-120px] h-[320px] w-[320px] rounded-full bg-secondary/10 blur-3xl" />
            </div>

            {/* Hero */}
            <section className="relative overflow-hidden py-24 md:py-32">
                <div className="container mx-auto px-4">

                    <div className="mx-auto max-w-4xl text-center">
                        <SectionBadge>
                            Gallery & Activities
                        </SectionBadge>

                        <h1
                            className="
                mt-6 text-5xl font-extrabold tracking-tight
                text-slate-900 md:text-7xl
              "
                        >
                            Stories, Moments,
                            <span className="text-primary"> & Growth</span>
                        </h1>

                        <p
                            className="
                mx-auto mt-6 max-w-2xl text-lg
                leading-relaxed text-slate-600
              "
                        >
                            Dokumentasi perjalanan, aktivitas, dan perkembangan anak-anak
                            bersama PlayPro Academy.
                        </p>
                    </div>

                    {/* Hero Visual */}
                    <div
                        className="
              relative mx-auto mt-16 overflow-hidden
              rounded-[3rem] shadow-[0_30px_100px_rgba(15,23,42,0.15)]
            "
                    >
                        <div className="relative aspect-[16/7]">
                            <Image
                                src="/images/galleries/gallery-7.png"
                                alt="PlayPro Activities"
                                fill
                                priority
                                className="object-cover"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                            <div className="absolute bottom-0 left-0 p-8 md:p-12">
                                <p className="text-sm font-medium text-white/80">
                                    Building Active & Confident Kids
                                </p>

                                <h2 className="mt-3 max-w-2xl text-3xl font-extrabold text-white md:text-5xl">
                                    Every Training Session Becomes a Growth Journey
                                </h2>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Article */}
            <section className="py-10">
                <div className="container mx-auto px-4">

                    <div
                        className="
              grid overflow-hidden rounded-[3rem]
              border border-slate-200/70 bg-white
              shadow-[0_20px_80px_rgba(15,23,42,0.08)]
              lg:grid-cols-2
            "
                    >
                        {/* Image */}
                        <div className="relative min-h-[420px]">
                            <Image
                                src={featuredArticle.image}
                                alt={featuredArticle.title}
                                fill
                                className="object-cover"
                            />
                        </div>

                        {/* Content */}
                        <div className="flex flex-col justify-center p-8 md:p-12">

                            <SectionBadge>
                                Featured Article
                            </SectionBadge>

                            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                <div className="flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4" />
                                    {featuredArticle.date}
                                </div>

                                <div className="flex items-center gap-2">
                                    <Clock3 className="h-4 w-4" />
                                    {featuredArticle.readTime}
                                </div>
                            </div>

                            <h2 className="mt-6 text-4xl font-extrabold leading-tight text-slate-900">
                                {featuredArticle.title}
                            </h2>

                            <p className="mt-5 text-lg leading-relaxed text-slate-600">
                                {featuredArticle.excerpt}
                            </p>

                            <div className="mt-8">
                                <Button size="lg" asChild>
                                    <Link href="/activities">
                                        Read Full Article
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Articles */}
            <section className="py-24">
                <div className="container mx-auto px-4">

                    <div className="flex items-end justify-between">
                        <div>
                            <SectionBadge>
                                Latest Stories
                            </SectionBadge>

                            <h2 className="mt-5 text-4xl font-extrabold text-slate-900">
                                Insights & Activities
                            </h2>
                        </div>
                    </div>

                    <div className="mt-14 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                        {articles.map((article) => (
                            <ArticleCard
                                key={article.title}
                                article={article}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Gallery */}
            <section className="pb-24">
                <div className="container mx-auto px-4">

                    <div className="text-center">
                        <SectionBadge>
                            Activities Gallery
                        </SectionBadge>

                        <h2 className="mt-5 text-4xl font-extrabold text-slate-900">
                            Moments at PlayPro Academy
                        </h2>
                    </div>

                    <div className="mt-14 columns-1 gap-6 sm:columns-2 lg:columns-3">
                        {galleryImages.map((image, index) => (
                            <div
                                key={index}
                                className="
                  mb-6 overflow-hidden rounded-[2rem]
                  shadow-sm
                "
                            >
                                <div className="relative">
                                    <Image
                                        src={image}
                                        alt="Gallery"
                                        width={800}
                                        height={1000}
                                        className="
                      h-auto w-full object-cover
                      transition-transform duration-700
                      hover:scale-105
                    "
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="bg-slate-50 py-24">
                <div className="container mx-auto px-4">

                    <div className="mx-auto max-w-3xl text-center">
                        <SectionBadge>
                            Journey Timeline
                        </SectionBadge>

                        <h2 className="mt-5 text-4xl font-extrabold text-slate-900">
                            Growing Together Across Indonesia
                        </h2>
                    </div>

                    <div className="mx-auto mt-16 max-w-4xl">
                        {timeline.map((item, index) => (
                            <div
                                key={item.title}
                                className="relative flex gap-6 pb-12"
                            >
                                {/* Line */}
                                {index !== timeline.length - 1 && (
                                    <div className="absolute left-[19px] top-10 h-full w-[2px] bg-primary/20" />
                                )}

                                {/* Dot */}
                                <div
                                    className="
                    relative z-10 flex h-10 w-10 shrink-0
                    items-center justify-center rounded-full
                    bg-primary text-white
                  "
                                >
                                    <Sparkles className="h-4 w-4" />
                                </div>

                                {/* Content */}
                                <div>
                                    <p className="text-sm font-medium text-primary">
                                        {item.date}
                                    </p>

                                    <h3 className="mt-2 text-2xl font-bold text-slate-900">
                                        {item.title}
                                    </h3>

                                    <p className="mt-3 leading-relaxed text-slate-600">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Parent Education */}
            <section className="py-24">
                <div className="container mx-auto px-4">

                    <div className="mx-auto max-w-3xl text-center">
                        <SectionBadge>
                            Why Parents Choose PlayPro
                        </SectionBadge>

                        <h2 className="mt-5 text-4xl font-extrabold text-slate-900">
                            More Than Just Sports
                        </h2>

                        <p className="mt-5 text-lg leading-relaxed text-slate-600">
                            Kami membantu anak berkembang melalui aktivitas olahraga yang
                            fun, aman, dan terarah.
                        </p>
                    </div>

                    <div className="mt-16 grid gap-8 md:grid-cols-3">
                        {parentBenefits.map((benefit) => {
                            const Icon = benefit.icon

                            return (
                                <div
                                    key={benefit.title}
                                    className="
                    rounded-[2rem] border border-slate-200/70
                    bg-white p-8 shadow-sm
                  "
                                >
                                    <div
                                        className="
                      flex h-14 w-14 items-center justify-center
                      rounded-2xl bg-primary/10
                    "
                                    >
                                        <Icon className="h-6 w-6 text-primary" />
                                    </div>

                                    <h3 className="mt-6 text-2xl font-bold text-slate-900">
                                        {benefit.title}
                                    </h3>

                                    <p className="mt-4 leading-relaxed text-slate-600">
                                        {benefit.description}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="pb-24">
                <div className="container mx-auto px-4">

                    <div
                        className="
              relative overflow-hidden rounded-[3rem]
              bg-gradient-to-br from-primary to-secondary
              px-8 py-16 text-center text-white
            "
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_35%)]" />

                        <div className="relative z-10">
                            <h2 className="text-4xl font-extrabold md:text-5xl">
                                Ready to Start Your Child’s Journey?
                            </h2>

                            <p className="mx-auto mt-5 max-w-2xl text-lg text-white/80">
                                Bergabunglah bersama PlayPro Academy dan bantu anak tumbuh aktif,
                                percaya diri, dan bahagia melalui olahraga.
                            </p>

                            <div className="mt-8 flex flex-wrap justify-center gap-4">
                                <Button
                                    size="lg"
                                    variant="secondary"
                                    asChild
                                >
                                    <Link href="/free-trial">
                                        Book Free Trial
                                    </Link>
                                </Button>

                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="
                    border-white/20 bg-white/10
                    text-white hover:bg-white
                    hover:text-primary
                  "
                                    asChild
                                >
                                    <Link href="/programs">
                                        Explore Programs
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}
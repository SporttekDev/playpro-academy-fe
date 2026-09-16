"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, Transition, useReducedMotion } from "framer-motion"
import {
    ArrowRight,
    CalendarDays,
    Clock3,
    Sparkles,
    Trophy,
    Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { useArticles } from "@/lib/content/article/hooks"
import { Article } from "@/lib/content/article/types"

// ─────────────────────────────────────────────────────────────────────────────
// Static data (belum dari CMS)
// ─────────────────────────────────────────────────────────────────────────────

const galleryImages = [
    "/images/galleries/gallery-7.png",
    "/images/galleries/gallery-2.png",
    "/images/galleries/gallery-3.png",
    "/images/galleries/gallery-4.png",
    "/images/galleries/gallery-5.png",
    "/images/galleries/gallery-1.png",
    "/images/galleries/gallery-6.png",
]

const timeline = [
    {
        title: "Bandung Branch Opening",
        date: "April 2026",
        description: "PlayPro Academy resmi membuka cabang ke-8 di Bandung.",
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
        description: "Camp olahraga interaktif untuk toddler dan junior.",
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
        description: "Membantu anak lebih percaya diri dan aktif bersosialisasi.",
        icon: Users,
    },
    {
        title: "Fun Learning Experience",
        description: "Program latihan dikemas fun dan suportif sesuai usia anak.",
        icon: Sparkles,
    },
]

// ─────────────────────────────────────────────────────────────────────────────
// Motion helpers
// ─────────────────────────────────────────────────────────────────────────────

const smoothTransition: Transition = {
    duration: 0.45,
    ease: "easeOut",
}

const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    visible: {
        opacity: 1,
        y: 0,
        transition: smoothTransition
    },
}

const staggerContainer = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.08,
        },
    },
}

// ─────────────────────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────────────────────

function SectionBadge({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            variants={fadeUp}
            className="
                inline-flex items-center gap-2 rounded-full
                border border-primary/10 bg-primary/5
                px-4 py-2 text-sm font-medium text-primary
            "
        >
            <Sparkles className="h-4 w-4" />
            {children}
        </motion.div>
    )
}

function CategoryFilter({
    categories,
    activeCategory,
    onSelect,
}: {
    categories: string[]
    activeCategory: string | null
    onSelect: (category: string | null) => void
}) {
    return (
        <div className="mt-6 flex flex-wrap gap-2">
            <button
                onClick={() => onSelect(null)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${activeCategory === null
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
            >
                All
            </button>
            {categories.map((category) => (
                <button
                    key={category}
                    onClick={() => onSelect(category)}
                    className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors ${activeCategory === category
                            ? "bg-primary text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                >
                    {category.replace(/-/g, " ")}
                </button>
            ))}
        </div>
    )
}

function ArticleCardSkeleton() {
    return (
        <div className="animate-pulse overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white">
            <div className="aspect-[4/3] bg-slate-200" />
            <div className="space-y-3 p-6">
                <div className="h-3 w-1/3 rounded bg-slate-200" />
                <div className="h-5 w-full rounded bg-slate-200" />
                <div className="h-3 w-full rounded bg-slate-200" />
                <div className="h-3 w-2/3 rounded bg-slate-200" />
            </div>
        </div>
    )
}

function ArticleCard({
    article,
    index,
}: {
    article: Article
    index: number
}) {
    const reduceMotion = useReducedMotion()

    return (
        <motion.article
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={{
                duration: reduceMotion ? 0 : 0.4,
                delay: reduceMotion ? 0 : index * 0.05,
                ease: "easeOut",
            }}
            whileHover={
                reduceMotion
                    ? undefined
                    : {
                        y: -6,
                        transition: { duration: 0.15, ease: "easeOut" },
                    }
            }
            className="
                group overflow-hidden rounded-[2rem]
                border border-slate-200/70 bg-white
                shadow-sm transition-all duration-300
                hover:shadow-2xl
            "
        >
            <div className="relative aspect-[4/3] overflow-hidden">
                <motion.div
                    whileHover={
                        reduceMotion
                            ? undefined
                            : {
                                scale: 1.05,
                                transition: { duration: 0.55, ease: "easeOut" },
                            }
                    }
                    className="absolute inset-0"
                >
                    <Image
                        src={article.cover_image_url}
                        alt={article.title}
                        fill
                        className="object-cover"
                    />
                </motion.div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="absolute left-5 top-5"
                >
                    <span
                        className="
                            rounded-full bg-white/90 px-3 py-1
                            text-xs font-semibold text-slate-800
                            backdrop-blur-md
                        "
                    >
                        {article.categoryLabel}
                    </span>
                </motion.div>
            </div>

            <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <CalendarDays className="h-4 w-4" />
                    {article.publishedAtLabel}
                </div>

                <h3 className="mt-4 text-xl font-bold leading-tight text-slate-900">
                    {article.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {article.excerpt}
                </p>

                <motion.div
                    whileHover={reduceMotion ? undefined : { x: 4 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                >
                    <Link
                        href={`/activities/${article.slug}`}
                        className="
                            mt-5 inline-flex items-center gap-2
                            text-sm font-semibold text-primary
                            transition-all duration-300
                        "
                    >
                        Read Article
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </motion.div>
            </div>
        </motion.article>
    )
}

function TimelineItem({
    item,
    index,
    isLast,
}: {
    item: { title: string; date: string; description: string }
    index: number
    isLast: boolean
}) {
    const reduceMotion = useReducedMotion()

    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
                duration: reduceMotion ? 0 : 0.4,
                delay: reduceMotion ? 0 : index * 0.05,
                ease: "easeOut",
            }}
            className="relative flex gap-6 pb-12"
        >
            {!isLast && (
                <div className="absolute left-[19px] top-10 h-full w-[2px] bg-primary/20" />
            )}

            <motion.div
                whileHover={reduceMotion ? undefined : { scale: 1.05 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="
                    relative z-10 flex h-10 w-10 shrink-0
                    items-center justify-center rounded-full
                    bg-primary text-white
                "
            >
                <Sparkles className="h-4 w-4" />
            </motion.div>

            <div>
                <p className="text-sm font-medium text-primary">{item.date}</p>

                <h3 className="mt-2 text-2xl font-bold text-slate-900">
                    {item.title}
                </h3>

                <p className="mt-3 leading-relaxed text-slate-600">
                    {item.description}
                </p>
            </div>
        </motion.div>
    )
}

function BenefitCard({
    benefit,
    index,
}: {
    benefit: (typeof parentBenefits)[number]
    index: number
}) {
    const Icon = benefit.icon
    const reduceMotion = useReducedMotion()

    return (
        <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            transition={{
                duration: reduceMotion ? 0 : 0.4,
                delay: reduceMotion ? 0 : index * 0.05,
                ease: "easeOut",
            }}
            whileHover={
                reduceMotion
                    ? undefined
                    : {
                        y: -5,
                        transition: { duration: 0.15, ease: "easeOut" },
                    }
            }
            className="
                rounded-[2rem] border border-slate-200/70
                bg-white p-8 shadow-sm
            "
        >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
            </div>

            <h3 className="mt-6 text-2xl font-bold text-slate-900">
                {benefit.title}
            </h3>

            <p className="mt-4 leading-relaxed text-slate-600">
                {benefit.description}
            </p>
        </motion.div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function GalleryActivitiesPage() {
    const reduceMotion = useReducedMotion()
    const {
        featured,
        articles: restArticles,
        categories,
        activeCategory,
        setCategory,
        isLoading,
        error,
        hasMore,
        loadMore,
    } = useArticles()

    return (
        <main className="relative overflow-hidden bg-white">
            {/* Background Blur */}
            <div className="absolute inset-0 -z-10">
                <motion.div
                    animate={
                        reduceMotion
                            ? undefined
                            : { x: [0, 18, 0], y: [0, -12, 0] }
                    }
                    transition={
                        reduceMotion
                            ? undefined
                            : {
                                duration: 12,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }
                    }
                    className="absolute left-[-120px] top-[-120px] h-[320px] w-[320px] rounded-full bg-primary/10 blur-3xl"
                />
                <motion.div
                    animate={
                        reduceMotion
                            ? undefined
                            : { x: [0, -18, 0], y: [0, 12, 0] }
                    }
                    transition={
                        reduceMotion
                            ? undefined
                            : {
                                duration: 14,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }
                    }
                    className="absolute bottom-[-120px] right-[-120px] h-[320px] w-[320px] rounded-full bg-secondary/10 blur-3xl"
                />
            </div>

            {/* Hero */}
            <section className="relative overflow-hidden py-24 md:py-32">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={staggerContainer}
                        className="mx-auto max-w-4xl text-center"
                    >
                        <SectionBadge>Gallery & Activities</SectionBadge>

                        <motion.h1
                            variants={fadeUp}
                            className="
                                mt-6 text-5xl font-extrabold tracking-tight
                                text-slate-900 md:text-7xl
                            "
                        >
                            Stories, Moments,
                            <span className="text-primary"> & Growth</span>
                        </motion.h1>

                        <motion.p
                            variants={fadeUp}
                            className="
                                mx-auto mt-6 max-w-2xl text-lg
                                leading-relaxed text-slate-600
                            "
                        >
                            Dokumentasi perjalanan, aktivitas, dan perkembangan anak-anak
                            bersama PlayPro Academy.
                        </motion.p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 24, scale: 0.98 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, amount: 0.15 }}
                        transition={{ duration: 0.55, ease: "easeOut" }}
                        className="
                            relative mx-auto mt-16 overflow-hidden
                            rounded-[3rem] shadow-[0_30px_100px_rgba(15,23,42,0.15)]
                        "
                    >
                        <motion.div
                            whileHover={reduceMotion ? undefined : { scale: 1.01 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="relative aspect-[16/7]"
                        >
                            <Image
                                src="/images/galleries/gallery-7.png"
                                alt="PlayPro Activities"
                                fill
                                priority
                                className="object-cover"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                            <div className="absolute bottom-0 left-0 p-8 md:p-12">
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.2 }}
                                    transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
                                    className="text-sm font-medium text-white/80"
                                >
                                    Building Active & Confident Kids
                                </motion.p>

                                <motion.h2
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.2 }}
                                    transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
                                    className="mt-3 max-w-2xl text-3xl font-extrabold text-white md:text-5xl"
                                >
                                    Every Training Session Becomes a Growth Journey
                                </motion.h2>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Featured Article */}
            {featured && (
                <section className="py-10">
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.18 }}
                            transition={{ duration: 0.45, ease: "easeOut" }}
                            className="
                                grid overflow-hidden rounded-[3rem]
                                border border-slate-200/70 bg-white
                                shadow-[0_20px_80px_rgba(15,23,42,0.08)]
                                lg:grid-cols-2
                            "
                        >
                            <motion.div
                                whileHover={reduceMotion ? undefined : { scale: 1.01 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="relative min-h-[420px]"
                            >
                                <Image
                                    src={featured.cover_image_url}
                                    alt={featured.title}
                                    fill
                                    className="object-cover"
                                />
                            </motion.div>

                            <div className="flex flex-col justify-center p-8 md:p-12">
                                <SectionBadge>Featured Article</SectionBadge>

                                <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                    <div className="flex items-center gap-2">
                                        <CalendarDays className="h-4 w-4" />
                                        {featured.publishedAtLabel}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Clock3 className="h-4 w-4" />
                                        {featured.readTimeMinutes} min read
                                    </div>
                                </div>

                                <h2 className="mt-6 text-4xl font-extrabold leading-tight text-slate-900">
                                    {featured.title}
                                </h2>

                                <p className="mt-5 text-lg leading-relaxed text-slate-600">
                                    {featured.excerpt}
                                </p>

                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.2 }}
                                    transition={{ duration: 0.35, ease: "easeOut", delay: 0.08 }}
                                    className="mt-8"
                                >
                                    <Button size="lg" asChild>
                                        <Link href={`/activities/${featured.slug}`}>
                                            Read Full Article
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </section>
            )}

            {/* Articles */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={staggerContainer}
                        className="flex items-end justify-between"
                    >
                        <div>
                            <SectionBadge>Latest Stories</SectionBadge>

                            <motion.h2
                                variants={fadeUp}
                                className="mt-5 text-4xl font-extrabold text-slate-900"
                            >
                                Insights & Activities
                            </motion.h2>

                            <CategoryFilter
                                categories={categories}
                                activeCategory={activeCategory}
                                onSelect={setCategory}
                            />
                        </div>
                    </motion.div>

                    {isLoading ? (
                        <div className="mt-14 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <ArticleCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : (
                        <>
                            {error && (
                                <p className="mt-14 text-center text-red-500">{error}</p>
                            )}

                            {!error && restArticles.length === 0 && (
                                <p className="mt-14 text-center text-slate-500">
                                    Belum ada artikel untuk kategori ini.
                                </p>
                            )}

                            <div className="mt-14 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                                {restArticles.map((article, index) => (
                                    <ArticleCard
                                        key={article.id}
                                        article={article}
                                        index={index}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {hasMore && (
                        <div className="mt-12 flex justify-center">
                            <Button variant="outline" size="lg" onClick={loadMore}>
                                Load More
                            </Button>
                        </div>
                    )}
                </div>
            </section>

            {/* Gallery */}
            <section className="pb-24">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={staggerContainer}
                        className="text-center"
                    >
                        <SectionBadge>Activities Gallery</SectionBadge>

                        <motion.h2
                            variants={fadeUp}
                            className="mt-5 text-4xl font-extrabold text-slate-900"
                        >
                            Moments at PlayPro Academy
                        </motion.h2>
                    </motion.div>

                    <div className="mt-14 columns-1 gap-6 sm:columns-2 lg:columns-3">
                        {galleryImages.map((image, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 18 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{
                                    duration: 0.35,
                                    delay: index * 0.03,
                                    ease: "easeOut",
                                }}
                                whileHover={reduceMotion ? undefined : { y: -4 }}
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
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="bg-slate-50 py-24">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={staggerContainer}
                        className="mx-auto max-w-3xl text-center"
                    >
                        <SectionBadge>Journey Timeline</SectionBadge>

                        <motion.h2
                            variants={fadeUp}
                            className="mt-5 text-4xl font-extrabold text-slate-900"
                        >
                            Growing Together Across Indonesia
                        </motion.h2>
                    </motion.div>

                    <div className="mx-auto mt-16 max-w-4xl">
                        {timeline.map((item, index) => (
                            <TimelineItem
                                key={item.title}
                                item={item}
                                index={index}
                                isLast={index === timeline.length - 1}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Parent Education */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={staggerContainer}
                        className="mx-auto max-w-3xl text-center"
                    >
                        <SectionBadge>Why Parents Choose PlayPro</SectionBadge>

                        <motion.h2
                            variants={fadeUp}
                            className="mt-5 text-4xl font-extrabold text-slate-900"
                        >
                            More Than Just Sports
                        </motion.h2>

                        <motion.p
                            variants={fadeUp}
                            className="mt-5 text-lg leading-relaxed text-slate-600"
                        >
                            Kami membantu anak berkembang melalui aktivitas olahraga yang
                            fun, aman, dan terarah.
                        </motion.p>
                    </motion.div>

                    <div className="mt-16 grid gap-8 md:grid-cols-3">
                        {parentBenefits.map((benefit, index) => (
                            <BenefitCard
                                key={benefit.title}
                                benefit={benefit}
                                index={index}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </main>
    )
}
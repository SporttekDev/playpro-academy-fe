// components/landing-ui/article-detail-page.tsx
"use client"

import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { motion, useReducedMotion, Variants } from "framer-motion"
import {
    ArrowLeft,
    CalendarDays,
    Clock3,
    Share2,
    Facebook,
    Twitter,
} from "lucide-react"
import { useArticle, useArticles } from "@/lib/content/article/hooks"
import { Article } from "@/lib/content/article/types"

const fadeUp: Variants = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
}

function ArticleDetailSkeleton() {
    return (
        <main className="animate-pulse bg-white">
            {/* Hero skeleton */}
            <div className="h-[40vh] w-full bg-slate-200 md:h-[55vh]" />

            <div className="container mx-auto px-4 py-14">
                <div className="grid gap-10 lg:grid-cols-[220px_1fr] xl:grid-cols-[220px_1fr_340px]">
                    {/* Sidebar kiri skeleton */}
                    <div className="space-y-4">
                        <div className="h-4 w-24 rounded bg-slate-200" />
                        <div className="h-40 rounded-[1.5rem] bg-slate-100" />
                    </div>

                    {/* Body skeleton */}
                    <div className="max-w-3xl space-y-4">
                        <div className="h-4 w-full rounded bg-slate-200" />
                        <div className="h-4 w-full rounded bg-slate-200" />
                        <div className="h-4 w-3/4 rounded bg-slate-200" />
                        <div className="h-4 w-full rounded bg-slate-200" />
                        <div className="h-4 w-5/6 rounded bg-slate-200" />
                        <div className="mt-8 h-4 w-full rounded bg-slate-200" />
                        <div className="h-4 w-full rounded bg-slate-200" />
                        <div className="h-4 w-2/3 rounded bg-slate-200" />
                    </div>

                    {/* Sidebar kanan skeleton, cuma tampil di xl */}
                    <div className="hidden space-y-6 xl:block">
                        <div className="h-4 w-24 rounded bg-slate-200" />
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="overflow-hidden rounded-[1.5rem] border border-slate-100">
                                <div className="aspect-video bg-slate-200" />
                                <div className="space-y-2 p-4">
                                    <div className="h-3 w-1/3 rounded bg-slate-200" />
                                    <div className="h-4 w-full rounded bg-slate-200" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    )
}

function ArticleHero({ article }: { article: Article }) {
    return (
        <div className="relative h-[40vh] w-full overflow-hidden md:h-[55vh]">
            <Image
                src={article.cover_image_url}
                alt={article.title}
                fill
                priority
                sizes="100vw"
                className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute inset-0 flex flex-col justify-end">
                <div className="container mx-auto px-4 pb-10 md:pb-14">
                    <span className="inline-block rounded-full bg-white/90 px-4 py-1.5 text-xs font-semibold text-slate-800 backdrop-blur-md">
                        {article.categoryLabel}
                    </span>
                    <h1 className="mt-4 max-w-2xl text-3xl font-extrabold leading-tight text-white md:text-5xl">
                        {article.title}
                    </h1>
                </div>
            </div>
        </div>
    )
}

function ArticleSidebar({ article }: { article: Article }) {
    return (
        <aside className="lg:sticky lg:top-28 lg:h-fit">
            <Link
                href="/gallery-activities"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-primary"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Articles
            </Link>

            <div className="mt-6 space-y-4 rounded-[1.5rem] border border-slate-200/70 bg-white p-5">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <CalendarDays className="h-4 w-4" />
                    {article.publishedAtLabel}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock3 className="h-4 w-4" />
                    {article.readTimeMinutes} min read
                </div>

                <div className="border-t border-slate-100 pt-4">
                    <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        <Share2 className="h-3.5 w-3.5" />
                        Share
                    </p>
                    <div className="flex gap-2">
                        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-primary hover:text-white">
                            <Facebook className="h-4 w-4" />
                        </button>
                        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-primary hover:text-white">
                            <Twitter className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    )
}

function RelatedArticlesSidebar({ currentSlug }: { currentSlug: string }) {
    const { articles } = useArticles()
    const related = articles.filter((a) => a.slug !== currentSlug).slice(0, 3)

    if (related.length === 0) return null

    return (
        <aside className="hidden xl:sticky xl:top-28 xl:block xl:h-fit">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                More Stories
            </p>

            <div className="mt-4 space-y-6">
                {related.map((article) => (
                    <Link
                        key={article.id}
                        href={`/activities/${article.slug}`}
                        className="group block overflow-hidden rounded-[1.5rem] border border-slate-200/70 bg-white transition-shadow hover:shadow-lg"
                    >
                        <div className="relative aspect-video overflow-hidden">
                            <Image
                                src={article.cover_image_url}
                                alt={article.title}
                                fill
                                sizes="320px"
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        </div>
                        <div className="p-4">
                            <p className="text-xs font-semibold text-primary">
                                {article.categoryLabel}
                            </p>
                            <h3 className="mt-1.5 text-base font-bold leading-snug text-slate-900">
                                {article.title}
                            </h3>
                            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
                                {article.excerpt}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </aside>
    )
}

// Fallback untuk layar di bawah xl, supaya related articles tetap muncul
function RelatedArticlesMobile({ currentSlug }: { currentSlug: string }) {
    const { articles } = useArticles()
    const related = articles.filter((a) => a.slug !== currentSlug).slice(0, 3)

    if (related.length === 0) return null

    return (
        <div className="mt-14 border-t border-slate-100 pt-10 xl:hidden">
            <h2 className="text-lg font-bold text-slate-900">More Stories</h2>
            <div className="mt-6 flex flex-wrap gap-6">
                {related.map((article) => (
                    <Link
                        key={article.id}
                        href={`/activities/${article.slug}`}
                        className="group w-full overflow-hidden rounded-[1.5rem] border border-slate-200/70 bg-white transition-shadow hover:shadow-lg sm:w-[calc(50%-0.75rem)]"
                    >
                        <div className="relative aspect-[4/3] overflow-hidden">
                            <Image
                                src={article.cover_image_url}
                                alt={article.title}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        </div>
                        <div className="p-5">
                            <p className="text-xs font-semibold text-primary">
                                {article.categoryLabel}
                            </p>
                            <h3 className="mt-2 text-lg font-bold leading-snug text-slate-900">
                                {article.title}
                            </h3>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default function ArticleDetailPage() {
    const params = useParams<{ slug: string }>()
    const { article, isLoading, error } = useArticle(params.slug)
    const reduceMotion = useReducedMotion()

    if (isLoading) {
        return <ArticleDetailSkeleton />
    }

    if (error || !article) {
        return <p className="py-24 text-center text-red-500">{error ?? "Artikel tidak ditemukan"}</p>
    }

    return (
        <main className="bg-white">
            <ArticleHero article={article} />

            <div className="container mx-auto px-4 py-14">
                <div className="grid gap-10 lg:grid-cols-[220px_1fr] xl:grid-cols-[220px_1fr_340px]">
                    <ArticleSidebar article={article} />

                    <motion.div
                        initial={reduceMotion ? undefined : "hidden"}
                        whileInView={reduceMotion ? undefined : "visible"}
                        viewport={{ once: true, amount: 0.1 }}
                        variants={fadeUp}
                        className="max-w-3xl"
                    >
                        <div
                            className="
                                prose prose-slate prose-lg max-w-none
                                prose-headings:font-extrabold prose-headings:text-slate-900
                                prose-p:leading-relaxed prose-p:text-slate-700 prose-p:mb-6
                                prose-a:text-primary prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
                                prose-strong:text-slate-900
                                prose-blockquote:border-l-primary prose-blockquote:text-slate-600 prose-blockquote:not-italic
                                prose-img:rounded-[1.5rem]
                            "
                            dangerouslySetInnerHTML={{ __html: article.body }}
                        />

                        <RelatedArticlesMobile currentSlug={article.slug} />
                    </motion.div>

                    <RelatedArticlesSidebar currentSlug={article.slug} />
                </div>
            </div>
        </main>
    )
}
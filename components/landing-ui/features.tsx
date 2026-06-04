"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import {
    Dumbbell,
    Goal,
    Volleyball,
    Sparkles,
    Circle,
    Trophy,
    type LucideIcon,
} from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

// ─── Types ───────────────────────────────────────────────────────────────────

interface Program {
    name: string
    icon: LucideIcon
}

interface TabContent {
    value: string
    label: string
    badge: string
    heading: string
    description: string
    programs: Program[]
    ctaLabel: string
    image: string
    imageAlt: string
}

// ─── Data ────────────────────────────────────────────────────────────────────

const tabs: TabContent[] = [
    {
        value: "toddler",
        label: "Toddler",
        badge: "Toddler Program",
        heading: "Untuk anak usia dini yang sedang aktif-aktifnya",
        description:
            "Program toddler dirancang untuk memperkenalkan olahraga dengan cara yang fun, aman, dan penuh stimulasi motorik. Fokus utama ada pada koordinasi tubuh, keberanian, dan kebiasaan bergerak sejak dini.",
        programs: [
            { name: "Basketball", icon: Volleyball },
            { name: "Soccer", icon: Goal },
            { name: "Tennis", icon: Trophy },
            { name: "Baseball", icon: Circle },
        ],
        ctaLabel: "Book Toddler Trial",
        image: "/images/toddler.png",
        imageAlt:
            "Ilustrasi anak toddler sedang berlatih olahraga di PlayPro Academy",
    },
    {
        value: "junior",
        label: "Junior",
        badge: "Junior Program",
        heading: "Untuk anak yang siap latihan lebih terarah",
        description:
            "Program junior ditujukan untuk anak yang sudah siap mengikuti latihan yang lebih terstruktur. Materi lebih berkembang, teknik lebih mendalam, dan tetap dikemas menyenangkan agar anak tetap semangat berlatih.",
        programs: [
            { name: "Basketball", icon: Volleyball },
            { name: "Soccer", icon: Goal },
            { name: "Padel", icon: Dumbbell },
            { name: "Tennis", icon: Trophy },
        ],
        ctaLabel: "Book Junior Trial",
        image: "/images/junior.png",
        imageAlt:
            "Ilustrasi anak junior sedang berlatih olahraga di PlayPro Academy",
    },
]

// ─── Sub-components ──────────────────────────────────────────────────────────

function ProgramBadge({
    name,
    icon: Icon,
    index,
}: Program & { index: number }) {
    const reduceMotion = useReducedMotion()

    return (
        <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
                duration: 0.28,
                delay: reduceMotion ? 0 : index * 0.04,
                ease: "easeOut",
            }}
            whileHover={
                reduceMotion
                    ? undefined
                    : {
                        y: -2,
                        transition: { duration: 0.15, ease: "easeOut" },
                    }
            }
            className="
                inline-flex items-center gap-2 rounded-full
                border border-primary/10 bg-primary/5
                px-3 py-1.5 text-xs font-medium text-slate-700
                transition-colors duration-200
                hover:bg-primary hover:text-white hover:shadow-md
                sm:px-4 sm:py-2 sm:text-sm
            "
        >
            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
            {name}
        </motion.span>
    )
}

function ProgramBadges({ items }: { items: Program[] }) {
    return (
        <div
            className="flex flex-wrap gap-2 sm:gap-3"
            role="list"
            aria-label="Daftar olahraga tersedia"
        >
            {items.map((item, index) => (
                <div key={item.name} role="listitem">
                    <ProgramBadge {...item} index={index} />
                </div>
            ))}
        </div>
    )
}

function CategoryIllustration({
    image,
    imageAlt,
}: {
    image: string
    imageAlt: string
}) {
    const reduceMotion = useReducedMotion()

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative flex justify-center lg:justify-end"
        >
            <motion.div
                animate={
                    reduceMotion
                        ? undefined
                        : {
                            y: [0, -6, 0],
                        }
                }
                transition={
                    reduceMotion
                        ? undefined
                        : {
                            duration: 5.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }
                }
                className="absolute h-[180px] w-[180px] rounded-full bg-primary/10 blur-3xl sm:h-[240px] sm:w-[240px]"
            />
            <div className="relative h-[280px] w-[280px] sm:h-[400px] sm:w-[400px] lg:h-[600px] lg:w-[600px]">
                <Image
                    src={image}
                    alt={imageAlt}
                    fill
                    priority
                    className="object-contain"
                />
            </div>
        </motion.div>
    )
}

function ProgramTab({ tab }: { tab: TabContent }) {
    return (
        <motion.div
            key={tab.value}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="grid items-center gap-8 sm:gap-10 lg:grid-cols-4"
        >
            {/* Top/Right — Illustration */}
            <div className="lg:col-span-2 lg:order-2">
                <CategoryIllustration image={tab.image} imageAlt={tab.imageAlt} />
            </div>

            {/* Bottom/Left — Content */}
            <div className="lg:col-span-2 lg:order-1">
                <div className="max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.25 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="inline-flex items-center rounded-full bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary sm:px-4 sm:py-2 sm:text-sm"
                    >
                        {tab.badge}
                    </motion.div>

                    <motion.h3
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.25 }}
                        transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
                        className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl"
                    >
                        {tab.heading}
                    </motion.h3>

                    <motion.p
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.25 }}
                        transition={{ duration: 0.35, ease: "easeOut", delay: 0.1 }}
                        className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base"
                    >
                        {tab.description}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.25 }}
                        transition={{ duration: 0.35, ease: "easeOut", delay: 0.15 }}
                        className="mt-6 sm:mt-7"
                    >
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 sm:text-sm">
                            Available Sports
                        </p>
                        <ProgramBadges items={tab.programs} />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.25 }}
                        transition={{ duration: 0.35, ease: "easeOut", delay: 0.2 }}
                        className="mt-6 flex flex-wrap gap-3 sm:mt-8 sm:gap-4"
                    >
                        <Button asChild size="lg">
                            <Link href="/free-trial">{tab.ctaLabel}</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg">
                            <Link href="/class-programs">See Program&apos;s Detail</Link>
                        </Button>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProgramsSection() {
    const reduceMotion = useReducedMotion()

    return (
        <motion.section
            aria-label="Program PlayPro Academy"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="relative overflow-hidden bg-white py-16 sm:py-20"
        >
            {/* Background Decoration */}
            <div aria-hidden="true" className="absolute inset-0 -z-10">
                <motion.div
                    animate={
                        reduceMotion
                            ? undefined
                            : { y: [0, -10, 0], x: [0, 6, 0] }
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
                    className="absolute left-[-120px] top-[-120px] h-[320px] w-[320px] rounded-full bg-primary/10 blur-3xl"
                />
                <motion.div
                    animate={
                        reduceMotion
                            ? undefined
                            : { y: [0, 12, 0], x: [0, -8, 0] }
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
                    className="absolute bottom-[-120px] right-[-120px] h-[320px] w-[320px] rounded-full bg-secondary/10 blur-3xl"
                />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className="mx-auto max-w-4xl text-center"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary sm:px-4 sm:py-2 sm:text-sm">
                        <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                        Our Programs
                    </div>

                    <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
                        Program yang Sesuai{" "}
                        <span className="text-primary">Usia Anak</span>
                    </h2>

                    <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:mt-5 sm:text-base md:text-lg">
                        PlayPro Academy membagi program menjadi dua kategori agar anak
                        mendapat pengalaman latihan yang tepat, aman, dan menyenangkan.
                    </p>
                </motion.div>

                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
                >
                    <Tabs defaultValue="toddler" className="mt-10 sm:mt-14">
                        <div className="flex justify-center">
                            <TabsList className="h-auto rounded-2xl bg-slate-100 p-1.5">
                                {tabs.map((tab) => (
                                    <TabsTrigger
                                        key={tab.value}
                                        value={tab.value}
                                        className={`
                                            rounded-xl px-5 py-2.5 text-sm font-semibold
                                            transition-all duration-300
                                            sm:px-6 sm:py-3

                                            ${tab.value === "toddler"
                                                ? `
                                                        data-[state=active]:bg-secondary
                                                        data-[state=active]:text-secondary-foreground
                                                        data-[state=active]:shadow-sm
                                                    `
                                                : `
                                                        data-[state=active]:bg-primary
                                                        data-[state=active]:text-primary-foreground
                                                        data-[state=active]:shadow-sm
                                                    `
                                            }
                                        `}
                                    >
                                        {tab.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        {tabs.map((tab) => (
                            <TabsContent
                                key={tab.value}
                                value={tab.value}
                                className="mt-8 sm:mt-10"
                            >
                                <ProgramTab tab={tab} />
                            </TabsContent>
                        ))}
                    </Tabs>
                </motion.div>
            </div>
        </motion.section>
    )
}
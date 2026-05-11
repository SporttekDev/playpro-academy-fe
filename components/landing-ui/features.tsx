"use client"

import Image from "next/image"
import Link from "next/link"
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

function ProgramBadge({ name, icon: Icon }: Program) {
    return (
        <span
            className="
        inline-flex items-center gap-2 rounded-full
        border border-primary/10 bg-primary/5
        px-3 py-1.5 text-xs font-medium text-slate-700
        transition-all duration-200
        hover:-translate-y-0.5 hover:bg-primary hover:text-white hover:shadow-md
        sm:px-4 sm:py-2 sm:text-sm
      "
        >
            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
            {name}
        </span>
    )
}

function ProgramBadges({ items }: { items: Program[] }) {
    return (
        <div className="flex flex-wrap gap-2 sm:gap-3" role="list" aria-label="Daftar olahraga tersedia">
            {items.map((item) => (
                <div key={item.name} role="listitem">
                    <ProgramBadge {...item} />
                </div>
            ))}
        </div>
    )
}

function CategoryIllustration({ image, imageAlt }: { image: string; imageAlt: string }) {
    return (
        <div className="relative flex justify-center lg:justify-end">
            <div className="relative h-[280px] w-[280px] sm:h-[400px] sm:w-[400px] lg:h-[600px] lg:w-[600px]">
                <Image
                    src={image}
                    alt={imageAlt}
                    fill
                    priority
                    className="object-contain"
                />
            </div>
        </div>
    )
}

function ProgramTab({ tab }: { tab: TabContent }) {
    return (
        <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-4">
            {/* Top/Right — Illustration (tampil duluan di mobile) */}
            <div className="lg:col-span-2 lg:order-2">
                <CategoryIllustration image={tab.image} imageAlt={tab.imageAlt} />
            </div>

            {/* Bottom/Left — Content */}
            <div className="lg:col-span-2 lg:order-1">
                <div className="max-w-3xl">
                    {/* Badge */}
                    <div className="inline-flex items-center rounded-full bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary sm:px-4 sm:py-2 sm:text-sm">
                        {tab.badge}
                    </div>

                    {/* Heading */}
                    <h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
                        {tab.heading}
                    </h3>

                    {/* Description */}
                    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                        {tab.description}
                    </p>

                    {/* Programs */}
                    <div className="mt-6 sm:mt-7">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 sm:text-sm">
                            Available Sports
                        </p>
                        <ProgramBadges items={tab.programs} />
                    </div>

                    {/* CTA */}
                    <div className="mt-6 flex flex-wrap gap-3 sm:mt-8 sm:gap-4">
                        <Button asChild size="lg">
                            <Link href="/free-trial">{tab.ctaLabel}</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg">
                            <Link href="/class-programs">See Program&apos;s Detail</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProgramsSection() {
    return (
        <section
            aria-label="Program PlayPro Academy"
            className="relative overflow-hidden bg-white py-16 sm:py-20"
        >
            {/* Background Decoration */}
            <div aria-hidden="true" className="absolute inset-0 -z-10">
                <div className="absolute left-[-120px] top-[-120px] h-[320px] w-[320px] rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute bottom-[-120px] right-[-120px] h-[320px] w-[320px] rounded-full bg-secondary/10 blur-3xl" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mx-auto max-w-4xl text-center">
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
                </div>

                {/* Tabs */}
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
                        <TabsContent key={tab.value} value={tab.value} className="mt-8 sm:mt-10">
                            <ProgramTab tab={tab} />
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </section>
    )
}
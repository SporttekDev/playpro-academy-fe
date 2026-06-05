"use client"

import * as React from "react"
import Link from "next/link"
import { AnimatePresence, motion, Transition, useReducedMotion } from "framer-motion"
import {
    ArrowRight,
    Award,
    CheckCircle2,
    Receipt,
    Sparkles,
    Star,
    Ticket,
    Trophy,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type ProgramKey = "toddler" | "junior"
type SportKey = "multisport" | "tennis" | "padel"

type MembershipOption = {
    id: string
    title: string
    desc: string
    price: number
    badge?: string
}

type SessionPackage = {
    id: string
    title: string
    sub: string
    price: number
    badge?: string
}

type SportData = {
    label: string
    packages: SessionPackage[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Knowledge base aligned data
// ─────────────────────────────────────────────────────────────────────────────

const TODDLER_MEMBERSHIPS: MembershipOption[] = [
    {
        id: "ta",
        title: "1 Year Membership + T-Shirt",
        desc: "Berlaku 1 tahun dan perlu diperpanjang setiap tahun",
        price: 200_000,
    },
    {
        id: "tb",
        title: "1 Year Membership + Jersey + T-Shirt",
        desc: "Berlaku 1 tahun, termasuk jersey + t-shirt training",
        price: 350_000,
        badge: "Best Value",
    },
]

const TODDLER_SESSIONS: SessionPackage[] = [
    { id: "t1", title: "1 Month", sub: "4x Session", price: 500_000, badge: "+ Free 1 Month" },
    { id: "t3", title: "3 Months", sub: "12x Session", price: 1_400_000, badge: "+ Free 2 Month" },
    {
        id: "t6",
        title: "6 Months",
        sub: "24x Session",
        price: 2_800_000,
        badge: "+ Free 2 Month",
    },
    {
        id: "t12",
        title: "12 Months",
        sub: "48x Session",
        price: 5_800_000,
        badge: "+ Free 3 Months",
    },
]

const JUNIOR_MEMBERSHIPS: MembershipOption[] = [
    {
        id: "jm",
        title: "Lifetime Membership",
        desc: "Berlaku selamanya dan mencakup seluruh cabor Junior",
        price: 350_000,
        badge: "Lifetime",
    },
]

const SPORTS: Record<SportKey, SportData> = {
    multisport: {
        label: "Soccer & Basketball",
        packages: [
            {
                id: "ms1",
                title: "1 Month",
                sub: "4x Session",
                price: 500000,
            },
            {
                id: "ms3",
                title: "3 Months",
                sub: "12x Session",
                price: 1400000,
            },
            {
                id: "ms6",
                title: "6 Months",
                sub: "24x Session",
                price: 2800000,
            },
            {
                id: "ms12",
                title: "12 Months",
                sub: "48x Session",
                price: 5600000,
                badge: "10% Arena Voucher",
            },
        ],
    },
    tennis: {
        label: "Tennis",
        packages: [
            { id: "tn0", title: "Single Session", sub: "1x Session", price: 200_000 },
            { id: "tnr1", title: "Regular — 1 Month", sub: "4x Session", price: 600_000 },
            { id: "tnr3", title: "Regular — 3 Months", sub: "12x Session", price: 1_800_000 },
            { id: "tnr6", title: "Regular — 6 Months", sub: "24x Session", price: 3_600_000 },
            { id: "tni1", title: "Intensif — 1 Month", sub: "8x Session", price: 1_150_000 },
            { id: "tni3", title: "Intensif — 3 Months", sub: "24x Session", price: 3_500_000 },
            { id: "tni6", title: "Intensif — 6 Months", sub: "48x Session", price: 6_700_000 },
        ],
    },
    padel: {
        label: "Padel",
        packages: [
            { id: "pd0", title: "Single Session", sub: "1x Session", price: 200_000 },
            { id: "pdr1", title: "Regular — 1 Month", sub: "4x Session", price: 600_000 },
            { id: "pdr3", title: "Regular — 3 Months", sub: "12x Session", price: 1_800_000 },
            { id: "pdr6", title: "Regular — 6 Months", sub: "24x Session", price: 3_600_000 },
            { id: "pdi1", title: "Intensif — 1 Month", sub: "8x Session", price: 1_200_000 },
            { id: "pdi3", title: "Intensif — 3 Months", sub: "24x Session", price: 3_600_000 },
            { id: "pdi6", title: "Intensif — 6 Months", sub: "48x Session", price: 7_200_000 },
        ],
    },
}

const COMPARISON_ROWS = [
    {
        feature: "Masa membership",
        toddler: "1 Year Membership, diperpanjang tiap tahun",
        junior: "Lifetime Membership, sekali beli selamanya",
    },
    {
        feature: "Sistem session",
        toddler: "Multisport: Basketball, Soccer, Tennis, Baseball",
        junior: "Spesifik per cabang olahraga",
    },
    {
        feature: "Scope penggunaan",
        toddler: "1 paket session untuk 4 cabor sekaligus",
        junior: "1 paket session hanya untuk cabor yang dipilih",
    },
]

const HIGHLIGHTS = [
    {
        title: "Toddler",
        value: "Multisport annual",
        caption: "Berlaku 1 tahun dan diperpanjang tahunan",
    },
    {
        title: "Junior",
        value: "Lifetime access",
        caption: "Membership sekali beli untuk selamanya",
    },
    {
        title: "Support",
        value: "Admin aktif",
        caption: "Bantu pilih program dan paket terbaik",
    },
]

const TODDLER_PERKS = [
    "Akses multisport untuk 4 cabang olahraga sekaligus",
    "Cocok untuk fase eksplorasi dan motorik anak usia dini",
    "Program fun learning dengan pendekatan aman dan terarah",
    "Monitoring perkembangan dilakukan secara berkala",
]

const JUNIOR_PERKS = [
    "Lifetime membership untuk seluruh cabor Junior",
    "Session dibeli spesifik per cabang olahraga",
    "Pilihan program regular atau intensif tersedia sesuai cabor",
    "Ada bonus voucher arena untuk paket tertentu",
]

const SPORT_BENEFIT_MAP: Record<
    SportKey,
    { title: string; items: string[]; accent: string }
> = {
    multisport: {
        title: "Soccer & Basketball benefits",
        items: [
            "Latihan teknik dasar dan koordinasi",
            "Cocok untuk program regular jangka panjang",
            "Bonus voucher 10% berlaku untuk Playpro Sports Arena pada paket 12 bulan",
        ],
        accent: "bg-primary/5 text-primary ring-primary/10",
    },
    tennis: {
        title: "Tennis benefits",
        items: [
            "Bisa pilih regular atau intensif sesuai kebutuhan",
            "Dilatih Coach Arum — eks atlet nasional dari Yayuk Basuki Tennis School",
            "Cocok untuk progres teknikal yang lebih cepat",
        ],
        accent: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    },
    padel: {
        title: "Padel benefits",
        items: [
            "Bisa pilih regular atau intensif sesuai kebutuhan",
            "Latihan respons cepat, footwork, dan dinamika permainan",
            "Cocok untuk anak yang ingin latihan yang lebih aktif dan kompetitif",
        ],
        accent: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    },
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function fmt(n: number) {
    return `Rp ${n.toLocaleString("id-ID")}`
}

const smoothTransition: Transition = {
    duration: 0.45,
    ease: "easeOut",
}

const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: smoothTransition },
}

const staggerContainer = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.08,
        },
    },
}

function SectionBadge({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-2 text-sm font-medium text-primary"
        >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {children}
        </motion.div>
    )
}

function SectionHeading({
    badge,
    title,
    description,
    center = true,
}: {
    badge?: string
    title: React.ReactNode
    description?: React.ReactNode
    center?: boolean
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className={cn("max-w-3xl", center && "mx-auto text-center")}
        >
            {badge ? <SectionBadge>{badge}</SectionBadge> : null}
            <h2 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
                {title}
            </h2>
            {description ? (
                <p className="mt-5 text-lg leading-relaxed text-slate-600">
                    {description}
                </p>
            ) : null}
        </motion.div>
    )
}


function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-3">
            <span className="shrink-0 text-xs text-slate-500">{label}</span>
            <span className="text-right text-xs font-medium text-slate-900">
                {value}
            </span>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Small reusable atoms
// ─────────────────────────────────────────────────────────────────────────────

function StepLabel({
    num,
    label,
    active,
}: {
    num: string | number
    label: string
    active?: boolean
}) {
    return (
        <div className="mb-3 flex items-center gap-2">
            <div
                className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-semibold",
                    active
                        ? "border-transparent bg-primary text-white"
                        : "border-slate-200 bg-slate-100 text-slate-500"
                )}
            >
                {num}
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                {label}
            </span>
        </div>
    )
}

function SegButton({
    label,
    selected,
    onClick,
}: {
    label: string
    selected: boolean
    onClick: () => void
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200",
                selected &&
                (label === "Junior"
                    ? "bg-primary text-white shadow-md"
                    : label === "Toddler"
                        ? "bg-secondary text-white shadow-md"
                        : "bg-primary text-white shadow-md"),
                !selected && "text-slate-500 hover:bg-slate-200"
            )}
        >
            {label}
        </button>
    )
}

function RadioItem({
    selected,
    onClick,
    title,
    sub,
    desc,
    price,
    badge,
}: {
    selected: boolean
    onClick: () => void
    title: string
    sub?: string
    desc?: string
    price: number
    badge?: string
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-200",
                selected
                    ? "border-primary/60 bg-primary/5 ring-1 ring-primary/30"
                    : "border-slate-200 bg-white hover:border-slate-300"
            )}
        >
            <div
                className={cn(
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all",
                    selected ? "border-primary bg-primary" : "border-slate-300"
                )}
            >
                {selected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">{title}</p>
                {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
                {desc && <p className="mt-0.5 text-xs text-slate-500">{desc}</p>}
                {badge && (
                    <span className="mt-1.5 inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                        {badge}
                    </span>
                )}
            </div>

            <p className="shrink-0 text-sm font-bold text-slate-900">
                {fmt(price)}
            </p>
        </button>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Bonus badge blocks
// ─────────────────────────────────────────────────────────────────────────────

function ToddlerBonusBadge() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
        >
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Star className="h-3.5 w-3.5" aria-hidden="true" />
                4 Sports Included
            </p>
            <div className="flex flex-wrap gap-2">
                {["Basketball", "Soccer", "Tennis", "Baseball"].map((s) => (
                    <span
                        key={s}
                        className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                    >
                        {s}
                    </span>
                ))}
            </div>
        </motion.div>
    )
}

function ArenaBonusBadge() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border border-amber-100 bg-amber-50 p-4"
        >
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                <Ticket className="h-3.5 w-3.5" aria-hidden="true" />
                Bonus Paket 12 Bulan
            </p>
            <div className="flex flex-wrap gap-2">
                {[
                    "10% Diskon Lapangan",
                    "Playpro Sports Arena",
                ].map((s) => (
                    <span
                        key={s}
                        className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800"
                    >
                        {s}
                    </span>
                ))}
            </div>
        </motion.div>
    )
}

function CoachBonusBadge() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4"
        >
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <Award className="h-3.5 w-3.5" aria-hidden="true" />
                Pelatih Tennis
            </p>
            <div className="flex flex-wrap gap-2">
                {[
                    "Coach Arum",
                    "Eks Atlet Nasional",
                    "Yayuk Basuki Tennis School",
                ].map((s) => (
                    <span
                        key={s}
                        className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800"
                    >
                        {s}
                    </span>
                ))}
            </div>
        </motion.div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Live Pricing Summary
// ─────────────────────────────────────────────────────────────────────────────

type SummaryState = {
    program: ProgramKey
    membershipOption: MembershipOption | null
    sessionPackage: SessionPackage | null
    sport: SportKey | null
}

function PricingSummary({ s }: { s: SummaryState }) {
    const reduceMotion = useReducedMotion()
    const hasM = !!s.membershipOption
    const hasS = !!s.sessionPackage
    const total = (s.membershipOption?.price ?? 0) + (s.sessionPackage?.price ?? 0)

    const selectedSportData =
        s.program === "junior" && s.sport ? SPORT_BENEFIT_MAP[s.sport] : null

    const sportTags =
        s.program === "toddler"
            ? ["Basketball", "Soccer", "Tennis", "Baseball"]
            : s.sport
                ? [SPORTS[s.sport].label]
                : null

    const summaryPerks = s.program === "toddler" ? TODDLER_PERKS : JUNIOR_PERKS

    const baseMeta =
        s.program === "toddler"
            ? [
                { label: "Type", value: "Annual multisport" },
                { label: "Target", value: "Usia dini" },
                { label: "Support", value: "Progress report" },
            ]
            : [
                { label: "Type", value: "Lifetime membership" },
                { label: "Target", value: "Per cabor" },
                { label: "Support", value: "Coach spesialis" },
            ]

    return (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm lg:sticky lg:top-24 lg:w-[430px] xl:w-[470px] lg:p-8">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                        <Receipt className="h-4 w-4 text-slate-400" aria-hidden="true" />
                        Paket kamu
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                        Ringkasan ini menampilkan pilihan aktif, benefit utama,
                        dan estimasi total biaya.
                    </p>
                </div>

                <div className="rounded-full bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Live
                </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {baseMeta.map((item) => (
                    <div
                        key={item.label}
                        className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3"
                    >
                        <p className="text-[11px] uppercase tracking-widest text-slate-400">
                            {item.label}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                            {item.value}
                        </p>
                    </div>
                ))}
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200/70 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    What you get
                </p>
                <div className="mt-4 space-y-2.5">
                    {summaryPerks.map((item) => (
                        <div
                            key={item}
                            className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-600"
                        >
                            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                            </div>
                            <span>{item}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-6">
                {!hasM && !hasS ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                        Pilih membership dan paket session untuk melihat detail
                        lengkap, benefit, dan total biaya.
                    </div>
                ) : (
                    <>
                        <div className="space-y-3 rounded-2xl border border-slate-200/70 bg-white p-5">
                            <SummaryRow
                                label="Program"
                                value={s.program === "toddler" ? "Toddler" : "Junior"}
                            />
                            <SummaryRow
                                label="Membership"
                                value={s.membershipOption?.title ?? "—"}
                            />
                            <SummaryRow
                                label="Paket training"
                                value={s.sessionPackage?.title ?? "—"}
                            />
                            {sportTags && (
                                <div className="flex items-start justify-between gap-3">
                                    <span className="shrink-0 text-xs text-slate-500">
                                        Cabang olahraga
                                    </span>
                                    <div className="flex flex-wrap justify-end gap-1">
                                        {sportTags.map((t) => (
                                            <span
                                                key={t}
                                                className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                                            >
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {selectedSportData && (
                            <div
                                className={cn(
                                    "mt-4 rounded-2xl border p-5",
                                    selectedSportData.accent
                                )}
                            >
                                <p className="text-xs font-semibold uppercase tracking-[0.22em]">
                                    {selectedSportData.title}
                                </p>
                                <div className="mt-3 space-y-2.5">
                                    {selectedSportData.items.map((item) => (
                                        <div
                                            key={item}
                                            className="flex items-start gap-2 text-sm leading-relaxed"
                                        >
                                            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/70">
                                                <Sparkles
                                                    className="h-3.5 w-3.5"
                                                    aria-hidden="true"
                                                />
                                            </div>
                                            <span>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-4 rounded-2xl border border-slate-200/70 bg-slate-50 p-5">
                            <div className="space-y-2">
                                <SummaryRow
                                    label="Membership"
                                    value={hasM ? fmt(s.membershipOption!.price) : "—"}
                                />
                                <SummaryRow
                                    label="Session"
                                    value={hasS ? fmt(s.sessionPackage!.price) : "—"}
                                />
                            </div>

                            <div className="my-4 h-px bg-slate-200" />

                            <div className="flex items-baseline justify-between">
                                <span className="text-sm font-semibold text-slate-900">
                                    Total
                                </span>
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={total}
                                        initial={{ opacity: 0, y: -6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 6 }}
                                        transition={{
                                            duration: reduceMotion ? 0 : 0.2,
                                        }}
                                        className="text-3xl font-extrabold tracking-tight text-slate-900"
                                    >
                                        {total > 0 ? fmt(total) : "—"}
                                    </motion.span>
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                            <Button className="w-full" size="lg" asChild>
                                <Link href="/contact">
                                    Daftar sekarang
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>

                            <Button size="lg" variant="outline" asChild>
                                <Link href="/free-trial">Book Free Trial</Link>
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Comparison Table
// ─────────────────────────────────────────────────────────────────────────────

function ComparisonTable() {
    const [focus, setFocus] = React.useState<"both" | "toddler" | "junior">(
        "both"
    )
    const reduceMotion = useReducedMotion()

    const focusButtonClass = (active: boolean) => {
        if (!active) {
            return cn(
                "rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200",
                "text-slate-500 hover:bg-slate-200"
            )
        }

        return cn(
            "rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200",
            focus === "toddler"
                ? "bg-secondary text-white shadow-md"
                : "bg-primary text-white shadow-md"
        )
    }

    const cellClass = (target: "toddler" | "junior") =>
        cn(
            "rounded-2xl border p-4 transition-all duration-300",
            focus === "both"
                ? "border-slate-200 bg-white"
                : focus === target
                    ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                    : "border-slate-200/70 bg-slate-50/60 opacity-75"
        )

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: reduceMotion ? 0 : 0.45, ease: "easeOut" }}
            className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-sm"
        >
            <div className="border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white p-6 md:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                            Program comparison
                        </p>
                        <h3 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                            <span className="text-secondary">Toddler</span>{" "}
                            dan{" "}
                            <span className="text-primary">Junior</span>
                            , dibandingkan dengan lebih jelas
                        </h3>
                        <p className="mt-4 text-base leading-relaxed text-slate-600">
                            Lihat perbedaan utama, scope membership, dan paket
                            session yang paling sesuai.
                        </p>
                    </div>

                    <div className="inline-flex self-start rounded-2xl bg-slate-100 p-1.5 lg:self-auto">
                        <button
                            type="button"
                            onClick={() => setFocus("both")}
                            className={focusButtonClass(focus === "both")}
                        >
                            All
                        </button>
                        <button
                            type="button"
                            onClick={() => setFocus("toddler")}
                            className={focusButtonClass(focus === "toddler")}
                        >
                            Toddler
                        </button>
                        <button
                            type="button"
                            onClick={() => setFocus("junior")}
                            className={focusButtonClass(focus === "junior")}
                        >
                            Junior
                        </button>
                    </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="rounded-[1.75rem] border border-primary/10 bg-primary/5 p-5">
                        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                            <Sparkles className="h-4 w-4" aria-hidden="true" />
                            Toddler
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                            Annual membership dengan sistem multisport untuk
                            Basketball, Soccer, Tennis, dan Baseball.
                        </p>
                    </div>

                    <div className="rounded-[1.75rem] border border-emerald-100 bg-emerald-50 p-5">
                        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                            <Trophy className="h-4 w-4" aria-hidden="true" />
                            Junior
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                            Lifetime membership dengan session spesifik per cabor,
                            termasuk Soccer, Basketball, Tennis, dan Padel.
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-6 md:p-8">
                <div className="space-y-4">
                    {COMPARISON_ROWS.map((row, index) => {
                        const toddlerActive =
                            focus === "both" || focus === "toddler"
                        const juniorActive = focus === "both" || focus === "junior"

                        return (
                            <motion.div
                                key={row.feature}
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.15 }}
                                transition={{
                                    duration: reduceMotion ? 0 : 0.32,
                                    delay: reduceMotion ? 0 : index * 0.04,
                                    ease: "easeOut",
                                }}
                                className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_minmax(0,1fr)]"
                            >
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:p-5">
                                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                                        Feature
                                    </p>
                                    <p className="mt-2 text-sm font-bold leading-relaxed text-slate-900 md:text-base">
                                        {row.feature}
                                    </p>
                                </div>

                                <div className={cellClass("toddler")}>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                                            <Sparkles
                                                className="h-4 w-4"
                                                aria-hidden="true"
                                            />
                                            Toddler
                                        </span>
                                        <span
                                            className={cn(
                                                "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest",
                                                toddlerActive
                                                    ? "bg-primary/10 text-primary"
                                                    : "bg-slate-200 text-slate-500"
                                            )}
                                        >
                                            {focus === "toddler"
                                                ? "Focused"
                                                : "View"}
                                        </span>
                                    </div>
                                    <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-[15px]">
                                        {row.toddler ?? (
                                            <span className="text-slate-300">
                                                —
                                            </span>
                                        )}
                                    </p>
                                </div>

                                <div className={cellClass("junior")}>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
                                            <Trophy
                                                className="h-4 w-4"
                                                aria-hidden="true"
                                            />
                                            Junior
                                        </span>
                                        <span
                                            className={cn(
                                                "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest",
                                                juniorActive
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-slate-200 text-slate-500"
                                            )}
                                        >
                                            {focus === "junior"
                                                ? "Focused"
                                                : "View"}
                                        </span>
                                    </div>
                                    <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-[15px]">
                                        {row.junior ?? (
                                            <span className="text-slate-300">
                                                —
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>

                <div className="mt-8 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 md:p-6">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                        <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                        Quick takeaway
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                                Toddler is best for
                            </p>
                            <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                Anak usia dini yang butuh eksplorasi olahraga,
                                gerak aktif, dan fondasi motorik yang menyenangkan.
                            </p>
                        </div>
                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                                Junior is best for
                            </p>
                            <p className="mt-2 text-sm leading-relaxed text-slate-600">
                                Anak yang siap latihan lebih terarah, memilih
                                cabang olahraga tertentu, dan mengikuti program
                                yang lebih spesifik.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Interactive Package Builder
// ─────────────────────────────────────────────────────────────────────────────

function PackageBuilder() {
    const reduceMotion = useReducedMotion()

    const [program, setProgram] = React.useState<ProgramKey>("toddler")
    const [selectedMembership, setSelectedMembership] =
        React.useState<MembershipOption | null>(null)
    const [selectedSession, setSelectedSession] =
        React.useState<SessionPackage | null>(null)
    const [selectedSport, setSelectedSport] = React.useState<SportKey | null>(null)

    function handleProgramChange(p: ProgramKey) {
        setProgram(p)
        setSelectedMembership(null)
        setSelectedSession(null)
        setSelectedSport(null)
    }

    function handleSportChange(sp: SportKey) {
        setSelectedSport(sp)
        setSelectedSession(null)
    }

    const memberships = program === "toddler" ? TODDLER_MEMBERSHIPS : JUNIOR_MEMBERSHIPS
    const sportPackages = program === "junior" && selectedSport ? SPORTS[selectedSport].packages : null

    const showToddlerBonus = program === "toddler"
    const showArenaBonus = program === "junior" && (selectedSport === "multisport")
    const showCoachBonus = program === "junior" && selectedSport === "tennis"

    const summaryState: SummaryState = {
        program,
        membershipOption: selectedMembership,
        sessionPackage: selectedSession,
        sport: selectedSport,
    }

    return (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_430px] xl:grid-cols-[minmax(0,1fr)_470px] lg:items-start">
            <div className="min-w-0 space-y-8">
                <div>
                    <StepLabel num={1} label="Program" active />
                    <div className="inline-flex gap-1 rounded-2xl bg-slate-100 p-1.5">
                        <SegButton
                            label="Toddler"
                            selected={program === "toddler"}
                            onClick={() => handleProgramChange("toddler")}
                        />
                        <SegButton
                            label="Junior"
                            selected={program === "junior"}
                            onClick={() => handleProgramChange("junior")}
                        />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${program}-membership`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{
                            duration: reduceMotion ? 0 : 0.28,
                            ease: "easeOut",
                        }}
                    >
                        <StepLabel
                            num={2}
                            label="Membership"
                            active={!!selectedMembership}
                        />
                        <div className="space-y-3">
                            {memberships.map((m) => (
                                <RadioItem
                                    key={m.id}
                                    selected={selectedMembership?.id === m.id}
                                    onClick={() => setSelectedMembership(m)}
                                    title={m.title}
                                    desc={m.desc}
                                    price={m.price}
                                    badge={m.badge}
                                />
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {program === "toddler" && (
                    <AnimatePresence>
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: reduceMotion ? 0 : 0.28 }}
                        >
                            <StepLabel
                                num={3}
                                label="Session package"
                                active={!!selectedSession}
                            />
                            <div className="space-y-3">
                                {TODDLER_SESSIONS.map((s) => (
                                    <RadioItem
                                        key={s.id}
                                        selected={selectedSession?.id === s.id}
                                        onClick={() => setSelectedSession(s)}
                                        title={s.title}
                                        sub={s.sub}
                                        price={s.price}
                                        badge={s.badge}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                )}

                {program === "junior" && (
                    <AnimatePresence>
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: reduceMotion ? 0 : 0.28 }}
                            className="space-y-5"
                        >
                            <div>
                                <StepLabel
                                    num={3}
                                    label="Pilih cabang olahraga"
                                    active={!!selectedSport}
                                />
                                <div className="flex flex-wrap gap-2">
                                    {(Object.keys(SPORTS) as SportKey[]).map((sp) => (
                                        <SegButton
                                            key={sp}
                                            label={SPORTS[sp].label}
                                            selected={selectedSport === sp}
                                            onClick={() => handleSportChange(sp)}
                                        />
                                    ))}
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {sportPackages && (
                                    <motion.div
                                        key={selectedSport}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: reduceMotion ? 0 : 0.22 }}
                                    >
                                        <StepLabel
                                            num={4}
                                            label="Pilih paket session"
                                            active={!!selectedSession}
                                        />
                                        <div className="space-y-3">
                                            {sportPackages.map((p) => (
                                                <RadioItem
                                                    key={p.id}
                                                    selected={selectedSession?.id === p.id}
                                                    onClick={() => setSelectedSession(p)}
                                                    title={p.title}
                                                    sub={p.sub}
                                                    price={p.price}
                                                    badge={p.badge}
                                                />
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </AnimatePresence>
                )}

                <AnimatePresence mode="wait">
                    {showToddlerBonus && (
                        <motion.div key="toddler-bonus">
                            <ToddlerBonusBadge />
                        </motion.div>
                    )}
                    {showArenaBonus && (
                        <motion.div key="arena-bonus">
                            <ArenaBonusBadge />
                        </motion.div>
                    )}
                    {showCoachBonus && (
                        <motion.div key="coach-bonus">
                            <CoachBonusBadge />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="w-full lg:shrink-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${program}-${selectedMembership?.id}-${selectedSession?.id}-${selectedSport}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: reduceMotion ? 0 : 0.2 }}
                    >
                        <PricingSummary s={summaryState} />
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function MembershipPage() {
    return (
        <main className="overflow-hidden bg-background">
            <section className="relative py-24 lg:py-32">
                <div className="container mx-auto px-6 sm:px-6 lg:px-8">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                        className="mx-auto max-w-4xl text-center"
                    >
                        <motion.div variants={fadeUp}>
                            <SectionBadge>Membership Packages</SectionBadge>
                        </motion.div>

                        <motion.h1
                            variants={fadeUp}
                            className="mt-6 text-4xl font-bold tracking-tight text-slate-900 md:text-6xl"
                        >
                            Membership yang Tepat untuk
                            <span className="text-primary">
                                {" "}Perjalanan Olahraga Anak
                            </span>
                        </motion.h1>

                        <motion.p
                            variants={fadeUp}
                            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600"
                        >
                            Pilih paket membership yang sesuai dengan usia,
                            kebutuhan, dan target perkembangan anak bersama
                            PlayPro Academy.
                        </motion.p>

                        <motion.div
                            variants={fadeUp}
                            className="mt-10 flex flex-wrap justify-center gap-4"
                        >
                            <Button size="lg" asChild>
                                <Link href="/free-trial">
                                    Book Free Trial
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>

                            <Button size="lg" variant="outline" asChild>
                                <Link href="/contact">Contact Admin</Link>
                            </Button>
                        </motion.div>

                        <div className="mt-10 grid gap-4 sm:grid-cols-3">
                            {HIGHLIGHTS.map((item, index) => (
                                <motion.div
                                    key={item.title}
                                    initial={{ opacity: 0, y: 12 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.2 }}
                                    transition={{
                                        duration: 0.35,
                                        ease: "easeOut",
                                        delay: index * 0.05,
                                    }}
                                    className="rounded-[1.5rem] border border-slate-200/70 bg-white p-4 shadow-sm"
                                >
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                                        {item.title}
                                    </p>
                                    <p className="mt-2 text-lg font-bold text-slate-900">
                                        {item.value}
                                    </p>
                                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                                        {item.caption}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ================= PACKAGE BUILDER ================= */}
            <section className="relative overflow-hidden py-24">
                {/* Background Decoration */}
                <div
                    className="
            absolute inset-0 opacity-[0.03]
            [background-image:linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)]
            [background-size:48px_48px]
        "
                />

                <div className="absolute left-0 top-20 h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />
                <div className="absolute right-0 bottom-10 h-72 w-72 rounded-full bg-secondary/10 blur-[120px]" />

                <div className="container relative z-10 mx-auto px-6">
                    {/* Header */}
                    <div className="mx-auto max-w-3xl text-center">
                        <SectionBadge>
                            Interactive Builder
                        </SectionBadge>

                        <h2 className="mt-5 text-3xl font-bold md:text-5xl">
                            Build Your
                            <span className="text-primary"> Membership Package</span>
                        </h2>

                        <p className="mt-5 text-lg text-muted-foreground">
                            Pilih program, membership, dan paket training sesuai
                            kebutuhan anak. Total biaya akan dihitung otomatis.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="mt-12 grid gap-4 md:grid-cols-3">
                        <div
                            className="
                    rounded-3xl
                    border
                    bg-white/80
                    p-5
                    backdrop-blur-sm
                    shadow-sm
                "
                        >
                            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                                Program
                            </p>

                            <p className="mt-3 text-3xl font-bold text-slate-900">
                                2
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                Toddler & Junior
                            </p>
                        </div>

                        <div
                            className="
                    rounded-3xl
                    border
                    bg-white/80
                    p-5
                    backdrop-blur-sm
                    shadow-sm
                "
                        >
                            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                                Sports
                            </p>

                            <p className="mt-3 text-3xl font-bold text-slate-900">
                                5+
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                Soccer, Basketball, Tennis, Padel & Baseball
                            </p>
                        </div>

                        <div
                            className="
                    rounded-3xl
                    border
                    bg-white/80
                    p-5
                    backdrop-blur-sm
                    shadow-sm
                "
                        >
                            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                                Trial Class
                            </p>

                            <p className="mt-3 text-3xl font-bold text-slate-900">
                                Free
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                                Konsultasi paket dengan admin academy
                            </p>
                        </div>
                    </div>

                    {/* Builder */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4 }}
                        className="
                relative
                mt-10
                overflow-hidden
                rounded-[2rem]
                border
                border-slate-200
                bg-white/90
                p-6
                shadow-xl
                backdrop-blur-sm
                lg:p-10
            "
                    >
                        {/* Internal Card Pattern */}
                        <div
                            className="
                    absolute inset-0 opacity-[0.02]
                    [background-image:linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)]
                    [background-size:32px_32px]
                "
                        />

                        <div className="relative z-10">
                            <PackageBuilder />
                        </div>
                    </motion.div>
                </div>
            </section>


            <section className="relative overflow-hidden bg-slate-50 py-24">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-24 left-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
                    <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
                </div>
                <div className="container relative mx-auto px-6">
                    <SectionHeading
                        badge="Program Comparison"
                        title={
                            <>
                                Toddler vs{" "}
                                <span className="text-primary">
                                    Junior
                                </span>
                            </>
                        }
                        description="Pahami perbedaan sistem membership dan session sebelum memilih program yang paling sesuai untuk anak."
                    />

                    <div className="mt-12">
                        <ComparisonTable />
                    </div>
                </div>
            </section>
        </main>
    )
}

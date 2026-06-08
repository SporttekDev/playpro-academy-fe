"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import {
    ArrowLeft,
    ArrowRight,
    BadgeCheck,
    ChevronDown,
    ChevronUp,
    Circle,
    Dumbbell,
    Goal,
    Check,
    Sparkles,
    Trophy,
    Volleyball,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { WhatsAppButton } from './whatsapp-button';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type ProgramKey = "toddler" | "junior"

interface AgeGroup {
    label: string
    range: string
    tagline: string
    sports: SportDetail[]
}

interface SportDetail {
    name: string
    icon: React.ElementType
    tagline: string
    benefits: string[]
}

interface Program {
    key: ProgramKey
    label: string
    subtitle: string
    title: string
    description: string
    image: string
    heroClass: string
    ageGroups: AgeGroup[]
    ctaLabel: string
}

// ─────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────

const programs: Program[] = [
    {
        key: "toddler",
        label: "Toddler Program",
        subtitle: "Age 2 – 5 Years",
        title: "Fun & Active Learning",
        description:
            "Memperkenalkan olahraga dengan cara yang fun, aman, dan penuh stimulasi — cocok untuk anak yang baru aktif bergerak.",
        image: "/images/toddler.png",
        heroClass: "bg-secondary",
        ctaLabel: "Book Toddler Trial",
        ageGroups: [
            {
                label: "2 – 3 tahun",
                range: "2-3",
                tagline: "Active Star",
                sports: [
                    {
                        name: "Soccer",
                        icon: Goal,
                        tagline: "Bermain & Eksplorasi",
                        benefits: [
                            "Mengenal bola sebagai alat bermain yang menyenangkan",
                            "Melatih motorik kasar, koordinasi, dan keseimbangan tubuh",
                            "Menumbuhkan rasa senang bergerak aktif sejak dini",
                        ],
                    },
                    {
                        name: "Basketball",
                        icon: Volleyball,
                        tagline: "Bermain & Eksplorasi",
                        benefits: [
                            "Mengenal dan senang bermain dengan bola",
                            "Melatih lari, lompat, menangkap, dan koordinasi dasar",
                            "Membiasakan interaksi sosial sederhana bersama teman",
                        ],
                    },
                    {
                        name: "Tennis",
                        icon: Trophy,
                        tagline: "Bermain & Eksplorasi",
                        benefits: [
                            "Koordinasi mata & tangan lewat aktivitas raket dan bola",
                            "Melatih keseimbangan, kelincahan, dan fokus anak",
                            "Menumbuhkan kepercayaan diri dan kebiasaan aktif bergerak",
                        ],
                    },
                    {
                        name: "Baseball",
                        icon: Circle,
                        tagline: "Bermain & Eksplorasi",
                        benefits: [
                            "Koordinasi mata & tangan lewat aktivitas raket dan bola",
                            "Melatih keseimbangan, kelincahan, dan fokus anak",
                            "Menumbuhkan kepercayaan diri dan kebiasaan aktif bergerak",
                        ],
                    },
                ],
            },
            {
                label: "4 – 5 tahun",
                range: "4-5",
                tagline: "Action Kids",
                sports: [
                    {
                        name: "Soccer",
                        icon: Goal,
                        tagline: "Fun · Fundamental · Friendship",
                        benefits: [
                            "Mengenal teknik dasar sepak bola dengan cara menyenangkan",
                            "Mengembangkan fundamental movement dan ball mastery",
                            "Belajar bermain bersama teman dan membangun pertemanan",
                        ],
                    },
                    {
                        name: "Basketball",
                        icon: Volleyball,
                        tagline: "Fun · Fundamental · Friendship",
                        benefits: [
                            "Mengembangkan gerak dasar (FMS) secara menyeluruh",
                            "Mengenalkan basketball secara fun dan non-kompetitif",
                            "Mengembangkan aspek fisik, kognitif, sosial, dan emosional",
                        ],
                    },
                    {
                        name: "Tennis",
                        icon: Trophy,
                        tagline: "Fun · Fundamental · Friendship",
                        benefits: [
                            "Mengembangkan koordinasi dan keseimbangan dasar",
                            "Belajar pukulan forehand & backhand secara menyenangkan",
                            "Membangun kepercayaan diri dengan raket dan bola",
                        ],
                    },
                    {
                        name: "Baseball",
                        icon: Circle,
                        tagline: "Fun · Fundamental · Friendship",
                        benefits: [
                            "Mengembangkan koordinasi dan keseimbangan dasar",
                            "Belajar pukulan forehand & backhand secara menyenangkan",
                            "Membangun kepercayaan diri dengan raket dan bola",
                        ],
                    },
                ],
            },
        ],
    },
    {
        key: "junior",
        label: "Junior Program",
        subtitle: "Age 6 – 12 Years",
        title: "Structured Sports Training",
        description:
            "Membantu anak berkembang melalui latihan olahraga yang lebih terarah, kompetitif, dan tetap menyenangkan.",
        image: "/images/junior.png",
        heroClass: "bg-primary",
        ctaLabel: "Book Junior Trial",
        ageGroups: [
            {
                label: "6 – 9 tahun",
                range: "6-9",
                tagline: "Fun · Fundamental",
                sports: [
                    {
                        name: "Basketball",
                        icon: Volleyball,
                        tagline: "Fun · Fundamental",
                        benefits: [
                            "Mengenal basketball dengan cara yang menyenangkan",
                            "Mengembangkan motorik kasar dan koordinasi tangan-mata",
                            "Menumbuhkan percaya diri dan kerja sama tim",
                        ],
                    },
                    {
                        name: "Soccer",
                        icon: Goal,
                        tagline: "Fun · Fundamental",
                        benefits: [
                            "Mengenalkan futsal melalui aktivitas yang menyenangkan",
                            "Melatih teknik dasar dengan cara yang benar dan seru",
                            "Membangun rasa percaya diri dan kerja sama dalam tim",
                        ],
                    },
                    {
                        name: "Padel",
                        icon: Dumbbell,
                        tagline: "Fun · Fundamental",
                        benefits: [
                            "Mengenal olahraga padel dengan cara yang menyenangkan",
                            "Mengembangkan koordinasi motorik dan keseimbangan dasar",
                            "Menumbuhkan rasa percaya diri dan semangat kerja sama",
                        ],
                    },
                    {
                        name: "Tennis",
                        icon: Trophy,
                        tagline: "Fun · Coordination",
                        benefits: [
                            "Mengembangkan koordinasi, keseimbangan, dan gerak dasar",
                            "Mempelajari pukulan forehand dan backhand dasar",
                            "Membangun kepercayaan diri dengan raket dan bola",
                        ],
                    },
                ],
            },
            {
                label: "10 – 14 tahun",
                range: "10-14",
                tagline: "Skill & Development",
                sports: [
                    {
                        name: "Basketball",
                        icon: Volleyball,
                        tagline: "Skill & Development",
                        benefits: [
                            "Mengembangkan teknik dribbling, passing, shooting, dan defense",
                            "Meningkatkan kemampuan fisik: agility, speed, dan coordination",
                            "Melatih disiplin, sportivitas, dan kontrol emosi saat bermain",
                        ],
                    },
                    {
                        name: "Soccer",
                        icon: Goal,
                        tagline: "Skill & Development",
                        benefits: [
                            "Mengembangkan teknik dribbling, passing, control, dan shooting",
                            "Memahami posisi, ruang, timing, dan pengambilan keputusan",
                            "Mengembangkan disiplin, tanggung jawab, dan sportivitas",
                        ],
                    },
                    {
                        name: "Padel",
                        icon: Dumbbell,
                        tagline: "Skill & Development",
                        benefits: [
                            "Menguasai teknik dasar hingga menengah dengan terarah",
                            "Memahami strategi sederhana dan meningkatkan kebugaran",
                            "Membangun mental kompetitif yang sehat dan disiplin latihan",
                        ],
                    },
                    {
                        name: "Tennis",
                        icon: Trophy,
                        tagline: "Technique + Consistency",
                        benefits: [
                            "Mempelajari mekanik servis, pengembalian, dan konsistensi reli",
                            "Memahami strategi permainan dan aturan dasar penilaian",
                            "Pengenalan permainan pertandingan yang sesungguhnya",
                        ],
                    },
                ],
            },
        ],
    },
]

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function SportAccordionItem({
    sport,
    isOpen,
    onToggle,
}: {
    sport: SportDetail
    isOpen: boolean
    onToggle: () => void
}) {
    const Icon = sport.icon

    return (
        <button
            type="button"
            onClick={onToggle}
            className={`w-full rounded-2xl border text-left transition-all duration-200 ${isOpen
                    ? "border-primary/40 bg-white shadow-sm"
                    : "border-white/60 bg-white/70 hover:border-white/80 hover:bg-white/80"
                } backdrop-blur-md`}
        >
            <div className="flex items-center justify-between px-4 py-3.5 sm:px-5 sm:py-4">
                <div className="flex items-center gap-3">
                    <div
                        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-colors ${isOpen ? "bg-primary/10" : "bg-slate-100"
                            }`}
                    >
                        <Icon
                            className={`h-4 w-4 ${isOpen ? "text-primary" : "text-slate-500"
                                }`}
                        />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-900">
                            {sport.name}
                        </p>
                        <p className="text-xs text-slate-500">{sport.tagline}</p>
                    </div>
                </div>

                {isOpen ? (
                    <ChevronUp className="h-4 w-4 flex-shrink-0 text-slate-400" />
                ) : (
                    <ChevronDown className="h-4 w-4 flex-shrink-0 text-slate-400" />
                )}
            </div>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-slate-100 px-4 pb-4 pt-3 sm:px-5">
                            <ul className="flex flex-col gap-2.5">
                                {sport.benefits.map((benefit) => (
                                    <li
                                        key={benefit}
                                        className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-600"
                                    >
                                        <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                                            <Check className="h-2.5 w-2.5 text-primary" />
                                        </span>
                                        <span>{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </button>
    )
}

function ExpandedProgram({
    program,
    onBack,
}: {
    program: Program
    onBack: () => void
}) {
    const [selectedAgeIndex, setSelectedAgeIndex] = React.useState(0)
    const [openSport, setOpenSport] = React.useState<string | null>(null)

    const currentAgeGroup = program.ageGroups[selectedAgeIndex]

    React.useEffect(() => {
        setOpenSport(null)
    }, [selectedAgeIndex])

    return (
        <motion.section
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.985 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative min-h-dvh overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 text-slate-900"
        >
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -left-24 top-16 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
                <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-secondary/20 blur-3xl" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.7),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.45),transparent_30%)]" />
            </div>

            <div className="absolute left-0 top-0 z-50 w-full">
                <div className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
                    <button
                        type="button"
                        onClick={onBack}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 backdrop-blur-md transition hover:border-primary/20 hover:text-slate-900 hover:shadow-sm sm:px-4 sm:text-sm"
                    >
                        <ArrowLeft className="h-4 w-4 shrink-0" />
                        <span className="hidden sm:inline">Back to Programs</span>
                    </button>

                    <p className="hidden text-sm font-semibold text-slate-600 md:block">
                        {program.label}
                    </p>
                </div>
            </div>

            <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-7xl items-center px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
                <div className="grid w-full items-start gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
                    <div className="order-1 relative lg:order-1">
                        <div
                            className={`absolute inset-0 rounded-full ${program.heroClass} opacity-40 blur-3xl`}
                        />
                        <motion.div
                            initial={{ y: 18, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                            className="relative mx-auto aspect-square w-full max-w-[280px] sm:max-w-[340px] md:max-w-[380px] lg:max-w-[420px] xl:max-w-[460px]"
                        >
                            <Image
                                src={program.image}
                                alt={program.title}
                                fill
                                priority
                                className="object-contain drop-shadow-2xl"
                            />
                        </motion.div>
                    </div>

                    <div className="order-2 lg:order-2">
                        <motion.div
                            initial={{ y: 12, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.35, delay: 0.05 }}
                            className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur-md"
                        >
                            <BadgeCheck className="h-4 w-4 text-primary" />
                            {program.subtitle}
                        </motion.div>

                        <motion.h1
                            initial={{ y: 12, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.35, delay: 0.1 }}
                            className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl lg:text-6xl"
                        >
                            {program.title}
                        </motion.h1>

                        <motion.p
                            initial={{ y: 12, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.35, delay: 0.15 }}
                            className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-700 sm:mt-5 sm:text-base md:text-lg"
                        >
                            {program.description}
                        </motion.p>

                        <motion.div
                            initial={{ y: 12, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.35, delay: 0.2 }}
                            className="mt-8 sm:mt-10"
                        >
                            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Pilih kelompok usia anak
                            </p>

                            <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
                                {program.ageGroups.map((group, index) => (
                                    <button
                                        key={group.range}
                                        type="button"
                                        onClick={() => setSelectedAgeIndex(index)}
                                        className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 sm:px-5 ${selectedAgeIndex === index
                                                ? "bg-slate-900 text-white shadow-sm"
                                                : "border border-white/70 bg-white/70 text-slate-600 backdrop-blur-md hover:bg-white hover:text-slate-900"
                                            }`}
                                    >
                                        {group.label}
                                    </button>
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={currentAgeGroup.range}
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    transition={{ duration: 0.2 }}
                                    className="mt-2 text-xs font-medium text-slate-400"
                                >
                                    Fokus: {currentAgeGroup.tagline}
                                </motion.p>
                            </AnimatePresence>
                        </motion.div>

                        <motion.div
                            initial={{ y: 12, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.35, delay: 0.25 }}
                            className="mt-6"
                        >
                            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Pilih olahraga untuk lihat manfaatnya
                            </p>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentAgeGroup.range}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.22 }}
                                    className="flex flex-col gap-2.5"
                                >
                                    {currentAgeGroup.sports.map((sport) => (
                                        <SportAccordionItem
                                            key={sport.name}
                                            sport={sport}
                                            isOpen={openSport === sport.name}
                                            onToggle={() =>
                                                setOpenSport(
                                                    openSport === sport.name
                                                        ? null
                                                        : sport.name
                                                )
                                            }
                                        />
                                    ))}
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>

                        <motion.div
                            initial={{ y: 12, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.35, delay: 0.3 }}
                            className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row"
                        >
                            <WhatsAppButton
                                phone="+6282131111549"
                                message={`Halo admin PlayPro Academy, saya tertarik dengan ${program.label} untuk anak saya yang berusia ${currentAgeGroup.label}. Mohon info lebih lanjut tentang program, jadwal, dan cara pendaftarannya. Terima kasih!`}
                                label="Hubungi Kami"
                                size="xl"
                                variant="default"
                                className="w-full sm:w-auto"
                            />
                            {/* <Button size="xl" className="w-full sm:w-auto">
                                {program.ctaLabel}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button> */}

                            <Button size="xl" variant="outline" className="w-full sm:w-auto">
                                Lihat Jadwal
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </div>
        </motion.section>
    )
}

function GatewayPanel({
    program,
    onClick,
}: {
    program: Program
    onClick: () => void
}) {
    const displaySports = program.ageGroups[0].sports.slice(0, 4)

    return (
        <motion.button
            layout
            type="button"
            onClick={onClick}
            transition={{ layout: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } }}
            whileHover={{ scale: 1.01 }}
            className="group relative flex min-h-[44vh] flex-1 cursor-pointer overflow-hidden text-left md:min-h-dvh"
        >
            <div className={`absolute inset-0 ${program.heroClass} transition-all duration-500`} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.45),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.28),transparent_32%)]" />
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
            <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

            <div className="relative z-10 flex h-full w-full flex-col justify-between p-4 sm:p-6 md:p-10 lg:p-12">
                <div className="flex items-center justify-center">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur-md sm:px-4 sm:py-2 sm:text-sm">
                        <BadgeCheck className="h-4 w-4 text-primary" />
                        {program.label}
                    </div>
                </div>

                <div className="flex flex-1 flex-col items-center justify-center text-center">
                    <motion.div
                        whileHover={{ y: -6 }}
                        transition={{ duration: 0.25 }}
                        className="relative mb-5 aspect-square w-full max-w-[320px] md:max-w-[340px] 2xl:max-w-[520px]"
                    >
                        <Image
                            src={program.image}
                            alt={program.title}
                            fill
                            priority
                            className="object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
                        />
                    </motion.div>

                    <p className="text-xs font-semibold tracking-wide text-slate-800/80 sm:text-sm">
                        {program.subtitle}
                    </p>
                    <h2 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:mt-3 xl:text-4xl 2xl:text-6xl">
                        {program.title}
                    </h2>
                    <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-800/80 sm:mt-5 sm:max-w-md md:text-base">
                        {program.description}
                    </p>
                </div>

                <div className="flex flex-col items-center">
                    <div className="flex flex-wrap justify-center gap-2">
                        {displaySports.map((sport) => {
                            const Icon = sport.icon
                            return (
                                <div
                                    key={sport.name}
                                    className="inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-2 text-xs font-medium text-slate-800 shadow-sm backdrop-blur-md sm:px-4 sm:text-sm"
                                >
                                    <Icon className="h-4 w-4" />
                                    {sport.name}
                                </div>
                            )
                        })}
                    </div>

                    <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 sm:mt-6">
                        Explore Program
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                </div>
            </div>
        </motion.button>
    )
}

export default function ClassProgramsPage() {
    const [selectedProgram, setSelectedProgram] =
        React.useState<ProgramKey | null>(null)

    const activeProgram = programs.find(
        (program) => program.key === selectedProgram
    )

    return (
        <main className="relative min-h-dvh overflow-hidden bg-white">
            <AnimatePresence mode="wait">
                {!selectedProgram ? (
                    <motion.section
                        key="gateway"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative min-h-dvh overflow-hidden bg-white"
                    >
                        <div className="absolute left-0 top-0 z-50 w-full">
                            <div className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 backdrop-blur-md transition hover:border-primary/20 hover:text-slate-900 hover:shadow-sm sm:px-4 sm:text-sm"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    <span className="hidden lg:inline">
                                        PlayPro Academy
                                    </span>
                                </Link>

                                <p className="hidden text-sm font-semibold text-slate-700 lg:block">
                                    Choose your child&apos;s journey
                                </p>
                            </div>
                        </div>

                        <div className="absolute left-1/2 top-0 z-20 hidden h-full w-px -translate-x-1/2 bg-white/35 md:block" />

                        <div className="flex min-h-dvh flex-col overflow-hidden md:flex-row">
                            {programs.map((program) => (
                                <GatewayPanel
                                    key={program.key}
                                    program={program}
                                    onClick={() => setSelectedProgram(program.key)}
                                />
                            ))}
                        </div>
                    </motion.section>
                ) : (
                    activeProgram && (
                        <ExpandedProgram
                            program={activeProgram}
                            onBack={() => setSelectedProgram(null)}
                        />
                    )
                )}
            </AnimatePresence>
        </main>
    )
}
"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import {
    ArrowLeft,
    ArrowRight,
    BadgeCheck,
    Circle,
    Dumbbell,
    Goal,
    Sparkles,
    Trophy,
    Volleyball,
} from "lucide-react"

import { Button } from "@/components/ui/button"

type ProgramKey = "toddler" | "junior"

interface Program {
    key: ProgramKey
    label: string
    subtitle: string
    title: string
    description: string
    image: string
    heroClass: string
    sports: {
        name: string
        icon: React.ElementType
    }[]
    highlights: string[]
    ctaLabel: string
}

const programs: Program[] = [
    {
        key: "toddler",
        label: "Toddler Program",
        subtitle: "Age 2 - 5 Years",
        title: "Fun & Active Learning",
        description:
            "Program toddler dirancang untuk memperkenalkan olahraga dengan cara yang fun, aman, dan penuh stimulasi motorik untuk anak usia dini.",
        image: "/images/toddler.png",
        // heroClass: "from-secondary via-orange-300 to-yellow-200",
        heroClass: "bg-secondary",
        sports: [
            { name: "Basketball", icon: Volleyball },
            { name: "Soccer", icon: Goal },
            { name: "Tennis", icon: Trophy },
            { name: "Baseball", icon: Circle },
        ],
        highlights: [
            "Latihan ringan dan menyenangkan",
            "Melatih motorik, koordinasi, dan fokus",
            "Pendekatan ramah anak dan aman",
        ],
        ctaLabel: "Book Toddler Trial",
    },
    {
        key: "junior",
        label: "Junior Program",
        subtitle: "Age 6 - 12 Years",
        title: "Structured Sports Training",
        description:
            "Program junior membantu anak berkembang melalui latihan olahraga yang lebih terarah, kompetitif, dan tetap menyenangkan.",
        image: "/images/junior.png",
        // heroClass: "from-primary via-sky-500 to-cyan-300",
        heroClass: "bg-primary",
        sports: [
            { name: "Basketball", icon: Volleyball },
            { name: "Soccer", icon: Goal },
            { name: "Padel", icon: Dumbbell },
            { name: "Tennis", icon: Trophy },
        ],
        highlights: [
            "Latihan lebih terarah dan progresif",
            "Teknik, disiplin, dan teamwork berkembang",
            "Cocok untuk anak yang ingin lebih aktif",
        ],
        ctaLabel: "Book Junior Trial",
    },
]

function SportBadge({ sport }: { sport: Program["sports"][number] }) {
    const Icon = sport.icon

    return (
        <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-medium text-slate-800 shadow-sm backdrop-blur-md transition hover:-translate-y-0.5">
            <Icon className="h-4 w-4" />
            {sport.name}
        </div>
    )
}

function ExpandedProgram({
    program,
    onBack,
}: {
    program: Program
    onBack: () => void
}) {
    return (
        <motion.section
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.985 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative min-h-screen overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 text-slate-900"
        >
            <div className="absolute inset-0">
                <div className="absolute -left-24 top-16 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
                <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-secondary/20 blur-3xl" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.7),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.45),transparent_30%)]" />
            </div>

            <div className="absolute left-0 top-0 z-50 w-full">
                <div className="flex items-center justify-between px-6 py-5">
                    <button
                        onClick={onBack}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-900 cursor-pointer"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Programs
                    </button>

                    <p className="hidden text-sm font-semibold text-slate-600 md:block">
                        {program.label}
                    </p>
                </div>
            </div>

            <div className="relative z-10 container mx-auto flex min-h-screen items-center px-4 py-20">
                <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                    <div className="relative">
                        <div
                            className={`absolute inset-0 rounded-full bg-gradient-to-br ${program.heroClass} opacity-40 blur-3xl`}
                        />
                        <motion.div
                            initial={{ y: 18, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                            className="relative mx-auto aspect-square w-full max-w-[360px] sm:max-w-[400px] lg:max-w-[420px]"
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

                    <div>
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
                            className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl lg:text-6xl"
                        >
                            {program.title}
                        </motion.h1>

                        <motion.p
                            initial={{ y: 12, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.35, delay: 0.15 }}
                            className="mt-5 max-w-2xl text-base leading-relaxed text-slate-700 md:text-lg"
                        >
                            {program.description}
                        </motion.p>

                        <motion.div
                            initial={{ y: 12, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.35, delay: 0.2 }}
                            className="mt-10"
                        >
                            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-600">
                                Available Sports
                            </p>

                            <div className="flex flex-wrap gap-3">
                                {program.sports.map((sport) => (
                                    <SportBadge key={sport.name} sport={sport} />
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ y: 12, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.35, delay: 0.25 }}
                            className="mt-10 grid gap-4 sm:grid-cols-3"
                        >
                            {program.highlights.map((item) => (
                                <div
                                    key={item}
                                    className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur-md"
                                >
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
                                        <Sparkles className="h-5 w-5 text-primary" />
                                    </div>
                                    <p className="mt-4 text-sm leading-relaxed text-slate-700">
                                        {item}
                                    </p>
                                </div>
                            ))}
                        </motion.div>

                        <motion.div
                            initial={{ y: 12, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.35, delay: 0.3 }}
                            className="mt-10 flex flex-wrap gap-4"
                        >
                            <Button size="xl">
                                {program.ctaLabel}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>

                            <Button size="xl" variant="outline">
                                View Schedule
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
    return (
        <motion.button
            layout
            type="button"
            onClick={onClick}
            transition={{
                layout: {
                    duration: 0.65,
                    ease: [0.22, 1, 0.36, 1],
                },
            }}
            whileHover={{ scale: 1.01 }}
            className="group relative flex min-h-[50vh] flex-1 overflow-hidden text-left md:min-h-screen cursor-pointer"
        >
            <div
                className={`absolute inset-0 ${program.heroClass} transition-all duration-500`}
                // className={`absolute inset-0 bg-gradient-to-br ${program.heroClass} transition-all duration-500`}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.45),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.28),transparent_32%)]" />
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />

            <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

            <div className="relative z-10 flex h-full w-full flex-col justify-between p-6 md:p-10 lg:p-12">
                {/* Top Badge */}
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur-md">
                        <BadgeCheck className="h-4 w-4 text-primary" />
                        {program.label}
                    </div>
                </div>

                {/* Center Content */}
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                    {/* Image */}
                    <motion.div
                        whileHover={{ y: -6 }}
                        transition={{ duration: 0.25 }}
                        className="
        relative
        mb-6
        aspect-square
        w-full
        max-w-[340px]
        sm:max-w-[380px]
        lg:max-w-[460px]
      "
                    >
                        <Image
                            src={program.image}
                            alt={program.title}
                            fill
                            priority
                            className="
          object-contain
          drop-shadow-2xl
          transition-transform
          duration-500
          group-hover:scale-105
        "
                        />
                    </motion.div>

                    {/* Subtitle */}
                    <p className="text-sm font-semibold tracking-wide text-slate-800/80">
                        {program.subtitle}
                    </p>

                    {/* Title */}
                    <h2 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 lg:text-6xl">
                        {program.title}
                    </h2>

                    {/* Description */}
                    <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-800/80 md:text-base">
                        {program.description}
                    </p>
                </div>

                {/* Bottom */}
                <div className="flex flex-col items-center">
                    {/* Sports */}
                    <div className="flex flex-wrap justify-center gap-2.5">
                        {program.sports.slice(0, 3).map((sport) => {
                            const Icon = sport.icon

                            return (
                                <div
                                    key={sport.name}
                                    className="
              inline-flex items-center gap-2
              rounded-full
              bg-white/85
              px-4 py-2
              text-sm font-medium text-slate-800
              shadow-sm
              backdrop-blur-md
            "
                                >
                                    <Icon className="h-4 w-4" />
                                    {sport.name}
                                </div>
                            )
                        })}
                    </div>

                    {/* CTA */}
                    <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
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
        <main className="relative min-h-screen overflow-hidden bg-white">
            <AnimatePresence mode="wait">
                {!selectedProgram ? (
                    <motion.section
                        key="gateway"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative min-h-screen overflow-hidden bg-white"
                    >
                        <div className="absolute left-0 top-0 z-50 w-full">
                            <div className="flex items-center justify-between px-6 py-5">
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-900"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    PlayPro Academy
                                </Link>

                                <p className="hidden text-sm font-semibold text-slate-700 md:block">
                                    Choose your child&apos;s journey
                                </p>
                            </div>
                        </div>

                        <div className="absolute left-1/2 top-0 z-20 hidden h-full w-px -translate-x-1/2 bg-white/35 md:block" />

                        <div className="flex min-h-screen flex-col overflow-hidden md:flex-row">
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
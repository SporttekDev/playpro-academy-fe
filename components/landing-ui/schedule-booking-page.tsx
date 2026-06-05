"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import {
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    Clock3,
    MapPin,
    Sparkles,
    Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// ─── Types ───────────────────────────────────────────────────────────────────

interface ScheduleItem {
    id: number
    category: "toddler" | "junior"
    sport: string
    age: string
    day: string
    time: string
    location: string
    coach: string
    slots: number
    status: "Available" | "Almost Full" | "Full"
}

// ─── Data ────────────────────────────────────────────────────────────────────

const schedules: ScheduleItem[] = [
    {
        id: 1,
        category: "toddler",
        sport: "Basketball",
        age: "3 - 5 Years",
        day: "Monday & Wednesday",
        time: "15:00 - 16:00",
        location: "Bandung Branch",
        coach: "Coach Adrian",
        slots: 8,
        status: "Available",
    },
    {
        id: 2,
        category: "toddler",
        sport: "Soccer",
        age: "3 - 5 Years",
        day: "Tuesday & Friday",
        time: "16:00 - 17:00",
        location: "Jakarta Branch",
        coach: "Coach Kevin",
        slots: 4,
        status: "Almost Full",
    },
    {
        id: 3,
        category: "toddler",
        sport: "Tennis",
        age: "4 - 6 Years",
        day: "Saturday",
        time: "09:00 - 10:30",
        location: "Bekasi Branch",
        coach: "Coach Michelle",
        slots: 6,
        status: "Available",
    },
    {
        id: 4,
        category: "junior",
        sport: "Basketball",
        age: "7 - 12 Years",
        day: "Monday & Thursday",
        time: "17:00 - 18:30",
        location: "Bandung Branch",
        coach: "Coach Adrian",
        slots: 10,
        status: "Available",
    },
    {
        id: 5,
        category: "junior",
        sport: "Padel",
        age: "8 - 12 Years",
        day: "Wednesday",
        time: "16:30 - 18:00",
        location: "Tangerang Branch",
        coach: "Coach Nathan",
        slots: 2,
        status: "Almost Full",
    },
    {
        id: 6,
        category: "junior",
        sport: "Soccer",
        age: "7 - 12 Years",
        day: "Saturday",
        time: "08:00 - 10:00",
        location: "Jakarta Branch",
        coach: "Coach Kevin",
        slots: 0,
        status: "Full",
    },
]

// ─── Utils ───────────────────────────────────────────────────────────────────

function getStatusStyle(status: ScheduleItem["status"]) {
    switch (status) {
        case "Available":
            return "bg-emerald-50 text-emerald-600 border-emerald-200"
        case "Almost Full":
            return "bg-amber-50 text-amber-600 border-amber-200"
        case "Full":
            return "bg-rose-50 text-rose-600 border-rose-200"
    }
}

// ─── Schedule Card ───────────────────────────────────────────────────────────

function ScheduleCard({
    schedule,
    active,
    onSelect,
    index,
}: {
    schedule: ScheduleItem
    active: boolean
    onSelect: () => void
    index: number
}) {
    const reduceMotion = useReducedMotion()

    return (
        <motion.button
            type="button"
            onClick={onSelect}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
                duration: reduceMotion ? 0 : 0.35,
                delay: reduceMotion ? 0 : index * 0.04,
                ease: "easeOut",
            }}
            whileHover={
                reduceMotion
                    ? undefined
                    : {
                        y: -4,
                        transition: { duration: 0.16, ease: "easeOut" },
                    }
            }
            className={`
                group relative overflow-hidden rounded-[2rem]
                border bg-white p-6 text-left
                transition-all duration-300
                hover:shadow-xl
                ${active
                    ? "border-primary shadow-[0_20px_50px_rgba(59,130,246,0.12)]"
                    : "border-slate-200/70"
                }
            `}
        >
            {/* Top */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div
                        className={`
                            inline-flex items-center rounded-full border
                            px-3 py-1 text-xs font-semibold
                            ${getStatusStyle(schedule.status)}
                        `}
                    >
                        {schedule.status}
                    </div>

                    <h3 className="mt-4 text-2xl font-extrabold text-slate-900">
                        {schedule.sport}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">{schedule.age}</p>
                </div>

                <div
                    className={`
                        flex h-14 w-14 items-center justify-center
                        rounded-2xl transition-colors duration-200
                        ${active ? "bg-primary text-white" : "bg-primary/10 text-primary"}
                    `}
                >
                    <CalendarDays className="h-6 w-6" />
                </div>
            </div>

            {/* Info */}
            <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                    <Clock3 className="mt-0.5 h-4 w-4 text-primary" />

                    <div>
                        <p className="text-sm font-semibold text-slate-900">
                            {schedule.day}
                        </p>

                        <p className="text-sm text-slate-500">{schedule.time}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 text-primary" />

                    <div>
                        <p className="text-sm font-semibold text-slate-900">
                            {schedule.location}
                        </p>

                        <p className="text-sm text-slate-500">{schedule.coach}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <Users className="mt-0.5 h-4 w-4 text-primary" />

                    <div>
                        <p className="text-sm font-semibold text-slate-900">
                            Remaining Slots
                        </p>

                        <p className="text-sm text-slate-500">
                            {schedule.slots} Slots Left
                        </p>
                    </div>
                </div>
            </div>

            {/* Active Indicator */}
            <AnimatePresence>
                {active && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="
                            absolute right-5 top-5
                            flex h-7 w-7 items-center justify-center
                            rounded-full bg-primary text-white
                        "
                    >
                        <CheckCircle2 className="h-4 w-4" />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ScheduleBookingPage() {
    const reduceMotion = useReducedMotion()
    const [activeTab, setActiveTab] = useState<"toddler" | "junior">("toddler")

    const filteredSchedules = useMemo(
        () => schedules.filter((item) => item.category === activeTab),
        [activeTab]
    )

    const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem | null>(
        filteredSchedules[0] ?? null
    )

    return (
        <main className="relative overflow-hidden bg-background">
            {/* Background */}
            <div className="absolute inset-0 -z-10">
                <motion.div
                    animate={
                        reduceMotion
                            ? undefined
                            : {
                                y: [0, -10, 0],
                                x: [0, 6, 0],
                            }
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
                            : {
                                y: [0, 10, 0],
                                x: [0, -6, 0],
                            }
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

            {/* ───────────────── Hero ───────────────── */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="mx-auto max-w-3xl text-center"
                    >
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
                            <Sparkles className="h-4 w-4" />
                            Schedules Booking
                        </div>

                        <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-slate-900 md:text-6xl">
                            Choose The Best
                            <span className="text-primary"> Schedule</span>
                            <br />
                            For Your Child
                        </h1>

                        <p className="mt-6 text-lg leading-relaxed text-slate-600">
                            Temukan jadwal latihan terbaik untuk anak Anda dan mulai perjalanan
                            olahraga yang seru bersama PlayPro Academy.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ───────────────── Schedule ───────────────── */}
            <section className="pb-24">
                <div className="container mx-auto px-4">
                    {/* Tabs */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="flex justify-center"
                    >
                        <Tabs
                            value={activeTab}
                            onValueChange={(value) => {
                                const nextTab = value as "toddler" | "junior"
                                setActiveTab(nextTab)

                                const nextSchedules = schedules.filter(
                                    (item) => item.category === nextTab
                                )

                                setSelectedSchedule(nextSchedules[0] ?? null)
                            }}
                        >
                            <TabsList className="h-auto rounded-2xl bg-slate-100 p-1.5">
                                <TabsTrigger
                                    value="toddler"
                                    className="
                                        rounded-xl px-6 py-3 text-sm font-semibold
                                        data-[state=active]:bg-secondary
                                        data-[state=active]:text-white
                                        data-[state=active]:shadow-sm
                                    "
                                >
                                    Toddler Program
                                </TabsTrigger>

                                <TabsTrigger
                                    value="junior"
                                    className="
                                        rounded-xl px-6 py-3 text-sm font-semibold
                                        data-[state=active]:bg-primary
                                        data-[state=active]:text-white
                                        data-[state=active]:shadow-sm
                                    "
                                >
                                    Junior Program
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </motion.div>

                    {/* Layout */}
                    <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_380px]">
                        {/* Schedule Grid */}
                        <div className="grid gap-6 md:grid-cols-2">
                            {filteredSchedules.map((schedule, index) => (
                                <ScheduleCard
                                    key={schedule.id}
                                    schedule={schedule}
                                    index={index}
                                    active={selectedSchedule?.id === schedule.id}
                                    onSelect={() => setSelectedSchedule(schedule)}
                                />
                            ))}
                        </div>

                        {/* Booking Summary */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.45, ease: "easeOut" }}
                            className="
                                sticky top-28 h-fit overflow-hidden
                                rounded-[2rem]
                                border border-primary/15
                                bg-gradient-to-br from-primary/5 via-white to-secondary/5
                                p-7 shadow-[0_20px_60px_rgba(15,23,42,0.08)]
                            "
                        >
                            <div className="flex items-center justify-between">
                                <div
                                    className="
                                        inline-flex items-center gap-2 rounded-full
                                        bg-primary/10 px-3 py-1 text-xs font-semibold text-primary
                                    "
                                >
                                    Booking Summary
                                </div>

                                <div className="h-2 w-2 rounded-full bg-primary" />
                            </div>

                            <AnimatePresence mode="wait">
                                {selectedSchedule ? (
                                    <motion.div
                                        key={selectedSchedule.id}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        transition={{ duration: 0.28, ease: "easeOut" }}
                                    >
                                        <div className="mt-6">
                                            <h3 className="text-3xl font-extrabold text-slate-900">
                                                {selectedSchedule.sport}
                                            </h3>

                                            <p className="mt-2 text-sm font-medium text-slate-500">
                                                {selectedSchedule.age}
                                            </p>
                                        </div>

                                        <div className="mt-8 rounded-2xl border border-slate-200/70 bg-white p-5">
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                        Schedule
                                                    </p>
                                                    <p className="mt-1 text-sm font-medium text-slate-900">
                                                        {selectedSchedule.day}
                                                    </p>
                                                    <p className="text-sm text-slate-600">
                                                        {selectedSchedule.time}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                        Location
                                                    </p>
                                                    <p className="mt-1 text-sm font-medium text-slate-900">
                                                        {selectedSchedule.location}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                        Coach
                                                    </p>
                                                    <p className="mt-1 text-sm font-medium text-slate-900">
                                                        {selectedSchedule.coach}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                        Remaining Slots
                                                    </p>
                                                    <p className="mt-1 text-sm font-medium text-slate-900">
                                                        {selectedSchedule.slots} Slots Available
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 space-y-3">
                                            <Button
                                                size="lg"
                                                className="w-full"
                                                disabled={selectedSchedule.status === "Full"}
                                            >
                                                {selectedSchedule.status === "Full"
                                                    ? "Class Full"
                                                    : "Book This Schedule"}
                                            </Button>

                                            <Button
                                                size="lg"
                                                variant="outline"
                                                className="w-full"
                                                asChild
                                            >
                                                <Link href="/free-trial">
                                                    Free Trial First
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.p
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="mt-5 text-sm text-slate-500"
                                    >
                                        Select a schedule first.
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>
            </section>
        </main>
    )
}
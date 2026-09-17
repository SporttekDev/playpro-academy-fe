"use client"

import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import {
    Building2,
    CalendarDays,
    CheckCircle2,
    Clock3,
    MapPin,
    Sparkles,
    Users,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WhatsAppButton } from './whatsapp-button';
import { useSchedules } from "@/lib/schedule/hooks"
import { ScheduleItem } from "@/lib/schedule/types"


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

function ScheduleCardSkeleton() {
    return (
        <div className="animate-pulse rounded-[2rem] border border-slate-200/70 bg-white p-6">
            <div className="h-6 w-24 rounded-full bg-slate-200" />
            <div className="mt-4 h-7 w-32 rounded bg-slate-200" />
            <div className="mt-2 h-4 w-20 rounded bg-slate-200" />
            <div className="mt-6 space-y-4">
                <div className="h-4 w-full rounded bg-slate-200" />
                <div className="h-4 w-full rounded bg-slate-200" />
                <div className="h-4 w-2/3 rounded bg-slate-200" />
            </div>
        </div>
    )
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
            whileHover={reduceMotion ? undefined : { y: -4, transition: { duration: 0.16, ease: "easeOut" } }}
            className={`
                group relative overflow-hidden rounded-[2rem]
                border bg-white p-6 text-left
                transition-all duration-300
                hover:shadow-xl
                ${active ? "border-primary shadow-[0_20px_50px_rgba(59,130,246,0.12)]" : "border-slate-200/70"}
            `}
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(schedule.status)}`}>
                        {schedule.status}
                    </div>

                    <h3 className="mt-4 text-2xl font-extrabold text-slate-900">
                        {schedule.sportName}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        {schedule.ageRange ?? schedule.categoryName}
                    </p>
                </div>

                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-colors duration-200 ${active ? "bg-primary text-white" : "bg-primary/10 text-primary"}`}>
                    <CalendarDays className="h-6 w-6" />
                </div>
            </div>

            <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                    <Clock3 className="mt-0.5 h-4 w-4 text-primary" />
                    <div>
                        <p className="text-sm font-semibold text-slate-900">{schedule.dateLabel}</p>
                        <p className="text-sm text-slate-500">{schedule.startTime} - {schedule.endTime}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                    <div>
                        <p className="text-sm font-semibold text-slate-900">{schedule.venueName}</p>
                        <p className="text-sm text-slate-500">{schedule.coachName ?? "Coach belum ditentukan"}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <Users className="mt-0.5 h-4 w-4 text-primary" />
                    <div>
                        <p className="text-sm font-semibold text-slate-900">Remaining Slots</p>
                        <p className="text-sm text-slate-500">{schedule.slotsRemaining} Slots Left</p>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {active && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-5 top-5 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white"
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
    const { schedules, categories, branches, isLoading, error } = useSchedules()
    const [activeCategory, setActiveCategory] = useState<string | null>(null)
    const [activeBranch, setActiveBranch] = useState<string>("all")

    const effectiveCategory = activeCategory ?? categories[0]?.key ?? null

    const filteredSchedules = useMemo(
        () =>
            schedules.filter((item) => {
                const matchCategory = item.categoryName.toLowerCase() === effectiveCategory
                const matchBranch =
                    activeBranch === "all" || item.branchName.toLowerCase() === activeBranch
                return matchCategory && matchBranch
            }),
        [schedules, effectiveCategory, activeBranch]
    )

    const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem | null>(null)

    useEffect(() => {
        setSelectedSchedule(filteredSchedules[0] ?? null)
    }, [filteredSchedules])

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

            <section className="pb-24">
                <div className="container mx-auto px-4">
                    {!isLoading && (categories.length > 0 || branches.length > 0) && (
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="flex flex-col items-center gap-4"
                        >
                            <Tabs
                                value={effectiveCategory ?? undefined}
                                onValueChange={(value) => setActiveCategory(value)}
                            >
                                <TabsList className="h-auto rounded-2xl bg-slate-100 p-1.5">
                                    {categories.map((cat) => (
                                        <TabsTrigger
                                            key={cat.key}
                                            value={cat.key}
                                            className="rounded-xl px-6 py-3 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm"
                                        >
                                            {cat.label}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </Tabs>

                            {branches.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-slate-400" />
                                    <Select value={activeBranch} onValueChange={setActiveBranch}>
                                        <SelectTrigger className="w-56 rounded-xl">
                                            <SelectValue placeholder="Pilih Cabang" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Cabang</SelectItem>
                                            {branches.map((branch) => (
                                                <SelectItem key={branch.key} value={branch.key}>
                                                    {branch.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </motion.div>
                    )}

                    <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_380px]">
                        <div className="grid gap-6 md:grid-cols-2">
                            {isLoading ? (
                                Array.from({ length: 4 }).map((_, i) => <ScheduleCardSkeleton key={i} />)
                            ) : error ? (
                                <p className="col-span-2 text-center text-red-500">{error}</p>
                            ) : filteredSchedules.length === 0 ? (
                                <p className="col-span-2 text-center text-slate-500">
                                    Belum ada jadwal mendatang untuk filter ini.
                                </p>
                            ) : (
                                filteredSchedules.map((schedule, index) => (
                                    <ScheduleCard
                                        key={schedule.id}
                                        schedule={schedule}
                                        index={index}
                                        active={selectedSchedule?.id === schedule.id}
                                        onSelect={() => setSelectedSchedule(schedule)}
                                    />
                                ))
                            )}
                        </div>

                        {/* Booking Summary */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.45, ease: "easeOut" }}
                            className="sticky top-28 h-fit overflow-hidden rounded-[2rem] border border-primary/15 bg-gradient-to-br from-primary/5 via-white to-secondary/5 p-7 shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
                        >
                            <div className="flex items-center justify-between">
                                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
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
                                                {selectedSchedule.sportName}
                                            </h3>
                                            <p className="mt-2 text-sm font-medium text-slate-500">
                                                {selectedSchedule.ageRange ?? selectedSchedule.categoryName}
                                            </p>
                                        </div>

                                        <div className="mt-8 rounded-2xl border border-slate-200/70 bg-white p-5">
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Schedule</p>
                                                    <p className="mt-1 text-sm font-medium text-slate-900">{selectedSchedule.dateLabel}</p>
                                                    <p className="text-sm text-slate-600">{selectedSchedule.startTime} - {selectedSchedule.endTime}</p>
                                                </div>

                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Location</p>
                                                    <p className="mt-1 text-sm font-medium text-slate-900">{selectedSchedule.venueName}</p>
                                                </div>

                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Coach</p>
                                                    <p className="mt-1 text-sm font-medium text-slate-900">
                                                        {selectedSchedule.coachName ?? "Belum ditentukan"}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Remaining Slots</p>
                                                    <p className="mt-1 text-sm font-medium text-slate-900">
                                                        {selectedSchedule.slotsRemaining} Slots Available
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 space-y-3">
                                            <WhatsAppButton
                                                label="Book This Schedule"
                                                phone="+6282131111549"
                                                message={`Halo admin PlayPro Academy, saya tertarik untuk booking jadwal ${selectedSchedule.sportName} (${selectedSchedule.className}) pada ${selectedSchedule.dateLabel}. Mohon info langkah pendaftarannya dan ketersediaan slotnya. Terima kasih!`}
                                                className="w-full"
                                                disabled={selectedSchedule.status === "Full"}
                                            />

                                            <WhatsAppButton
                                                variant="outline"
                                                label="Free Trial First"
                                                phone="+6282131111549"
                                                message={`Halo admin PlayPro Academy, saya tertarik untuk mencoba free trial sebelum booking jadwal ${selectedSchedule.sportName} untuk anak saya. Mohon info jadwal free trial yang tersedia dan cara daftarnya. Terima kasih!`}
                                                className="w-full"
                                            />
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
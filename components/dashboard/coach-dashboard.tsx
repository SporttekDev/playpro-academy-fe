"use client"

import * as React from "react"
import Cookies from "js-cookie"
import {
    AlertTriangle,
    ArrowRight,
    BadgeCheck,
    BookOpen,
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    CreditCard,
    Loader2,
    MapPin,
    MessageCircle,
    Target,
    Users,
    UserRound,
} from "lucide-react"

import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader } from "../ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

import MetricCard from "./metric-card"
import { SectionTitle } from "./section-title"
import ScheduleRow from "./schedule-row"
import { useRouter } from "next/navigation"

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type CoachDashboardResponse = {
    message: string
    coach: {
        id: number
        user_id: number
        name: string
        email: string
        phone: string | null
        address: string | null
        photo: string | null
        description: string | null
    }
    metrics: {
        classes_today: number
        attendance_submitted: number
        students_seen: number
        needs_follow_up: number
    }
    ongoing_class: CoachScheduleItem | null
    today_classes: CoachScheduleItem[]
    students_to_review: StudentReviewItem[]
}

type CoachScheduleItem = {
    id: number
    time: string
    end_time: string
    title: string
    meta: string
    coach: string
    students: number
    status: "ongoing" | "upcoming" | "completed"
    is_head_coach: boolean
    attendance_submitted: number
    pending_reports: number
}

type StudentReviewItem = {
    id: number
    name: string
    note: string
    status: string
    schedule_name?: string | null
    venue_name?: string | null
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function resolveAssetUrl(path?: string | null) {
    if (!path) return null
    if (path.startsWith("http")) return path

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? ""
    const baseUrl = apiUrl.replace(/\/api\/?$/, "")

    return `${baseUrl}/${path.replace(/^\/+/, "")}`
}

function formatCoachName(name?: string | null) {
    if (!name) return "Coach"
    return name
}

function buildScheduleMeta(item: CoachScheduleItem) {
    const statusLabel =
        item.status === "ongoing"
            ? "Ongoing"
            : item.status === "upcoming"
                ? "Upcoming"
                : "Completed"

    return `${item.meta} • ${item.students} students • ${statusLabel}`
}

// Nama schedule dari backend biasanya sudah lengkap berisi venue + tanggal + jam
// (mis. "Soccer - Toddler, PSA, 2026-09-23, 09:00-12:00"), padahal jam & venue
// sudah ditampilkan terpisah di badge/meta. Ambil segmen pertama saja biar tidak dobel.
function shortenTitle(title: string) {
    return title.split(",")[0]?.trim() || title
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function CoachDashboard({ name }: { name: string }) {
    const [data, setData] = React.useState<CoachDashboardResponse | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState("")

    const router = useRouter()

    React.useEffect(() => {
        const controller = new AbortController()

        async function fetchDashboard() {
            try {
                setLoading(true)
                setError("")

                const token = Cookies.get("token")

                if (!token) {
                    throw new Error("Token not found. Please login again.")
                }

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/dashboard/coach`,
                    {
                        method: "GET",
                        headers: {
                            Accept: "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        signal: controller.signal,
                    }
                )

                if (response.status === 401) {
                    throw new Error("Unauthorized. Please login again.")
                }

                if (!response.ok) {
                    const result = await response.json().catch(() => null)
                    throw new Error(
                        result?.message ?? "Failed to load coach dashboard"
                    )
                }

                const result: CoachDashboardResponse = await response.json()
                setData(result)
            } catch (err) {
                if (err instanceof DOMException && err.name === "AbortError") {
                    return
                }

                console.error(err)
                setError(err instanceof Error ? err.message : "Failed to load dashboard")
            } finally {
                setLoading(false)
            }
        }

        fetchDashboard()

        return () => controller.abort()
    }, [])

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="flex items-center gap-3 text-slate-500">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading coach dashboard...
                </div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
                {error || "Failed to load coach dashboard"}
            </div>
        )
    }

    const coachPhoto = resolveAssetUrl(data.coach.photo)
    const ongoingClass = data.ongoing_class
    const topSchedule = ongoingClass ?? data.today_classes[0] ?? null
    const displayName = formatCoachName(data.coach.name)

    return (
        <div className="space-y-6">
            <Card className="overflow-hidden rounded-3xl border-slate-200 bg-gradient-to-br from-primary via-primary/95 to-cyan-500 text-white shadow-[0_20px_60px_rgba(59,130,246,0.18)]">
                <CardHeader className="p-5 sm:p-6 md:p-8">
                    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                        <div className="flex items-start gap-3 sm:gap-4">
                            <Avatar className="h-12 w-12 shrink-0 border border-white/20 sm:h-16 sm:w-16">
                                {coachPhoto ? <AvatarImage src={coachPhoto} /> : null}
                                <AvatarFallback className="bg-white/15 text-white">
                                    {displayName.slice(0, 1)}
                                </AvatarFallback>
                            </Avatar>

                            <div className="min-w-0">
                                <Badge className="inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white sm:px-4 sm:py-2 sm:text-sm">
                                    <ClipboardList className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    Coach Dashboard
                                </Badge>

                                <h1 className="mt-4 text-2xl font-extrabold tracking-tight sm:mt-5 sm:text-3xl md:text-4xl lg:text-5xl">
                                    Morning Coach, {displayName}
                                </h1>

                                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80 sm:mt-4 sm:text-base md:text-lg">
                                    Focus on today&apos;s classes, attendance, and student follow-up in one
                                    action-oriented workspace.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <Button
                                size="lg"
                                variant="secondary"
                                className="rounded-2xl"
                                onClick={() => topSchedule && router.push(`/attendance-checkin/${topSchedule.id}`)}
                                disabled={!topSchedule}
                            >
                                Start Attendance
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white hover:text-primary"
                            >
                                View Schedule
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                <MetricCard
                    title="Classes Today"
                    value={`${data.metrics.classes_today}`}
                    note="Schedules assigned to you today"
                    icon={CalendarDays}
                    trend="Today"
                />
                <MetricCard
                    title="Attendance Submitted"
                    value={`${data.metrics.attendance_submitted}`}
                    note="Reports already completed"
                    icon={CheckCircle2}
                    trend="Progress"
                />
                <MetricCard
                    title="Students Seen"
                    value={`${data.metrics.students_seen}`}
                    note="Across today’s sessions"
                    icon={Users}
                    trend="Live"
                />
                <MetricCard
                    title="Needs Follow-Up"
                    value={`${data.metrics.needs_follow_up}`}
                    note="Pending reports or reviews"
                    icon={Target}
                    trend="Attention"
                />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-6">
                    <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
                        <CardHeader className="p-6">
                            <SectionTitle
                                eyebrow="Live"
                                title="Class Ongoing Now"
                                description="The session currently in progress and ready for attendance input."
                            />
                        </CardHeader>

                        <CardContent className="p-6 pt-0">
                            {ongoingClass ? (
                                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-emerald-700">
                                                {ongoingClass.time} - {ongoingClass.end_time}
                                            </p>
                                            <h3 className="mt-2 line-clamp-2 text-xl font-extrabold text-slate-900 sm:text-2xl">
                                                {shortenTitle(ongoingClass.title)}
                                            </h3>
                                            <p className="mt-2 text-sm text-slate-600">
                                                {buildScheduleMeta(ongoingClass)}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-3 sm:shrink-0">
                                            <Button
                                                className="flex-1 rounded-2xl sm:flex-none"
                                                onClick={() => router.push(`/attendance-checkin/${ongoingClass.id}`)}
                                            >
                                                Take Attendance
                                            </Button>
                                            <Button variant="outline" className="flex-1 rounded-2xl sm:flex-none">
                                                Open Roster
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-3xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">
                                    No class ongoing right now
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
                        <CardHeader className="p-6">
                            <SectionTitle
                                eyebrow="Today"
                                title="Today's Schedule"
                                description="Your classes for the day based on coach schedule assignments."
                            />
                        </CardHeader>

                        <CardContent className="space-y-4 p-6 pt-0">
                            {data.today_classes.length > 0 ? (
                                data.today_classes.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex flex-col gap-3 rounded-2xl border border-slate-100 p-3 sm:flex-row sm:items-center sm:border-0 sm:p-0"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <ScheduleRow
                                                time={`${item.time} - ${item.end_time}`}
                                                title={shortenTitle(item.title)}
                                                meta={item.meta}
                                                coach={item.coach}
                                                students={item.students}
                                                status={item.status}
                                            />
                                        </div>
                                        <Button
                                            size="sm"
                                            variant={item.status === "ongoing" ? "default" : "outline"}
                                            className="w-full rounded-xl sm:w-auto sm:shrink-0"
                                            onClick={() => router.push(`/attendance-checkin/${item.id}`)}
                                        >
                                            Absen
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-3xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">
                                    No schedules assigned for today
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
                        <CardHeader className="p-6">
                            <SectionTitle
                                eyebrow="Follow Up"
                                title="Students to Review"
                                description="Quick notes for your next attendance report."
                            />
                        </CardHeader>

                        <CardContent className="space-y-3 p-6 pt-0">
                            {data.students_to_review.length > 0 ? (
                                data.students_to_review.map((item) => (
                                    <div
                                        key={item.id}
                                        className="rounded-2xl border border-slate-200 bg-white p-4"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="font-semibold text-slate-900">
                                                    {item.name}
                                                </p>
                                                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                                                    {item.note}
                                                </p>
                                                {(item.schedule_name || item.venue_name) && (
                                                    <p className="mt-2 text-xs text-slate-400">
                                                        {item.schedule_name}
                                                        {item.schedule_name && item.venue_name ? " • " : ""}
                                                        {item.venue_name}
                                                    </p>
                                                )}
                                            </div>

                                            <Badge className="shrink-0 rounded-full bg-primary/10 text-primary">
                                                {item.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">
                                    No students to review right now
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
                        <CardHeader className="p-6">
                            <SectionTitle
                                eyebrow="Coach Profile"
                                title="Your Assignment"
                                description="Coach details from the current session."
                            />
                        </CardHeader>

                        <CardContent className="space-y-4 p-6 pt-0">
                            <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Name
                                </p>
                                <p className="mt-1 font-semibold text-slate-900">
                                    {data.coach.name}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Description
                                </p>
                                <p className="mt-1 font-semibold text-slate-900">
                                    {data.coach.description ?? "-"}
                                </p>
                            </div>

                            <div className="rounded-2xl bg-slate-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Contact
                                </p>
                                <p className="mt-1 break-words font-semibold text-slate-900">
                                    {data.coach.email}
                                </p>
                                <p className="text-sm text-slate-500">
                                    {data.coach.phone ?? "-"}
                                </p>
                            </div>

                            <Button variant="outline" className="w-full rounded-2xl">
                                <ArrowRight className="mr-2 h-4 w-4" />
                                View Full Roster
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
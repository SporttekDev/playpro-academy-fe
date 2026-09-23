"use client"

import * as React from "react"
import Cookies from "js-cookie"
import {
    Bell,
    BookOpen,
    CalendarDays,
    CreditCard,
    Loader2,
    MapPin,
    UserRound,
} from "lucide-react"

import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader } from "../ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

import { SectionTitle } from "./section-title"

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type ParentDashboardResponse = {
    message: string
    parent: {
        id: number
        name: string
        email: string
        phone: string
        address: string
        role: string
    }
    active_child_id: number | null
    children: Child[]
}

type Child = {
    id: number
    name: string
    nick_name?: string | null
    age: number
    gender: string
    photo?: string | null

    membership: {
        id: number
        registered_date: string
        valid_until: string
        status: string
        branch_id: number
    } | null

    sessions: {
        id: number
        count: number
        expiry_date: string
    } | null

    branch: {
        id: number
        name: string
        description?: string
    } | null

    next_class: {
        id: number
        name: string
        date: string
        start_time: string
        end_time: string
        quota: number

        venue?: {
            id: number
            name: string
            address?: string
        } | null
    } | null

    upcoming_schedules: UpcomingSchedule[]

    coach_note: string | null
}

type UpcomingSchedule = {
    id: number
    name: string
    date: string
    start_time: string
    end_time: string

    venue?: {
        id: number
        name: string
        address?: string
    } | null
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

function formatDate(date: string) {
    return new Intl.DateTimeFormat("id-ID", {
        weekday: "short",
        day: "numeric",
        month: "short",
        timeZone: "Asia/Jakarta",
    }).format(new Date(date))
}

function formatTime(time: string) {
    return time.slice(0, 5)
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function ParentDashboard({ name }: { name: string }) {
    const [data, setData] = React.useState<ParentDashboardResponse | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState("")
    const [activeChildId, setActiveChildId] = React.useState<number | null>(null)

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
                    `${process.env.NEXT_PUBLIC_API_URL}/dashboard/parent`,
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
                        result?.message ?? "Failed to load parent dashboard"
                    )
                }

                const result: ParentDashboardResponse = await response.json()
                setData(result)
                setActiveChildId(result.active_child_id)
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

    const activeChild =
        data?.children.find((child) => child.id === activeChildId) ??
        data?.children[0]

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="flex items-center gap-3 text-slate-500">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading parent dashboard...
                </div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
                {error || "Failed to load parent dashboard"}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <Card className="overflow-hidden rounded-3xl border-slate-200 bg-gradient-to-br from-primary via-primary/90 to-secondary text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
                <CardHeader className="p-5 sm:p-6 md:p-8">
                    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                        <div className="min-w-0">
                            <Badge className="inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white sm:px-4 sm:py-2 sm:text-sm">
                                <UserRound className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                Parent Dashboard
                            </Badge>

                            <h1 className="mt-4 text-2xl font-extrabold tracking-tight sm:mt-5 sm:text-3xl md:text-4xl lg:text-5xl">
                                Hello, {data.parent.name}
                            </h1>

                            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80 sm:mt-4 sm:text-base md:text-lg">
                                Monitor jadwal latihan, membership, dan perkembangan anak
                                dalam satu dashboard.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <Button size="lg" variant="secondary" className="rounded-2xl">
                                <CalendarDays className="mr-2 h-4 w-4" />
                                View Schedule
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white hover:text-primary"
                            >
                                <Bell className="mr-2 h-4 w-4" />
                                Contact Admin
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <div className="flex gap-3 overflow-x-auto pb-2">
                {data.children.map((child) => {
                    const isActive = child.id === activeChild?.id
                    const childPhoto = resolveAssetUrl(child.photo)

                    return (
                        <button
                            key={child.id}
                            onClick={() => setActiveChildId(child.id)}
                            className={`flex min-w-[240px] items-center gap-3 rounded-[1.5rem] border px-4 py-3 text-left shadow-sm transition ${isActive
                                    ? "border-primary bg-primary text-white"
                                    : "border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5"
                                }`}
                        >
                            <Avatar className="h-12 w-12 shrink-0">
                                {childPhoto ? <AvatarImage src={childPhoto} /> : null}
                                <AvatarFallback
                                    className={
                                        isActive
                                            ? "bg-white/15 text-white"
                                            : "bg-primary/10 text-primary"
                                    }
                                >
                                    {child.name.slice(0, 1)}
                                </AvatarFallback>
                            </Avatar>

                            <div className="min-w-0">
                                <p className="truncate font-semibold">{child.name}</p>
                                <p
                                    className={`text-sm ${isActive ? "text-white/80" : "text-slate-500"
                                        }`}
                                >
                                    {child.age} years old
                                </p>
                            </div>
                        </button>
                    )
                })}
            </div>

            {activeChild && (
                <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                    <div className="space-y-6">
                        <Card className="overflow-hidden rounded-3xl border-slate-200 bg-white shadow-sm">
                            <CardHeader className="p-6">
                                <SectionTitle
                                    eyebrow="Next Class"
                                    title="Upcoming Training"
                                    description="Jadwal latihan berikutnya."
                                />
                            </CardHeader>

                            <CardContent className="p-6 pt-0">
                                {activeChild.next_class ? (
                                    <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-white to-secondary/10 p-6">
                                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                                            {formatDate(activeChild.next_class.date)}
                                        </p>

                                        <h3 className="mt-3 text-3xl font-extrabold text-slate-900">
                                            {activeChild.next_class.name}
                                        </h3>

                                        <div className="mt-5 flex flex-wrap gap-3">
                                            <Badge variant="secondary">
                                                {formatTime(activeChild.next_class.start_time)} -{" "}
                                                {formatTime(activeChild.next_class.end_time)}
                                            </Badge>

                                            {activeChild.next_class.venue?.name && (
                                                <Badge variant="outline">
                                                    <MapPin className="mr-1 h-3 w-3" />
                                                    {activeChild.next_class.venue.name}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-3xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">
                                        No upcoming class yet
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
                            <CardHeader className="p-6">
                                <SectionTitle
                                    eyebrow="Schedule"
                                    title="Upcoming Classes"
                                    description="Jadwal latihan yang akan datang."
                                />
                            </CardHeader>

                            <CardContent className="space-y-4 p-6 pt-0">
                                {activeChild.upcoming_schedules.length > 0 ? (
                                    activeChild.upcoming_schedules.map((schedule) => (
                                        <div
                                            key={schedule.id}
                                            className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate font-semibold text-slate-900">
                                                    {schedule.name}
                                                </p>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    {formatDate(schedule.date)} •{" "}
                                                    {formatTime(schedule.start_time)} -{" "}
                                                    {formatTime(schedule.end_time)}
                                                </p>
                                            </div>

                                            <Button size="sm" variant="outline" className="shrink-0">
                                                Detail
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">
                                        No schedules available
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
                            <CardHeader className="p-6">
                                <SectionTitle
                                    eyebrow="Membership"
                                    title="Package Status"
                                    description="Membership dan sisa sesi aktif."
                                />
                            </CardHeader>

                            <CardContent className="space-y-4 p-6 pt-0">
                                <div className="rounded-2xl border border-slate-200 p-5">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                                            <CreditCard className="h-5 w-5 text-primary" />
                                        </div>

                                        <div className="min-w-0 space-y-2">
                                            <p className="font-semibold text-slate-900">
                                                {activeChild.membership?.status === "active"
                                                    ? "Membership Active"
                                                    : "No Active Membership"}
                                            </p>

                                            <p className="text-sm text-slate-500">
                                                Valid until{" "}
                                                {activeChild.membership?.valid_until
                                                    ? formatDate(activeChild.membership.valid_until)
                                                    : "-"}
                                            </p>

                                            <div className="pt-2">
                                                <Badge variant="secondary">
                                                    {activeChild.sessions?.count ?? 0} sessions left
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Button className="w-full rounded-2xl" variant="outline">
                                    Renew Membership
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
                            <CardHeader className="p-6">
                                <SectionTitle
                                    eyebrow="Child Profile"
                                    title="Student Information"
                                    description="Informasi dasar anak."
                                />
                            </CardHeader>

                            <CardContent className="space-y-4 p-6 pt-0">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-16 w-16 shrink-0">
                                        {resolveAssetUrl(activeChild.photo) ? (
                                            <AvatarImage src={resolveAssetUrl(activeChild.photo)!} />
                                        ) : null}
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                            {activeChild.name.slice(0, 1)}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="min-w-0">
                                        <h3 className="truncate text-xl font-bold text-slate-900">
                                            {activeChild.name}
                                        </h3>
                                        <p className="text-sm text-slate-500">
                                            {activeChild.age} years old
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-3 pt-2">
                                    <div className="rounded-2xl bg-slate-50 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Branch
                                        </p>
                                        <p className="mt-1 font-semibold text-slate-900">
                                            {activeChild.branch?.name ?? "-"}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl bg-slate-50 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Gender
                                        </p>
                                        <p className="mt-1 font-semibold capitalize text-slate-900">
                                            {activeChild.gender}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-3xl border-dashed border-slate-300 bg-slate-50 shadow-none">
                            <CardContent className="flex flex-col items-center justify-center p-10 text-center">
                                <BookOpen className="h-10 w-10 text-slate-300" />

                                <h3 className="mt-4 text-lg font-bold text-slate-900">
                                    Coach Notes Coming Soon
                                </h3>

                                <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
                                    Feedback dan evaluasi coach akan tampil di sini.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    )
}
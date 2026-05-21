"use client"

import * as React from "react"
import Link from "next/link"
import {
    ArrowRight,
    Bell,
    BookOpen,
    CalendarDays,
    CreditCard,
    Loader2,
    MapPin,
    UserRound,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Cookies from 'js-cookie'

import { SectionTitle } from "./section-title"

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface ParentResponse {
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

interface Child {
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

interface UpcomingSchedule {
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

function formatDate(date: string) {
    return new Intl.DateTimeFormat("id-ID", {
        weekday: "short",
        day: "numeric",
        month: "short",
    }).format(new Date(date))
}

function formatTime(time: string) {
    return time.slice(0, 5)
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function ParentDashboard() {
    const [data, setData] = React.useState<ParentResponse | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState("")
    const [activeChildId, setActiveChildId] = React.useState<number | null>(null)

    React.useEffect(() => {
        async function fetchDashboard() {
            try {
                setLoading(true)

                const token = Cookies.get('token');

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/dashboard/parent`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch parent dashboard")
                }

                const result: ParentResponse = await response.json()

                setData(result)
                setActiveChildId(result.active_child_id)
            } catch (err) {
                console.error(err)
                setError("Failed to load dashboard")
            } finally {
                setLoading(false)
            }
        }

        fetchDashboard()
    }, [])

    const activeChild =
        data?.children.find((child) => child.id === activeChildId) ??
        data?.children[0]

    // ─────────────────────────────────────────
    // Loading
    // ─────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="flex items-center gap-3 text-slate-500">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading dashboard...
                </div>
            </div>
        )
    }

    // ─────────────────────────────────────────
    // Error
    // ─────────────────────────────────────────

    if (error || !data) {
        return (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600">
                {error || "Something went wrong"}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* ───────────────── Hero ───────────────── */}
            <Card className="overflow-hidden rounded-3xl border-slate-200 bg-gradient-to-br from-primary via-primary/90 to-secondary text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
                <CardHeader className="p-6 md:p-8">
                    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                        <div>
                            <Badge className="inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-4 py-2 text-white">
                                <UserRound className="mr-2 h-4 w-4" />
                                Parent Dashboard
                            </Badge>

                            <h1 className="mt-5 text-4xl font-extrabold tracking-tight md:text-5xl">
                                Hello, {data.parent.name}
                            </h1>

                            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
                                Monitor jadwal latihan, membership, dan perkembangan
                                anak dalam satu dashboard.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <Button
                                size="lg"
                                variant="secondary"
                                className="rounded-2xl"
                            >
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

            {/* ───────────────── Child Switcher ───────────────── */}
            <div className="flex gap-3 overflow-x-auto pb-2">
                {data.children.map((child) => {
                    const isActive = child.id === activeChild?.id

                    return (
                        <button
                            key={child.id}
                            onClick={() => setActiveChildId(child.id)}
                            className={`
                flex min-w-[240px] items-center gap-3 rounded-[1.5rem]
                border px-4 py-3 text-left shadow-sm transition
                ${isActive
                                    ? "border-primary bg-primary text-white"
                                    : "border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5"
                                }
              `}
                        >
                            <Avatar className="h-12 w-12">
                                {child.photo ? (
                                    <AvatarImage src={child.photo} />
                                ) : null}

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
                                <p className="truncate font-semibold">
                                    {child.name}
                                </p>

                                <p
                                    className={`text-sm ${isActive
                                        ? "text-white/80"
                                        : "text-slate-500"
                                        }`}
                                >
                                    {child.age} years old
                                </p>
                            </div>
                        </button>
                    )
                })}
            </div>

            {/* ───────────────── Main Grid ───────────────── */}
            {activeChild && (
                <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                    {/* LEFT */}
                    <div className="space-y-6">
                        {/* Next Class */}
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
                                                {formatTime(
                                                    activeChild.next_class.start_time
                                                )}{" "}
                                                -{" "}
                                                {formatTime(
                                                    activeChild.next_class.end_time
                                                )}
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

                        {/* Upcoming Schedule */}
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
                                            <div>
                                                <p className="font-semibold text-slate-900">
                                                    {schedule.name}
                                                </p>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    {formatDate(schedule.date)} •{" "}
                                                    {formatTime(schedule.start_time)} -{" "}
                                                    {formatTime(schedule.end_time)}
                                                </p>
                                            </div>

                                            <Button size="sm" variant="outline">
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

                    {/* RIGHT */}
                    <div className="space-y-6">
                        {/* Membership */}
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
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                                            <CreditCard className="h-5 w-5 text-primary" />
                                        </div>

                                        <div className="space-y-2">
                                            <p className="font-semibold text-slate-900">
                                                {activeChild.membership?.status ===
                                                    "active"
                                                    ? "Membership Active"
                                                    : "No Active Membership"}
                                            </p>

                                            <p className="text-sm text-slate-500">
                                                Valid until{" "}
                                                {activeChild.membership?.valid_until
                                                    ? formatDate(
                                                        activeChild.membership
                                                            .valid_until
                                                    )
                                                    : "-"}
                                            </p>

                                            <div className="pt-2">
                                                <Badge variant="secondary">
                                                    {activeChild.sessions?.count ?? 0}{" "}
                                                    sessions left
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    className="w-full rounded-2xl"
                                    variant="outline"
                                >
                                    Renew Membership
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Child Info */}
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
                                    <Avatar className="h-16 w-16">
                                        {activeChild.photo ? (
                                            <AvatarImage src={activeChild.photo} />
                                        ) : null}

                                        <AvatarFallback className="bg-primary/10 text-primary">
                                            {activeChild.name.slice(0, 1)}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">
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

                        {/* Coach Note Placeholder */}
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
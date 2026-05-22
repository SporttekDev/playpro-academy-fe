"use client"

import * as React from "react"
import Cookies from "js-cookie"
import {
    ClipboardList,
    BadgeCheck,
    Building2,
    CalendarDays,
    Loader2,
    MapPin,
    School2,
    Sparkles,
    UserRound,
    Users,
} from "lucide-react"

import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader } from "../ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import MetricCard from "./metric-card"
import { SectionTitle } from "./section-title"
import MembershipBranchChart from "../membership-branch-chart"
import ScheduleRow from "./schedule-row"

type AdminDashboardResponse = {
    message: string
    admin: {
        id: number
        name: string
        email: string
        phone: string | null
        address: string | null
        role: string
    }
    metrics: {
        playkids: number
        coaches: number
        branches: number
        venues: number
        classes: number
        schedules_today: number
        expiring_memberships: number
        low_sessions: number
    }
    ongoing_now: {
        id: number
        time: string
        end_time: string
        title: string
        meta: string
        coach: string
        students: number
        quota: number
        status: "ongoing" | "upcoming" | "completed"
    } | null
    today_schedules: Array<{
        id: number
        time: string
        end_time: string
        title: string
        meta: string
        coach: string
        students: number
        quota: number
        status: "ongoing" | "upcoming" | "completed"
    }>
    recent_registrations: Array<{
        id: number
        name: string
        full_name: string
        parent_name: string | null
        gender: string
        created_at: string
        photo: string | null
    }>
    membership_expiring_soon: Array<{
        membership_id: number
        playkid_name: string
        parent_name: string | null
        branch_name: string | null
        valid_until: string
        days_left: number
    }>
    sessions_running_low: Array<{
        membership_id: number
        playkid_name: string
        parent_name: string | null
        branch_name: string | null
        sessions_left: number
        expiry_date: string | null
    }>
    analytics: {
        weekly_schedule_trend: Array<{ label: string; value: number }>
        sport_breakdown: Array<{ label: string; value: number }>
        active_memberships_by_branch: Array<{ id: number; name: string; total_active_memberships: number }>
    }
}

function resolveAssetUrl(path?: string | null) {
    if (!path) return null
    if (path.startsWith("http")) return path

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? ""
    const baseUrl = apiUrl.replace(/\/api\/?$/, "")

    return `${baseUrl}/${path.replace(/^\/+/, "")}`
}

function formatTime(time: string) {
    return time.slice(0, 5)
}

function formatDate(date: string) {
    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(date))
}

function MiniChart({
    title,
    description,
    data,
}: {
    title: string
    description: string
    data: Array<{ label: string; value: number }>
}) {
    const max = Math.max(...data.map((item) => item.value), 1)

    return (
        <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                            {description}
                        </p>
                    </div>
                    <Badge className="rounded-full bg-primary/10 text-primary hover:bg-primary/10">
                        Analytics
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="p-6 pt-0">
                <div className="flex h-52 items-end gap-3">
                    {data.map((item) => {
                        const height = Math.max(12, Math.round((item.value / max) * 100))

                        return (
                            <div key={item.label} className="flex flex-1 flex-col items-center gap-3">
                                <div className="flex h-40 w-full items-end rounded-2xl bg-slate-100 p-2">
                                    <div
                                        className="w-full rounded-2xl bg-gradient-to-t from-primary to-secondary"
                                        style={{ height: `${height}%` }}
                                    />
                                </div>
                                <span className="text-xs font-medium text-slate-500">
                                    {item.label}
                                </span>
                                <span className="text-xs font-semibold text-slate-900">
                                    {item.value}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}

function WarningListCard({
    title,
    description,
    items,
    type,
}: {
    title: string
    description: string
    items: Array<{
        membership_id: number
        playkid_name: string
        parent_name: string | null
        branch_name: string | null
        valid_until?: string
        days_left?: number
        sessions_left?: number
        expiry_date?: string | null
    }>
    type: "membership" | "session"
}) {

    return (
        <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="p-6">
                <SectionTitle
                    eyebrow="Attention"
                    title={title}
                    description={description}
                />
            </CardHeader>

            <CardContent className="p-6 pt-0">
                <div className="max-h-[26rem] space-y-3 overflow-y-auto pr-1">
                    {items.length > 0 ? (
                        items.map((item) => (
                            <div
                                key={item.membership_id}
                                className="rounded-2xl border border-slate-200 bg-white p-4"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="font-semibold text-slate-900">
                                            {item.playkid_name}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Parent: {item.parent_name ?? "-"}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Branch: {item.branch_name ?? "-"}
                                        </p>

                                        {type === "membership" ? (
                                            <p className="mt-2 text-xs text-slate-400">
                                                Valid until{" "}
                                                {item.valid_until ? formatDate(item.valid_until) : "-"}
                                            </p>
                                        ) : (
                                            <p className="mt-2 text-xs text-slate-400">
                                                Latest session expiry:{" "}
                                                {item.expiry_date ? formatDate(item.expiry_date) : "-"}
                                            </p>
                                        )}
                                    </div>

                                    <Badge
                                        className={
                                            type === "membership"
                                                ? "rounded-full bg-amber-500/10 text-amber-700"
                                                : "rounded-full bg-rose-500/10 text-rose-700"
                                        }
                                    >
                                        {type === "membership"
                                            ? `${item.days_left ?? 0} days left`
                                            : `${item.sessions_left ?? 0} left`}
                                    </Badge>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">
                            No items to show
                        </div>
                    )}
                </div>

                {/* {items.length > 4 ? (
                    <p className="mt-3 text-center text-xs text-slate-400">
                        Showing 4 of {items.length} items
                    </p>
                ) : null} */}
            </CardContent>
        </Card>
    )
}

export default function AdminDashboard({ name }: { name: string }) {
    const [data, setData] = React.useState<AdminDashboardResponse | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState("")

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
                    `${process.env.NEXT_PUBLIC_API_URL}/dashboard/admin`,
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
                        result?.message ?? "Failed to load admin dashboard"
                    )
                }

                const result: AdminDashboardResponse = await response.json()
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
                    Loading admin dashboard...
                </div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
                {error || "Failed to load admin dashboard"}
            </div>
        )
    }

    const ongoing = data.ongoing_now

    return (
        <div className="space-y-6">
            <Card className="overflow-hidden rounded-3xl border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-primary text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
                <CardHeader className="p-6 md:p-8">
                    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                        <div>
                            <Badge className="inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-4 py-2 text-white">
                                <UserRound className="mr-2 h-4 w-4" />
                                Admin Dashboard
                            </Badge>

                            <h1 className="mt-5 text-4xl font-extrabold tracking-tight md:text-5xl">
                                Good morning, {data.admin.name}
                            </h1>

                            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">
                                Monitor playkids, coaches, classes, branches, venues, and today&apos;s
                                operational flow in one clean workspace.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <Button size="lg" variant="secondary" className="rounded-2xl">
                                Manage PlayKids
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white hover:text-slate-900"
                            >
                                View Reports
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                <MetricCard
                    title="Total PlayKids"
                    value={`${data.metrics.playkids}`}
                    note="Registered children"
                    icon={Users}
                    trend="Live"
                />
                <MetricCard
                    title="Active Coaches"
                    value={`${data.metrics.coaches}`}
                    note="Coach accounts"
                    icon={BadgeCheck}
                    trend="Active"
                />
                <MetricCard
                    title="Branches"
                    value={`${data.metrics.branches}`}
                    note="Operating branches"
                    icon={Building2}
                    trend="Stable"
                />
                <MetricCard
                    title="Venues"
                    value={`${data.metrics.venues}`}
                    note="Training venues"
                    icon={MapPin}
                    trend="Ready"
                />
                <MetricCard
                    title="Classes"
                    value={`${data.metrics.classes}`}
                    note="Available classes"
                    icon={School2}
                    trend="Managed"
                />
                <MetricCard
                    title="Schedules Today"
                    value={`${data.metrics.schedules_today}`}
                    note="Classes for today"
                    icon={CalendarDays}
                    trend="Today"
                />
                <MetricCard
                    title="Expiring Memberships"
                    value={`${data.metrics.expiring_memberships}`}
                    note="Within 14 days"
                    icon={Sparkles}
                    trend="Attention"
                />
                <MetricCard
                    title="Low Sessions"
                    value={`${data.metrics.low_sessions}`}
                    note="2 sessions or less"
                    icon={ClipboardList}
                    trend="Attention"
                />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-6">
                    <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
                        <CardHeader className="p-6">
                            <SectionTitle
                                eyebrow="Live"
                                title="Ongoing Session"
                                description="Current class that is happening right now."
                            />
                        </CardHeader>

                        <CardContent className="p-6 pt-0">
                            {ongoing ? (
                                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-semibold text-emerald-700">
                                                {formatTime(ongoing.time)} - {formatTime(ongoing.end_time)}
                                            </p>
                                            <h3 className="mt-2 text-2xl font-extrabold text-slate-900">
                                                {ongoing.title}
                                            </h3>
                                            <p className="mt-2 text-sm text-slate-600">
                                                {ongoing.meta}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {ongoing.coach} • {ongoing.students}/{ongoing.quota} students
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                            <Button className="rounded-2xl">Open Class</Button>
                                            <Button variant="outline" className="rounded-2xl">
                                                View Roster
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-3xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">
                                    No ongoing session right now
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
                        <CardHeader className="p-6">
                            <SectionTitle
                                eyebrow="Today"
                                title="Today's Schedule"
                                description="All schedules created for today."
                            />
                        </CardHeader>

                        <CardContent className="space-y-4 p-6 pt-0">
                            {data.today_schedules.length > 0 ? (
                                data.today_schedules.map((item) => (
                                    <ScheduleRow
                                        key={item.id}
                                        time={`${item.time} - ${item.end_time}`}
                                        title={item.title}
                                        meta={item.meta}
                                        coach={item.coach}
                                        students={item.students}
                                        status={item.status}
                                    />
                                ))
                            ) : (
                                <div className="rounded-3xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">
                                    No schedules available today
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="grid gap-6 2xl:grid-cols-2">
                        <WarningListCard
                            type="membership"
                            title="Membership Expiring Soon"
                            description="Active memberships that will expire within 14 days."
                            items={data.membership_expiring_soon}
                        />

                        <WarningListCard
                            type="session"
                            title="Sessions Running Low"
                            description="Active memberships with 2 sessions or less."
                            items={data.sessions_running_low}
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <MembershipBranchChart data={data.analytics.active_memberships_by_branch} />
                    <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
                        <CardHeader className="p-6">
                            <SectionTitle
                                eyebrow="Live Feed"
                                title="Recent Registrations"
                                description="Latest children registered in the system."
                            />
                        </CardHeader>

                        <CardContent className="space-y-3 p-6 pt-0">
                            {data.recent_registrations.length > 0 ? (
                                data.recent_registrations.map((item) => {
                                    const photo = resolveAssetUrl(item.photo)

                                    return (
                                        <div
                                            key={item.id}
                                            className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4"
                                        >
                                            <div className="flex items-start gap-3">
                                                <Avatar className="h-11 w-11">
                                                    {photo ? <AvatarImage src={photo} /> : null}
                                                    <AvatarFallback className="bg-primary/10 text-primary">
                                                        {item.name.slice(0, 1)}
                                                    </AvatarFallback>
                                                </Avatar>

                                                <div>
                                                    <p className="font-semibold text-slate-900">
                                                        {item.name}
                                                    </p>
                                                    <p className="mt-1 text-sm text-slate-500">
                                                        Parent: {item.parent_name ?? "-"}
                                                    </p>
                                                </div>
                                            </div>

                                            <Badge className="rounded-full bg-slate-100 text-slate-700">
                                                New
                                            </Badge>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-500">
                                    No recent registrations
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <MiniChart
                        title="Weekly Schedule Trend"
                        description="How many schedules are set across this week."
                        data={data.analytics.weekly_schedule_trend}
                    />

                    <MiniChart
                        title="Sports Distribution"
                        description="Sport variety used across this week."
                        data={data.analytics.sport_breakdown}
                    />

                </div>
            </div>
        </div>
    )
}
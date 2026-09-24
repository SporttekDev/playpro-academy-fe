"use client"

import * as React from "react"
import Cookies from "js-cookie"
import {
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    Banknote,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Loader2,
    UserRoundX,
    Wallet,
} from "lucide-react"

import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader } from "../ui/card"
import MetricCard from "./metric-card"
import { SectionTitle } from "./section-title"

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type FinanceDashboardResponse = {
    period: { month: number; year: number }
    summary: {
        total_amount: number
        coach_paid_count: number
        status_breakdown: { draft: number; final: number; paid: number }
    }
    comparison: {
        previous_month: number
        previous_year: number
        previous_total_amount: number
        growth_amount: number
        growth_percent: number | null
    }
    coach_not_generated: { count: number }
    items_needing_review: { count: number }
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
]

function formatCurrency(value: number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(value)
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function FinanceDashboard({ name }: { name: string }) {
    const now = React.useMemo(() => new Date(), [])
    const [month, setMonth] = React.useState(now.getMonth() + 1)
    const [year, setYear] = React.useState(now.getFullYear())

    const [data, setData] = React.useState<FinanceDashboardResponse | null>(null)
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
                    `${process.env.NEXT_PUBLIC_API_URL}/dashboard/finance?month=${month}&year=${year}`,
                    {
                        method: "GET",
                        headers: {
                            Accept: "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        signal: controller.signal,
                    }
                )
                console.log("Finance dashboard response status:", response.status)

                if (response.status === 401) {
                    throw new Error("Unauthorized. Please login again.")
                }
                if (response.status === 403) {
                    throw new Error("You don't have access to the finance dashboard.")
                }

                if (!response.ok) {
                    const result = await response.json().catch(() => null)
                    throw new Error(result?.message ?? "Failed to load finance dashboard")
                }

                const result = await response.json()
                setData(result.data)
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
    }, [month, year])

    function goToPreviousMonth() {
        if (month === 1) {
            setMonth(12)
            setYear((y) => y - 1)
        } else {
            setMonth((m) => m - 1)
        }
    }

    function goToNextMonth() {
        if (month === 12) {
            setMonth(1)
            setYear((y) => y + 1)
        } else {
            setMonth((m) => m + 1)
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div className="flex items-center gap-3 text-slate-500">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading finance dashboard...
                </div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
                {error || "Failed to load finance dashboard"}
            </div>
        )
    }

    const isPositiveGrowth = data.comparison.growth_amount >= 0

    return (
        <div className="space-y-6">
            <Card className="overflow-hidden rounded-3xl border-slate-200 bg-gradient-to-br from-emerald-950 via-emerald-900 to-primary text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
                <CardHeader className="p-5 sm:p-6 md:p-8">
                    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                        <div className="min-w-0">
                            <Badge className="inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white sm:px-4 sm:py-2 sm:text-sm">
                                <Wallet className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                Finance Dashboard
                            </Badge>

                            <h1 className="mt-4 text-2xl font-extrabold tracking-tight sm:mt-5 sm:text-3xl md:text-4xl lg:text-5xl">
                                Hi, {name}
                            </h1>

                            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80 sm:mt-4 sm:text-base md:text-lg">
                                Payroll overview for coaches — track totals, pending reviews, and monthly trends.
                            </p>
                        </div>

                        <div className="flex items-center justify-start gap-3 lg:justify-end">
                            <Button
                                size="icon"
                                variant="outline"
                                className="rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white hover:text-slate-900"
                                onClick={goToPreviousMonth}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold">
                                <CalendarDays className="h-4 w-4" />
                                {MONTH_NAMES[month - 1]} {year}
                            </div>

                            <Button
                                size="icon"
                                variant="outline"
                                className="rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white hover:text-slate-900"
                                onClick={goToNextMonth}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                <MetricCard
                    title="Total Payroll"
                    value={formatCurrency(data.summary.total_amount)}
                    note={`${MONTH_NAMES[month - 1]} ${year}`}
                    icon={Banknote}
                    trend="This month"
                />
                <MetricCard
                    title="Coach Paid"
                    value={`${data.summary.coach_paid_count}`}
                    note="Payroll status: paid"
                    icon={ClipboardList}
                    trend="Completed"
                />
                <MetricCard
                    title="Not Generated"
                    value={`${data.coach_not_generated.count}`}
                    note="Coaches without payroll yet"
                    icon={UserRoundX}
                    trend="Attention"
                />
                <MetricCard
                    title="Needs Review"
                    value={`${data.items_needing_review.count}`}
                    note="No-show / incomplete items"
                    icon={AlertTriangle}
                    trend="Attention"
                />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
                    <CardHeader className="p-6">
                        <SectionTitle
                            eyebrow="Status"
                            title="Payroll Status Breakdown"
                            description="Distribution of payroll periods by status this month."
                        />
                    </CardHeader>

                    <CardContent className="grid grid-cols-3 gap-4 p-6 pt-0">
                        <div className="rounded-2xl border border-slate-200 p-5 text-center">
                            <p className="text-3xl font-extrabold text-slate-900">
                                {data.summary.status_breakdown.draft}
                            </p>
                            <p className="mt-2 text-sm font-medium text-slate-500">Draft</p>
                        </div>
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
                            <p className="text-3xl font-extrabold text-amber-700">
                                {data.summary.status_breakdown.final}
                            </p>
                            <p className="mt-2 text-sm font-medium text-amber-700">Final</p>
                        </div>
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
                            <p className="text-3xl font-extrabold text-emerald-700">
                                {data.summary.status_breakdown.paid}
                            </p>
                            <p className="mt-2 text-sm font-medium text-emerald-700">Paid</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
                    <CardHeader className="p-6">
                        <SectionTitle
                            eyebrow="Trend"
                            title="Compared to Last Month"
                            description={`vs ${MONTH_NAMES[data.comparison.previous_month - 1]} ${data.comparison.previous_year}`}
                        />
                    </CardHeader>

                    <CardContent className="p-6 pt-0">
                        <div className="rounded-2xl bg-slate-50 p-5">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Previous total
                            </p>
                            <p className="mt-1 font-semibold text-slate-900">
                                {formatCurrency(data.comparison.previous_total_amount)}
                            </p>

                            <div
                                className={`mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${isPositiveGrowth
                                        ? "bg-emerald-500/10 text-emerald-700"
                                        : "bg-rose-500/10 text-rose-700"
                                    }`}
                            >
                                {isPositiveGrowth ? (
                                    <ArrowUpRight className="h-4 w-4" />
                                ) : (
                                    <ArrowDownRight className="h-4 w-4" />
                                )}
                                {formatCurrency(Math.abs(data.comparison.growth_amount))}
                                {data.comparison.growth_percent !== null
                                    ? ` (${data.comparison.growth_percent}%)`
                                    : ""}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
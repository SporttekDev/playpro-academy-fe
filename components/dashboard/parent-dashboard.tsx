import { Bell, BookOpen, CheckCircle2, CreditCard, FileText, MapPin, MessageCircle, TrendingUp, UserRound } from "lucide-react"
import { Badge } from "../ui/badge"
import { Card, CardContent, CardHeader } from "../ui/card"
import { Button } from "../ui/button"
import { Avatar, AvatarFallback } from "../ui/avatar"
import MetricCard from "./metric-card"
import { SectionTitle } from "./section-title"
import { Progress } from "../ui/progress"
import React from "react"

const parentChildren = [
    {
        name: "Ethan",
        age: "8 years",
        program: "Junior Basketball",
        branch: "Bandung",
        coach: "Coach Daniel",
        nextClass: "Today • 16:00",
        attendance: 92,
        streak: 6,
        sessionsLeft: 12,
        membership: "Active until Aug 2026",
        progress: [
            { label: "Coordination", value: 78 },
            { label: "Confidence", value: 84 },
            { label: "Teamwork", value: 88 },
        ],
        schedule: [
            { day: "Today", time: "16:00", label: "Junior Basketball" },
            { day: "Thu", time: "16:00", label: "Junior Basketball" },
            { day: "Sat", time: "09:00", label: "Evaluation Class" },
        ],
        note: "Ethan showed strong focus and better dribbling control this week.",
    },
    {
        name: "Mila",
        age: "5 years",
        program: "Toddler Soccer",
        branch: "Bekasi",
        coach: "Coach Amanda",
        nextClass: "Sat • 10:00",
        attendance: 88,
        streak: 4,
        sessionsLeft: 8,
        membership: "Active until Sep 2026",
        progress: [
            { label: "Motor Skills", value: 72 },
            { label: "Listening", value: 80 },
            { label: "Social Growth", value: 76 },
        ],
        schedule: [
            { day: "Sat", time: "10:00", label: "Toddler Soccer" },
            { day: "Sun", time: "09:00", label: "Toddler Tennis" },
            { day: "Wed", time: "17:00", label: "Fun Play Session" },
        ],
        note: "Mila is more confident joining group activities and following simple instructions.",
    },
]

const parentNotifications = [
    {
        title: "New progress report is ready",
        description: "Coach Daniel uploaded Ethan&apos;s weekly evaluation notes.",
        icon: FileText,
        tone: "success" as const,
    },
    {
        title: "Schedule reminder",
        description: "Mila has a class this Saturday at 10:00.",
        icon: Bell,
        tone: "default" as const,
    },
    {
        title: "Membership renewal coming soon",
        description: "Ethan&apos;s package will renew in 18 days.",
        icon: CreditCard,
        tone: "warning" as const,
    },
]


export default function ParentDashboard({ name }: { name: string }) {
    const [activeChildIndex, setActiveChildIndex] = React.useState(0)
    const activeChild = parentChildren[activeChildIndex] ?? parentChildren[0]

    return (
        <div className="space-y-6">
            <Card className="overflow-hidden rounded-3xl border-slate-200 bg-gradient-to-br from-secondary via-orange-400 to-amber-300 text-white shadow-[0_20px_60px_rgba(249,115,22,0.18)]">
                <CardHeader className="p-6 md:p-8">
                    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                        <div>
                            <Badge className="inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-4 py-2 text-white">
                                <UserRound className="mr-2 h-4 w-4" />
                                Parent Dashboard
                            </Badge>

                            <h1 className="mt-5 text-4xl font-extrabold tracking-tight md:text-5xl">
                                Hello, {name}
                            </h1>

                            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
                                Track your children&apos;s classes, attendance, progress, and membership
                                in one friendly family dashboard.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <Button size="lg" variant="secondary" className="rounded-2xl">
                                View Schedule
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white hover:text-primary"
                            >
                                Contact Admin
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <div className="flex gap-3 overflow-x-auto pb-2">
                {parentChildren.map((child, index) => {
                    const isActive = index === activeChildIndex

                    return (
                        <button
                            key={child.name}
                            onClick={() => setActiveChildIndex(index)}
                            className={`
                  flex min-w-[220px] items-center gap-3 rounded-[1.5rem]
                  border px-4 py-3 text-left shadow-sm transition
                  ${isActive
                                    ? "border-primary bg-primary text-white"
                                    : "border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5"
                                }
                `}
                        >
                            <Avatar className="h-11 w-11">
                                <AvatarFallback
                                    className={
                                        isActive ? "bg-white/15 text-white" : "bg-primary/10 text-primary"
                                    }
                                >
                                    {child.name.slice(0, 1)}
                                </AvatarFallback>
                            </Avatar>

                            <div className="min-w-0">
                                <p className="font-semibold">{child.name}</p>
                                <p className={`text-sm ${isActive ? "text-white/80" : "text-slate-500"}`}>
                                    {child.program}
                                </p>
                            </div>
                        </button>
                    )
                })}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                    title="Attendance"
                    value={`${activeChild.attendance}%`}
                    note="Current class attendance score"
                    icon={CheckCircle2}
                    trend="Good"
                />
                <MetricCard
                    title="Streak"
                    value={`${activeChild.streak} weeks`}
                    note="Consistent participation streak"
                    icon={TrendingUp}
                    trend="Strong"
                />
                <MetricCard
                    title="Sessions Left"
                    value={`${activeChild.sessionsLeft}`}
                    note="Remaining visits in membership"
                    icon={BookOpen}
                    trend="Active"
                />
                <MetricCard
                    title="Current Branch"
                    value={activeChild.branch}
                    note={`Coach: ${activeChild.coach}`}
                    icon={MapPin}
                    trend="On site"
                />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-6">
                    <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
                        <CardHeader className="p-6">
                            <SectionTitle
                                eyebrow="Next Class"
                                title="Upcoming Training"
                                description="What your child will attend next."
                            />
                        </CardHeader>

                        <CardContent className="p-6 pt-0">
                            <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-white to-secondary/10 p-6">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                                            {activeChild.nextClass}
                                        </p>
                                        <h3 className="mt-3 text-3xl font-extrabold text-slate-900">
                                            {activeChild.program}
                                        </h3>
                                        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
                                            Hosted at {activeChild.branch} with {activeChild.coach}.
                                        </p>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button size="lg" className="rounded-2xl">
                                            Book Trial
                                        </Button>
                                        <Button variant="outline" size="lg" className="rounded-2xl">
                                            View Schedule
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
                        <CardHeader className="p-6">
                            <SectionTitle
                                eyebrow="Development"
                                title="Progress Snapshot"
                                description="A simple overview of your child&apos;s latest development."
                            />
                        </CardHeader>

                        <CardContent className="space-y-5 p-6 pt-0">
                            {activeChild.progress.map((item) => (
                                <div key={item.label} className="space-y-2">
                                    <div className="flex items-center justify-between gap-4">
                                        <p className="text-sm font-medium text-slate-700">{item.label}</p>
                                        <p className="text-sm font-semibold text-slate-900">{item.value}%</p>
                                    </div>
                                    <Progress value={item.value} className="h-3" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
                        <CardHeader className="p-6">
                            <SectionTitle
                                eyebrow="Coach Feedback"
                                title="Latest Notes"
                                description={`Recent feedback from ${activeChild.coach}.`}
                            />
                        </CardHeader>

                        <CardContent className="p-6 pt-0">
                            <div className="rounded-2xl bg-slate-50 p-5">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                                        <MessageCircle className="h-5 w-5 text-primary" />
                                    </div>

                                    <p className="text-sm leading-relaxed text-slate-700">
                                        {activeChild.note}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
                        <CardHeader className="p-6">
                            <SectionTitle
                                eyebrow="Membership"
                                title="Package Status"
                                description="Current plan and remaining package."
                            />
                        </CardHeader>

                        <CardContent className="space-y-4 p-6 pt-0">
                            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
                                    <CreditCard className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">{activeChild.membership}</p>
                                    <p className="text-sm text-slate-500">
                                        {activeChild.sessionsLeft} sessions remaining
                                    </p>
                                </div>
                            </div>

                            <Button className="w-full rounded-2xl" variant="outline">
                                Renew Membership
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
import { AlertTriangle, CalendarDays, CheckCircle2, ClipboardList, MessageCircle, Target, Users } from "lucide-react";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import MetricCard from "./metric-card";
import { SectionTitle } from "./section-title";
import ScheduleRow from "./schedule-row";

const coachMetrics = [
    {
        title: "Classes Today",
        value: "4",
        note: "One class currently ongoing",
        icon: CalendarDays,
        trend: "Today",
    },
    {
        title: "Attendance Submitted",
        value: "3",
        note: "Pending reports still open",
        icon: CheckCircle2,
        trend: "75%",
    },
    {
        title: "Students Seen",
        value: "47",
        note: "Across today’s sessions",
        icon: Users,
        trend: "+8",
    },
    {
        title: "Needs Follow-Up",
        value: "5",
        note: "Students requiring notes",
        icon: Target,
        trend: "Attention",
    },
]

const coachSchedule = [
    {
        time: "08:00",
        title: "Toddler Soccer",
        meta: "Decathlon Pondok Indah • Group A",
        coach: "Coach You",
        students: 11,
        status: "ongoing" as const,
    },
    {
        time: "10:00",
        title: "Junior Basketball",
        meta: "Bakjer Arena Bandung • Court 2",
        coach: "Coach You",
        students: 14,
        status: "upcoming" as const,
    },
    {
        time: "14:00",
        title: "Toddler Tennis",
        meta: "HiPlay Arena Jakarta • Mini Court",
        coach: "Coach You",
        students: 9,
        status: "upcoming" as const,
    },
    {
        time: "16:00",
        title: "Junior Soccer",
        meta: "Estadio Arena Bekasi • Field B",
        coach: "Coach You",
        students: 13,
        status: "pending" as const,
    },
]

const coachAlerts = [
    {
        title: "Attendance from last class is pending",
        description: "Please submit the Toddler Soccer report before the end of day.",
        icon: ClipboardList,
        tone: "warning" as const,
    },
    {
        title: "One parent sent a question",
        description: "There is a new message waiting in your inbox.",
        icon: MessageCircle,
        tone: "default" as const,
    },
    {
        title: "Class room changed",
        description: "Junior Basketball moved to Court 1 due to venue maintenance.",
        icon: AlertTriangle,
        tone: "warning" as const,
    },
]

const coachStudents = [
    {
        name: "Ayla Putri",
        note: "Excellent teamwork during cone drills.",
        status: "Strong improvement",
    },
    {
        name: "Rafa Pratama",
        note: "Needs more focus on ball control.",
        status: "Follow up",
    },
    {
        name: "Nara Valen",
        note: "Very confident and expressive in warm-up.",
        status: "Great energy",
    },
    {
        name: "Kian Ardi",
        note: "Improving coordination and listening skills.",
        status: "On track",
    },
]



export default function CoachDashboard({ name }: { name: string }) {
    return (
        <div className="space-y-6">
            <Card className="overflow-hidden rounded-3xl border-slate-200 bg-gradient-to-br from-primary via-primary/95 to-cyan-500 text-white shadow-[0_20px_60px_rgba(59,130,246,0.18)]">
                <CardHeader className="p-6 md:p-8">
                    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                        <div>
                            <Badge className="inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-4 py-2 text-white">
                                <ClipboardList className="mr-2 h-4 w-4" />
                                Coach Dashboard
                            </Badge>

                            <h1 className="mt-5 text-4xl font-extrabold tracking-tight md:text-5xl">
                                Morning Coach, {name}
                            </h1>

                            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg">
                                Focus on today&apos;s classes, attendance, and student follow-up in one
                                action-oriented workspace.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <Button size="lg" variant="secondary" className="rounded-2xl">
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

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {coachMetrics.map((item) => (
                    <MetricCard
                        key={item.title}
                        title={item.title}
                        value={item.value}
                        note={item.note}
                        icon={item.icon}
                        trend={item.trend}
                    />
                ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-6">
                    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
                        <CardHeader className="p-6">
                            <SectionTitle
                                eyebrow="Live"
                                title="Class Ongoing Now"
                                description="The session currently in progress and ready for attendance input."
                            />
                        </CardHeader>

                        <CardContent className="p-6 pt-0">
                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-semibold text-emerald-700">
                                            08:00 - 09:00
                                        </p>
                                        <h3 className="mt-2 text-2xl font-extrabold text-slate-900">
                                            Toddler Soccer
                                        </h3>
                                        <p className="mt-2 text-sm text-slate-600">
                                            Decathlon Pondok Indah • Group A • 11 students
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <Button className="rounded-2xl">Take Attendance</Button>
                                        <Button variant="outline" className="rounded-2xl">
                                            Open Roster
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
                        <CardHeader className="p-6">
                            <SectionTitle
                                eyebrow="Today"
                                title="Today's Schedule"
                                description="Your classes for the day based on coach schedule assignments."
                            />
                        </CardHeader>

                        <CardContent className="space-y-4 p-6 pt-0">
                            {coachSchedule.map((item) => (
                                <ScheduleRow key={`${item.time}-${item.title}`} {...item} />
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">

                    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
                        <CardHeader className="p-6">
                            <SectionTitle
                                eyebrow="Follow Up"
                                title="Students to Review"
                                description="Quick notes for your next attendance report."
                            />
                        </CardHeader>

                        <CardContent className="space-y-3 p-6 pt-0">
                            {coachStudents.map((item) => (
                                <div
                                    key={item.name}
                                    className="rounded-2xl border border-slate-200 bg-white p-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-semibold text-slate-900">{item.name}</p>
                                            <p className="mt-1 text-sm leading-relaxed text-slate-600">
                                                {item.note}
                                            </p>
                                        </div>

                                        <Badge className="rounded-full bg-primary/10 text-primary">
                                            {item.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

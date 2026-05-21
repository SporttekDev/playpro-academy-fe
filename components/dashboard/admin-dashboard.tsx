import { AlertTriangle, BadgeCheck, Building2, CalendarDays, ClipboardList, Layers3, LayoutDashboard, MapPin, PlusCircle, Sparkles, UserRound, Users } from "lucide-react";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import MetricCard from "./metric-card";
import { SectionTitle } from "./section-title";
import ScheduleRow from "./schedule-row";
import QuickAction from "./quick-action";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { StatusBadge } from "./status-badge";
import { Separator } from "../ui/separator";

const adminKpis = [
    {
        title: "Total PlayKids",
        value: "1,248",
        note: "Active children across all branches",
        icon: Users,
        trend: "+12%",
    },
    {
        title: "Active Coaches",
        value: "18",
        note: "Coach accounts and assignments",
        icon: BadgeCheck,
        trend: "100%",
    },
    {
        title: "Classes Today",
        value: "24",
        note: "Schedules created for today",
        icon: CalendarDays,
        trend: "+4",
    },
    {
        title: "Branches",
        value: "7",
        note: "Operating locations and venues",
        icon: MapPin,
        trend: "Stable",
    },
    {
        title: "Sports",
        value: "8",
        note: "Available sports in the system",
        icon: Sparkles,
        trend: "Active",
    },
    {
        title: "Categories",
        value: "4",
        note: "Age and program categories",
        icon: Layers3,
        trend: "Managed",
    },
]

const adminClasses = [
    {
        time: "08:00",
        title: "Toddler Soccer",
        meta: "Decathlon Summarecon Bekasi • Venue A",
        coach: "Coach Amanda",
        students: 12,
        status: "ongoing" as const,
    },
    {
        time: "10:00",
        title: "Junior Basketball",
        meta: "Bakjer Arena Bandung • Court 2",
        coach: "Coach Daniel",
        students: 14,
        status: "upcoming" as const,
    },
    {
        time: "16:00",
        title: "Toddler Tennis",
        meta: "HiPlay Arena Jakarta Utara • Mini Court",
        coach: "Coach Olivia",
        students: 9,
        status: "upcoming" as const,
    },
    {
        time: "17:30",
        title: "Junior Soccer",
        meta: "Estadio Arena Bekasi • Field B",
        coach: "Coach Michael",
        students: 13,
        status: "pending" as const,
    },
]

const adminActivity = [
    {
        title: "New playkid registration",
        description: "A new family joined the junior basketball class in Bandung.",
        icon: UserRound,
        tone: "success" as const,
    },
    {
        title: "Attendance report pending",
        description: "Two reports from yesterday are still waiting for approval.",
        icon: ClipboardList,
        tone: "warning" as const,
    },
    {
        title: "Venue capacity alert",
        description: "Bekasi toddler venue is close to full for the weekend class.",
        icon: AlertTriangle,
        tone: "warning" as const,
    },
]

const adminQuickActions = [
    { icon: PlusCircle, label: "Add PlayKid", description: "Register a new playkid profile" },
    { icon: Users, label: "Manage Coaches", description: "Assign coach and branch coverage" },
    { icon: CalendarDays, label: "Manage Schedules", description: "Create and adjust class slots" },
    { icon: Building2, label: "Manage Branches", description: "Update branch information" },
    { icon: MapPin, label: "Manage Venues", description: "Edit venue address and capacity" },
    { icon: Sparkles, label: "Manage Sports", description: "Sports and program setup" },
]

const adminRegistrations = [
    {
        name: "Ayla Putri",
        program: "Toddler Soccer",
        branch: "Bekasi",
        time: "Today, 07:45",
        status: "Completed" as const,
    },
    {
        name: "Rafa Pratama",
        program: "Junior Basketball",
        branch: "Bandung",
        time: "Today, 08:10",
        status: "Pending" as const,
    },
    {
        name: "Nara Valen",
        program: "Toddler Tennis",
        branch: "Jakarta",
        time: "Today, 09:05",
        status: "New Trial" as const,
    },
    {
        name: "Kian Ardi",
        program: "Junior Soccer",
        branch: "BSD",
        time: "Today, 09:20",
        status: "Completed" as const,
    },
]


export default function AdminDashboard({ name }: { name: string }) {
    return (
        <div className="space-y-6">
            <Card className="overflow-hidden rounded-3xl border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-primary text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
                <CardHeader className="p-6 md:p-8">
                    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                        <div>
                            <Badge className="inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-4 py-2 text-white">
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                Admin Overview
                            </Badge>

                            <h1 className="mt-5 text-4xl font-extrabold tracking-tight md:text-5xl">
                                Good morning, {name}
                            </h1>

                            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">
                                Monitor playkids, coaches, classes, branches, venues, and today&apos;s
                                academy operation in one clean full-width dashboard.
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

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                {adminKpis.map((item) => (
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
                <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
                    <CardHeader className="p-6">
                        <SectionTitle
                            eyebrow="Today"
                            title="Today's Classes"
                            description="Live, upcoming, and pending sessions that need operational attention."
                        />
                    </CardHeader>

                    <CardContent className="space-y-4 p-6 pt-0">
                        {adminClasses.map((item) => (
                            <ScheduleRow key={`${item.time}-${item.title}`} {...item} />
                        ))}
                    </CardContent>
                </Card>

                <div className="space-y-6">

                    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
                        <CardHeader className="p-6">
                            <SectionTitle
                                eyebrow="Quick Access"
                                title="Management Shortcuts"
                                description="Fast access to the most common admin actions."
                            />
                        </CardHeader>

                        <CardContent className="grid gap-3 p-6 pt-0">
                            {adminQuickActions.map((item) => (
                                <QuickAction key={item.label} {...item} />
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
                <Card className="rounded-2xl border-slate-200 bg-white shadow-sm">
                    <CardHeader className="p-6">
                        <SectionTitle
                            eyebrow="Live Feed"
                            title="Recent Registrations"
                            description="Latest student and trial activity from the system."
                        />
                    </CardHeader>

                    <CardContent className="p-6 pt-0">
                        <div className="overflow-hidden rounded-[1.5rem] border border-slate-200">
                            {adminRegistrations.map((item, index) => (
                                <div key={item.name}>
                                    <div className="flex items-center justify-between gap-4 bg-white p-4">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarFallback className="bg-primary/10 text-primary">
                                                        {item.name
                                                            .split(" ")
                                                            .map((part) => part[0])
                                                            .join("")
                                                            .slice(0, 2)}
                                                    </AvatarFallback>
                                                </Avatar>

                                                <div className="min-w-0">
                                                    <p className="font-semibold text-slate-900">{item.name}</p>
                                                    <p className="text-sm text-slate-500">
                                                        {item.program} • {item.branch}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <StatusBadge
                                                status={
                                                    item.status === "Pending"
                                                        ? "pending"
                                                        : item.status === "New Trial"
                                                            ? "attention"
                                                            : "completed"
                                                }
                                            />
                                            <p className="mt-2 text-xs text-slate-500">{item.time}</p>
                                        </div>
                                    </div>

                                    {index !== adminRegistrations.length - 1 ? <Separator /> : null}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
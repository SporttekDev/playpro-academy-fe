import { ChevronRight } from "lucide-react"
import { StatusBadge } from "./status-badge"

export default function ScheduleRow({
    time,
    title,
    meta,
    coach,
    students,
    status,
}: {
    time: string
    title: string
    meta: string
    coach: string
    students: number
    status: "ongoing" | "upcoming" | "pending" | "completed" | "attention"
}) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="min-w-0">
                <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-slate-900">{time}</p>
                    <StatusBadge status={status} />
                </div>

                <h4 className="mt-2 font-bold text-slate-900">{title}</h4>
                <p className="mt-1 text-sm text-slate-500">{meta}</p>
                <p className="mt-2 text-xs text-slate-500">
                    {coach} • {students} students
                </p>
            </div>

            <ChevronRight className="h-5 w-5 text-slate-400" />
        </div>
    )
}
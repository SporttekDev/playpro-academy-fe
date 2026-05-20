import { Badge } from "@/components/ui/badge"

type Status =
    | "ongoing"
    | "upcoming"
    | "pending"
    | "completed"
    | "attention"

const statusClassMap = {
    ongoing: "bg-emerald-500/10 text-emerald-700",
    upcoming: "bg-primary/10 text-primary",
    pending: "bg-amber-500/10 text-amber-700",
    completed: "bg-slate-500/10 text-slate-600",
    attention: "bg-rose-500/10 text-rose-700",
}

const statusLabelMap = {
    ongoing: "Ongoing",
    upcoming: "Upcoming",
    pending: "Pending",
    completed: "Completed",
    attention: "Attention",
}

export function StatusBadge({
    status,
}: {
    status: Status
}) {
    return (
        <Badge
            className={`rounded-full border-0 ${statusClassMap[status]}`}
        >
            {statusLabelMap[status]}
        </Badge>
    )
}
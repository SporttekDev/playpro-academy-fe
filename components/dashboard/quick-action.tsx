import { ArrowRight } from "lucide-react"

export default function QuickAction({
    icon: Icon,
    label,
    description,
}: {
    icon: React.ElementType
    label: string
    description: string
}) {
    return (
        <button className="group flex w-full items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
                <p className="font-semibold text-slate-900">{label}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{description}</p>
            </div>
            <ArrowRight className="ml-auto mt-1 h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
        </button>
    )
}
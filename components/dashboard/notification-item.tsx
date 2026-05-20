export default function NotificationItem({
    title,
    description,
    icon: Icon,
    tone = "default",
}: {
    title: string
    description: string
    icon: React.ElementType
    tone?: "default" | "warning" | "success"
}) {
    const toneClass =
        tone === "warning"
            ? "bg-amber-500/10 text-amber-700"
            : tone === "success"
                ? "bg-emerald-500/10 text-emerald-700"
                : "bg-primary/10 text-primary"

    return (
        <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${toneClass}`}>
                <Icon className="h-5 w-5" />
            </div>

            <div className="min-w-0">
                <h4 className="font-semibold text-slate-900">{title}</h4>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    {description}
                </p>
            </div>
        </div>
    )
}
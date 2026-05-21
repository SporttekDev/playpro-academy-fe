import { Badge } from "../ui/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card"

export default function MetricCard({
    title,
    value,
    note,
    icon: Icon,
    trend,
}: {
    title: string
    value: string
    note: string
    icon: React.ElementType
    trend?: string
}) {
    return (
        <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="space-y-4 p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                    </div>

                    {trend ? (
                        <Badge className="rounded-full bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10">
                            {trend}
                        </Badge>
                    ) : null}
                </div>

                <div>
                    <CardDescription className="text-sm text-slate-500">
                        {title}
                    </CardDescription>

                    <CardTitle className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                        {value}
                    </CardTitle>

                    <p className="mt-2 text-xs font-medium text-slate-500">{note}</p>
                </div>
            </CardHeader>
        </Card>
    )
}
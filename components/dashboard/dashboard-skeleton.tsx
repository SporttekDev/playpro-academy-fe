import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
    return (
        <div className="w-full space-y-6 px-4 py-6 lg:px-6">
            <Skeleton className="h-28 w-full rounded-2xl" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="rounded-2xl p-6">
                        <Skeleton className="h-24 w-full" />
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <Skeleton className="h-[28rem] w-full rounded-2xl" />
                <Skeleton className="h-[28rem] w-full rounded-2xl" />
            </div>
        </div>
    )
}
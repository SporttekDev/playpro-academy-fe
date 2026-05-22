"use client"

import * as React from "react"
import {
    Bar,
    BarChart,
    CartesianGrid,
    XAxis,
    YAxis,
} from "recharts"

import { Card, CardContent, CardHeader } from "./ui/card"
import { SectionTitle } from './dashboard/section-title';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "./ui/chart"

type BranchMembershipItem = {
    id: number
    name: string
    total_active_memberships: number
}

type Props = {
    data: BranchMembershipItem[]
}

const chartConfig = {
    active: {
        color: "var(--chart-1)",
    },
} satisfies ChartConfig

export default function MembershipBranchChart({ data }: Props) {
    const chartData = data.map((item) => ({
        branch: item.name,
        active: item.total_active_memberships,
    }))

    return (
        <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="p-6">
                <SectionTitle
                    eyebrow="Analytics"
                    title="Active Memberships by Branch"
                    description="Jumlah membership aktif di masing-masing branch."
                />
            </CardHeader>

            <CardContent className="p-6 pt-0">
                <ChartContainer config={chartConfig} className="min-h-[320px] w-full">
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                        margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="branch"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            interval={0}
                            tickFormatter={(value) =>
                                String(value).length > 12
                                    ? `${String(value).slice(0, 12)}…`
                                    : String(value)
                            }
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                        />
                        <ChartTooltip content={<ChartTooltipContent />}/>
                        <Bar
                            dataKey="active"
                            fill="var(--color-active)"
                            radius={8}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
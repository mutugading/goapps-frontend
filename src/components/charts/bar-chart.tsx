"use client"

import {
    Bar,
    BarChart as RechartsBarChart,
    CartesianGrid,
    XAxis,
    YAxis,
    ResponsiveContainer,
} from "recharts"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"

interface BarChartProps {
    data: Array<Record<string, unknown>>
    xAxisKey: string
    series: Array<{
        key: string
        label: string
        color: string
    }>
    className?: string
}

export function BarChart({ data, xAxisKey, series, className }: BarChartProps) {
    const chartConfig: ChartConfig = series.reduce((acc, s) => {
        acc[s.key] = { label: s.label, color: s.color }
        return acc
    }, {} as ChartConfig)

    return (
        <ChartContainer config={chartConfig} className={className}>
            <RechartsBarChart data={data} margin={{ left: 12, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                    dataKey={xAxisKey}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                {series.map((s) => (
                    <Bar
                        key={s.key}
                        dataKey={s.key}
                        fill={s.color}
                        radius={[4, 4, 0, 0]}
                    />
                ))}
            </RechartsBarChart>
        </ChartContainer>
    )
}

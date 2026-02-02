"use client"

import {
    Area,
    AreaChart as RechartsAreaChart,
    CartesianGrid,
    XAxis,
    YAxis,
} from "recharts"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"

interface AreaChartProps {
    data: Array<Record<string, unknown>>
    xAxisKey: string
    series: Array<{
        key: string
        label: string
        color: string
    }>
    className?: string
}

export function AreaChart({ data, xAxisKey, series, className }: AreaChartProps) {
    const chartConfig: ChartConfig = series.reduce((acc, s) => {
        acc[s.key] = { label: s.label, color: s.color }
        return acc
    }, {} as ChartConfig)

    return (
        <ChartContainer config={chartConfig} className={className}>
            <RechartsAreaChart data={data} margin={{ left: 12, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                    dataKey={xAxisKey}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                {series.map((s, index) => (
                    <Area
                        key={s.key}
                        type="monotone"
                        dataKey={s.key}
                        stackId={index}
                        stroke={s.color}
                        fill={s.color}
                        fillOpacity={0.3}
                    />
                ))}
            </RechartsAreaChart>
        </ChartContainer>
    )
}

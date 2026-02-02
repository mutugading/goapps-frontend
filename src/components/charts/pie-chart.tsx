"use client"

import { Pie, PieChart as RechartsPieChart, Cell, Legend } from "recharts"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"

interface PieChartDataItem {
    name: string
    value: number
    color: string
}

interface PieChartProps {
    data: PieChartDataItem[]
    className?: string
}

export function PieChart({ data, className }: PieChartProps) {
    const chartConfig: ChartConfig = data.reduce((acc, item) => {
        acc[item.name] = { label: item.name, color: item.color }
        return acc
    }, {} as ChartConfig)

    return (
        <ChartContainer config={chartConfig} className={className}>
            <RechartsPieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Legend />
            </RechartsPieChart>
        </ChartContainer>
    )
}

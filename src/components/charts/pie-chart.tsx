"use client"

import { Pie, PieChart as RechartsPieChart, Cell, Tooltip, ResponsiveContainer } from "recharts"

interface PieChartDataItem {
    name: string
    value: number
    color: string
}

interface PieChartProps {
    data: PieChartDataItem[]
    /** Height of the donut chart area in px (default 200) */
    chartHeight?: number
    className?: string
}

export function PieChart({ data, chartHeight = 200, className }: PieChartProps) {
    const total = data.reduce((sum, d) => sum + d.value, 0)

    return (
        <div className={`flex flex-col gap-3 ${className ?? ""}`}>
            {/* Fixed-height chart area — no percentage-height ambiguity */}
            <div style={{ height: chartHeight, width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                        <Tooltip
                            formatter={(value: number, name: string) => [
                                `${total > 0 ? Math.round((value / total) * 100) : 0}%`,
                                name,
                            ]}
                            contentStyle={{
                                borderRadius: "8px",
                                fontSize: "12px",
                                border: "1px solid hsl(var(--border))",
                                background: "hsl(var(--card))",
                                color: "hsl(var(--card-foreground))",
                            }}
                        />
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={85}
                            paddingAngle={2}
                            dataKey="value"
                            nameKey="name"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                    </RechartsPieChart>
                </ResponsiveContainer>
            </div>

            {/* Custom legend */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 px-1">
                {data.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5 min-w-0">
                        <span
                            className="size-2 shrink-0 rounded-full"
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="truncate text-xs text-muted-foreground">{item.name}</span>
                        <span className="ml-auto shrink-0 text-xs font-medium tabular-nums">
                            {total > 0 ? Math.round((item.value / total) * 100) : 0}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

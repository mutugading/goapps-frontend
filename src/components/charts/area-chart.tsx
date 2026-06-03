"use client"

import {
    Area,
    AreaChart as RechartsAreaChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts"

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
    return (
        <div className={`w-full ${className ?? ""}`}>
            <ResponsiveContainer width="100%" height="100%">
                <RechartsAreaChart data={data} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                        dataKey={xAxisKey}
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={4}
                        width={52}
                        tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                        tickFormatter={(v: number) =>
                            v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                        }
                    />
                    <Tooltip
                        formatter={(value: number, name: string) => {
                            const s = series.find((s) => s.key === name)
                            return [value.toLocaleString(), s?.label ?? name]
                        }}
                        contentStyle={{
                            borderRadius: "8px",
                            fontSize: "12px",
                            border: "1px solid hsl(var(--border))",
                            background: "hsl(var(--card))",
                            color: "hsl(var(--card-foreground))",
                        }}
                    />
                    {series.map((s, index) => (
                        <Area
                            key={s.key}
                            type="monotone"
                            dataKey={s.key}
                            stackId={index}
                            stroke={s.color}
                            strokeWidth={2}
                            fill={s.color}
                            fillOpacity={0.15}
                        />
                    ))}
                </RechartsAreaChart>
            </ResponsiveContainer>
        </div>
    )
}

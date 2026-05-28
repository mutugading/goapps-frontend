"use client"

import { Line, LineChart, ResponsiveContainer } from "recharts"

import { biColors } from "@/lib/bi/color-tokens"

/** Tiny inline sparkline used inside KPI cards. */
export function MiniSparkline({ values }: { values: number[] }) {
  const data = values.map((v, i) => ({ i, v }))
  return (
    <div className="mt-2 h-8">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="v" stroke={biColors.positive} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

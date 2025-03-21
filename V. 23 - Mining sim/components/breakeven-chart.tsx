"use client"

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface ChartData {
  month: number
  gridRevenue: number
  miningProfit: number
  cumulativeGridRevenue: number
  cumulativeMiningProfit: number
}

interface BreakevenChartProps {
  data: ChartData[]
}

export default function BreakevenChart({ data }: BreakevenChartProps) {
  // Handle empty data
  if (!data || data.length === 0) {
    return <div className="flex justify-center items-center h-full">No data available</div>
  }

  // Format data for the chart
  const chartData = data.map((item) => ({
    month: `Month ${item.month}`,
    "Cumulative Grid Revenue": Number.parseFloat((item.cumulativeGridRevenue || 0).toFixed(2)),
    "Cumulative Mining Profit": Number.parseFloat((item.cumulativeMiningProfit || 0).toFixed(2)),
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis label={{ value: "Cumulative Revenue ($)", angle: -90, position: "insideLeft" }} width={80} />
        <Tooltip formatter={(value) => [`$${value}`, ""]} />
        <Legend />
        <Line
          type="monotone"
          dataKey="Cumulative Grid Revenue"
          stroke="hsl(var(--chart-1))"
          activeDot={{ r: 8 }}
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="Cumulative Mining Profit"
          stroke="hsl(var(--chart-2))"
          activeDot={{ r: 8 }}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}


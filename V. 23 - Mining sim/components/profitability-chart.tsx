"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface ChartData {
  month: number
  gridRevenue: number
  miningProfit: number
  cumulativeGridRevenue: number
  cumulativeMiningProfit: number
}

interface ProfitabilityChartProps {
  data: ChartData[]
}

export default function ProfitabilityChart({ data }: ProfitabilityChartProps) {
  // Handle empty data
  if (!data || data.length === 0) {
    return <div className="flex justify-center items-center h-full">No data available</div>
  }

  // Format data for the chart
  const chartData = data.map((item) => ({
    month: `Month ${item.month}`,
    "Grid Revenue": Number.parseFloat((item.gridRevenue || 0).toFixed(2)),
    "Mining Profit": Number.parseFloat((item.miningProfit || 0).toFixed(2)),
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" />
        <YAxis label={{ value: "Revenue ($)", angle: -90, position: "insideLeft" }} width={80} />
        <Tooltip formatter={(value) => [`$${value}`, ""]} />
        <Legend />
        <Bar dataKey="Grid Revenue" fill="hsl(var(--chart-1))" name="Grid Revenue" />
        <Bar dataKey="Mining Profit" fill="hsl(var(--chart-2))" name="Mining Profit" />
      </BarChart>
    </ResponsiveContainer>
  )
}


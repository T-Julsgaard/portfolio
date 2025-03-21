"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

interface EnergyDistributionChartProps {
  energyUsedForMining: number
  totalEnergyProduced: number
}

export default function EnergyDistributionChart({
  energyUsedForMining,
  totalEnergyProduced,
}: EnergyDistributionChartProps) {
  const energyForGrid = totalEnergyProduced - energyUsedForMining

  const data = [
    { name: "Used for Mining", value: energyUsedForMining },
    { name: "Sold to Grid", value: energyForGrid },
  ]

  const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))"]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={true}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} kWh`, ""]} />
      </PieChart>
    </ResponsiveContainer>
  )
}


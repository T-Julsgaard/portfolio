"use client"

import { useState } from "react"
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EnergyData {
  timestamp: string
  energy: number
}

interface HourlyEnergyChartProps {
  data: EnergyData[]
}

export default function HourlyEnergyChart({ data }: HourlyEnergyChartProps) {
  const [viewMode, setViewMode] = useState<"day" | "week" | "month" | "all-hours">("day")

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hourly Energy Export</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">Upload data to view energy export patterns</p>
        </CardContent>
      </Card>
    )
  }

  // Process data based on view mode
  const processData = () => {
    let chartData: any[] = []

    switch (viewMode) {
      case "day":
        // Group by hour of day (show all hours)
        const hourlyData: Record<string, number[]> = {}

        data.forEach((item) => {
          const hour = item.timestamp.split(" ")[1].substring(0, 5)
          if (!hourlyData[hour]) {
            hourlyData[hour] = []
          }
          hourlyData[hour].push(item.energy)
        })

        // Calculate average for each hour
        chartData = Object.entries(hourlyData)
          .map(([hour, values]) => {
            const avgEnergy = values.reduce((sum, val) => sum + val, 0) / values.length
            return {
              time: hour,
              energy: avgEnergy,
              min: Math.min(...values),
              max: Math.max(...values),
            }
          })
          .sort((a, b) => a.time.localeCompare(b.time))
        break

      case "week":
        // Group by day of week (all days)
        const weekData: Record<string, number[]> = {}

        data.forEach((item) => {
          const date = new Date(item.timestamp)
          const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][
            date.getDay()
          ]

          if (!weekData[dayOfWeek]) {
            weekData[dayOfWeek] = []
          }
          weekData[dayOfWeek].push(item.energy)
        })

        // Calculate total for each day
        const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        chartData = daysOrder.map((day) => {
          const values = weekData[day] || []
          const totalEnergy = values.reduce((sum, val) => sum + val, 0)
          const avgEnergy = values.length > 0 ? totalEnergy / values.length : 0

          return {
            time: day,
            energy: avgEnergy,
            min: values.length > 0 ? Math.min(...values) : 0,
            max: values.length > 0 ? Math.max(...values) : 0,
          }
        })
        break

      case "month":
        // Group by day for all data
        const monthData: Record<string, number[]> = {}

        data.forEach((item) => {
          const day = item.timestamp.split(" ")[0]
          if (!monthData[day]) {
            monthData[day] = []
          }
          monthData[day].push(item.energy)
        })

        // Calculate daily totals
        chartData = Object.entries(monthData)
          .map(([day, values]) => {
            const totalEnergy = values.reduce((sum, val) => sum + val, 0)
            return {
              time: day.substring(5), // MM-DD format
              fullDate: day,
              energy: totalEnergy,
              min: Math.min(...values),
              max: Math.max(...values),
            }
          })
          .sort((a, b) => a.fullDate.localeCompare(b.fullDate))
        break
      case "all-hours":
        // Show each individual hour in the dataset
        chartData = data
          .map((item) => {
            const datePart = item.timestamp.split(" ")[0]
            const timePart = item.timestamp.split(" ")[1].substring(0, 5)
            return {
              time: `${datePart} ${timePart}`,
              fullTimestamp: item.timestamp,
              energy: item.energy,
            }
          })
          .sort((a, b) => a.fullTimestamp.localeCompare(b.fullTimestamp))
        break
    }

    return chartData
  }

  const chartData = processData()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Hourly Energy Export</CardTitle>
          <CardDescription>
            {viewMode === "day"
              ? "Average hourly energy export pattern"
              : viewMode === "week"
                ? "Average energy export by day of week"
                : viewMode === "month"
                  ? "Daily energy export totals"
                  : "All individual hourly data points"}
          </CardDescription>
        </div>
        <Select value={viewMode} onValueChange={(value: "day" | "week" | "month" | "all-hours") => setViewMode(value)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="View" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Day</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="month">Month</SelectItem>
            <SelectItem value="all-hours">All Hours</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                label={{
                  value:
                    viewMode === "day"
                      ? "Hour"
                      : viewMode === "week"
                        ? "Day of Week"
                        : viewMode === "month"
                          ? "Date"
                          : "Timestamp",
                  position: "insideBottom",
                  offset: -5,
                }}
              />
              <YAxis
                label={{
                  value: "Energy (kWh)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip
                formatter={(value) => [`${Number(value).toFixed(2)} kWh`, ""]}
                labelFormatter={(label) =>
                  viewMode === "day"
                    ? `Time: ${label}`
                    : viewMode === "week"
                      ? label
                      : viewMode === "month"
                        ? `Date: ${label}`
                        : `${label}`
                }
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="energy"
                name={
                  viewMode === "day" || viewMode === "week"
                    ? "Average Energy"
                    : viewMode === "month"
                      ? "Total Energy"
                      : "Energy"
                }
                stroke="hsl(var(--chart-1))"
                fill="hsl(var(--chart-1)/0.2)"
              />
              {(viewMode === "day" || viewMode === "week") && (
                <>
                  <Area
                    type="monotone"
                    dataKey="min"
                    name="Minimum"
                    stroke="hsl(var(--chart-2))"
                    fill="transparent"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                  />
                  <Area
                    type="monotone"
                    dataKey="max"
                    name="Maximum"
                    stroke="hsl(var(--chart-3))"
                    fill="transparent"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                  />
                </>
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}


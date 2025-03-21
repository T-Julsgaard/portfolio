"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface EnergyData {
  timestamp: string
  energy: number
}

interface AdvancedAnalysisProps {
  data: EnergyData[]
}

export default function AdvancedAnalysis({ data }: AdvancedAnalysisProps) {
  const analysis = useMemo(() => {
    if (!data || data.length === 0) return null

    // Calculate key metrics
    const totalEnergy = data.reduce((sum, item) => sum + item.energy, 0)
    const avgHourlyEnergy = totalEnergy / data.length
    const maxHourlyEnergy = Math.max(...data.map((item) => item.energy))
    const zeroHours = data.filter((item) => item.energy === 0).length
    const zeroPercentage = (zeroHours / data.length) * 100

    // Calculate energy distribution by hour
    const hourlyDistribution = Array(24).fill(0)
    const hourlyCount = Array(24).fill(0)

    data.forEach((item) => {
      const hour = Number.parseInt(item.timestamp.split(" ")[1].split(":")[0])
      hourlyDistribution[hour] += item.energy
      hourlyCount[hour]++
    })

    // Calculate average energy by hour
    const avgEnergyByHour = hourlyDistribution.map((total, i) => ({
      hour: i,
      energy: hourlyCount[i] > 0 ? total / hourlyCount[i] : 0,
    }))

    // Calculate energy distribution by range
    const energyRanges = [
      { name: "0 kWh", range: [0, 0.01], count: 0 },
      { name: "0.01-1 kWh", range: [0.01, 1], count: 0 },
      { name: "1-5 kWh", range: [1, 5], count: 0 },
      { name: "5-10 kWh", range: [5, 10], count: 0 },
      { name: "10-20 kWh", range: [10, 20], count: 0 },
      { name: "20+ kWh", range: [20, Number.POSITIVE_INFINITY], count: 0 },
    ]

    data.forEach((item) => {
      const range = energyRanges.find((r) => item.energy >= r.range[0] && item.energy < r.range[1])
      if (range) range.count++
    })

    // Calculate mining potential
    // Assuming a typical ASIC miner uses ~3.5 kWh per hour
    const minerHourlyConsumption = 3.5
    const totalMiningHours = data.filter((item) => item.energy >= minerHourlyConsumption).length
    const miningPotentialPercentage = (totalMiningHours / data.length) * 100

    // Calculate optimal number of miners
    // This is a simplified calculation - for each hour, how many miners could run
    const hourlyMiners = data.map((item) => Math.floor(item.energy / minerHourlyConsumption))
    const maxMiners = Math.max(...hourlyMiners)
    const avgMiners = hourlyMiners.reduce((sum, count) => sum + count, 0) / hourlyMiners.length

    // Calculate utilization for different miner counts
    const utilizationByMinerCount = []
    for (let miners = 1; miners <= Math.min(10, maxMiners); miners++) {
      const totalPossibleEnergy = miners * minerHourlyConsumption * data.length
      let usedEnergy = 0

      data.forEach((item) => {
        const minerEnergy = miners * minerHourlyConsumption
        usedEnergy += Math.min(item.energy, minerEnergy)
      })

      utilizationByMinerCount.push({
        miners,
        utilization: (usedEnergy / totalPossibleEnergy) * 100,
      })
    }

    return {
      totalEnergy,
      avgHourlyEnergy,
      maxHourlyEnergy,
      zeroHours,
      zeroPercentage,
      avgEnergyByHour,
      energyRanges,
      miningPotentialPercentage,
      maxMiners,
      avgMiners,
      utilizationByMinerCount,
    }
  }, [data])

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Advanced Analysis</CardTitle>
          <CardDescription>Upload CSV data to view advanced analysis</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Energy Analysis</CardTitle>
        <CardDescription>Detailed analysis of your energy export patterns for mining optimization</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="hourly">Hourly Patterns</TabsTrigger>
            <TabsTrigger value="mining">Mining Potential</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Key Metrics</h3>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Energy Exported</span>
                    <span className="font-medium">{analysis.totalEnergy.toFixed(2)} kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Average Hourly Export</span>
                    <span className="font-medium">{analysis.avgHourlyEnergy.toFixed(2)} kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Maximum Hourly Export</span>
                    <span className="font-medium">{analysis.maxHourlyEnergy.toFixed(2)} kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Hours with Zero Export</span>
                    <span className="font-medium">
                      {analysis.zeroHours} ({analysis.zeroPercentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Mining Potential</h3>
                  <div className="flex justify-between">
                    <span className="text-sm">Hours Suitable for Mining</span>
                    <Badge variant={analysis.miningPotentialPercentage > 50 ? "default" : "secondary"}>
                      {analysis.miningPotentialPercentage.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Maximum Miners Supported</span>
                    <span className="font-medium">{Math.floor(analysis.maxMiners)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Average Miners Supported</span>
                    <span className="font-medium">{analysis.avgMiners.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              <div className="h-72">
                <h3 className="text-lg font-medium mb-4">Energy Distribution</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analysis.energyRanges}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {analysis.energyRanges.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} hours`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="hourly" className="pt-4">
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Average Energy Export by Hour</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analysis.avgEnergyByHour}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" label={{ value: "Hour of Day", position: "insideBottom", offset: -5 }} />
                    <YAxis label={{ value: "Average Energy (kWh)", angle: -90, position: "insideLeft" }} />
                    <Tooltip formatter={(value) => [`${value.toFixed(2)} kWh`, ""]} />
                    <Bar dataKey="energy" name="Avg Energy" fill="hsl(var(--chart-1))">
                      {analysis.avgEnergyByHour.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.energy >= 3.5 ? "hsl(var(--chart-1))" : "hsl(var(--chart-2))"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-muted p-4 rounded-md">
                <h4 className="font-medium mb-2">Hourly Pattern Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  {analysis.avgEnergyByHour.filter((h) => h.energy >= 3.5).length} out of 24 hours have sufficient
                  average energy (3.5+ kWh) to run a typical ASIC miner.
                  {analysis.avgEnergyByHour.filter((h) => h.energy >= 3.5).length > 12
                    ? " Your energy pattern is well-suited for Bitcoin mining."
                    : " Consider a flexible mining setup that can be powered down during low-energy hours."}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="mining" className="pt-4">
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Miner Utilization Analysis</h3>
              <p className="text-sm text-muted-foreground">
                This chart shows the utilization percentage for different numbers of miners. Higher utilization means
                more efficient use of your mining hardware.
              </p>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analysis.utilizationByMinerCount}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="miners"
                      label={{ value: "Number of Miners", position: "insideBottom", offset: -5 }}
                    />
                    <YAxis label={{ value: "Utilization (%)", angle: -90, position: "insideLeft" }} />
                    <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, "Utilization"]} />
                    <Bar dataKey="utilization" name="Utilization" fill="hsl(var(--chart-3))">
                      {analysis.utilizationByMinerCount.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.utilization > 75
                              ? "hsl(var(--chart-1))"
                              : entry.utilization > 50
                                ? "hsl(var(--chart-3))"
                                : "hsl(var(--chart-4))"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Optimal Mining Setup</h4>

                {analysis.utilizationByMinerCount.length > 0 && (
                  <>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="text-sm font-medium mb-1">
                          Recommended Miners:{" "}
                          {analysis.utilizationByMinerCount.findIndex((item) => item.utilization < 80) ||
                            analysis.utilizationByMinerCount.length}
                        </div>
                        <Progress value={analysis.utilizationByMinerCount[0]?.utilization || 0} className="h-2" />
                      </div>
                      <div className="text-sm font-medium">
                        {analysis.utilizationByMinerCount[0]?.utilization.toFixed(1)}% Utilization
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Based on your energy export pattern, we recommend a setup with
                      {analysis.utilizationByMinerCount.findIndex((item) => item.utilization < 80) > 0
                        ? ` ${analysis.utilizationByMinerCount.findIndex((item) => item.utilization < 80)}`
                        : ` ${Math.min(3, analysis.utilizationByMinerCount.length)}`}{" "}
                      miners for optimal efficiency.
                      {analysis.zeroPercentage > 30 &&
                        " Consider adding battery storage to improve utilization during zero-export hours."}
                    </p>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}


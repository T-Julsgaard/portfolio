"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, Battery, BatteryCharging, Clock, Zap } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import type { MinerModel } from "@/components/miner-selection"

interface EnergyData {
  timestamp: string
  energy: number
}

interface EnergyUtilizationAnalysisProps {
  energyData: EnergyData[]
  selectedMiner: MinerModel | null
}

export default function EnergyUtilizationAnalysis({ energyData, selectedMiner }: EnergyUtilizationAnalysisProps) {
  // Extract information about multiple miners if available
  const isCombinedMiner = selectedMiner?.id === "combined"
  const minerCount = isCombinedMiner ? selectedMiner.name.split(" ")[0] : "1"

  const analysis = useMemo(() => {
    if (!energyData || energyData.length === 0 || !selectedMiner) return null

    // Convert miner power from watts to kWh
    const minerHourlyConsumption = selectedMiner.powerConsumption / 1000 // kWh per hour

    // Calculate miner uptime
    const hourlyUptime = energyData.map((item) => {
      const canRun = item.energy >= minerHourlyConsumption
      const energyUsed = canRun ? minerHourlyConsumption : 0
      const energyWasted = canRun ? item.energy - minerHourlyConsumption : 0
      const energyDeficit = canRun ? 0 : minerHourlyConsumption - item.energy

      return {
        timestamp: item.timestamp,
        canRun,
        energyAvailable: item.energy,
        energyUsed,
        energyWasted,
        energyDeficit,
      }
    })

    // Calculate uptime statistics
    const totalHours = hourlyUptime.length
    const uptimeHours = hourlyUptime.filter((h) => h.canRun).length
    const uptimePercentage = (uptimeHours / totalHours) * 100

    // Calculate energy utilization
    const totalEnergyAvailable = hourlyUptime.reduce((sum, h) => sum + h.energyAvailable, 0)
    const totalEnergyUsed = hourlyUptime.reduce((sum, h) => sum + h.energyUsed, 0)
    const totalEnergyWasted = hourlyUptime.reduce((sum, h) => sum + h.energyWasted, 0)
    const utilizationPercentage = (totalEnergyUsed / totalEnergyAvailable) * 100

    // Calculate uptime by hour of day
    const uptimeByHour = Array(24)
      .fill(0)
      .map((_, hour) => {
        const hoursInThisSlot = hourlyUptime.filter((h) => {
          const hourOfDay = Number.parseInt(h.timestamp.split(" ")[1].split(":")[0])
          return hourOfDay === hour
        })

        const uptimeInThisSlot = hoursInThisSlot.filter((h) => h.canRun).length
        const percentageUptime = hoursInThisSlot.length > 0 ? (uptimeInThisSlot / hoursInThisSlot.length) * 100 : 0

        return {
          hour,
          uptime: percentageUptime,
        }
      })

    // Calculate uptime by day of week
    const uptimeByDay = Array(7)
      .fill(0)
      .map((_, day) => {
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

        const hoursInThisDay = hourlyUptime.filter((h) => {
          const date = new Date(h.timestamp)
          return date.getDay() === day
        })

        const uptimeInThisDay = hoursInThisDay.filter((h) => h.canRun).length
        const percentageUptime = hoursInThisDay.length > 0 ? (uptimeInThisDay / hoursInThisDay.length) * 100 : 0

        return {
          day: daysOfWeek[day],
          uptime: percentageUptime,
        }
      })

    // Energy distribution data for pie chart
    const energyDistribution = [
      { name: "Used by Miner", value: totalEnergyUsed },
      { name: "Wasted Energy", value: totalEnergyWasted },
    ]

    return {
      minerHourlyConsumption,
      hourlyUptime,
      totalHours,
      uptimeHours,
      uptimePercentage,
      totalEnergyAvailable,
      totalEnergyUsed,
      totalEnergyWasted,
      utilizationPercentage,
      uptimeByHour,
      uptimeByDay,
      energyDistribution,
    }
  }, [energyData, selectedMiner])

  if (!selectedMiner) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Energy Utilization Analysis</CardTitle>
          <CardDescription>Select a miner to analyze energy utilization</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground">No miner selected</p>
        </CardContent>
      </Card>
    )
  }

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Energy Utilization Analysis</CardTitle>
          <CardDescription>Upload energy data and select a miner to analyze</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          <span>Energy Utilization Analysis</span>
        </CardTitle>
        <CardDescription>
          Analysis of how effectively {isCombinedMiner ? selectedMiner.name : `the ${selectedMiner.name}`} would operate
          with your energy profile
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex flex-col p-4 border rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Miner Uptime</h3>
            </div>
            <div className="text-2xl font-bold mb-1">{analysis.uptimePercentage.toFixed(1)}%</div>
            <p className="text-sm text-muted-foreground">
              {analysis.uptimeHours} of {analysis.totalHours} hours
            </p>
            <Progress value={analysis.uptimePercentage} className="mt-2" />
          </div>

          <div className="flex flex-col p-4 border rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <BatteryCharging className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Energy Utilization</h3>
            </div>
            <div className="text-2xl font-bold mb-1">{analysis.utilizationPercentage.toFixed(1)}%</div>
            <p className="text-sm text-muted-foreground">
              {analysis.totalEnergyUsed.toFixed(1)} of {analysis.totalEnergyAvailable.toFixed(1)} kWh
            </p>
            <Progress value={analysis.utilizationPercentage} className="mt-2" />
          </div>

          <div className="flex flex-col p-4 border rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <Battery className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Wasted Energy</h3>
            </div>
            <div className="text-2xl font-bold mb-1">{analysis.totalEnergyWasted.toFixed(1)} kWh</div>
            <p className="text-sm text-muted-foreground">
              {((analysis.totalEnergyWasted / analysis.totalEnergyAvailable) * 100).toFixed(1)}% of available energy
            </p>
            <Progress value={(analysis.totalEnergyWasted / analysis.totalEnergyAvailable) * 100} className="mt-2" />
          </div>
        </div>

        {isCombinedMiner && (
          <div className="p-4 border rounded-md bg-blue-50 border-blue-200 mb-6">
            <h3 className="text-sm font-medium text-blue-700 mb-2">Multiple Miners Analysis</h3>
            <p className="text-sm text-blue-600">
              This analysis combines {minerCount} miners with a total power consumption of{" "}
              {selectedMiner.powerConsumption}W and total hashrate of {selectedMiner.hashRate} TH/s.
            </p>
          </div>
        )}

        {analysis.uptimePercentage < 50 && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Low Miner Uptime</AlertTitle>
            <AlertDescription>
              Your miner would be operational less than 50% of the time. Consider a miner with lower power requirements
              or adding battery storage to improve utilization.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="distribution">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="distribution">Energy Distribution</TabsTrigger>
            <TabsTrigger value="hourly">Hourly Uptime</TabsTrigger>
            <TabsTrigger value="daily">Daily Uptime</TabsTrigger>
          </TabsList>

          <TabsContent value="distribution">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analysis.energyDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell fill="hsl(var(--chart-1))" />
                    <Cell fill="hsl(var(--chart-2))" />
                  </Pie>
                  <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} kWh`, ""]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="hourly">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysis.uptimeByHour}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" label={{ value: "Hour of Day", position: "insideBottom", offset: -5 }} />
                  <YAxis label={{ value: "Uptime (%)", angle: -90, position: "insideLeft" }} />
                  <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, "Uptime"]} />
                  <Bar dataKey="uptime" name="Uptime %" fill="hsl(var(--chart-1))">
                    {analysis.uptimeByHour.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.uptime > 75 ? "hsl(var(--chart-1))" : "hsl(var(--chart-2))"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="daily">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysis.uptimeByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" label={{ value: "Day of Week", position: "insideBottom", offset: -5 }} />
                  <YAxis label={{ value: "Uptime (%)", angle: -90, position: "insideLeft" }} />
                  <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, "Uptime"]} />
                  <Bar dataKey="uptime" name="Uptime %" fill="hsl(var(--chart-3))">
                    {analysis.uptimeByDay.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.uptime > 75 ? "hsl(var(--chart-3))" : "hsl(var(--chart-4))"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}


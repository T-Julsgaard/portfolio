"use client"

import { useMemo, useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { RefreshCw, TrendingUp, DollarSign, Bitcoin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

import type { MinerModel } from "@/components/miner-selection"

interface EnergyData {
  timestamp: string
  energy: number
}

interface ProfitabilityBreakdownProps {
  energyData: EnergyData[]
  selectedMiner: MinerModel | null
}

export default function ProfitabilityBreakdown({ energyData, selectedMiner }: ProfitabilityBreakdownProps) {
  const [btcPrice, setBtcPrice] = useState(60000)
  const [miningDifficulty, setMiningDifficulty] = useState(70000000000000)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchMarketData()
  }, [])

  const fetchMarketData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/market-data")

      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`)
      }

      const data = await response.json()

      setBtcPrice(data.btcPrice)
      setMiningDifficulty(data.miningDifficulty)

      toast({
        title: data.source === "fallback" ? "Using estimated market data" : "Market data updated",
        description:
          data.source === "fallback"
            ? "Could not connect to live APIs. Using estimated values for calculations."
            : "Latest BTC price and mining difficulty fetched successfully.",
        variant: data.source === "fallback" ? "default" : "default",
      })
    } catch (error) {
      console.error("Error fetching market data:", error)
      toast({
        title: "Error fetching data",
        description: "Using default values for calculations. Check your internet connection.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const profitability = useMemo(() => {
    if (!energyData || energyData.length === 0 || !selectedMiner) return null

    // Convert miner power from watts to kWh
    const minerHourlyConsumption = selectedMiner.powerConsumption / 1000 // kWh per hour

    // Calculate miner uptime
    const hourlyUptime = energyData.map((item) => {
      const canRun = item.energy >= minerHourlyConsumption
      return canRun
    })

    const uptimeHours = hourlyUptime.filter(Boolean).length
    const uptimePercentage = (uptimeHours / hourlyUptime.length) * 100

    // Calculate BTC mining revenue
    // Formula: (hashrate * blocks_per_day * block_reward) / (network_difficulty * 2^32)
    const hashRateGH = selectedMiner.hashRate * 1000 // Convert TH/s to GH/s
    const blocksPerDay = 144 // Average BTC blocks per day
    const blockReward = 6.25 // Current BTC block reward

    // Calculate daily BTC mined at 100% uptime
    const dailyBtcMined100 = (hashRateGH * blocksPerDay * blockReward) / (miningDifficulty / 2 ** 32)

    // Adjust for actual uptime
    const dailyBtcMined = dailyBtcMined100 * (uptimePercentage / 100)

    // Apply pool fees (assuming 2%)
    const poolFees = 0.02
    const dailyBtcAfterPoolFees = dailyBtcMined * (1 - poolFees)

    // Convert to USD
    const dailyRevenue = dailyBtcAfterPoolFees * btcPrice

    // Calculate operational costs (assuming $0.10/kWh)
    const electricityCost = 0.1
    const dailyEnergyCost = (minerHourlyConsumption * uptimeHours * electricityCost) / (hourlyUptime.length / 24)

    // Calculate profit
    const dailyProfit = dailyRevenue - dailyEnergyCost
    const weeklyProfit = dailyProfit * 7
    const monthlyProfit = dailyProfit * 30
    const yearlyProfit = dailyProfit * 365

    // Calculate ROI (assuming hardware cost based on hashrate)
    const estimatedHardwareCost = selectedMiner.hashRate * 50 // Rough estimate: $50 per TH/s
    const roiDays = estimatedHardwareCost / dailyProfit

    // Generate projection data for chart
    const projectionData = []
    for (let month = 1; month <= 24; month++) {
      // Adjust difficulty increase over time (assuming 3% monthly increase)
      const difficultyFactor = Math.pow(1.03, month - 1)

      // Calculate monthly profit with increasing difficulty
      const adjustedMonthlyProfit = monthlyProfit / difficultyFactor

      // Calculate cumulative profit
      const cumulativeProfit =
        projectionData.length > 0
          ? projectionData[projectionData.length - 1].cumulativeProfit + adjustedMonthlyProfit
          : adjustedMonthlyProfit

      projectionData.push({
        month,
        monthlyProfit: adjustedMonthlyProfit,
        cumulativeProfit,
        hardwareCost: estimatedHardwareCost,
      })
    }

    return {
      dailyBtcMined: dailyBtcAfterPoolFees,
      dailyRevenue,
      dailyEnergyCost,
      dailyProfit,
      weeklyProfit,
      monthlyProfit,
      yearlyProfit,
      estimatedHardwareCost,
      roiDays,
      btcPrice,
      miningDifficulty,
      uptimePercentage,
      projectionData,
    }
  }, [energyData, selectedMiner, btcPrice, miningDifficulty])

  if (!selectedMiner) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profitability Breakdown</CardTitle>
          <CardDescription>Select a miner to see profitability analysis</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground">No miner selected</p>
        </CardContent>
      </Card>
    )
  }

  if (!profitability) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profitability Breakdown</CardTitle>
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
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            <span>Profitability Breakdown</span>
          </CardTitle>
          <CardDescription>
            Financial analysis for {selectedMiner.name} with {profitability.uptimePercentage.toFixed(1)}% uptime
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={fetchMarketData} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Update Market Data
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="flex flex-col p-4 border rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Daily Profit</h3>
            </div>
            <div className="text-2xl font-bold mb-1">${profitability.dailyProfit.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground">Revenue: ${profitability.dailyRevenue.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Costs: ${profitability.dailyEnergyCost.toFixed(2)}</p>
          </div>

          <div className="flex flex-col p-4 border rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <Bitcoin className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Daily BTC Mined</h3>
            </div>
            <div className="text-2xl font-bold mb-1">{profitability.dailyBtcMined.toFixed(8)}</div>
            <p className="text-sm text-muted-foreground">BTC Price: ${profitability.btcPrice.toLocaleString()}</p>
          </div>

          <div className="flex flex-col p-4 border rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Monthly Profit</h3>
            </div>
            <div className="text-2xl font-bold mb-1">${profitability.monthlyProfit.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground">Yearly: ${profitability.yearlyProfit.toFixed(2)}</p>
          </div>

          <div className="flex flex-col p-4 border rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">ROI Period</h3>
            </div>
            <div className="text-2xl font-bold mb-1">{Math.ceil(profitability.roiDays)} days</div>
            <p className="text-sm text-muted-foreground">Hardware: ${profitability.estimatedHardwareCost.toFixed(0)}</p>
          </div>
        </div>

        <Tabs defaultValue="projection">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="projection">Profit Projection</TabsTrigger>
            <TabsTrigger value="details">Detailed Breakdown</TabsTrigger>
          </TabsList>

          <TabsContent value="projection">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={profitability.projectionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" label={{ value: "Month", position: "insideBottom", offset: -5 }} />
                  <YAxis label={{ value: "Profit ($)", angle: -90, position: "insideLeft" }} />
                  <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, ""]} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cumulativeProfit"
                    name="Cumulative Profit"
                    stroke="hsl(var(--chart-1))"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="hardwareCost"
                    name="Hardware Cost"
                    stroke="hsl(var(--chart-2))"
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 p-4 bg-muted/30 rounded-md">
              <h4 className="font-medium mb-2">Profitability Notes</h4>
              <ul className="text-sm space-y-1">
                <li>• Projection assumes a 3% monthly increase in mining difficulty</li>
                <li>• Electricity cost is estimated at $0.10/kWh</li>
                <li>• Pool fees are estimated at 2%</li>
                <li>• Hardware cost is estimated at $50 per TH/s</li>
                <li>• BTC price is assumed to remain constant at ${profitability.btcPrice.toLocaleString()}</li>
                <li className="text-muted-foreground">
                  • Note: Market data may be estimated if live APIs are unavailable
                </li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="details">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Daily BTC Mined</TableCell>
                  <TableCell>{profitability.dailyBtcMined.toFixed(8)} BTC</TableCell>
                  <TableCell>After pool fees</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Daily Revenue</TableCell>
                  <TableCell>${profitability.dailyRevenue.toFixed(2)}</TableCell>
                  <TableCell>At current BTC price</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Daily Energy Cost</TableCell>
                  <TableCell>${profitability.dailyEnergyCost.toFixed(2)}</TableCell>
                  <TableCell>Based on {profitability.uptimePercentage.toFixed(1)}% uptime</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Daily Profit</TableCell>
                  <TableCell>${profitability.dailyProfit.toFixed(2)}</TableCell>
                  <TableCell>Revenue minus costs</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Weekly Profit</TableCell>
                  <TableCell>${profitability.weeklyProfit.toFixed(2)}</TableCell>
                  <TableCell>Daily profit × 7</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Monthly Profit</TableCell>
                  <TableCell>${profitability.monthlyProfit.toFixed(2)}</TableCell>
                  <TableCell>Daily profit × 30</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Yearly Profit</TableCell>
                  <TableCell>${profitability.yearlyProfit.toFixed(2)}</TableCell>
                  <TableCell>Daily profit × 365</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Hardware Cost</TableCell>
                  <TableCell>${profitability.estimatedHardwareCost.toFixed(0)}</TableCell>
                  <TableCell>Estimated based on hashrate</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">ROI Period</TableCell>
                  <TableCell>{Math.ceil(profitability.roiDays)} days</TableCell>
                  <TableCell>Hardware cost ÷ daily profit</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Mining Difficulty</TableCell>
                  <TableCell>{(profitability.miningDifficulty / 1000000000000).toFixed(2)} T</TableCell>
                  <TableCell>Current network difficulty</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}


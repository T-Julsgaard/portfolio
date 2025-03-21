"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Download, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import ProfitabilityChart from "@/components/profitability-chart"
import BreakevenChart from "@/components/breakeven-chart"
import EnergyDistributionChart from "@/components/energy-distribution-chart"
import SummaryTable from "@/components/summary-table"
import { useToast } from "@/hooks/use-toast"

interface CalculationResults {
  gridSellMonthly: number
  miningRevenueMonthly: number
  miningCostsMonthly: number
  miningProfitMonthly: number
  netDifferenceMonthly: number
  breakevenMonths: number
  roi: number
  energyUsedForMining: number
  totalEnergyProduced: number
  monthlyData: Array<{
    month: number
    gridRevenue: number
    miningProfit: number
    cumulativeGridRevenue: number
    cumulativeMiningProfit: number
  }>
}

export default function ResultsDashboard() {
  const [results, setResults] = useState<CalculationResults | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Load results from localStorage
    const storedResults = localStorage.getItem("calculationResults")
    if (storedResults) {
      try {
        setResults(JSON.parse(storedResults))
      } catch (error) {
        console.error("Error parsing results:", error)
        setResults(null)
      }
    }
    setLoading(false)
  }, [])

  const handleRecalculate = () => {
    router.push("/?tab=calculator")
  }

  const handleDownloadResults = () => {
    if (!results) return

    // Create CSV content
    const csvContent = [
      "Month,Grid Revenue ($),Mining Profit ($),Cumulative Grid Revenue ($),Cumulative Mining Profit ($)",
      ...results.monthlyData.map(
        (data) =>
          `${data.month},${data.gridRevenue.toFixed(2)},${data.miningProfit.toFixed(2)},${data.cumulativeGridRevenue.toFixed(
            2,
          )},${data.cumulativeMiningProfit.toFixed(2)}`,
      ),
    ].join("\n")

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "renewable-energy-profitability.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Download complete",
      description: "Your results have been downloaded as a CSV file.",
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p>Loading results...</p>
        </div>
      </div>
    )
  }

  if (!results) {
    return (
      <Alert>
        <AlertTitle>No calculation results found</AlertTitle>
        <AlertDescription>
          Please go to the Calculator tab and enter your parameters to see results.
          <div className="mt-4">
            <Button onClick={handleRecalculate}>Go to Calculator</Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  const moreProfiable = (results.netDifferenceMonthly || 0) > 0 ? "Mining Bitcoin" : "Selling to Grid"
  const profitabilityDifference = Math.abs(results.netDifferenceMonthly || 0).toFixed(2)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Profitability Analysis Results</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRecalculate}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Recalculate
          </Button>
          <Button onClick={handleDownloadResults}>
            <Download className="h-4 w-4 mr-2" />
            Download CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Monthly Revenue</CardDescription>
            <CardTitle className="text-2xl">${(results.gridSellMonthly || 0).toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Selling to Grid</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Monthly Profit</CardDescription>
            <CardTitle className="text-2xl">${(results.miningProfitMonthly || 0).toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Bitcoin Mining</p>
          </CardContent>
        </Card>
        <Card className={(results.netDifferenceMonthly || 0) > 0 ? "border-green-500" : "border-blue-500"}>
          <CardHeader className="pb-2">
            <CardDescription>More Profitable Option</CardDescription>
            <CardTitle className="text-2xl">{moreProfiable}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">By ${profitabilityDifference}/month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ROI Analysis</CardTitle>
          <CardDescription>
            Breakeven in {(results.breakevenMonths || 0).toFixed(1)} months with {(results.roi || 0).toFixed(2)}% annual
            ROI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <BreakevenChart data={results.monthlyData || []} />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="profitability">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="profitability">Monthly Profitability</TabsTrigger>
          <TabsTrigger value="energy">Energy Distribution</TabsTrigger>
          <TabsTrigger value="details">Detailed Breakdown</TabsTrigger>
        </TabsList>
        <TabsContent value="profitability">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Profitability Comparison</CardTitle>
              <CardDescription>Grid selling vs. Bitcoin mining monthly revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ProfitabilityChart data={results.monthlyData || []} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="energy">
          <Card>
            <CardHeader>
              <CardTitle>Energy Distribution</CardTitle>
              <CardDescription>How your renewable energy is being utilized</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <EnergyDistributionChart
                  energyUsedForMining={results.energyUsedForMining || 0}
                  totalEnergyProduced={results.totalEnergyProduced || 0}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Financial Breakdown</CardTitle>
              <CardDescription>Complete analysis of all financial aspects</CardDescription>
            </CardHeader>
            <CardContent>
              <SummaryTable results={results} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


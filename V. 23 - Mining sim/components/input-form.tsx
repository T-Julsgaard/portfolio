"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Info, RefreshCw, FileSpreadsheet } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { calculateProfitability } from "@/lib/calculations"

const formSchema = z.object({
  // Energy production details
  energySource: z.string(),
  capacity: z.coerce.number().positive(),
  dailyProduction: z.coerce.number().positive(),

  // Grid pricing
  gridSellPrice: z.coerce.number().positive(),

  // Bitcoin mining parameters
  electricityCost: z.coerce.number().positive(),
  minerModel: z.string(),
  miningDifficulty: z.coerce.number().positive().optional(),
  btcPrice: z.coerce.number().positive().optional(),
  poolFees: z.coerce.number().min(0).max(100),
  hardwareCost: z.coerce.number().nonnegative().optional(),

  // Additional parameters
  incentives: z.coerce.number().nonnegative().default(0),
  taxRate: z.coerce.number().min(0).max(100).default(0),
})

const minerModels = [
  { id: "antminer-s19-pro", name: "Antminer S19 Pro", powerConsumption: 3250, hashRate: 110 },
  { id: "antminer-s19j-pro", name: "Antminer S19j Pro", powerConsumption: 3050, hashRate: 100 },
  { id: "whatsminer-m30s++", name: "Whatsminer M30S++", powerConsumption: 3472, hashRate: 112 },
  { id: "avalon-1246", name: "Avalon 1246", powerConsumption: 3420, hashRate: 90 },
]

export default function InputForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingData, setIsFetchingData] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      energySource: "solar",
      capacity: 10,
      dailyProduction: 40,
      gridSellPrice: 0.12,
      electricityCost: 0.1,
      minerModel: "antminer-s19-pro",
      miningDifficulty: 70000000000000,
      btcPrice: 60000,
      poolFees: 2,
      hardwareCost: 10000,
      incentives: 0,
      taxRate: 20,
    },
  })

  async function fetchLatestData() {
    setIsFetchingData(true)
    try {
      const response = await fetch("/api/market-data")
      const data = await response.json()

      form.setValue("btcPrice", data.btcPrice)
      form.setValue("miningDifficulty", data.miningDifficulty)

      toast({
        title: "Data updated",
        description: "Latest BTC price and mining difficulty fetched successfully.",
      })
    } catch (error) {
      toast({
        title: "Error fetching data",
        description: "Could not fetch the latest market data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsFetchingData(false)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      // Calculate profitability and store in localStorage
      const results = calculateProfitability(values)
      localStorage.setItem("calculationResults", JSON.stringify(results))

      // Navigate to results tab
      window.location.href = "/?tab=results"

      toast({
        title: "Calculation complete",
        description: "Your profitability analysis is ready to view.",
      })
    } catch (error) {
      console.error("Calculation error:", error)
      toast({
        title: "Calculation error",
        description: "An error occurred during calculation. Please check your inputs.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Alert className="bg-blue-50 border-blue-200">
          <FileSpreadsheet className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-blue-700">New Feature: Hourly Energy Analysis</AlertTitle>
          <AlertDescription className="text-blue-600">
            For more accurate profitability calculations, you can now upload your hourly energy export data.
            <div className="mt-2">
              <Link href="/hourly-analysis">
                <Button variant="outline" size="sm" className="text-blue-600 border-blue-300 hover:bg-blue-100">
                  Upload Hourly Data
                </Button>
              </Link>
            </div>
          </AlertDescription>
        </Alert>

        <div>
          <h2 className="text-xl font-semibold mb-4">Energy Production Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="energySource"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Energy Source</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select energy source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="solar">Solar</SelectItem>
                      <SelectItem value="wind">Wind</SelectItem>
                      <SelectItem value="hydro">Hydro</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Type of renewable energy you are producing</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity (kW)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
                  </FormControl>
                  <FormDescription>Total installed capacity of your system</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dailyProduction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Average Daily Production (kWh)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" {...field} />
                  </FormControl>
                  <FormDescription>How much energy your system produces daily</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        <div>
          <h2 className="text-xl font-semibold mb-4">Grid Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="gridSellPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grid Sell Price ($/kWh)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormDescription>Price you receive when selling to the grid</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Bitcoin Mining Parameters</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={fetchLatestData} disabled={isFetchingData}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isFetchingData ? "animate-spin" : ""}`} />
                    Fetch Latest Data
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Update BTC price and mining difficulty with latest market data</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="electricityCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Electricity Cost ($/kWh)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormDescription>Your cost of electricity</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="minerModel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ASIC Miner Model</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select miner model" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {minerModels.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name} ({model.hashRate} TH/s, {model.powerConsumption}W)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Mining hardware specifications</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="btcPrice"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel>BTC Price ($)</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Current Bitcoin price in USD</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <FormControl>
                    <Input type="number" step="100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="miningDifficulty"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel>Mining Difficulty</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Current Bitcoin network difficulty</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <FormControl>
                    <Input type="number" step="1000000000000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="poolFees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pool Fees (%)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" min="0" max="100" {...field} />
                  </FormControl>
                  <FormDescription>Mining pool fee percentage</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hardwareCost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hardware Cost ($)</FormLabel>
                  <FormControl>
                    <Input type="number" step="100" {...field} />
                  </FormControl>
                  <FormDescription>Initial investment for mining equipment</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        <div>
          <h2 className="text-xl font-semibold mb-4">Additional Parameters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="incentives"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Incentives ($/month)</FormLabel>
                  <FormControl>
                    <Input type="number" step="10" {...field} />
                  </FormControl>
                  <FormDescription>Monthly value of carbon credits or government incentives</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="taxRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax Rate (%)</FormLabel>
                  <FormControl>
                    <Input type="number" step="1" min="0" max="100" {...field} />
                  </FormControl>
                  <FormDescription>Applicable tax rate on mining income</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isLoading}>
            {isLoading ? "Calculating..." : "Calculate Profitability"}
          </Button>
        </div>
      </form>
    </Form>
  )
}


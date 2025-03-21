"use client"

import { useState, useEffect } from "react"
import { Cpu, Settings, Search, RefreshCw, Minus, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Sparkles } from "lucide-react"

export interface MinerModel {
  id: string
  name: string
  powerConsumption: number // in watts
  hashRate: number // in TH/s
  isCustom?: boolean
  brand?: string
  releaseDate?: string
  hardwareCost?: number
  efficiency?: number // J/TH
  dailyProfit?: string
}

interface MinerSelectionProps {
  onMinerSelected: (miner: MinerModel) => void
  isEnergyDataUploaded: boolean
}

export default function MinerSelection({ onMinerSelected, isEnergyDataUploaded }: MinerSelectionProps) {
  const [selectedMiner, setSelectedMiner] = useState<MinerModel | null>(null)
  const [selectedMiners, setSelectedMiners] = useState<{ miner: MinerModel; quantity: number }[]>([])
  const [customMiner, setCustomMiner] = useState<MinerModel>({
    id: "custom",
    name: "Custom Miner",
    powerConsumption: 3000,
    hashRate: 100,
    isCustom: true,
  })
  const [minerData, setMinerData] = useState<MinerModel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<string>("all")
  const [showMinerSelector, setShowMinerSelector] = useState(false)
  const [recommendationLoading, setRecommendationLoading] = useState(false)
  const [recommendationError, setRecommendationError] = useState<string | null>(null)

  const totalPower = selectedMiners.reduce((sum, item) => sum + item.miner.powerConsumption * item.quantity, 0)
  const totalHashrate = selectedMiners.reduce((sum, item) => sum + item.miner.hashRate * item.quantity, 0)

  useEffect(() => {
    fetchMinerData()
  }, [])

  const fetchMinerData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/asicminervaluenewwwwwww2-INf7gC6xPTQQWiT7OZGruuOYLquCml.csv",
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch miner data: ${response.status}`)
      }

      const csvText = await response.text()
      const parsedMiners = parseCSV(csvText)
      setMinerData(parsedMiners)
    } catch (err) {
      console.error("Error fetching miner data:", err)
      setError("Failed to load miner data. Using default miners instead.")
      // Set default miners as fallback
      setMinerData([
        { id: "antminer-s19-pro", name: "Antminer S19 Pro", brand: "Bitmain", powerConsumption: 3250, hashRate: 110 },
        { id: "whatsminer-m30s++", name: "Whatsminer M30S++", brand: "MicroBT", powerConsumption: 3472, hashRate: 112 },
        { id: "bitmain-s21", name: "Bitmain S21", brand: "Bitmain", powerConsumption: 3550, hashRate: 200 },
        { id: "antminer-s19-xp", name: "Antminer S19 XP", brand: "Bitmain", powerConsumption: 3010, hashRate: 140 },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const parseCSV = (csvText: string): MinerModel[] => {
    const lines = csvText.split("\n")
    const headers = lines[0].split(",")

    const miners: MinerModel[] = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const values = line.split(",")
      if (values.length < 5) continue

      const brand = values[0]
      const name = values[1]
      const hashRate = Number.parseFloat(values[2])
      const releaseDate = values[3]
      const powerConsumption = Number.parseFloat(values[4])
      const efficiency = values[5] ? Number.parseFloat(values[5]) : powerConsumption / hashRate

      // Parse hardware cost - remove $ and any other non-numeric characters
      let hardwareCost = 0
      if (values[6]) {
        const costString = values[6].replace(/[^0-9.]/g, "")
        hardwareCost = Number.parseFloat(costString) || 0
      }

      const dailyProfit = values[9] || "N/A"

      if (isNaN(hashRate) || isNaN(powerConsumption)) continue

      miners.push({
        id: `${brand.toLowerCase()}-${name.toLowerCase().replace(/\s+/g, "-")}-${i}`,
        name,
        brand,
        powerConsumption,
        hashRate,
        releaseDate,
        hardwareCost,
        efficiency,
        dailyProfit,
      })
    }

    return miners
  }

  const addMiner = (miner: MinerModel, quantity: number) => {
    // Check if this miner is already in the list
    const existingIndex = selectedMiners.findIndex((item) => item.miner.id === miner.id)

    if (existingIndex >= 0) {
      // Update quantity if already exists
      updateQuantity(existingIndex, selectedMiners[existingIndex].quantity + quantity)
    } else {
      // Add new miner
      setSelectedMiners([...selectedMiners, { miner, quantity }])
    }
  }

  const updateQuantity = (index: number, newQuantity: number) => {
    const updated = [...selectedMiners]
    updated[index].quantity = newQuantity
    setSelectedMiners(updated)
  }

  const removeMiner = (index: number) => {
    setSelectedMiners(selectedMiners.filter((_, i) => i !== index))
  }

  const runAnalysis = () => {
    if (selectedMiners.length === 0) return

    // Create a combined miner model that represents all selected miners
    const combinedMiner: MinerModel = {
      id: "combined",
      name: `${selectedMiners.reduce((sum, item) => sum + item.quantity, 0)} Miners`,
      powerConsumption: totalPower,
      hashRate: totalHashrate,
    }

    onMinerSelected(combinedMiner)
  }

  const createRecommendedSetup = async () => {
    if (!isEnergyDataUploaded || minerData.length === 0) {
      setRecommendationError("Please upload energy data and ensure miner data is loaded first")
      return
    }

    setRecommendationLoading(true)
    setRecommendationError(null)
    setSelectedMiners([])

    try {
      // Get the maximum power available from the energy data
      // This would typically come from the parent component, but we'll simulate it here
      const maxPowerKw = 10 // Example: 10kW maximum power
      const maxPowerW = maxPowerKw * 1000

      // Sort miners by efficiency (J/TH) - lower is better
      const sortedMiners = [...minerData]
        .filter((miner) => miner.powerConsumption > 0 && miner.hashRate > 0 && miner.hardwareCost)
        .sort((a, b) => {
          const efficiencyA = a.efficiency || a.powerConsumption / a.hashRate
          const efficiencyB = b.efficiency || b.powerConsumption / b.hashRate
          return efficiencyA - efficiencyB
        })

      if (sortedMiners.length === 0) {
        throw new Error("No suitable miners found with complete data")
      }

      // Find the most efficient miners that fit within the power budget
      let remainingPower = maxPowerW
      const selectedSetup: { miner: MinerModel; quantity: number }[] = []

      // First pass: Add the most efficient miners
      for (const miner of sortedMiners.slice(0, 10)) {
        // Consider top 10 most efficient miners
        if (miner.powerConsumption <= remainingPower) {
          const maxQuantity = Math.floor(remainingPower / miner.powerConsumption)
          if (maxQuantity > 0) {
            // Start with a reasonable quantity (not using all power on one type)
            const quantity = Math.min(maxQuantity, 3)
            selectedSetup.push({ miner, quantity })
            remainingPower -= miner.powerConsumption * quantity
          }
        }
      }

      // Second pass: Try to fill remaining power with smaller miners
      const smallerMiners = sortedMiners
        .filter((miner) => miner.powerConsumption <= remainingPower)
        .sort((a, b) => b.hashRate / b.hardwareCost! - a.hashRate / a.hardwareCost!)

      for (const miner of smallerMiners) {
        if (miner.powerConsumption <= remainingPower) {
          const maxQuantity = Math.floor(remainingPower / miner.powerConsumption)
          if (maxQuantity > 0) {
            // Check if this miner is already in the setup
            const existingSetup = selectedSetup.find((setup) => setup.miner.id === miner.id)
            if (existingSetup) {
              existingSetup.quantity += 1
            } else {
              selectedSetup.push({ miner, quantity: 1 })
            }
            remainingPower -= miner.powerConsumption
          }
        }

        // Stop if we've used most of the power
        if (remainingPower < 500) break
      }

      if (selectedSetup.length === 0) {
        throw new Error("Could not find miners that fit within your power constraints")
      }

      // Update the selected miners
      setSelectedMiners(selectedSetup)

      // Automatically run the analysis
      if (selectedSetup.length > 0) {
        setTimeout(() => {
          const combinedMiner: MinerModel = {
            id: "combined",
            name: `${selectedSetup.reduce((sum, item) => sum + item.quantity, 0)} Miners`,
            powerConsumption: selectedSetup.reduce((sum, item) => sum + item.miner.powerConsumption * item.quantity, 0),
            hashRate: selectedSetup.reduce((sum, item) => sum + item.miner.hashRate * item.quantity, 0),
          }
          onMinerSelected(combinedMiner)
        }, 500)
      }
    } catch (err) {
      console.error("Error creating recommended setup:", err)
      setRecommendationError(err instanceof Error ? err.message : "Failed to create recommended setup")
    } finally {
      setRecommendationLoading(false)
    }
  }

  // Get unique brands for tabs
  const brands = Array.from(new Set(minerData.map((miner) => miner.brand || "Unknown")))

  // Filter miners based on search query and active tab
  const filteredMiners = minerData.filter((miner) => {
    const matchesSearch =
      searchQuery === "" ||
      miner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (miner.brand && miner.brand.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesTab = activeTab === "all" || (miner.brand && miner.brand.toLowerCase() === activeTab.toLowerCase())

    return matchesSearch && matchesTab
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="h-5 w-5" />
          <span>Select Bitcoin Miner</span>
        </CardTitle>
        <CardDescription>
          Choose from {minerData.length} ASIC miners or enter custom specifications to analyze profitability with your
          energy profile
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3 mb-6">
          <Button
            variant="default"
            size="lg"
            onClick={() => setShowMinerSelector(true)}
            className="flex items-center gap-2"
          >
            <Cpu className="h-5 w-5" />
            Choose Miners
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={createRecommendedSetup}
            className="flex items-center gap-2"
            disabled={!isEnergyDataUploaded || isLoading}
          >
            <Sparkles className="h-5 w-5" />
            Create Recommended Setup
          </Button>

          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Loading miner data...</span>
            </div>
          )}
        </div>

        {/* Miner selection dialog */}
        {showMinerSelector && (
          <Dialog open={showMinerSelector} onOpenChange={setShowMinerSelector}>
            <DialogContent className="sm:max-w-[900px] max-h-[80vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Select Miners</DialogTitle>
                <DialogDescription>
                  Choose from {minerData.length} ASIC miners to analyze with your energy profile
                </DialogDescription>
              </DialogHeader>

              <div className="flex items-center space-x-2 my-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search miners by name or brand..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={fetchMinerData} disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Refresh miner data</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <ScrollArea className="w-full whitespace-nowrap pb-2">
                  <TabsList className="inline-flex w-auto">
                    <TabsTrigger value="all">All Miners</TabsTrigger>
                    {brands.sort().map((brand) => (
                      <TabsTrigger key={brand} value={brand.toLowerCase()}>
                        {brand}
                      </TabsTrigger>
                    ))}
                    <TabsTrigger value="custom">Custom</TabsTrigger>
                  </TabsList>
                </ScrollArea>

                <div className="flex-1 overflow-hidden mt-4">
                  <ScrollArea className="h-[400px] w-full rounded-md border">
                    <TabsContent value="all" className="p-4 space-y-4 h-full">
                      {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="border rounded-md p-4">
                              <Skeleton className="h-5 w-40 mb-2" />
                              <div className="flex gap-2 mb-3">
                                <Skeleton className="h-5 w-16" />
                                <Skeleton className="h-5 w-16" />
                                <Skeleton className="h-5 w-16" />
                              </div>
                              <div className="flex justify-between">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-8 w-16" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : error ? (
                        <div className="text-center p-4 text-red-500">{error}</div>
                      ) : filteredMiners.length === 0 ? (
                        <div className="text-center p-4 text-muted-foreground">
                          No miners found matching your search criteria
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {filteredMiners.map((miner) => (
                            <div key={miner.id} className="border rounded-md p-4 hover:bg-muted/50">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium">{miner.name}</h4>
                                    <Badge variant="outline" className="text-xs">
                                      {miner.brand}
                                    </Badge>
                                  </div>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    <Badge variant="outline">{miner.powerConsumption}W</Badge>
                                    <Badge variant="outline">{miner.hashRate} TH/s</Badge>
                                    <Badge variant="outline">
                                      {miner.efficiency
                                        ? `${miner.efficiency} J/TH`
                                        : ((miner.powerConsumption / miner.hashRate) * 1000).toFixed(2) + " J/TH"}
                                    </Badge>
                                    {miner.hardwareCost && <Badge variant="outline">${miner.hardwareCost}</Badge>}
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button type="button" variant="outline" size="sm" onClick={() => addMiner(miner, 1)}>
                                    Add
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    {brands.map((brand) => (
                      <TabsContent key={brand} value={brand.toLowerCase()} className="p-4 space-y-4 h-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {minerData
                            .filter(
                              (miner) =>
                                miner.brand === brand &&
                                (searchQuery === "" || miner.name.toLowerCase().includes(searchQuery.toLowerCase())),
                            )
                            .map((miner) => (
                              <div key={miner.id} className="border rounded-md p-4 hover:bg-muted/50">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h4 className="font-medium">{miner.name}</h4>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      <Badge variant="outline">{miner.powerConsumption}W</Badge>
                                      <Badge variant="outline">{miner.hashRate} TH/s</Badge>
                                      <Badge variant="outline">
                                        {miner.efficiency
                                          ? `${miner.efficiency} J/TH`
                                          : ((miner.powerConsumption / miner.hashRate) * 1000).toFixed(2) + " J/TH"}
                                      </Badge>
                                      {miner.hardwareCost && <Badge variant="outline">${miner.hardwareCost}</Badge>}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => addMiner(miner, 1)}
                                    >
                                      Add
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </TabsContent>
                    ))}

                    <TabsContent value="custom" className="p-4 space-y-4 h-full">
                      <div className="border rounded-md p-4">
                        <h4 className="font-medium mb-3">Custom Miner Specifications</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Name</label>
                            <Input
                              type="text"
                              placeholder="Custom Miner"
                              value={customMiner.name}
                              onChange={(e) => setCustomMiner({ ...customMiner, name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Power (W)</label>
                            <Input
                              type="number"
                              placeholder="3000"
                              value={customMiner.powerConsumption}
                              onChange={(e) =>
                                setCustomMiner({ ...customMiner, powerConsumption: Number(e.target.value) })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Hashrate (TH/s)</label>
                            <Input
                              type="number"
                              placeholder="100"
                              value={customMiner.hashRate}
                              onChange={(e) => setCustomMiner({ ...customMiner, hashRate: Number(e.target.value) })}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end mt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => addMiner({ ...customMiner, id: `custom-${Date.now()}` }, 1)}
                            disabled={
                              !customMiner.name || customMiner.powerConsumption <= 0 || customMiner.hashRate <= 0
                            }
                          >
                            Add Custom Miner
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </ScrollArea>
                </div>
              </Tabs>

              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setShowMinerSelector(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {recommendationLoading && (
          <div className="p-6 border rounded-md mb-6 flex flex-col items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin mb-4 text-primary" />
            <h3 className="text-lg font-medium mb-2">Creating Recommended Setup</h3>
            <p className="text-muted-foreground text-center">
              Analyzing your energy profile and finding the optimal miner combination...
            </p>
          </div>
        )}

        {recommendationError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Recommendation Error</AlertTitle>
            <AlertDescription>{recommendationError}</AlertDescription>
          </Alert>
        )}

        {selectedMiners.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Selected Miners</h3>
              <Button type="button" variant="outline" size="sm" onClick={runAnalysis} disabled={!isEnergyDataUploaded}>
                {!isEnergyDataUploaded ? "Upload Energy Data First" : "Run Analysis"}
              </Button>
            </div>

            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Miner</TableHead>
                    <TableHead>Specs</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedMiners.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          {item.miner.name}
                          {item.miner.brand && (
                            <span className="text-xs text-muted-foreground">{item.miner.brand}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">
                            {item.miner.powerConsumption}W
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {item.miner.hashRate} TH/s
                          </Badge>
                          {item.miner.hardwareCost && (
                            <Badge variant="outline" className="text-xs">
                              ${item.miner.hardwareCost}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(index, Math.max(1, item.quantity - 1))}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(index, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => removeMiner(index)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-md">
              <div>
                <p className="text-sm font-medium">Total Power: {totalPower.toFixed(0)}W</p>
                <p className="text-sm font-medium">Total Hashrate: {totalHashrate.toFixed(2)} TH/s</p>
                {selectedMiners.some((item) => item.miner.hardwareCost) && (
                  <p className="text-sm font-medium">
                    Total Hardware Cost: $
                    {selectedMiners
                      .reduce((sum, item) => sum + (item.miner.hardwareCost || 0) * item.quantity, 0)
                      .toFixed(0)}
                  </p>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedMiners.reduce((sum, item) => sum + item.quantity, 0)} miners selected
              </p>
            </div>
          </div>
        )}
      </CardContent>
      {selectedMiner && (
        <CardFooter className="flex flex-col items-start border-t bg-muted/50 px-6 py-4">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Selected Miner:</span>
            <span className="text-sm">{selectedMiner.name}</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="secondary">{selectedMiner.powerConsumption}W</Badge>
            <Badge variant="secondary">{selectedMiner.hashRate} TH/s</Badge>
            <Badge variant="secondary">
              {((selectedMiner.hashRate / selectedMiner.powerConsumption) * 1000).toFixed(2)} J/TH
            </Badge>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}


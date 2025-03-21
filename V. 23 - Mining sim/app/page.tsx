"use client"

import { useState } from "react"
import { Cpu } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import FileUpload from "@/components/csv-upload"
import HourlyEnergyChart from "@/components/hourly-energy-chart"
import AdvancedAnalysis from "@/components/advanced-analysis"
import MinerSelection, { type MinerModel } from "@/components/miner-selection"
import EnergyUtilizationAnalysis from "@/components/energy-utilization-analysis"
import ProfitabilityBreakdown from "@/components/profitability-breakdown"

interface EnergyData {
  timestamp: string
  energy: number
}

export default function Home() {
  const [energyData, setEnergyData] = useState<EnergyData[]>([])
  const [selectedMiner, setSelectedMiner] = useState<MinerModel | null>(null)

  const handleDataUploaded = (data: EnergyData[]) => {
    setEnergyData(data)
  }

  const handleMinerSelected = (miner: MinerModel) => {
    setSelectedMiner(miner)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Bitcoin Mining Energy Analysis</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Upload your hourly energy export data to analyze mining profitability and optimize your setup based on your
          specific energy patterns.
        </p>
      </header>

      <div className="space-y-8 max-w-5xl mx-auto">
        <FileUpload onDataUploaded={handleDataUploaded} />

        {energyData.length > 0 && (
          <>
            <Separator />

            <HourlyEnergyChart data={energyData} />

            <AdvancedAnalysis data={energyData} />

            <Separator />

            <div className="flex items-center gap-2 mb-4">
              <Cpu className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight">Bitcoin Mining Optimization</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Analyze how effectively Bitcoin miners would operate with your specific energy profile and calculate
              potential profitability.
            </p>

            <MinerSelection onMinerSelected={handleMinerSelected} isEnergyDataUploaded={energyData.length > 0} />

            {selectedMiner && (
              <>
                <EnergyUtilizationAnalysis energyData={energyData} selectedMiner={selectedMiner} />

                <ProfitabilityBreakdown energyData={energyData} selectedMiner={selectedMiner} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}


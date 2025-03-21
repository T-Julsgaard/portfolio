"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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

interface SummaryTableProps {
  results: CalculationResults
}

export default function SummaryTable({ results }: SummaryTableProps) {
  // Ensure results is not null and has all required properties
  if (!results) {
    return <div>No results available</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead colSpan={2} className="text-center font-medium">
            Financial Comparison
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">Grid Selling Monthly Revenue</TableCell>
          <TableCell className="text-right">${(results.gridSellMonthly || 0).toFixed(2)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Mining Monthly Revenue (Before Costs)</TableCell>
          <TableCell className="text-right">${(results.miningRevenueMonthly || 0).toFixed(2)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Mining Monthly Costs</TableCell>
          <TableCell className="text-right">${(results.miningCostsMonthly || 0).toFixed(2)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Mining Monthly Profit (After Costs)</TableCell>
          <TableCell className="text-right">${(results.miningProfitMonthly || 0).toFixed(2)}</TableCell>
        </TableRow>
        <TableRow className="bg-muted/50">
          <TableCell className="font-medium">Net Difference (Mining vs Grid)</TableCell>
          <TableCell
            className={`text-right ${(results.netDifferenceMonthly || 0) > 0 ? "text-green-600" : "text-blue-600"}`}
          >
            ${Math.abs(results.netDifferenceMonthly || 0).toFixed(2)} in favor of{" "}
            {(results.netDifferenceMonthly || 0) > 0 ? "Mining" : "Grid Selling"}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Breakeven Period</TableCell>
          <TableCell className="text-right">{(results.breakevenMonths || 0).toFixed(1)} months</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Annual ROI (Mining)</TableCell>
          <TableCell className="text-right">{(results.roi || 0).toFixed(2)}%</TableCell>
        </TableRow>
      </TableBody>
      <TableHeader>
        <TableRow>
          <TableHead colSpan={2} className="text-center font-medium mt-4">
            Energy Distribution
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">Total Energy Produced</TableCell>
          <TableCell className="text-right">{(results.totalEnergyProduced || 0).toFixed(2)} kWh/day</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Energy Used for Mining</TableCell>
          <TableCell className="text-right">{(results.energyUsedForMining || 0).toFixed(2)} kWh/day</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Energy Sold to Grid</TableCell>
          <TableCell className="text-right">
            {((results.totalEnergyProduced || 0) - (results.energyUsedForMining || 0)).toFixed(2)} kWh/day
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Mining Energy Percentage</TableCell>
          <TableCell className="text-right">
            {(((results.energyUsedForMining || 0) / Math.max(0.01, results.totalEnergyProduced || 0)) * 100).toFixed(2)}
            %
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}


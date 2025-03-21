interface MinerModel {
  id: string
  name: string
  powerConsumption: number // in watts
  hashRate: number // in TH/s
}

const minerModels: Record<string, MinerModel> = {
  "antminer-s19-pro": { id: "antminer-s19-pro", name: "Antminer S19 Pro", powerConsumption: 3250, hashRate: 110 },
  "antminer-s19j-pro": { id: "antminer-s19j-pro", name: "Antminer S19j Pro", powerConsumption: 3050, hashRate: 100 },
  "whatsminer-m30s++": { id: "whatsminer-m30s++", name: "Whatsminer M30S++", powerConsumption: 3472, hashRate: 112 },
  "avalon-1246": { id: "avalon-1246", name: "Avalon 1246", powerConsumption: 3420, hashRate: 90 },
}

interface CalculationParams {
  // Energy production details
  energySource: string
  capacity: number
  dailyProduction: number

  // Grid pricing
  gridSellPrice: number

  // Bitcoin mining parameters
  electricityCost: number
  minerModel: string
  miningDifficulty?: number
  btcPrice?: number
  poolFees: number
  hardwareCost?: number

  // Additional parameters
  incentives?: number
  taxRate?: number
}

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

export function calculateProfitability(params: CalculationParams): CalculationResults {
  // Default values
  const miningDifficulty = params.miningDifficulty || 70000000000000
  const btcPrice = params.btcPrice || 60000
  const incentives = params.incentives || 0
  const taxRate = params.taxRate || 0
  const hardwareCost = params.hardwareCost || 0

  // Get miner specs
  const miner = minerModels[params.minerModel]
  if (!miner) {
    throw new Error("Invalid miner model")
  }

  // Calculate daily energy production
  const dailyEnergyProduction = params.dailyProduction // kWh
  const monthlyEnergyProduction = dailyEnergyProduction * 30 // kWh

  // Calculate grid selling revenue
  const gridSellMonthly = monthlyEnergyProduction * params.gridSellPrice

  // Calculate mining potential
  // How many miners can we run with our energy?
  const minerDailyEnergy = (miner.powerConsumption / 1000) * 24 // kWh per day per miner
  const maxMiners = Math.floor(dailyEnergyProduction / minerDailyEnergy)

  // If we can't run even one miner, mining is not viable
  if (maxMiners < 1) {
    return {
      gridSellMonthly,
      miningRevenueMonthly: 0,
      miningCostsMonthly: 0,
      miningProfitMonthly: 0,
      netDifferenceMonthly: -gridSellMonthly, // Grid is better
      breakevenMonths: Number.POSITIVE_INFINITY,
      roi: 0,
      energyUsedForMining: 0,
      totalEnergyProduced: dailyEnergyProduction,
      monthlyData: Array.from({ length: 24 }, (_, i) => ({
        month: i + 1,
        gridRevenue: gridSellMonthly,
        miningProfit: 0,
        cumulativeGridRevenue: gridSellMonthly * (i + 1),
        cumulativeMiningProfit: 0,
      })),
    }
  }

  // Calculate energy used for mining
  const energyUsedForMining = maxMiners * minerDailyEnergy // kWh per day

  // Calculate BTC mining revenue
  // Formula: (hashrate * blocks_per_day * block_reward) / (network_difficulty * 2^32)
  const totalHashRate = maxMiners * miner.hashRate // TH/s
  const hashRateGH = totalHashRate * 1000 // GH/s
  const blocksPerDay = 144 // Average BTC blocks per day
  const blockReward = 6.25 // Current BTC block reward
  const dailyBtcMined = (hashRateGH * blocksPerDay * blockReward) / (miningDifficulty / 2 ** 32)

  // Apply pool fees
  const dailyBtcAfterPoolFees = dailyBtcMined * (1 - params.poolFees / 100)

  // Convert to USD
  const dailyRevenue = dailyBtcAfterPoolFees * btcPrice
  const monthlyRevenue = dailyRevenue * 30

  // Calculate operational costs
  // Energy cost is already accounted for in our scenario since we're using our own energy
  // But we'll calculate it for reference
  const monthlyCosts = energyUsedForMining * 30 * params.electricityCost + hardwareCost / 24 // Amortize hardware over 2 years

  // Apply incentives
  const monthlyRevenueWithIncentives = monthlyRevenue + incentives

  // Apply taxes
  const afterTaxRevenue = monthlyRevenueWithIncentives * (1 - taxRate / 100)

  // Calculate profit
  const monthlyProfit = afterTaxRevenue - monthlyCosts

  // Calculate net difference
  const netDifference = monthlyProfit - gridSellMonthly

  // Calculate breakeven period (in months)
  const breakevenMonths = hardwareCost / Math.max(0.01, monthlyProfit) // Avoid division by zero

  // Calculate ROI
  const annualProfit = monthlyProfit * 12
  const roi = (annualProfit / hardwareCost) * 100

  // Generate monthly data for charts (24 months)
  const monthlyData = Array.from({ length: 24 }, (_, i) => {
    const month = i + 1
    const gridRevenue = gridSellMonthly
    const miningProfit = monthlyProfit

    return {
      month,
      gridRevenue,
      miningProfit,
      cumulativeGridRevenue: gridRevenue * month,
      cumulativeMiningProfit: miningProfit * month - hardwareCost,
    }
  })

  return {
    gridSellMonthly,
    miningRevenueMonthly: monthlyRevenue,
    miningCostsMonthly: monthlyCosts,
    miningProfitMonthly: monthlyProfit,
    netDifferenceMonthly: netDifference,
    breakevenMonths,
    roi,
    energyUsedForMining,
    totalEnergyProduced: dailyEnergyProduction,
    monthlyData,
  }
}


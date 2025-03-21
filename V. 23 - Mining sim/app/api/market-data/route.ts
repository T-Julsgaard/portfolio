import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Try to fetch BTC price from CoinGecko with better error handling
    let btcPrice = 60000 // Default fallback value
    try {
      const priceResponse = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd", {
        next: { revalidate: 60 }, // Cache for 1 minute
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })

      if (priceResponse.ok) {
        const priceData = await priceResponse.json()
        if (priceData && priceData.bitcoin && priceData.bitcoin.usd) {
          btcPrice = priceData.bitcoin.usd
        }
      } else {
        console.log(`CoinGecko API returned status: ${priceResponse.status}`)
      }
    } catch (priceError) {
      console.error("Error fetching BTC price:", priceError)
    }

    // Try to fetch mining difficulty with better error handling
    let miningDifficulty = 70000000000000 // Default fallback value

    // Try multiple APIs for difficulty data
    const difficultyApis = ["https://api.btc.com/v3/stats", "https://blockchain.info/q/getdifficulty"]

    for (const api of difficultyApis) {
      try {
        const difficultyResponse = await fetch(api, {
          next: { revalidate: 3600 }, // Cache for 1 hour
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })

        if (difficultyResponse.ok) {
          const data = await difficultyResponse.json()

          // Handle different API response formats
          if (api.includes("btc.com") && data && data.data && data.data.difficulty) {
            miningDifficulty = data.data.difficulty
            break
          } else if (api.includes("blockchain.info") && typeof data === "number") {
            // blockchain.info returns the difficulty directly as a number
            miningDifficulty = data * 1000000000000 // Convert to same scale
            break
          }
        } else {
          console.log(`API ${api} returned status: ${difficultyResponse.status}`)
        }
      } catch (difficultyError) {
        console.error(`Error fetching from ${api}:`, difficultyError)
        // Continue to the next API if this one fails
      }
    }

    // Return the data we have, whether from APIs or fallback values
    return NextResponse.json({
      btcPrice,
      miningDifficulty,
      timestamp: new Date().toISOString(),
      source: btcPrice === 60000 && miningDifficulty === 70000000000000 ? "fallback" : "api",
    })
  } catch (error) {
    console.error("Error in market data API route:", error)

    // Always return a valid response even if everything fails
    return NextResponse.json(
      {
        btcPrice: 60000, // Fallback BTC price
        miningDifficulty: 70000000000000, // Fallback difficulty
        timestamp: new Date().toISOString(),
        source: "fallback",
        error: "Failed to fetch live data, using fallback values",
      },
      { status: 200 }, // Still return 200 to not break the UI
    )
  }
}


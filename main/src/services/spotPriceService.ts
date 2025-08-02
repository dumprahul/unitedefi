export interface SpotPriceResponse {
  [tokenAddress: string]: string; // Price in USD
}

export interface PriceCalculation {
  destinationTokenPrice: number;
  sourceTokenPrice: number;
  sourceTokenAmount: number;
  destinationTokenAmount: number;
  conversionRate: number;
}

export const fetchSpotPrice = async (chainId: string, tokenAddress: string): Promise<number> => {
  try {
    const url = `/api/spot-price/${chainId}/${tokenAddress}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: SpotPriceResponse = await response.json();
    const price = parseFloat(data[tokenAddress] || '0');
    
    console.log(`💰 Spot price for ${tokenAddress} on chain ${chainId}: $${price}`);
    
    return price;
  } catch (error) {
    console.error(`Error fetching spot price for ${tokenAddress} on chain ${chainId}:`, error);
    return 0;
  }
};

export const calculateSourceTokenAmount = async (
  destinationChainId: string,
  destinationTokenAddress: string,
  destinationTokenAmount: number,
  sourceChainId: string,
  sourceTokenAddress: string
): Promise<PriceCalculation> => {
  try {
    console.log("🔄 Starting price calculation...");
    console.log("🎯 Destination:", {
      chainId: destinationChainId,
      tokenAddress: destinationTokenAddress,
      amount: destinationTokenAmount
    });
    console.log("🔗 Source:", {
      chainId: sourceChainId,
      tokenAddress: sourceTokenAddress
    });

    // Fetch destination token price
    const destinationTokenPrice = await fetchSpotPrice(destinationChainId, destinationTokenAddress);
    
    // Fetch source token price
    const sourceTokenPrice = await fetchSpotPrice(sourceChainId, sourceTokenAddress);

    if (destinationTokenPrice === 0 || sourceTokenPrice === 0) {
      throw new Error("Unable to fetch token prices");
    }

    // Calculate the USD value of destination token amount
    const destinationValueUSD = destinationTokenAmount * destinationTokenPrice;
    
    // Calculate how much source token is needed to match the USD value
    const sourceTokenAmount = destinationValueUSD / sourceTokenPrice;
    
    // Calculate conversion rate
    const conversionRate = destinationTokenPrice / sourceTokenPrice;

    const calculation: PriceCalculation = {
      destinationTokenPrice,
      sourceTokenPrice,
      sourceTokenAmount,
      destinationTokenAmount,
      conversionRate
    };

    console.log("✅ Price calculation completed:", {
      destinationTokenPrice: `$${destinationTokenPrice}`,
      sourceTokenPrice: `$${sourceTokenPrice}`,
      destinationValueUSD: `$${destinationValueUSD}`,
      sourceTokenAmount: sourceTokenAmount.toFixed(6),
      conversionRate: conversionRate.toFixed(6)
    });

    return calculation;
  } catch (error) {
    console.error("❌ Error in price calculation:", error);
    throw error;
  }
}; 
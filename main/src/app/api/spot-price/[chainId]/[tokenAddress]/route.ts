import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chainId: string; tokenAddress: string }> }
) {
  try {
    const { chainId, tokenAddress } = await params;
    const apiKey = process.env.INCH_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: '1inch API key not configured' },
        { status: 500 }
      );
    }

    // Add currency parameter as USD
    const url = `https://api.1inch.dev/price/v1.1/${chainId}/${tokenAddress}?currency=USD`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log(`💰 Spot price fetched for ${tokenAddress} on chain ${chainId}:`, data);
    
    return NextResponse.json(data);
  } catch (error) {
    const { chainId, tokenAddress } = await params;
    console.error(`Error fetching spot price for ${tokenAddress} on chain ${chainId}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch spot price' },
      { status: 500 }
    );
  }
} 
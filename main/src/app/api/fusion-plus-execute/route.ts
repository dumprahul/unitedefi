import { NextRequest, NextResponse } from 'next/server';
import { HashLock, SDK, PresetEnum, ReadyToAcceptSecretFills, OrderStatusResponse, OrderStatus } from '@1inch/cross-chain-sdk';
import { BigNumber, ethers } from 'ethers';

// Server-side blockchain provider (read-only for now)
class ServerBlockchainProvider {
  private provider: ethers.providers.JsonRpcProvider;

  constructor(rpcUrl: string) {
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  }

  async signTypedData(walletAddress: string, typedData: any): Promise<string> {
    // For now, return a placeholder signature
    // In a real implementation, this would need to be handled by the client
    throw new Error('Signing requires client-side wallet integration');
  }

  async ethCall(contractAddress: string, callData: string): Promise<string> {
    return this.provider.call({
      to: contractAddress,
      data: callData,
    });
  }
}

// Helper function to get the correct router address for each chain
function getAggregationRouterAddress(chainId: number): string {
  const routerAddresses: { [chainId: number]: string } = {
    1: '0x1111111254EEB25477B68fb85Ed929f73A960582', // Ethereum Mainnet
    42161: '0x111111125421ca6dc452d289314280a0f8842a65', // Arbitrum
    10: '0x1111111254EEB25477B68fb85Ed929f73A960582', // Optimism
    137: '0x1111111254EEB25477B68fb85Ed929f73A960582', // Polygon
    56: '0x1111111254EEB25477B68fb85Ed929f73A960582', // BSC
    43114: '0x1111111254EEB25477B68fb85Ed929f73A960582', // Avalanche
    100: '0x1111111254EEB25477B68fb85Ed929f73A960582', // Gnosis
    8453: '0x1111111254EEB25477B68fb85Ed929f73A960582', // Base
    59144: '0x1111111254EEB25477B68fb85Ed929f73A960582', // Linea
    324: '0x1111111254EEB25477B68fb85Ed929f73A960582', // zkSync Era
  };

  const routerAddress = routerAddresses[chainId];
  if (!routerAddress) {
    throw new Error(`No router address found for chain ID: ${chainId}`);
  }

  return routerAddress;
}

// Function to get RPC URL for a chain
function getRpcUrl(chainId: number): string {
  const rpcUrls: { [chainId: number]: string } = {
    1: 'https://api.1inch.dev/web3/1',
    42161: 'https://api.1inch.dev/web3/42161',
    10: 'https://api.1inch.dev/web3/10',
    137: 'https://api.1inch.dev/web3/137',
    56: 'https://api.1inch.dev/web3/56',
    43114: 'https://api.1inch.dev/web3/43114',
    100: 'https://api.1inch.dev/web3/100',
    8453: 'https://api.1inch.dev/web3/8453',
    59144: 'https://api.1inch.dev/web3/59144',
    324: 'https://api.1inch.dev/web3/324',
  };

  const rpcUrl = rpcUrls[chainId];
  if (!rpcUrl) {
    throw new Error(`No RPC URL found for chain ID: ${chainId}`);
  }

  return rpcUrl;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      srcChainId,
      dstChainId,
      srcTokenAddress,
      dstTokenAddress,
      amount,
      receiverAddress,
      walletAddress
    } = body;

    const authKey = process.env.NEXT_PUBLIC_AUTH_KEY;

    if (!authKey) {
      return NextResponse.json(
        { error: '1inch Fusion Plus API key not configured' },
        { status: 500 }
      );
    }

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    console.log('🚀 Starting Server-Side Fusion+ Cross-Chain Swap');
    console.log('Parameters:', {
      srcChainId,
      dstChainId,
      srcTokenAddress,
      dstTokenAddress,
      amount,
      receiverAddress,
      walletAddress
    });

    // Get RPC URL for source chain
    const rpcUrl = getRpcUrl(srcChainId);
    
    // Create blockchain provider
    const blockchainProvider = new ServerBlockchainProvider(rpcUrl);

    // Initialize SDK
    const sdk = new SDK({
      url: 'https://api.1inch.dev/fusion-plus',
      authKey,
      blockchainProvider,
    });

    // Get quote
    console.log('📊 Fetching quote...');
    const quote = await sdk.getQuote({
      srcChainId,
      dstChainId,
      srcTokenAddress,
      dstTokenAddress,
      amount,
      enableEstimate: true,
      walletAddress,
    });

    console.log('✅ Quote received. Recommended preset:', quote.recommendedPreset);

    // For now, return the quote information
    // Full swap execution requires client-side wallet integration
    return NextResponse.json({
      success: true,
      message: 'Quote fetched successfully',
      quote: {
        recommendedPreset: quote.recommendedPreset,
        srcChainId,
        dstChainId,
        srcTokenAddress,
        dstTokenAddress,
        amount,
        receiverAddress,
        walletAddress
      },
      note: 'Full swap execution requires client-side wallet integration for signing'
    });

  } catch (error) {
    console.error('❌ Error in server-side Fusion+ swap:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 
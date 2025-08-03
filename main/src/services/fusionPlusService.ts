import { useAccount } from 'wagmi';

// Custom hook for Fusion+ functionality
export function useFusionPlus() {
  const { address, isConnected } = useAccount();

  const executeCrossChainSwap = async (params: {
    srcChainId: number;
    dstChainId: number;
    srcTokenAddress: string;
    dstTokenAddress: string;
    amount: string;
    receiverAddress: string;
  }) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      console.log('🚀 Starting Cross-Chain Swap via Server-Side API');
      console.log('Parameters:', {
        ...params,
        walletAddress: address,
        receiverAddress: params.receiverAddress
      });

      // Call our server-side API
      const response = await fetch('/api/fusion-plus-execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...params,
          walletAddress: address
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to execute swap');
      }

      const result = await response.json();
      console.log('✅ Server-side swap result:', result);

      return result;

    } catch (error) {
      console.error('❌ Error in cross-chain swap:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  return {
    executeCrossChainSwap,
    isConnected,
    address
  };
}

// Function to get RPC URL for a chain
export function getRpcUrl(chainId: number): string {
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
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { HashLock, SDK, PresetEnum, ReadyToAcceptSecretFills, OrderStatusResponse, OrderStatus } from '@1inch/cross-chain-sdk';
import { BigNumber, ethers } from 'ethers';
import { useEffect, useState } from 'react';

// Blockchain Provider for Fusion Plus SDK using Wagmi
class WagmiBlockchainProvider {
  private walletClient: any;
  private publicClient: any;

  constructor(walletClient: any, publicClient: any) {
    this.walletClient = walletClient;
    this.publicClient = publicClient;
  }

  async signTypedData(walletAddress: string, typedData: any): Promise<string> {
    const { domain, types, message } = typedData;
    const { EIP712Domain, ...signTypes } = types;
    
    // Use Wagmi's wallet client to sign typed data
    const signature = await this.walletClient.signTypedData({
      account: walletAddress,
      domain,
      types: signTypes,
      primaryType: 'Order',
      message,
    });
    
    return signature;
  }

  async ethCall(contractAddress: string, callData: string): Promise<string> {
    // Use Wagmi's public client to make contract calls
    const result = await this.publicClient.call({
      to: contractAddress,
      data: callData,
    });
    
    return result.data || '0x';
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

// Ensure token allowance for the router using Wagmi
async function ensureAllowance(
  walletClient: any,
  publicClient: any,
  tokenAddress: string,
  spenderAddress: string,
  amount: string | BigNumber | bigint,
  walletAddress: string
) {
  // Create contract instance for allowance check
  const allowanceAbi = [
    'function allowance(address owner, address spender) view returns (uint256)',
    'function approve(address spender, uint256 amount) returns (bool)',
  ];

  console.log(`Token Address: ${tokenAddress}`);
  console.log(`Owner Address: ${walletAddress}`);
  console.log(`Spender Address: ${spenderAddress}`);

  // Check current allowance
  const currentAllowance = await publicClient.readContract({
    address: tokenAddress as `0x${string}`,
    abi: allowanceAbi,
    functionName: 'allowance',
    args: [walletAddress, spenderAddress],
  });

  console.log(`Current allowance: ${currentAllowance.toString()}`);

  const requiredAmount = BigNumber.from(amount);

  if (BigNumber.from(currentAllowance).lt(requiredAmount)) {
    console.log(`Required allowance: ${requiredAmount.toString()}. Current allowance is insufficient.`);
    console.log(`Approving ${spenderAddress} to spend ${requiredAmount.toString()} tokens...`);
    
    try {
      // Approve using Wagmi wallet client
      const { hash } = await walletClient.writeContract({
        address: tokenAddress as `0x${string}`,
        abi: allowanceAbi,
        functionName: 'approve',
        args: [spenderAddress, requiredAmount],
      });

      console.log(`Approval transaction sent: ${hash} (waiting for confirmation...)`);
      
      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log(`Approval transaction confirmed. Gas used: ${receipt.gasUsed.toString()}`);

      // Verify new allowance
      const newAllowance = await publicClient.readContract({
        address: tokenAddress as `0x${string}`,
        abi: allowanceAbi,
        functionName: 'allowance',
        args: [walletAddress, spenderAddress],
      });

      console.log(`New allowance after approval: ${newAllowance.toString()}`);
      
      if (BigNumber.from(newAllowance).lt(requiredAmount)) {
        console.error("ERROR: Allowance after approval is still less than required.");
        throw new Error("Allowance not updated correctly after approval.");
      }
    } catch (e) {
      console.error("Error during token approval transaction:", e);
      throw e;
    }
  } else {
    console.log(`Sufficient allowance already set: ${currentAllowance.toString()} >= ${requiredAmount.toString()}`);
  }
}

// Verify allowance using Wagmi
async function verifyAllowance(
  publicClient: any,
  tokenAddress: string,
  spenderAddress: string,
  expectedAmount: string,
  walletAddress: string
) {
  const allowanceAbi = [
    'function allowance(address owner, address spender) view returns (uint256)',
  ];

  const currentAllowance = await publicClient.readContract({
    address: tokenAddress as `0x${string}`,
    abi: allowanceAbi,
    functionName: 'allowance',
    args: [walletAddress, spenderAddress],
  });

  const expectedAmountBN = BigNumber.from(expectedAmount);

  console.log(`Verifying allowance for ${spenderAddress}:`);
  console.log(`  Expected: ${expectedAmountBN.toString()}`);
  console.log(`  Current:  ${currentAllowance.toString()}`);
  console.log(`  Sufficient: ${BigNumber.from(currentAllowance).gte(expectedAmountBN) ? '✅ YES' : '❌ NO'}`);

  return BigNumber.from(currentAllowance).gte(expectedAmountBN);
}

// Custom hook for Fusion+ functionality
export function useFusionPlus() {
  const [isMounted, setIsMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  // Ensure we're on the client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const executeCrossChainSwap = async (params: {
    srcChainId: number;
    dstChainId: number;
    srcTokenAddress: string;
    dstTokenAddress: string;
    amount: string;
    receiverAddress: string;
    executeSwap?: boolean;
  }) => {
    if (!isMounted) {
      throw new Error('Component not mounted yet');
    }

    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    if (!walletClient || !publicClient) {
      throw new Error('Wallet client not available');
    }

    try {
      console.log('🚀 Starting Real Cross-Chain Swap with Fusion Plus SDK');
      console.log('Parameters:', {
        ...params,
        walletAddress: address,
        receiverAddress: params.receiverAddress
      });

      const authKey = process.env.NEXT_PUBLIC_AUTH_KEY;
      if (!authKey) {
        throw new Error('Auth key not configured');
      }

      // Create blockchain provider using Wagmi
      const blockchainProvider = new WagmiBlockchainProvider(walletClient, publicClient);

      // Initialize SDK with server proxy
      const sdk = new SDK({
        url: '/api/fusion-plus',
        authKey,
        blockchainProvider,
      });

      // Get quote using SDK
      console.log('📊 Fetching quote...');
      const quote = await sdk.getQuote({
        srcChainId: params.srcChainId,
        dstChainId: params.dstChainId,
        srcTokenAddress: params.srcTokenAddress,
        dstTokenAddress: params.dstTokenAddress,
        amount: params.amount,
        enableEstimate: true,
        walletAddress: address,
      });

      console.log('✅ Quote received. Recommended preset:', quote.recommendedPreset);

      // If not executing swap, return quote only
      if (!params.executeSwap) {
        return {
          success: true,
          message: 'Quote fetched successfully',
          quote: {
            recommendedPreset: quote.recommendedPreset,
            srcChainId: params.srcChainId,
            dstChainId: params.dstChainId,
            srcTokenAddress: params.srcTokenAddress,
            dstTokenAddress: params.dstTokenAddress,
            amount: params.amount,
            receiverAddress: params.receiverAddress,
            walletAddress: address
          }
        };
      }

      // Get aggregation router address
      const aggregationRouterAddress = getAggregationRouterAddress(params.srcChainId);
      console.log(`🔗 Using 1inch Aggregation Router V6: ${aggregationRouterAddress}`);

      // Ensure allowance using Wagmi
      console.log(`🔐 Ensuring allowance for ${address} to let Aggregation Router V6 ${aggregationRouterAddress} use ${params.amount} of token ${params.srcTokenAddress}...`);
      
      await ensureAllowance(
        walletClient,
        publicClient,
        params.srcTokenAddress,
        aggregationRouterAddress,
        params.amount,
        address
      );

      // Verify approval
      const approvalVerified = await verifyAllowance(
        publicClient,
        params.srcTokenAddress,
        aggregationRouterAddress,
        params.amount,
        address
      );

      if (!approvalVerified) {
        throw new Error('Token approval verification failed');
      }

      console.log('✅ Token approval verified successfully');

      // Generate secrets
      const secretsCount = quote.getPreset().secretsCount;
      console.log('🔐 Secrets count required:', secretsCount);

      const secrets = Array.from({ length: secretsCount }).map(() => 
        ethers.utils.hexlify(ethers.utils.randomBytes(32))
      );
      const secretHashes = secrets.map((s) => HashLock.hashSecret(s));

      const hashLock = secretsCount === 1
        ? HashLock.forSingleFill(secrets[0])
        : HashLock.forMultipleFills(HashLock.getMerkleLeaves(secrets));

      // Place order
      console.log('📝 Placing order...');
      console.log('Order parameters:');
      console.log(`  Wallet Address: ${address}`);
      console.log(`  Receiver: ${params.receiverAddress}`);
      console.log(`  Preset: ${PresetEnum.fast}`);
      console.log(`  Source: emojipay-app`);
      console.log(`  HashLock: ${hashLock}`);
      console.log(`  Secret Hashes: ${secretHashes}`);

      const order = await sdk.placeOrder(quote, {
        walletAddress: address,
        receiver: params.receiverAddress,
        preset: PresetEnum.fast,
        source: 'emojipay-app',
        hashLock,
        secretHashes,
      });

      console.log('✅ Order placed successfully!');
      console.log('Order details:', JSON.stringify(order, null, 2));

      const orderHash = order.orderHash;
      console.log('🎯 OrderHash:', orderHash);

      // Wait for escrows & finality
      let ready: ReadyToAcceptSecretFills;
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes with 5-second intervals
      
      do {
        console.log(`⏳ Waiting for escrows & finality... (attempt ${attempts + 1}/${maxAttempts})`);
        ready = await sdk.getReadyToAcceptSecretFills(orderHash);
        attempts++;
        
        if (attempts >= maxAttempts) {
          throw new Error('Timeout waiting for escrows and finality');
        }
        
        await new Promise((r) => setTimeout(r, 5000));
      } while (ready.fills.length === 0);

      console.log('✅ Escrows ready, revealing secrets...');

      // Reveal secrets to unlock escrows
      for (const secret of secrets) {
        console.log('🔓 Submitting secret:', secret);
        await sdk.submitSecret(orderHash, secret);
      }

      console.log('✅ All secrets submitted, monitoring order status...');

      // Monitor until order reaches terminal state
      const terminalStates = [
        OrderStatus.Executed,
        OrderStatus.Expired,
        OrderStatus.Cancelled,
        OrderStatus.Refunded,
      ];

      let status: OrderStatus;
      let statusAttempts = 0;
      const maxStatusAttempts = 120; // 10 minutes with 5-second intervals
      
      do {
        const resp = await sdk.getOrderStatus(orderHash);
        status = resp.status;
        console.log(`📊 Status: ${status} (attempt ${statusAttempts + 1}/${maxStatusAttempts})`);
        
        if (terminalStates.includes(status)) break;
        
        statusAttempts++;
        if (statusAttempts >= maxStatusAttempts) {
          throw new Error('Timeout waiting for order to reach terminal state');
        }
        
        await new Promise((r) => setTimeout(r, 5000));
      } while (true);

      console.log('✅ Final status:', status);

      return {
        success: true,
        message: 'Swap executed successfully',
        orderHash,
        status,
        order,
        quote: {
          recommendedPreset: quote.recommendedPreset,
          srcChainId: params.srcChainId,
          dstChainId: params.dstChainId,
          srcTokenAddress: params.srcTokenAddress,
          dstTokenAddress: params.dstTokenAddress,
          amount: params.amount,
          receiverAddress: params.receiverAddress,
          walletAddress: address
        }
      };

    } catch (error) {
      console.error('❌ Error in cross-chain swap:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  // Function to get quote only
  const getQuote = async (params: {
    srcChainId: number;
    dstChainId: number;
    srcTokenAddress: string;
    dstTokenAddress: string;
    amount: string;
    receiverAddress: string;
  }) => {
    return executeCrossChainSwap({
      ...params,
      executeSwap: false
    });
  };

  // Function to execute full swap
  const executeFullSwap = async (params: {
    srcChainId: number;
    dstChainId: number;
    srcTokenAddress: string;
    dstTokenAddress: string;
    amount: string;
    receiverAddress: string;
  }) => {
    return executeCrossChainSwap({
      ...params,
      executeSwap: true
    });
  };

  return {
    executeCrossChainSwap,
    getQuote,
    executeFullSwap,
    isConnected: isMounted ? isConnected : false,
    address: isMounted ? address : undefined
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
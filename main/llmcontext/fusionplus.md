this docs is to understand how the fusion plus sdk works-

IMPORTANT-
THIS CODE TOTALLY USES THE ETHERS 5.7.0 VERSION
SO YOU HAVE TO USE THIS TO WORK WITH FULL FUNCTIONALITY

Use Wagmi for wallet connection, chain switching, etc.

FOR ethers5.7.0, use it only for interacting with contracts, but always derive signer from Wagmi's walletClient.

DONT CHANGE THE MAIN AND ETHERS CODE

code-
import { HashLock, SDK, PresetEnum, ReadyToAcceptSecretFills, ReadyToExecutePublicActions, OrderStatusResponse, OrderStatus } from '@1inch/cross-chain-sdk';
import dotenv from 'dotenv';
import { BigNumber, ethers } from 'ethers';

// 2. CLASS DEFINITIONS
class EthersBlockchainProvider {
private wallet: ethers.Wallet;

constructor(privateKey: string, provider: ethers.providers.JsonRpcProvider) {
this.wallet = new ethers.Wallet(privateKey, provider);
}

async signTypedData(walletAddress: string, typedData: any): Promise<string> {
const { domain, types, message } = typedData;
const { EIP712Domain, ...signTypes } = types;
return this.wallet.\_signTypedData(domain, signTypes, message);
}

async ethCall(contractAddress: string, callData: string): Promise<string> {
return this.wallet.provider.call({
to: contractAddress,
data: callData,
});
}
}

// 3. HELPER FUNCTION DEFINITIONS
async function ensureAllowance(
wallet: ethers.Wallet,
tokenAddress: string,
spenderAddress: string,
amount: string | BigNumber | bigint
) {
const tokenContract = new ethers.Contract(
tokenAddress,
[
'function allowance(address owner, address spender) view returns (uint256)',
'function approve(address spender, uint256 amount) returns (bool)',
],
wallet
);

const ownerAddress = await wallet.getAddress();
const currentAllowance = await tokenContract.allowance(ownerAddress, spenderAddress);

console.log(`Token Address: ${tokenAddress}`);
console.log(`Owner Address (Maker): ${ownerAddress}`);
console.log(`Spender Address (Escrow Factory/Settlement): ${spenderAddress}`);
console.log(`Current allowance: ${currentAllowance.toString()}`);

const requiredAmount = BigNumber.from(amount);

if (currentAllowance.lt(requiredAmount)) {
console.log(`Required allowance: ${requiredAmount.toString()}. Current allowance is insufficient.`);
console.log(`Approving ${spenderAddress} to spend ${requiredAmount.toString()} tokens...`);
try {
const approveTx = await tokenContract.approve(spenderAddress, requiredAmount);
console.log(`Approval transaction sent: ${approveTx.hash} (waiting for confirmation...)`);
const receipt = await approveTx.wait();
console.log(`Approval transaction confirmed. Gas used: ${receipt.gasUsed.toString()}`);

      const newAllowance = await tokenContract.allowance(ownerAddress, spenderAddress);
      console.log(`New allowance after approval: ${newAllowance.toString()}`);
      if (newAllowance.lt(requiredAmount)) {
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

// Add function to verify approval
async function verifyAllowance(
wallet: ethers.Wallet,
tokenAddress: string,
spenderAddress: string,
expectedAmount: string
) {
const tokenContract = new ethers.Contract(
tokenAddress,
[
'function allowance(address owner, address spender) view returns (uint256)',
],
wallet
);

const ownerAddress = await wallet.getAddress();
const currentAllowance = await tokenContract.allowance(ownerAddress, spenderAddress);
const expectedAmountBN = BigNumber.from(expectedAmount);

console.log(`Verifying allowance for ${spenderAddress}:`);
console.log(`  Expected: ${expectedAmountBN.toString()}`);
console.log(`  Current:  ${currentAllowance.toString()}`);
console.log(`  Sufficient: ${currentAllowance.gte(expectedAmountBN) ? '✅ YES' : '❌ NO'}`);

return currentAllowance.gte(expectedAmountBN);
}

// Add this function to get the correct router address for each chain
function getAggregationRouterAddress(chainId: number): string {
const routerAddresses: { [chainId: number]: string } = {
1: '0x1111111254EEB25477B68fb85Ed929f73A960582', // Ethereum Mainnet
42161: '0x111111125421ca6dc452d289314280a0f8842a65', // Arbitrum
10: '0x1111111254EEB25477B68fb85Ed929f73A960582', // Optimism
137: '0x1111111254EEB25477B68fb85Ed929f73A960582', // Polygon
56: '0x1111111254EEB25477B68fb85Ed929f73A960582', // BSC
// Add more chains as needed
};

const routerAddress = routerAddresses[chainId];
if (!routerAddress) {
throw new Error(`No router address found for chain ID: ${chainId}`);
}

return routerAddress;
}

// 4. LOAD ENVIRONMENT VARIABLES
dotenv.config();

// 5. VALIDATE ENVIRONMENT VARIABLES AND THE REST OF YOUR SCRIPT LOGIC
const makerPrivateKey = process.env.MAKER_PRIVATE_KEY || "";
const makerAddressEnv = process.env.MAKER_ADDRESS || "";
const receiverAddressEnv = process.env.RECEIVER_ADDRESS || "";
const nodeUrl = process.env.NODE_URL || "";
const authKeyEnv = process.env.AUTH_KEY || "";

async function main() {
const provider = new ethers.providers.JsonRpcProvider(nodeUrl);
const blockchainProvider = new EthersBlockchainProvider(makerPrivateKey, provider);

const derivedMakerAddress = new ethers.Wallet(makerPrivateKey).address;
if (ethers.utils.getAddress(makerAddressEnv) !== ethers.utils.getAddress(derivedMakerAddress)) {
console.warn(`Warning: MAKER_ADDRESS (${makerAddressEnv}) does not match address derived from MAKER_PRIVATE_KEY (${derivedMakerAddress}).`);
}

const sdk = new SDK({
url: 'https://api.1inch.dev/fusion-plus',
authKey: authKeyEnv,
blockchainProvider,
});

const params = {
srcChainId: 42161, // Arbitrum chain ID
dstChainId: 10, // Optimism chain ID
srcTokenAddress: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // USDT on Arbitrum
dstTokenAddress: '0x4200000000000000000000000000000000000042', // OP on Optimism
amount: '5000000', // 0.95 USDC (6 decimals)
enableEstimate: true,
walletAddress: makerAddressEnv,
};

try {
console.log('Fetching quote with params:', params);
const quote = await sdk.getQuote(params);
console.log('Quote received. Recommended preset:', quote.recommendedPreset);

    // Use Aggregation Router V6 instead of escrow factory
    const aggregationRouterAddress = getAggregationRouterAddress(params.srcChainId);
    console.log(`Using 1inch Aggregation Router V6: ${aggregationRouterAddress}`);

    const tokenAmountToApprove = params.amount;
    const approvalWallet = new ethers.Wallet(makerPrivateKey, provider);

    console.log(`Ensuring allowance for maker ${await approvalWallet.getAddress()} to let Aggregation Router V6 ${aggregationRouterAddress} use ${tokenAmountToApprove} of token ${params.srcTokenAddress}...`);
    await ensureAllowance(
      approvalWallet,
      params.srcTokenAddress,
      aggregationRouterAddress,
      tokenAmountToApprove
    );

    // Verify the approval was successful
    const approvalVerified = await verifyAllowance(
      approvalWallet,
      params.srcTokenAddress,
      aggregationRouterAddress,
      tokenAmountToApprove
    );

    if (!approvalVerified) {
      throw new Error('Token approval verification failed');
    }

    console.log('✅ Token approval verified successfully');

    const secretsCount = quote.getPreset().secretsCount;
    console.log('Secrets count required:', secretsCount);

    const secrets = Array.from({ length: secretsCount }).map(() => ethers.utils.hexlify(ethers.utils.randomBytes(32)));
    const secretHashes = secrets.map((s) => HashLock.hashSecret(s));


    const hashLock =
      secretsCount === 1
        ? HashLock.forSingleFill(secrets[0])
        :
        // HashLock.forMultipleFills(
        //     secretHashes.map((secretHash, i) =>
        //       ethers.utils.solidityKeccak256(['uint64', 'bytes32'], [i, secretHash]) as string & { _tag: 'MerkleLeaf' }
        //     )
        HashLock.forMultipleFills(HashLock.getMerkleLeaves(secrets)
      );

    // Place order
    console.log('Placing order...');
    console.log('Order parameters:');
    console.log(`  Wallet Address: ${makerAddressEnv}`);
    console.log(`  Receiver: ${receiverAddressEnv}`);
    console.log(`  Preset: ${PresetEnum.fast}`);
    console.log(`  Source: sdk-tutorial`);
    console.log(`  HashLock: ${hashLock}`);
    console.log(`  Secret Hashes: ${secretHashes}`);

    const order = await sdk.placeOrder(quote, {
      walletAddress: makerAddressEnv,
      receiver: receiverAddressEnv,
      preset: PresetEnum.fast,
      source: 'sdk-tutorial',
      hashLock,
      secretHashes,
    });

    console.log('✅ Order placed successfully!');
    console.log('Order details:', JSON.stringify(order, null, 2));

const orderHash = order.orderHash;
console.log('▶️ OrderHash:', orderHash);

// 4) Wait for escrows & finality
let ready: ReadyToAcceptSecretFills;
do {
console.log('⏳ Waiting for escrows & finality...');
ready = await sdk.getReadyToAcceptSecretFills(orderHash);
await new Promise((r) => setTimeout(r, 5000));
} while (ready.fills.length === 0);

// 5) Reveal your secret(s) to unlock the escrows
for (const secret of secrets) {
console.log('🔓 Submitting secret:', secret);
await sdk.submitSecret(orderHash, secret);
}

// 6) Monitor until the order reaches a terminal state
const terminalStates = [
OrderStatus.Executed,
OrderStatus.Expired,
OrderStatus.Cancelled,
OrderStatus.Refunded,
];
let status: OrderStatus;
do {
const resp = await sdk.getOrderStatus(orderHash);
status = resp.status;
console.log('Status:', status);
if (terminalStates.includes(status)) break;
await new Promise((r) => setTimeout(r, 5000));
} while (true);

console.log('✅ Final status:', status);
} catch (error) {
console.error('❌ Error:', error);
}

}

main();

reference code with wagmi-

import { HashLock, SDK, PresetEnum, ReadyToAcceptSecretFills, OrderStatusResponse, OrderStatus } from '@1inch/cross-chain-sdk';
import { BigNumber, ethers } from 'ethers';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';

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

// Main function to execute cross-chain swap using Wagmi
export async function executeCrossChainSwapWithWagmi(params: {
srcChainId: number;
dstChainId: number;
srcTokenAddress: string;
dstTokenAddress: string;
amount: string;
walletAddress: string;
receiverAddress: string;
walletClient: any;
publicClient: any;
authKey: string;
}) {
try {
console.log('🚀 Starting Cross-Chain Swap with Fusion Plus SDK (Wagmi)');
console.log('Parameters:', {
srcChainId: params.srcChainId,
dstChainId: params.dstChainId,
srcTokenAddress: params.srcTokenAddress,
dstTokenAddress: params.dstTokenAddress,
amount: params.amount,
walletAddress: params.walletAddress,
receiverAddress: params.receiverAddress
});

    // Create blockchain provider using Wagmi
    const blockchainProvider = new WagmiBlockchainProvider(params.walletClient, params.publicClient);

    // Initialize SDK
    const sdk = new SDK({
      url: 'https://api.1inch.dev/fusion-plus',
      authKey: params.authKey,
      blockchainProvider,
    });

    // Get quote
    console.log('📊 Fetching quote...');
    const quote = await sdk.getQuote({
      srcChainId: params.srcChainId,
      dstChainId: params.dstChainId,
      srcTokenAddress: params.srcTokenAddress,
      dstTokenAddress: params.dstTokenAddress,
      amount: params.amount,
      enableEstimate: true,
      walletAddress: params.walletAddress,
    });

    console.log('✅ Quote received. Recommended preset:', quote.recommendedPreset);

    // Get aggregation router address
    const aggregationRouterAddress = getAggregationRouterAddress(params.srcChainId);
    console.log(`🔗 Using 1inch Aggregation Router V6: ${aggregationRouterAddress}`);

    // Ensure allowance using Wagmi
    console.log(`🔐 Ensuring allowance for ${params.walletAddress} to let Aggregation Router V6 ${aggregationRouterAddress} use ${params.amount} of token ${params.srcTokenAddress}...`);

    await ensureAllowance(
      params.walletClient,
      params.publicClient,
      params.srcTokenAddress,
      aggregationRouterAddress,
      params.amount,
      params.walletAddress
    );

    // Verify approval
    const approvalVerified = await verifyAllowance(
      params.publicClient,
      params.srcTokenAddress,
      aggregationRouterAddress,
      params.amount,
      params.walletAddress
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
    console.log(`  Wallet Address: ${params.walletAddress}`);
    console.log(`  Receiver: ${params.receiverAddress}`);
    console.log(`  Preset: ${PresetEnum.fast}`);
    console.log(`  Source: emojipay-app`);
    console.log(`  HashLock: ${hashLock}`);
    console.log(`  Secret Hashes: ${secretHashes}`);

    const order = await sdk.placeOrder(quote, {
      walletAddress: params.walletAddress,
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
    do {
      console.log('⏳ Waiting for escrows & finality...');
      ready = await sdk.getReadyToAcceptSecretFills(orderHash);
      await new Promise((r) => setTimeout(r, 5000));
    } while (ready.fills.length === 0);

    // Reveal secrets to unlock escrows
    for (const secret of secrets) {
      console.log('🔓 Submitting secret:', secret);
      await sdk.submitSecret(orderHash, secret);
    }

    // Monitor until order reaches terminal state
    const terminalStates = [
      OrderStatus.Executed,
      OrderStatus.Expired,
      OrderStatus.Cancelled,
      OrderStatus.Refunded,
    ];

    let status: OrderStatus;
    do {
      const resp = await sdk.getOrderStatus(orderHash);
      status = resp.status;
      console.log('📊 Status:', status);
      if (terminalStates.includes(status)) break;
      await new Promise((r) => setTimeout(r, 5000));
    } while (true);

    console.log('✅ Final status:', status);

    return {
      success: true,
      orderHash,
      status,
      order
    };

} catch (error) {
console.error('❌ Error in cross-chain swap:', error);
return {
success: false,
error: error instanceof Error ? error.message : 'Unknown error'
};
}
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

This code ensures how to implement the fusion plus sdk.
the api key will be given in env file

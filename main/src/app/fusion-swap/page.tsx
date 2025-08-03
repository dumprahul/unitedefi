"use client";

import { useState } from "react";
import { useFusionPlus } from "@/services/fusionPlusService";
import { chains } from "@/config/chain";
import ChainSelect from "@/components/ChainSelect";
import TokenSelect from "@/components/TokenSelect";
import { fetchTokensByChainId } from "@/services/tokenService";

export default function FusionSwapPage() {
  const [swapParams, setSwapParams] = useState({
    srcChainId: "42161", // Arbitrum
    dstChainId: "10", // Optimism
    srcTokenAddress: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", // USDT on Arbitrum
    dstTokenAddress: "0x4200000000000000000000000000000000000042", // OP on Optimism
    amount: "5000000", // 5 USDT (6 decimals)
    receiverAddress: ""
  });

  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const { executeCrossChainSwap, isConnected, address } = useFusionPlus();

  const handleParamChange = (field: string, value: string) => {
    setSwapParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTokenSelect = async (tokenAddress: string, field: 'srcTokenAddress' | 'dstTokenAddress') => {
    const chainId = field === 'srcTokenAddress' ? swapParams.srcChainId : swapParams.dstChainId;
    
    try {
      const tokens = await fetchTokensByChainId(parseInt(chainId));
      const selectedToken = tokens.find(token => token.address === tokenAddress);
      
      if (selectedToken) {
        console.log(`Selected ${field}:`, selectedToken);
        handleParamChange(field, selectedToken.address);
      }
    } catch (error) {
      console.error('Error fetching token details:', error);
    }
  };

  const handleExecuteSwap = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first!");
      return;
    }

    if (!swapParams.receiverAddress) {
      alert("Please enter a receiver address!");
      return;
    }

    try {
      setIsExecuting(true);
      setResult(null);

      console.log("🚀 Executing Fusion+ Cross-Chain Swap");
      console.log("Parameters:", swapParams);

      const result = await executeCrossChainSwap({
        srcChainId: parseInt(swapParams.srcChainId),
        dstChainId: parseInt(swapParams.dstChainId),
        srcTokenAddress: swapParams.srcTokenAddress,
        dstTokenAddress: swapParams.dstTokenAddress,
        amount: swapParams.amount,
        receiverAddress: swapParams.receiverAddress
      });

      setResult(result);

      if (result.success) {
        alert(`✅ Cross-chain swap executed successfully!\nOrder Hash: ${result.orderHash}\nStatus: ${result.status}`);
      } else {
        alert(`❌ Swap failed: ${result.error}`);
      }

    } catch (error) {
      console.error("❌ Error executing Fusion+ swap:", error);
      alert(`Failed to execute cross-chain swap: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="text-center mb-8">
              <h1 className="font-bold text-3xl mb-2 text-black">Fusion+ Cross-Chain Swap</h1>
              <p className="text-gray-600">Test the 1inch Fusion+ cross-chain swap functionality</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Source Chain */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Source Chain
                </label>
                <ChainSelect
                  value={swapParams.srcChainId}
                  onChange={(value) => handleParamChange("srcChainId", value)}
                  placeholder="Select source chain"
                />
              </div>

              {/* Destination Chain */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Destination Chain
                </label>
                <ChainSelect
                  value={swapParams.dstChainId}
                  onChange={(value) => handleParamChange("dstChainId", value)}
                  placeholder="Select destination chain"
                />
              </div>

              {/* Source Token */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Source Token
                </label>
                <TokenSelect
                  value={swapParams.srcTokenAddress}
                  onChange={(value) => handleTokenSelect(value, 'srcTokenAddress')}
                  chainId={parseInt(swapParams.srcChainId)}
                  placeholder="Select source token"
                />
              </div>

              {/* Destination Token */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Destination Token
                </label>
                <TokenSelect
                  value={swapParams.dstTokenAddress}
                  onChange={(value) => handleTokenSelect(value, 'dstTokenAddress')}
                  chainId={parseInt(swapParams.dstChainId)}
                  placeholder="Select destination token"
                />
              </div>
            </div>

            {/* Amount */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-black mb-2">
                Amount (in wei)
              </label>
              <input
                type="text"
                value={swapParams.amount}
                onChange={(e) => handleParamChange("amount", e.target.value)}
                placeholder="5000000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            {/* Receiver Address */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-black mb-2">
                Receiver Address
              </label>
              <input
                type="text"
                value={swapParams.receiverAddress}
                onChange={(e) => handleParamChange("receiverAddress", e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            {/* Execute Button */}
            <button
              onClick={handleExecuteSwap}
              disabled={!isConnected || isExecuting}
              className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExecuting ? "🔄 Executing Swap..." : "🚀 Execute Cross-Chain Swap"}
            </button>

            {/* Result Display */}
            {result && (
              <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h5 className="font-bold text-black mb-3">
                  {result.success ? "✅ Swap Result" : "❌ Swap Failed"}
                </h5>
                
                <div className="space-y-2">
                  {result.success ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Order Hash:</span>
                        <span className="font-mono text-xs text-green-600 break-all">
                          {result.orderHash}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className="font-medium text-green-600">
                          {result.status}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-red-600 text-sm">
                      Error: {result.error}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Connection Status */}
            <div className="mt-4 text-center">
              <p className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? '✅ Wallet Connected' : '❌ Wallet Not Connected'}
              </p>
              {isConnected && address && (
                <p className="text-xs text-gray-500 mt-1">
                  Address: {address.slice(0, 6)}...{address.slice(-4)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
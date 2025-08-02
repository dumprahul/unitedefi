"use client";

import { useState } from "react";
import { getReceiptByEmojiCode } from "@/services/receiptService";
import { Receipt } from "@/lib/supabase";
import { chains } from "@/config/chain";
import ChainSelect from "@/components/ChainSelect";
import TokenSelect from "@/components/TokenSelect";
import { fetchTokensByChainId } from "@/services/tokenService";
import { calculateSourceTokenAmount, PriceCalculation } from "@/services/spotPriceService";

export default function DropReceiptPage() {
  const [emojis, setEmojis] = useState(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [receiptData, setReceiptData] = useState<Receipt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReceiptFound, setIsReceiptFound] = useState(false);
  const [priceCalculation, setPriceCalculation] = useState<PriceCalculation | null>(null);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  
  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    chain: "",
    token: "",
    tokenAddress: "",
    tokenSymbol: ""
  });

  // Helper function to convert stored amount back to human-readable format
  const convertAmountToReadable = (amount: string, decimals: number): string => {
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue)) return "0";
    
    // Divide by 10^decimals to get the original amount
    const divisor = Math.pow(10, decimals);
    const readableAmount = amountValue / divisor;
    
    // Format to appropriate decimal places
    return readableAmount.toFixed(6).replace(/\.?0+$/, '');
  };

  const handleEmojiChange = (index: number, value: string) => {
    const newEmojis = [...emojis];
    newEmojis[index] = value;
    setEmojis(newEmojis);
  };

  // Helper function to count actual emojis (not characters)
  const countEmojis = (text: string) => {
    return Array.from(text).length;
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      console.log('Pasted text:', clipboardText);
      
      // Split into individual emojis
      const emojiArray = Array.from(clipboardText);
      console.log('Emoji array:', emojiArray);
      
      if (emojiArray.length >= 4) {
        const newEmojis = emojiArray.slice(0, 4);
        console.log('Setting emojis:', newEmojis);
        setEmojis(newEmojis);
      } else {
        alert("Please copy at least 4 emojis to paste");
      }
    } catch (err) {
      console.error('Paste error:', err);
      alert("Failed to read clipboard. Please paste manually.");
    }
  };

  const handleInputPaste = (e: React.ClipboardEvent, index: number) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    console.log('Input paste text:', pastedText);

    // Split into individual emojis
    const emojiArray = Array.from(pastedText);
    console.log('Input paste emoji array:', emojiArray);

    if (emojiArray.length >= 4) {
      const newEmojis = [...emojis];
      // Distribute first 4 emojis across all boxes
      for (let i = 0; i < 4; i++) {
        newEmojis[i] = emojiArray[i] || "";
      }
      setEmojis(newEmojis);
    } else if (emojiArray.length > 0) {
      // If less than 4 emojis, just paste in current box
      const newEmojis = [...emojis];
      newEmojis[index] = emojiArray[0] || "";
      setEmojis(newEmojis);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if all 4 boxes have emojis
    const filledEmojis = emojis.filter(emoji => emoji.trim() !== "");
    console.log('Filled emojis:', filledEmojis);
    console.log('Emoji count:', filledEmojis.length);
    
    if (filledEmojis.length !== 4) {
      alert("Please enter exactly 4 emojis");
      return;
    }

    const emojiCode = filledEmojis.join('');
    console.log('Emoji code:', emojiCode);

    setIsLoading(true);
    setError(null);
    setIsReceiptFound(false);
    
    try {
      const receipt = await getReceiptByEmojiCode(emojiCode);
      
      if (receipt) {
        console.log("✅ Receipt Found:", {
          emojiCode: emojiCode,
          receipt: receipt,
          description: receipt.description,
          destinationChain: receipt.destination_chain,
          destinationToken: receipt.destination_token,
          destinationTokenAddress: receipt.destination_token_address,
          amount: receipt.amount,
          decimals: receipt.decimal,
          destinationAddress: receipt.destination_address
        });
        
        setReceiptData(receipt);
        setIsReceiptFound(true);
      } else {
        console.log("❌ No receipt found for emoji code:", emojiCode);
        setError("No receipt found with these emojis. Please check and try again.");
        setIsReceiptFound(false);
      }
    } catch (error) {
      console.error('Error fetching receipt:', error);
      setError("Failed to fetch receipt. Please try again.");
      setIsReceiptFound(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentFormChange = (field: string, value: string) => {
    setPaymentForm(prev => ({
      ...prev,
      [field]: value
    }));

    // Log source chain selection
    if (field === "chain") {
      const selectedChain = chains.find(chain => chain.id.toString() === value);
      console.log("🔗 Selected Source Chain:", {
        chainId: value,
        chainName: selectedChain?.name || "Unknown",
        rpcUrl: selectedChain?.rpcUrl || ""
      });
    }
  };

  const handleTokenSelect = async (tokenAddress: string) => {
    if (!paymentForm.chain) return;
    
    try {
      const tokens = await fetchTokensByChainId(parseInt(paymentForm.chain));
      const selectedToken = tokens.find(token => token.address === tokenAddress);
      
      if (selectedToken) {
        console.log("🎯 Selected Source Token:", {
          sourceChainId: paymentForm.chain,
          sourceTokenName: selectedToken.name,
          sourceTokenSymbol: selectedToken.symbol,
          sourceTokenAddress: selectedToken.address,
          sourceTokenDecimals: selectedToken.decimals
        });

        setPaymentForm(prev => ({
          ...prev,
          token: selectedToken.symbol,
          tokenAddress: selectedToken.address,
          tokenSymbol: selectedToken.symbol
        }));
      }
    } catch (error) {
      console.error('Error fetching token details:', error);
    }
  };

  const handleEmoSwap = async () => {
    if (!paymentForm.chain || !paymentForm.token) {
      alert("Please select both chain and token");
      return;
    }
    
    if (!receiptData) {
      alert("No receipt data available");
      return;
    }

    // Get the selected chain details
    const selectedChain = chains.find(chain => chain.id.toString() === paymentForm.chain);
    
    // Organize source and destination parameters
    const sourceParams = {
      chain: {
        id: paymentForm.chain,
        name: selectedChain?.name || "Unknown",
        rpcUrl: selectedChain?.rpcUrl || ""
      },
      token: {
        symbol: paymentForm.token,
        address: paymentForm.tokenAddress,
        name: paymentForm.tokenSymbol
      }
    };

    const destinationParams = {
      chain: {
        name: receiptData.destination_chain,
        // You might want to map chain names to IDs here
        id: getChainIdByName(receiptData.destination_chain)
      },
      token: {
        symbol: receiptData.destination_token,
        address: receiptData.destination_token_address,
        name: receiptData.destination_token
      },
      amount: {
        raw: receiptData.amount,
        readable: convertAmountToReadable(receiptData.amount, receiptData.decimal),
        decimals: receiptData.decimal
      },
      description: receiptData.description,
      destinationAddress: receiptData.destination_address
    };

    // Comprehensive console logging
    console.log("=== EMOJI SWAP PARAMETERS ===");
    console.log("📱 Receipt Data:", receiptData);
    console.log("🔗 Source Parameters:", sourceParams);
    console.log("🎯 Destination Parameters:", destinationParams);
    console.log("💰 Amount Details:", {
      raw: receiptData.amount,
      readable: convertAmountToReadable(receiptData.amount, receiptData.decimal),
      decimals: receiptData.decimal,
      token: receiptData.destination_token
    });
    console.log("📝 Description:", receiptData.description);
    console.log("👤 Destination Address:", receiptData.destination_address);
    console.log("🎨 Emoji Code:", emojis.join(''));
    console.log("=== END PARAMETERS ===");

    // Calculate spot prices and required source token amount
    try {
      setIsCalculatingPrice(true);
      setPriceCalculation(null);

      const destinationAmount = parseFloat(convertAmountToReadable(receiptData.amount, receiptData.decimal));
      
      // Log the destination token details before calculation
      console.log("🎯 Destination Token Details:", {
        chainId: destinationParams.chain.id,
        tokenAddress: destinationParams.token.address,
        tokenSymbol: destinationParams.token.symbol,
        amount: destinationAmount,
        decimals: receiptData.decimal
      });

      // Log the source token details before calculation
      console.log("🔗 Source Token Details:", {
        chainId: sourceParams.chain.id,
        tokenAddress: sourceParams.token.address,
        tokenSymbol: sourceParams.token.symbol
      });
      
      const calculation = await calculateSourceTokenAmount(
        destinationParams.chain.id,
        destinationParams.token.address,
        destinationAmount,
        sourceParams.chain.id,
        sourceParams.token.address
      );

      // Log the raw spot price values from API responses
      console.log("💰 Raw Spot Price Values:", {
        destinationTokenValue: calculation.destinationTokenPrice,
        sourceTokenValue: calculation.sourceTokenPrice,
        destinationChainId: destinationParams.chain.id,
        sourceChainId: sourceParams.chain.id,
        destinationTokenAddress: destinationParams.token.address,
        sourceTokenAddress: sourceParams.token.address
      });

      setPriceCalculation(calculation);

      console.log("💱 Price Calculation Result:", {
        destinationToken: `${destinationAmount} ${destinationParams.token.symbol}`,
        destinationTokenPrice: `$${calculation.destinationTokenPrice}`,
        sourceToken: `${calculation.sourceTokenAmount.toFixed(6)} ${sourceParams.token.symbol}`,
        sourceTokenPrice: `$${calculation.sourceTokenPrice}`,
        conversionRate: calculation.conversionRate.toFixed(6)
      });

    } catch (error) {
      console.error("❌ Error calculating prices:", error);
      alert("Failed to calculate token prices. Please try again.");
    } finally {
      setIsCalculatingPrice(false);
    }
  };

  // Helper function to get chain ID by name
  const getChainIdByName = (chainName: string): string => {
    const chain = chains.find(c => c.name.toLowerCase() === chainName.toLowerCase());
    return chain?.id.toString() || "1"; // Default to Ethereum if not found
  };

  const handleReset = () => {
    setEmojis(["", "", "", ""]);
    setReceiptData(null);
    setError(null);
    setIsReceiptFound(false);
    setPriceCalculation(null);
    setPaymentForm({
      chain: "",
      token: "",
      tokenAddress: "",
      tokenSymbol: ""
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left Section - Branding */}
          <div className="flex flex-col justify-center items-center lg:items-start text-center lg:text-left">
            <div className="mb-8">
              <h1 className="font-bold text-black text-5xl mb-4">EmojiSwap</h1>
              <p className="text-xl text-gray-800 font-light max-w-md">
                Retrieve payment receipts using emoji codes. 
                Enter the 4 emojis to access your cross-chain payment details.
              </p>
            </div>
          </div>

          {/* Right Section - Emoji Input */}
          <div className="flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 w-full max-w-lg">
              {!isReceiptFound ? (
                <>
                  <div className="text-center mb-8">
                    <h2 className="font-bold text-2xl mb-2 text-black">Drop Receipt</h2>
                    <p className="text-gray-700">Enter the 4 emojis to retrieve your receipt</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Emoji Input Boxes */}
                    <div className="grid grid-cols-4 gap-4">
                      {emojis.map((emoji, index) => (
                        <div key={index}>
                          <input
                            type="text"
                            value={emoji}
                            onChange={(e) => handleEmojiChange(index, e.target.value)}
                            onPaste={(e) => handleInputPaste(e, index)}
                            className="w-full h-16 text-center text-2xl border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 font-light"
                            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                            maxLength={2}
                            placeholder=""
                          />
                        </div>
                      ))}
                    </div>

                    {/* Paste Button */}
                    <button
                      type="button"
                      onClick={handlePaste}
                      className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      Paste Emojis
                    </button>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading || emojis.filter(emoji => emoji.trim() !== "").length !== 4}
                      className="w-full bg-black text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "🔄 Searching..." : "Retrieve Receipt"}
                    </button>
                  </form>

                  {/* Error Message */}
                  {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}
                </>
              ) : (
                /* Receipt Data - Inline Display */
                receiptData && (
                  <div>
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-black mb-2">Receipt Found!</h3>
                      <p className="text-gray-600">Here are your payment details</p>
                    </div>

                    {/* Receipt Details - Horizontal Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {/* Left Column - Receipt Info */}
                      <div className="space-y-3">
                        <div className="p-3 bg-gray-50 rounded-lg border">
                          <div className="text-sm text-gray-600 mb-1">Description</div>
                          <div className="font-medium text-black">{receiptData.description}</div>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-lg border">
                          <div className="text-sm text-gray-600 mb-1">Destination Chain</div>
                          <div className="font-medium text-black">{receiptData.destination_chain}</div>
                        </div>
                      </div>

                      {/* Right Column - Token & Amount */}
                      <div className="space-y-3">
                        <div className="p-3 bg-gray-50 rounded-lg border">
                          <div className="text-sm text-gray-600 mb-1">Destination Token</div>
                          <div className="font-medium text-black">{receiptData.destination_token}</div>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-lg border">
                          <div className="text-sm text-gray-600 mb-1">Amount</div>
                          <div className="font-medium text-black">
                            {convertAmountToReadable(receiptData.amount, receiptData.decimal)} {receiptData.destination_token}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Section */}
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-lg font-bold text-black mb-4">Select Payment Details</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Chain Selection */}
                        <div>
                          <label className="block text-sm font-medium text-black mb-2">
                            Select Chain to Pay
                          </label>
                          <ChainSelect
                            value={paymentForm.chain}
                            onChange={(value) => handlePaymentFormChange("chain", value)}
                            placeholder="Select a chain"
                          />
                        </div>

                        {/* Token Selection */}
                        <div>
                          <label className="block text-sm font-medium text-black mb-2">
                            Select Token to Pay
                          </label>
                          <TokenSelect
                            value={paymentForm.tokenAddress}
                            onChange={handleTokenSelect}
                            chainId={paymentForm.chain ? parseInt(paymentForm.chain) : undefined}
                            placeholder="Select a token"
                          />
                        </div>
                      </div>

                      {/* EmoSwap Button */}
                      <button
                        onClick={handleEmoSwap}
                        disabled={!paymentForm.chain || !paymentForm.token || isCalculatingPrice}
                        className="w-full bg-black text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCalculatingPrice ? "🔄 Calculating..." : "EmoSwap!"}
                      </button>

                      {/* Price Calculation Results */}
                      {priceCalculation && (
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h5 className="font-bold text-black mb-3">💱 Price Calculation</h5>
                          
                          <div className="space-y-3">
                            {/* Destination Token Info */}
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Destination Token:</span>
                              <span className="font-medium text-black">
                                {convertAmountToReadable(receiptData.amount, receiptData.decimal)} {receiptData.destination_token}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Destination Token Price:</span>
                              <span className="font-medium text-black">
                                ${priceCalculation.destinationTokenPrice.toFixed(6)}
                              </span>
                            </div>

                            {/* Source Token Info */}
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Required Source Token:</span>
                              <span className="font-medium text-black">
                                {priceCalculation.sourceTokenAmount.toFixed(6)} {paymentForm.token}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Source Token Price:</span>
                              <span className="font-medium text-black">
                                ${priceCalculation.sourceTokenPrice.toFixed(6)}
                              </span>
                            </div>

                            {/* Conversion Rate */}
                            <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                              <span className="text-sm font-medium text-gray-700">Conversion Rate:</span>
                              <span className="font-bold text-blue-600">
                                1 {receiptData.destination_token} = {priceCalculation.conversionRate.toFixed(6)} {paymentForm.token}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Reset Button */}
                    <div className="mt-4 text-center">
                      <button
                        onClick={handleReset}
                        className="text-gray-500 hover:text-gray-700 text-sm underline"
                      >
                        Search Another Receipt
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
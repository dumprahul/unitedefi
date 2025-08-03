"use client";

import { useState, useEffect } from "react";
import { getReceiptByEmojiCode } from "@/services/receiptService";
import { Receipt } from "@/lib/supabase";
import { chains } from "@/config/chain";
import ChainSelect from "@/components/ChainSelect";
import TokenSelect from "@/components/TokenSelect";
import { fetchTokensByChainId } from "@/services/tokenService";
import { calculateSourceTokenAmount, PriceCalculation } from "@/services/spotPriceService";
import { useFusionPlus } from "@/services/fusionPlusService";
import { motion } from "motion/react";

export default function DropReceiptPage() {
  const [emojis, setEmojis] = useState(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [receiptData, setReceiptData] = useState<Receipt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReceiptFound, setIsReceiptFound] = useState(false);
  const [priceCalculation, setPriceCalculation] = useState<PriceCalculation | null>(null);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  const [isExecutingSwap, setIsExecutingSwap] = useState(false);
  const [swapResult, setSwapResult] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(true);
  const [showPriceDetailsModal, setShowPriceDetailsModal] = useState(false);
  
  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    chain: "",
    token: "",
    tokenAddress: "",
    tokenSymbol: "",
    tokenDecimals: 18 // Default to 18 decimals
  });

  // Fusion+ hook
  const { executeCrossChainSwap, getQuote, executeFullSwap, isConnected, address } = useFusionPlus();

  // Ensure we're on the client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  // Helper function to convert human-readable amount to wei format
  const convertToWei = (amount: number, decimals: number): string => {
    // Round up to ensure sufficient amount and remove excessive decimals
    // This prevents "invalid amount" errors from the API
    const roundedAmount = Math.ceil(amount);
    const weiAmount = roundedAmount * Math.pow(10, decimals);
    return weiAmount.toString();
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
        console.log("🔢 Token Decimals:", {
          token: selectedToken.symbol,
          decimals: selectedToken.decimals,
          example: `1 ${selectedToken.symbol} = ${Math.pow(10, selectedToken.decimals)} wei`
        });

        setPaymentForm(prev => ({
          ...prev,
          token: selectedToken.symbol,
          tokenAddress: selectedToken.address,
          tokenSymbol: selectedToken.symbol,
          tokenDecimals: selectedToken.decimals
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

    if (!isConnected) {
      alert("Please connect your wallet first!");
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

      setPriceCalculation(calculation);
      setShowPaymentForm(false); // Hide payment form after successful calculation

    } catch (error) {
      console.error("❌ Error calculating prices:", error);
      alert("Failed to calculate token prices. Please try again.");
    } finally {
      setIsCalculatingPrice(false);
    }
  };

  const handleFetchFusionQuote = async () => {
    if (!paymentForm.chain || !paymentForm.token || !receiptData) {
      alert("Please select chain, token and ensure receipt data is available");
      return;
    }

    if (!isConnected) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      setIsExecutingSwap(true);
      setSwapResult(null);

      // Get the required source token amount from price calculation
      const sourceTokenAmount = priceCalculation ? priceCalculation.sourceTokenAmount : 0;
      
      // Convert to wei format using the helper function
      const amountInWei = convertToWei(sourceTokenAmount, paymentForm.tokenDecimals);

      console.log("📊 Fetching Fusion+ Quote");
      const roundedAmount = Math.ceil(sourceTokenAmount);
      console.log("💰 Amount Conversion:", {
        originalAmount: sourceTokenAmount,
        roundedAmount: roundedAmount,
        tokenDecimals: paymentForm.tokenDecimals,
        amountInWei: amountInWei,
        calculation: `${roundedAmount} * 10^${paymentForm.tokenDecimals} = ${amountInWei}`
      });
      console.log("Parameters:", {
        srcChainId: parseInt(paymentForm.chain),
        dstChainId: parseInt(getChainIdByName(receiptData.destination_chain)),
        srcTokenAddress: paymentForm.tokenAddress,
        dstTokenAddress: receiptData.destination_token_address,
        amount: amountInWei,
        receiverAddress: receiptData.destination_address
      });

      const result = await getQuote({
        srcChainId: parseInt(paymentForm.chain),
        dstChainId: parseInt(getChainIdByName(receiptData.destination_chain)),
        srcTokenAddress: paymentForm.tokenAddress,
        dstTokenAddress: receiptData.destination_token_address,
        amount: amountInWei,
        receiverAddress: receiptData.destination_address
      });

      setSwapResult(result);

      if (result.success) {
        alert(`✅ Quote fetched successfully!\nPreset: ${result.quote?.recommendedPreset}`);
      } else {
        alert(`❌ Quote failed: ${result.error}`);
      }

    } catch (error) {
      console.error("❌ Error fetching Fusion+ quote:", error);
      alert(`Failed to fetch quote: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExecutingSwap(false);
    }
  };

  const handleExecuteFullSwap = async () => {
    if (!paymentForm.chain || !paymentForm.token || !receiptData) {
      alert("Please select chain, token and ensure receipt data is available");
      return;
    }

    if (!isConnected) {
      alert("Please connect your wallet first!");
      return;
    }

    if (!priceCalculation) {
      alert("Please calculate prices first by clicking 'Calculate Prices'");
      return;
    }

    try {
      setIsExecutingSwap(true);
      setSwapResult(null);

      // Get the required source token amount from price calculation
      const sourceTokenAmount = priceCalculation.sourceTokenAmount;
      
      // Convert to wei format using the helper function
      const amountInWei = convertToWei(sourceTokenAmount, paymentForm.tokenDecimals);

      console.log("🚀 Executing Full Fusion+ Swap");
      const roundedAmount = Math.ceil(sourceTokenAmount);
      console.log("💰 Amount Conversion:", {
        originalAmount: sourceTokenAmount,
        roundedAmount: roundedAmount,
        tokenDecimals: paymentForm.tokenDecimals,
        amountInWei: amountInWei,
        calculation: `${roundedAmount} * 10^${paymentForm.tokenDecimals} = ${amountInWei}`
      });
      console.log("Parameters:", {
        srcChainId: parseInt(paymentForm.chain),
        dstChainId: parseInt(getChainIdByName(receiptData.destination_chain)),
        srcTokenAddress: paymentForm.tokenAddress,
        dstTokenAddress: receiptData.destination_token_address,
        amount: amountInWei,
        receiverAddress: receiptData.destination_address
      });

      const result = await executeFullSwap({
        srcChainId: parseInt(paymentForm.chain),
        dstChainId: parseInt(getChainIdByName(receiptData.destination_chain)),
        srcTokenAddress: paymentForm.tokenAddress,
        dstTokenAddress: receiptData.destination_token_address,
        amount: amountInWei,
        receiverAddress: receiptData.destination_address
      });

      setSwapResult(result);

      if (result.success) {
        if (result.orderHash) {
          alert(`✅ Real swap executed successfully!\nOrderHash: ${result.orderHash}\nStatus: ${result.status}`);
        } else {
          alert(`✅ Quote fetched successfully!\nPreset: ${result.quote?.recommendedPreset || 'N/A'}`);
        }
      } else {
        alert(`❌ Swap failed: ${result.error}`);
      }

    } catch (error) {
      console.error("❌ Error executing Fusion+ swap:", error);
      alert(`Failed to execute swap: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExecutingSwap(false);
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
    setSwapResult(null);
    setPaymentForm({
      chain: "",
      token: "",
      tokenAddress: "",
      tokenSymbol: "",
      tokenDecimals: 18
    });
  };

  // Don't render until component is mounted to prevent hydration issues
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Full Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/main.jpg')",
        }}
      />
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left Section - Branding */}
          <div className="flex flex-col justify-center items-center lg:items-start text-center lg:text-left">
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 
                className="text-2xl md:text-3xl lg:text-6xl mb-4 text-white font-bold"
                style={{
                  textShadow: "2px 2px 0px #000000, 4px 4px 0px #FF6B35",
                  fontFamily: "'Comical Cartoon', cursive",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                Drop Receipt
              </h1>
              {/* <p 
                className="text-lg md:text-xl text-white font-bold max-w-md"
                style={{
                  textShadow: "2px 2px 0px #000000, 4px 4px 0px #FF6B35",
                  fontFamily: "'Comical Cartoon', cursive",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                Retrieve payment receipts using emoji codes. 
                Enter the 4 emojis to access your cross-chain payment details.
              </p> */}
            </motion.div>
          </div>

          {/* Right Section - Emoji Input */}
          <div className="flex items-center justify-center">
            <motion.div 
              className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border-2 border-orange-400 p-6 w-full max-w-lg"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {!isReceiptFound ? (
                <>
                  <div className="text-center mb-6">
                    <h2 className="text-xl md:text-2xl mb-2 text-black font-bold">Drop Receipt</h2>
                    <p className="text-gray-700">Enter the 4 emojis to retrieve your receipt</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Emoji Input Boxes */}
                    <div className="grid grid-cols-4 gap-4">
                      {emojis.map((emoji, index) => (
                        <div key={index}>
                          <input
                            type="text"
                            value={emoji}
                            onChange={(e) => handleEmojiChange(index, e.target.value)}
                            onPaste={(e) => handleInputPaste(e, index)}
                            className="w-full h-16 text-center text-2xl border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 font-light"
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
                      className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors border-2 border-gray-400"
                    >
                      Paste Emojis
                    </button>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={isLoading || emojis.filter(emoji => emoji.trim() !== "").length !== 4}
                      className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold py-3 px-4 rounded-lg hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-orange-600 shadow-md text-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isLoading ? "🔄 Searching..." : "Retrieve Receipt"}
                    </motion.button>
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
                    {showPaymentForm ? (
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
                              disabled={!isMounted}
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
                              disabled={!isMounted}
                            />
                          </div>
                        </div>

                        {/* EmoSwap Button */}
                        <motion.button
                          onClick={handleEmoSwap}
                          disabled={!paymentForm.chain || !paymentForm.token || isCalculatingPrice || !isMounted}
                          className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold py-3 px-4 rounded-lg hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-orange-600 shadow-md text-sm"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {isCalculatingPrice ? "🔄 Calculating..." : "Calculate Prices"}
                        </motion.button>
                      </div>
                                         ) : (
                       /* Price Calculation Results - Show when calculated */
                       priceCalculation && (
                         <div className="border-t border-gray-200 pt-4">
                           <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg">
                             <h5 className="font-bold text-black mb-4 text-lg">💱 Price Conversion Details</h5>
                             
                             {/* Only show Required Source Token */}
                             <div className="mb-4">
                               <div className="flex justify-between items-center p-3 bg-white/70 rounded-lg border border-blue-200">
                                 <span className="text-sm font-medium text-gray-700">Required Source Token:</span>
                                 <span className="font-bold text-black text-lg">
                                   {priceCalculation.sourceTokenAmount.toFixed(6)} {paymentForm.token}
                                 </span>
                               </div>
                             </div>

                             {/* Show More Button */}
                             <div className="mb-4 text-center">
                               <button
                                 onClick={() => setShowPriceDetailsModal(true)}
                                 className="text-blue-600 hover:text-blue-800 underline text-sm font-medium transition-colors"
                               >
                                 Show More Details
                               </button>
                             </div>

                             {/* Fusion+ Cross-Chain Swap Button - Only show after price calculation */}
                             {isMounted && (
                               <motion.button
                                 onClick={handleFetchFusionQuote}
                                 disabled={!isConnected || isExecutingSwap}
                                 className="w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:from-blue-300 hover:to-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-blue-600 shadow-md text-sm"
                                 whileHover={{ scale: 1.02 }}
                                 whileTap={{ scale: 0.98 }}
                               >
                                 {isExecutingSwap ? "🔄 Fetching Quote..." : "📊 Get Fusion+ Quote"}
                               </motion.button>
                             )}
                           </div>
                         </div>
                       )
                     )}

                    {/* Execute Full Swap Button - Show when quote is successful */}
                    {priceCalculation && swapResult?.success && isMounted && (
                      <motion.button
                        onClick={handleExecuteFullSwap}
                        disabled={!isConnected || isExecutingSwap}
                        className="w-full mt-3 bg-gradient-to-r from-green-400 to-green-600 text-white font-bold py-3 px-4 rounded-lg hover:from-green-300 hover:to-green-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-green-600 shadow-md text-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isExecutingSwap ? "🔄 Executing Swap..." : "🚀 Execute Real Cross-Chain Swap"}
                      </motion.button>
                    )}

                    {/* Quote Result Display */}
                    {swapResult && (
                      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h5 className="font-bold text-black mb-3">
                          {swapResult.success ? (swapResult.orderHash ? "✅ Swap Executed" : "✅ Quote Result") : "❌ Failed"}
                        </h5>
                          
                        <div className="space-y-2">
                          {swapResult.success ? (
                            <>
                              {swapResult.orderHash && (
                                <>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Order Hash:</span>
                                    <span className="font-medium text-green-600 font-mono text-xs">
                                      {swapResult.orderHash}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Status:</span>
                                    <span className="font-medium text-green-600">
                                      {swapResult.status}
                                    </span>
                                  </div>
                                </>
                              )}
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Preset:</span>
                                <span className="font-medium text-green-600">
                                  {swapResult.quote?.recommendedPreset || 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Source Chain:</span>
                                <span className="font-medium text-green-600">
                                  {swapResult.quote?.srcChainId}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Destination Chain:</span>
                                <span className="font-medium text-green-600">
                                  {swapResult.quote?.dstChainId}
                                </span>
                              </div>
                              {swapResult.message && (
                                <div className="text-xs text-gray-500 mt-2">
                                  {swapResult.message}
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-red-600 text-sm">
                              Error: {swapResult.error}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Reset Button */}
                    <div className="mt-4 text-center">
                      <motion.button
                        onClick={handleReset}
                        className="text-gray-500 hover:text-gray-700 text-sm underline font-bold"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Search Another Receipt
                      </motion.button>
                    </div>
                  </div>
                )
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Price Details Modal */}
      {showPriceDetailsModal && priceCalculation && receiptData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-black">💱 Price Conversion Details</h3>
              <button
                onClick={() => setShowPriceDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold transition-colors"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-3">
              {/* Destination Token Info */}
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Destination Token:</span>
                <span className="font-bold text-black">
                  {convertAmountToReadable(receiptData.amount, receiptData.decimal)} {receiptData.destination_token}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Destination Token Price:</span>
                <span className="font-bold text-black">
                  ${priceCalculation.destinationTokenPrice.toFixed(6)}
                </span>
              </div>

              {/* Source Token Info */}
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Required Source Token:</span>
                <span className="font-bold text-black">
                  {priceCalculation.sourceTokenAmount.toFixed(6)} {paymentForm.token}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Source Token Price:</span>
                <span className="font-bold text-black">
                  ${priceCalculation.sourceTokenPrice.toFixed(6)}
                </span>
              </div>

              {/* Conversion Rate */}
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-sm font-bold text-gray-800">Conversion Rate:</span>
                <span className="font-bold text-blue-700">
                  1 {receiptData.destination_token} = {priceCalculation.conversionRate.toFixed(6)} {paymentForm.token}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowPriceDetailsModal(false)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 
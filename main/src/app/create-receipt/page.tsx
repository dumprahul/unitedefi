"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { chains } from "@/config/chain";
import ChainSelect from "@/components/ChainSelect";
import TokenSelect from "@/components/TokenSelect";
import { createReceipt } from "@/services/receiptService";
import { fetchTokensByChainId, Token } from "@/services/tokenService";

// Import emoji data (you'll need to install emoji.json package)
const emojis = [
  "🎨", "🚀", "💎", "🌟", "🔥", "💫", "⭐", "✨", "🎯", "🎪", 
  "🎭", "🎨", "🎪", "🎯", "🎲", "🎮", "🎸", "🎹", "🎺", "🎻",
  "🎤", "🎧", "🎵", "🎶", "🎼", "🎹", "🎸", "🎺", "🎻", "🎤",
  "🎧", "🎵", "🎶", "🎼", "🎹", "🎸", "🎺", "🎻", "🎤", "🎧",
  "🎵", "🎶", "🎼", "🎹", "🎸", "🎺", "🎻", "🎤", "🎧", "🎵"
];

export default function CreateReceiptPage() {
  const { address: connectedAddress } = useAccount();
  
  const [formData, setFormData] = useState({
    description: "",
    chain: "",
    token: "",
    tokenAddress: "",
    tokenSymbol: "",
    amount: "",
    tokenDecimals: 18 // Default to 18 decimals
  });

  const [showModal, setShowModal] = useState(false);
  const [generatedEmojis, setGeneratedEmojis] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Check if wallet is connected
  useEffect(() => {
    setIsConnected(!!connectedAddress);
  }, [connectedAddress]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTokenSelect = async (tokenAddress: string) => {
    if (!formData.chain) return;
    
    try {
      const tokens = await fetchTokensByChainId(parseInt(formData.chain));
      const selectedToken = tokens.find(token => token.address === tokenAddress);
      
      if (selectedToken) {
        setFormData(prev => ({
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

  const generateRandomEmojis = () => {
    const randomEmojis = [];
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * emojis.length);
      randomEmojis.push(emojis[randomIndex]);
    }
    return randomEmojis;
  };

  const calculateAmountWithDecimals = (amount: string, decimals: number): string => {
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      return "0";
    }
    
    // Calculate: amount * (10^decimals)
    const multiplier = Math.pow(10, decimals);
    const calculatedAmount = amountValue * multiplier;
    
    // Convert to string to avoid scientific notation for large numbers
    return calculatedAmount.toLocaleString('fullwide', { useGrouping: false });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      alert("Please connect your wallet first!");
      return;
    }

    if (!formData.description || !formData.chain || !formData.token || !formData.tokenAddress || !formData.amount) {
      alert("Please fill in all fields!");
      return;
    }

    // Validate amount is a positive number
    const amountValue = parseFloat(formData.amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      alert("Please enter a valid amount (positive number)!");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Generate 4 random emojis
      const emojiArray = generateRandomEmojis();
      const emojiCode = emojiArray.join('');
      
      // Get selected chain name
      const selectedChain = chains.find(chain => chain.id.toString() === formData.chain);
      const chainName = selectedChain?.name || formData.chain;
      
      // Calculate amount with decimals
      const calculatedAmount = calculateAmountWithDecimals(formData.amount, formData.tokenDecimals);
      
      // Save to Supabase
      const receiptData = {
        emoji_code: emojiCode,
        description: formData.description,
        destination_chain: chainName,
        destination_token: formData.tokenSymbol,
        destination_token_address: formData.tokenAddress,
        destination_address: connectedAddress!,
        amount: calculatedAmount,
        decimal: formData.tokenDecimals
      };

      const savedReceipt = await createReceipt(receiptData);
      
      if (savedReceipt) {
        setGeneratedEmojis(emojiArray);
        setShowModal(true);
      } else {
        alert("Failed to create receipt. Please try again.");
      }
    } catch (error) {
      console.error('Error creating receipt:', error);
      alert("Failed to create receipt. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setGeneratedEmojis([]);
    setCopied(false);
    // Reset form
    setFormData({
      description: "",
      chain: "",
      token: "",
      tokenAddress: "",
      tokenSymbol: "",
      amount: "",
      tokenDecimals: 18
    });
  };

  const copyEmojis = async () => {
    const emojiString = generatedEmojis.join('');
    try {
      await navigator.clipboard.writeText(emojiString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy emojis');
    }
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
                Create custom payment receipts for cross-chain transactions. 
                Generate unique emoji-based payment links that work across multiple blockchains.
              </p>
            </div>
          </div>

          {/* Right Section - Modal */}
          <div className="flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 w-full max-w-lg">
              <div className="text-center mb-8">
                <h2 className="font-bold text-2xl mb-2 text-black">Create Receipt</h2>
                <p className="text-gray-700">Fill in the details to generate your payment receipt</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="What is this for?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                {/* Chain and Token Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Chain */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Chain
                    </label>
                    <ChainSelect
                      value={formData.chain}
                      onChange={(value) => handleInputChange("chain", value)}
                      placeholder="Select a chain"
                    />
                  </div>

                  {/* Token */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Token
                    </label>
                    <TokenSelect
                      value={formData.tokenAddress}
                      onChange={handleTokenSelect}
                      chainId={formData.chain ? parseInt(formData.chain) : undefined}
                      placeholder="Select a token"
                    />
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => handleInputChange("amount", e.target.value)}
                    placeholder="0.0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                    required
                  />
                  {formData.tokenSymbol && (
                    <p className="text-xs text-gray-500 mt-1">
                      Amount will be converted to {formData.tokenSymbol} with {formData.tokenDecimals} decimals
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isGenerating || !isConnected}
                  className="w-full bg-black text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? "🔄 Generating..." : "Create Receipt"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 max-w-sm w-full text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            {/* Success Message */}
            <div className="text-gray-500 text-lg mb-2">Great!</div>
            <h3 className="text-2xl font-bold text-black mb-2">Receipt Generated</h3>
            <p className="text-gray-500 mb-6">Here are your unique emojis</p>

            {/* Generated Emojis */}
            <div className="flex justify-center space-x-3 mb-6">
              {generatedEmojis.map((emoji, index) => (
                <div
                  key={index}
                  className="w-16 h-16 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-gray-100 rounded-2xl flex items-center justify-center text-3xl shadow-sm"
                >
                  {emoji}
                </div>
              ))}
            </div>

            {/* Copy Button */}
            <button
              onClick={copyEmojis}
              className="w-full mb-4 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>{copied ? "Copied!" : "Copy Emojis"}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={closeModal}
              className="w-full bg-black text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 
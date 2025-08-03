"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { chains } from "@/config/chain";
import ChainSelect from "@/components/ChainSelect";
import TokenSelect from "@/components/TokenSelect";
import { createReceipt } from "@/services/receiptService";
import { fetchTokensByChainId, Token } from "@/services/tokenService";
import { motion } from "motion/react";

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
                Create Receipt
              </h1>
              {/* <p 
                className="text-lg md:text-xl text-white font-bold max-w-md"
                style={{
                  fontFamily: "'Comical Cartoon', cursive",
                  textShadow: "2px 2px 0px #000000, 4px 4px 0px #FF6B35",
                  WebkitTextStroke: "1px #000000",
                }}
              >
                Create custom payment receipts for cross-chain transactions. 
                Generate unique emoji-based payment links that work across multiple blockchains.
              </p> */}
            </motion.div>
          </div>

          {/* Right Section - Form */}
          <div className="flex items-center justify-center">
            <motion.div 
              className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border-2 border-orange-400 p-6 w-full max-w-lg"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="text-center mb-6">
                <h2 
                  className="text-xl md:text-2xl mb-2 text-black font-bold"
                >
                  Just 4 fields, you get 4 emojis
                </h2>
                {/* <p 
                  className="text-gray-700 font-bold"
                  style={{
                    fontFamily: "'Comical Cartoon', cursive",
                    textShadow: "1px 1px 0px #000000",
                  }}
                >
                  Fill in the details to generate your payment receipt
                </p> */}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Description */}
                <div>
                  <label 
                    className="block text-xl font-bold text-black mb-1"
                  >
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="What is this for?"
                    className="w-full px-3 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200  text-l"
                    required
                  />
                </div>

                {/* Chain and Token Row */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Chain */}
                  <div>
                    <label 
                      className="block text-xl font-bold text-black mb-1"
                    >
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
                    <label 
                      className="block text-xl font-bold text-black mb-1"
                    >
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
                  <label 
                    className="block text-xl  text-black mb-1"
                  >
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => handleInputChange("amount", e.target.value)}
                    placeholder="0.0"
                    className="w-full px-3 py-2 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 font-bold text-sm"
                    required
                  />
                  {formData.tokenSymbol && (
                    <p 
                      className="text-xs text-gray-600 mt-1 font-bold"
                    >
                      Amount will be converted to {formData.tokenSymbol} with {formData.tokenDecimals} decimals
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isGenerating || !isConnected}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold py-3 px-4 rounded-lg hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-orange-600 shadow-md text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isGenerating ? "🔄 Generating..." : "Create Receipt"}
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <motion.div 
            className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border-2 border-orange-400 p-6 max-w-sm w-full text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Success Icon */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-500">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            {/* Success Message */}
            <div 
              className="text-gray-600 mb-2 font-bold text-2xl"
            >
              Great!
            </div>
            <h3 
              className="text-3xl font-bold text-black mb-2"
            >
              Receipt Generated
            </h3>
            <p 
              className="text-gray-600 mb-4 font-bold text-xl"
            >
              Here are your unique emojis
            </p>

            {/* Generated Emojis */}
            <div className="flex justify-center space-x-2 mb-6">
              {generatedEmojis.map((emoji, index) => (
                <motion.div
                  key={index}
                  className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-orange-400 rounded-xl flex items-center justify-center text-2xl shadow-md"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  {emoji}
                </motion.div>
              ))}
            </div>

            {/* Copy Button */}
            <motion.button
              onClick={copyEmojis}
              className="w-full mb-3 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-bold hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2 border-2 border-gray-400 shadow-md text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>{copied ? "Copied!" : "Copy Emojis"}</span>
            </motion.button>

            {/* Close Button */}
            <motion.button
              onClick={closeModal}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black py-2 px-4 rounded-lg font-bold hover:from-yellow-300 hover:to-orange-400 transition-colors border-2 border-orange-600 shadow-md text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Done
            </motion.button>
          </motion.div>
        </div>
      )}
    </div>
  );
} 
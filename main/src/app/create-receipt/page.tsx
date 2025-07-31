"use client";

import { useState } from "react";

// Import emoji data (you'll need to install emoji.json package)
const emojis = [
  "🎨", "🚀", "💎", "🌟", "🔥", "💫", "⭐", "✨", "🎯", "🎪", 
  "🎭", "🎨", "🎪", "🎯", "🎲", "🎮", "🎸", "🎹", "🎺", "🎻",
  "🎤", "🎧", "🎵", "🎶", "🎼", "🎹", "🎸", "🎺", "🎻", "🎤",
  "🎧", "🎵", "🎶", "🎼", "🎹", "🎸", "🎺", "🎻", "🎤", "🎧",
  "🎵", "🎶", "🎼", "🎹", "🎸", "🎺", "🎻", "🎤", "🎧", "🎵"
];

export default function CreateReceiptPage() {
  const [formData, setFormData] = useState({
    preferredChain: "",
    preferredToken: "",
    walletAddress: "",
    description: ""
  });

  const [showModal, setShowModal] = useState(false);
  const [generatedEmojis, setGeneratedEmojis] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateRandomEmojis = () => {
    const randomEmojis = [];
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * emojis.length);
      randomEmojis.push(emojis[randomIndex]);
    }
    return randomEmojis;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate 4 random emojis
    const emojis = generateRandomEmojis();
    setGeneratedEmojis(emojis);
    
    setIsGenerating(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setGeneratedEmojis([]);
    setCopied(false);
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Section - EmojiSwap Branding */}
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
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 max-w-md mx-auto w-full">
          <div className="text-center mb-6">
            <h2 className="font-bold text-2xl mb-2 text-black">Create Receipt</h2>
            <p className="text-gray-700">Fill in the details to generate your payment receipt</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Preferred Chain */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Your Preferred Chain
              </label>
              <select
                value={formData.preferredChain}
                onChange={(e) => handleInputChange("preferredChain", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                required
              >
                <option value="">Select a chain</option>
                <option value="ethereum">Ethereum</option>
                <option value="polygon">Polygon</option>
                <option value="arbitrum">Arbitrum</option>
                <option value="mantle">Mantle</option>
                <option value="sepolia">Sepolia (Testnet)</option>
              </select>
            </div>

            {/* Preferred Token */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Your Preferred Token
              </label>
              <select
                value={formData.preferredToken}
                onChange={(e) => handleInputChange("preferredToken", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                required
              >
                <option value="">Select a token</option>
                <option value="eth">ETH</option>
                <option value="usdc">USDC</option>
                <option value="usdt">USDT</option>
                <option value="emoji">🎨 EmojiCoin</option>
                <option value="matic">MATIC</option>
                <option value="arb">ARB</option>
              </select>
            </div>

            {/* Wallet Address */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Wallet Address
              </label>
              <input
                type="text"
                value={formData.walletAddress}
                onChange={(e) => handleInputChange("walletAddress", e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter payment description..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 resize-none"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full bg-black text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? "🔄 Generating..." : "Create Receipt"}
            </button>
          </form>

          {/* Additional Info */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <span className="text-green-500">✓</span>
              <span>Receipt generated instantly</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-700 mt-1">
              <span className="text-green-500">✓</span>
              <span>Cross-chain compatible</span>
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
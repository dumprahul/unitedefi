"use client";

import { useState } from "react";

export default function CreateReceiptPage() {
  const [formData, setFormData] = useState({
    preferredChain: "",
    preferredToken: "",
    walletAddress: "",
    description: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert("Receipt creation feature coming soon!");
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
              className="w-full bg-black text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-800 transition-all duration-200"
            >
              Create Receipt
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
    </div>
  );
} 
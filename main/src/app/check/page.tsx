"use client";

import { useState } from "react";

export default function CheckPage() {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectWallet = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      alert("Wallet connection feature coming soon!");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              🎨
            </div>
            <div>
              <h1 className="font-bold text-lg">EmojiPay</h1>
              <p className="text-sm text-green-600">Available for payments</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">
              ❤️
            </button>
            <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">
              📌
            </button>
            <button
              onClick={handleConnectWallet}
              disabled={isConnecting}
              className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Payment Information Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="font-bold text-xl">Payment Information</h2>
            <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">
              ✕
            </button>
          </div>

          {/* Payment Method */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-8 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                💳
              </div>
              <div>
                <p className="font-medium">EmojiCard</p>
                <p className="text-sm text-gray-600">Alexander Smith</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">08/12/2024</p>
              <p className="text-sm text-gray-600">09:07 AM</p>
            </div>
          </div>

          {/* Transaction Amount */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">-🎨 264.76</p>
              <p className="text-sm text-gray-600">EmojiPay</p>
            </div>
            <div className="bg-green-500 text-white px-4 py-2 rounded-full flex items-center space-x-2">
              <span>✓</span>
              <span className="text-sm font-medium">Paid</span>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mt-8">
          <h3 className="font-bold text-lg mb-4">Recent Transactions</h3>
          <div className="space-y-4">
            {/* Transaction 1 */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white">
                    🚀
                  </div>
                  <div>
                    <p className="font-medium">Cross-chain Transfer</p>
                    <p className="text-sm text-gray-600">Ethereum → Polygon</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">-🎨 150.00</p>
                  <p className="text-sm text-green-600">✓ Completed</p>
                </div>
              </div>
            </div>

            {/* Transaction 2 */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center text-white">
                    💎
                  </div>
                  <div>
                    <p className="font-medium">Token Swap</p>
                    <p className="text-sm text-gray-600">USDC → EmojiCoin</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">+🎨 89.50</p>
                  <p className="text-sm text-green-600">✓ Completed</p>
                </div>
              </div>
            </div>

            {/* Transaction 3 */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-red-500 rounded-lg flex items-center justify-center text-white">
                    🌉
                  </div>
                  <div>
                    <p className="font-medium">Bridge Fee</p>
                    <p className="text-sm text-gray-600">Polygon Bridge</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">-🎨 2.50</p>
                  <p className="text-sm text-green-600">✓ Completed</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="text-2xl mb-2">💸</div>
              <p className="font-medium text-sm">Send Payment</p>
            </button>
            <button className="bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="text-2xl mb-2">🔄</div>
              <p className="font-medium text-sm">Swap Tokens</p>
            </button>
            <button className="bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="text-2xl mb-2">🌉</div>
              <p className="font-medium text-sm">Bridge Assets</p>
            </button>
            <button className="bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="text-2xl mb-2">📊</div>
              <p className="font-medium text-sm">View Analytics</p>
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar Icons */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 space-y-4">
        <button className="w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:shadow-xl transition-shadow">
          <span className="text-lg">💬</span>
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
        </button>
        <button className="w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:shadow-xl transition-shadow">
          <span className="text-lg">↗️</span>
        </button>
        <button className="w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:shadow-xl transition-shadow">
          <span className="text-lg">ℹ️</span>
        </button>
      </div>
    </div>
  );
} 
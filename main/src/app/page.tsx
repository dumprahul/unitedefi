"use client";

import { useState } from "react";
import { ConnectButton } from "@/components/ConnectButton";


export default function Home() {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectWallet = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      alert("Wallet connection feature coming soon!");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-6">
        <div className="mb-8">
       
          <h1 className="font-bold text-black text-4xl mb-4">emojipay.</h1>
          <p className="text-lg text-gray-600 font-light">
            Revolutionary cross-chain payments where emojis become currency. 
            Connect your wallet and start transacting across multiple blockchains.
          </p>
          
        </div>
        
        <button
          onClick={handleConnectWallet}
          disabled={isConnecting}
          className="bg-black text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-800 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {isConnecting ? "🔄 Connecting..." : "Connect Wallet"}
        </button>
      </div>
    </div>
  );
}

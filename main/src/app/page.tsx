"use client";

import { useState, useEffect } from "react";
import { ConnectButton } from "@/components/ConnectButton";
import { motion } from "motion/react";

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
    <div className="min-h-screen relative overflow-hidden">
      {/* Full Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/main.jpg')",
        }}
      />
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-6xl mx-auto text-center">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-12"
          >
            {/* EmojiSwap Title */}
            <div className="mb-8">
              <motion.h1 
                className="text-3xl md:text-3xl lg:text-6xl mb-2 text-white font-bold"
                style={{
                  fontFamily: "'Comical Cartoon', cursive",
                  textShadow: "4px 4px 0px #000000, 8px 8px 0px #FF6B35",
                  WebkitTextStroke: "3px #000000",
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                EmojiSwap
              </motion.h1>
            </div>

            {/* Subtitle with Comical Cartoon Font */}
            <motion.p 
              className="text-base md:text-lg lg:text-xl text-white font-bold max-w-4xl mx-auto leading-relaxed mb-12"
              style={{
                fontFamily: "'Comical Cartoon', cursive",
                textShadow: "2px 2px 0px #000000, 4px 4px 0px #FF6B35",
                WebkitTextStroke: "1px #000000",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Cross chain swaps made by emoji's, powered by 1inch
            </motion.p>
          </motion.div>

          {/* Stats Section */}
          <motion.div 
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-400 mb-2" style={{ fontFamily: "'Comical Cartoon', cursive", textShadow: "2px 2px 0px #000000" }}>12+</div>
              <div className="text-white text-sm font-bold" style={{ fontFamily: "'Comical Cartoon', cursive", textShadow: "1px 1px 0px #000000" }}>Supported Chains</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-400 mb-2" style={{ fontFamily: "'Comical Cartoon', cursive", textShadow: "2px 2px 0px #000000" }}>196M+</div>
              <div className="text-white text-sm font-bold" style={{ fontFamily: "'Comical Cartoon', cursive", textShadow: "1px 1px 0px #000000" }}>Trades</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-400 mb-2" style={{ fontFamily: "'Comical Cartoon', cursive", textShadow: "2px 2px 0px #000000" }}>MEV</div>
              <div className="text-white text-sm font-bold" style={{ fontFamily: "'Comical Cartoon', cursive", textShadow: "1px 1px 0px #000000" }}>Protection</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2" style={{ fontFamily: "'Comical Cartoon', cursive", textShadow: "2px 2px 0px #000000" }}>Self</div>
              <div className="text-white text-sm font-bold" style={{ fontFamily: "'Comical Cartoon', cursive", textShadow: "1px 1px 0px #000000" }}>Custody</div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

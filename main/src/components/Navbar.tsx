"use client";

import { ConnectButton } from "./ConnectButton";
import { motion } from "motion/react";

export default function Navbar() {
  const handleCreateReceipt = () => {
    window.location.href = "/create-receipt";
  };

  const handleDropReceipt = () => {
    window.location.href = "/drop-receipt";
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <motion.div 
        className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-2xl border-4 border-black px-8 py-4"
        style={{
          fontFamily: "'Comical Cartoon', cursive",
          textShadow: "2px 2px 0px #000000",
        }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="flex items-center space-x-6">
          {/* Create Receipt Button */}
          <motion.button 
            onClick={handleCreateReceipt}
            className="text-black font-bold text-sm uppercase tracking-wide hover:text-white transition-all duration-300 px-4 py-2 rounded-full bg-white/80 hover:bg-white border-2 border-black shadow-lg"
            style={{
              fontFamily: "'Comical Cartoon', cursive",
              textShadow: "1px 1px 0px #000000",
            }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Create Receipt
          </motion.button>

          {/* Drop Receipt Button */}
          <motion.button 
            onClick={handleDropReceipt}
            className="text-black font-bold text-sm uppercase tracking-wide hover:text-white transition-all duration-300 px-4 py-2 rounded-full bg-white/80 hover:bg-white border-2 border-black shadow-lg"
            style={{
              fontFamily: "'Comical Cartoon', cursive",
              textShadow: "1px 1px 0px #000000",
            }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Drop the Code
          </motion.button>

          {/* Connect Wallet Button */}
          <motion.div 
            className="bg-black text-white font-bold text-sm uppercase tracking-wide px-6 py-2 rounded-full hover:bg-gray-800 transition-all duration-300 border-2 border-black shadow-lg"
            style={{
              fontFamily: "'Comical Cartoon', cursive",
              textShadow: "1px 1px 0px #000000",
            }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <ConnectButton />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
} 
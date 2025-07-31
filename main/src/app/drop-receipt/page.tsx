"use client";

import { useState } from "react";
import { getReceiptByEmojiCode } from "@/services/receiptService";
import { Receipt } from "@/lib/supabase";

export default function DropReceiptPage() {
  const [emojis, setEmojis] = useState(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [receiptData, setReceiptData] = useState<Receipt | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    
    try {
      const receipt = await getReceiptByEmojiCode(emojiCode);
      
      if (receipt) {
        setReceiptData(receipt);
        setShowResult(true);
      } else {
        setError("No receipt found with these emojis. Please check and try again.");
      }
    } catch (error) {
      console.error('Error fetching receipt:', error);
      setError("Failed to fetch receipt. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setEmojis(["", "", "", ""]);
    setShowResult(false);
    setReceiptData(null);
    setError(null);
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
            </div>
          </div>
        </div>
      </div>

      {/* Result Modal */}
      {showResult && receiptData && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 max-w-md w-full">
            {/* Header */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-black mb-2">Receipt Found!</h3>
              <p className="text-gray-500">Here are your payment details</p>
            </div>

            {/* Receipt Details */}
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Description</div>
                <div className="font-medium text-black">{receiptData.description}</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Destination Chain</div>
                <div className="font-medium text-black">{receiptData.destination_chain}</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Destination Token</div>
                <div className="font-medium text-black">{receiptData.destination_token}</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Destination Address</div>
                <div className="font-medium text-black text-xs break-all">{receiptData.destination_address}</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Token Address</div>
                <div className="font-medium text-black text-xs break-all">{receiptData.destination_token_address}</div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={handleReset}
              className="w-full bg-black text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 
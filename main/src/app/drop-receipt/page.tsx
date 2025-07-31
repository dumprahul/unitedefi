"use client";

import { useState } from "react";

export default function DropReceiptPage() {
  const [emojis, setEmojis] = useState(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  const handleEmojiChange = (index: number, value: string) => {
    const newEmojis = [...emojis];
    newEmojis[index] = value;
    setEmojis(newEmojis);
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const emojiArray = clipboardText.split('').filter(char => 
        /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(char)
      );
      
      if (emojiArray.length >= 4) {
        const newEmojis = emojiArray.slice(0, 4);
        setEmojis(newEmojis);
      } else {
        alert("Please copy at least 4 emojis to paste");
      }
    } catch (err) {
      alert("Failed to read clipboard. Please paste manually.");
    }
  };

  const handleInputPaste = (e: React.ClipboardEvent, index: number) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    
    console.log('Pasted text:', pastedText);
    console.log('Text length:', pastedText.length);
    console.log('First 4 chars:', pastedText.slice(0, 4));
    
    // Simple approach: just take the first 4 characters
    const chars = Array.from(pastedText);
    const firstFour = chars.slice(0, 4);
    
    if (firstFour.length >= 4) {
      const newEmojis = [...emojis];
      // Distribute characters across all 4 boxes
      for (let i = 0; i < 4; i++) {
        newEmojis[i] = firstFour[i] || "";
      }
      setEmojis(newEmojis);
    } else if (firstFour.length > 0) {
      // If less than 4 characters, just paste in current box
      const newEmojis = [...emojis];
      newEmojis[index] = firstFour[0] || "";
      setEmojis(newEmojis);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emojis.some(emoji => emoji === "")) {
      alert("Please fill all emoji fields");
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock receipt data
    setReceiptData({
      description: "Payment for services",
      chain: "Ethereum",
      token: "ETH",
      walletAddress: "0x1234...5678",
      amount: "0.5 ETH",
      timestamp: new Date().toLocaleString()
    });
    
    setIsLoading(false);
    setShowResult(true);
  };

  const handleReset = () => {
    setEmojis(["", "", "", ""]);
    setShowResult(false);
    setReceiptData(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-24">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left Section - Branding */}
          <div className="flex flex-col justify-center items-center lg:items-start text-center lg:text-left">
            <div className="mb-8">
              <h1 className="font-bold text-black text-5xl mb-4">Drop Receipt</h1>
              <p className="text-xl text-gray-800 font-light max-w-md">
                Enter the four emojis from your receipt to retrieve payment details and transaction information.
              </p>
            </div>
          </div>

          {/* Right Section - Emoji Input */}
          <div className="flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 w-full max-w-lg">
              <div className="text-center mb-8">
                <h2 className="font-bold text-2xl mb-2 text-black">Enter Receipt Emojis</h2>
                <p className="text-gray-700">Fill in the four emojis from your receipt</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Paste Button */}
                <div className="text-center space-y-2">
                  <button
                    type="button"
                    onClick={handlePaste}
                    className="bg-gray-100 text-black font-medium py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2 mx-auto"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>Paste Emojis</span>
                  </button>
                  <p className="text-xs text-gray-500">Or paste directly into any emoji box</p>
                </div>

                {/* Emoji Input Fields */}
                <div className="grid grid-cols-4 gap-4">
                  {emojis.map((emoji, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <input
                        type="text"
                        value={emoji}
                        onChange={(e) => handleEmojiChange(index, e.target.value)}
                        onPaste={(e) => handleInputPaste(e, index)}
                        placeholder="🎨"
                        className="w-16 h-16 text-center text-2xl border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 bg-gray-50"
                        maxLength={2}
                        required
                        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                      />
                    </div>
                  ))}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || emojis.some(emoji => emoji === "")}
                  className="w-full bg-black text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "🔍 Searching..." : "Drop Receipt"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Result Modal */}
      {showResult && receiptData && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 max-w-md w-full text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            {/* Receipt Found Message */}
            <h3 className="text-2xl font-bold text-black mb-4">Receipt Found!</h3>
            
            {/* Receipt Details */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Description:</span>
                  <span className="font-medium text-black">{receiptData.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Chain:</span>
                  <span className="font-medium text-black">{receiptData.chain}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Token:</span>
                  <span className="font-medium text-black">{receiptData.token}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium text-black">{receiptData.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Wallet:</span>
                  <span className="font-medium text-black">{receiptData.walletAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium text-black">{receiptData.timestamp}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleReset}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Drop Another
              </button>
              <button
                onClick={() => setShowResult(false)}
                className="flex-1 bg-black text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-800 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
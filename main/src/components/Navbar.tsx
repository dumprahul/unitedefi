"use client";

export default function Navbar() {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-full shadow-lg border border-gray-200 px-8 py-4">
        <div className="flex items-center space-x-8">
          <button className="text-black font-bold text-sm uppercase tracking-wide hover:text-gray-700 transition-colors">
            Create Receipt
          </button>
          <button className="text-black font-bold text-sm uppercase tracking-wide hover:text-gray-700 transition-colors">
            Drop the Code
          </button>
          <button className="bg-black text-white font-bold text-sm uppercase tracking-wide px-6 py-2 rounded-full hover:bg-gray-800 transition-colors">
            Connect Wallet
          </button>
        </div>
      </div>
    </div>
  );
} 
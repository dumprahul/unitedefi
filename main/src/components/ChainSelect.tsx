"use client";

import { useState, useRef, useEffect } from "react";
import { chains, Chain } from "@/config/chain";

interface ChainSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function ChainSelect({ value, onChange, placeholder = "Select a chain", className = "", disabled = false }: ChainSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedChain = chains.find(chain => chain.id.toString() === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 bg-white text-left flex items-center justify-between ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center space-x-3">
          {selectedChain ? (
            <>
              <img 
                src={selectedChain.logo} 
                alt={selectedChain.name}
                className="w-6 h-6 rounded-full object-cover"
                onError={(e) => {
                  console.log(`Failed to load logo for ${selectedChain.name}:`, selectedChain.logo);
                  e.currentTarget.style.display = 'none';
                }}
                onLoad={(e) => {
                  console.log(`Successfully loaded logo for ${selectedChain.name}`);
                }}
              />
              <span className="text-sm">{selectedChain.name}</span>
            </>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {chains.map((chain) => (
            <button
              key={chain.id}
              type="button"
              onClick={() => {
                onChange(chain.id.toString());
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
            >
              <img 
                src={chain.logo} 
                alt={chain.name}
                className="w-6 h-6 rounded-full object-cover"
                onError={(e) => {
                  console.log(`Failed to load logo for ${chain.name}:`, chain.logo);
                  e.currentTarget.style.display = 'none';
                }}
                onLoad={(e) => {
                  console.log(`Successfully loaded logo for ${chain.name}`);
                }}
              />
              <span className="text-sm">{chain.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 
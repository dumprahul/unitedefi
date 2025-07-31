"use client";

import { useState, useRef, useEffect } from "react";
import { Token, fetchTokensByChainId, filterTokens, getNativeTokens, getPopularTokens } from "@/services/tokenService";

interface TokenSelectProps {
  value: string;
  onChange: (value: string) => void;
  chainId?: number;
  placeholder?: string;
  className?: string;
}

export default function TokenSelect({ value, onChange, chainId, placeholder = "Select a token", className = "" }: TokenSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedToken = tokens.find(token => token.address === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (chainId && isOpen) {
      fetchTokens();
    }
  }, [chainId, isOpen]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = filterTokens(tokens, searchTerm);
      setFilteredTokens(filtered);
    } else {
      // Show native tokens first, then popular tokens
      const nativeTokens = getNativeTokens(tokens);
      const popularTokens = getPopularTokens(tokens);
      setFilteredTokens([...nativeTokens, ...popularTokens]);
    }
  }, [searchTerm, tokens]);

  const fetchTokens = async () => {
    if (!chainId) return;
    
    setIsLoading(true);
    try {
      const fetchedTokens = await fetchTokensByChainId(chainId);
      setTokens(fetchedTokens);
      
      // Initialize with native tokens and popular tokens
      const nativeTokens = getNativeTokens(fetchedTokens);
      const popularTokens = getPopularTokens(fetchedTokens);
      setFilteredTokens([...nativeTokens, ...popularTokens]);
    } catch (error) {
      console.error('Error fetching tokens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 bg-white text-left flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          {selectedToken ? (
            <>
              <img 
                src={selectedToken.logoURI} 
                alt={selectedToken.name}
                className="w-6 h-6 rounded-full object-cover"
                onError={(e) => {
                  console.log(`Failed to load logo for ${selectedToken.name}:`, selectedToken.logoURI);
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="text-sm">{selectedToken.symbol}</span>
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
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search tokens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-black focus:border-transparent"
            />
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="p-4 text-center text-gray-500">
              Loading tokens...
            </div>
          )}

          {/* Token List */}
          {!isLoading && filteredTokens.length > 0 && (
            <div>
              {filteredTokens.map((token, index) => (
                <button
                  key={`${chainId}-${token.address}-${index}`}
                  type="button"
                  onClick={() => {
                    onChange(token.address);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
                >
                  <img 
                    src={token.logoURI} 
                    alt={token.name}
                    className="w-6 h-6 rounded-full object-cover"
                    onError={(e) => {
                      console.log(`Failed to load logo for ${token.name}:`, token.logoURI);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{token.symbol}</span>
                    <span className="text-xs text-gray-500">{token.name}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {!isLoading && filteredTokens.length === 0 && searchTerm && (
            <div className="p-4 text-center text-gray-500">
              No tokens found
            </div>
          )}

          {/* No Chain Selected */}
          {!chainId && (
            <div className="p-4 text-center text-gray-500">
              Please select a chain first
            </div>
          )}
        </div>
      )}
    </div>
  );
} 
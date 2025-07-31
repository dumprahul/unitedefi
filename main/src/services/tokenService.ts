export interface Token {
  chainId: number;
  address: string;
  name: string;
  decimals: number;
  symbol: string;
  logoURI: string;
  tags: string[];
}

export interface TokenListResponse {
  name: string;
  timestamp: string;
  version: {
    major: number;
    minor: number;
    patch: number;
  };
  keywords: string[];
  tags: {
    [key: string]: {
      name: string;
      description: string;
    };
  };
  tags_order: string[];
  tokens: Token[];
}

export async function fetchTokensByChainId(chainId: number): Promise<Token[]> {
  try {
    // Use our API route instead of calling 1inch directly
    const response = await fetch(`/api/tokens/${chainId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      // Return mock data if API fails
      return getMockTokens(chainId);
    }

    const data: TokenListResponse = await response.json();
    return data.tokens;
  } catch (error) {
    console.error('Error fetching tokens:', error);
    // Return mock data on error
    return getMockTokens(chainId);
  }
}

// Mock tokens for development/testing
function getMockTokens(chainId: number): Token[] {
  const mockTokens: { [key: number]: Token[] } = {
    1: [
      {
        chainId: 1,
        address: "0x0000000000000000000000000000000000000000",
        name: "Ethereum",
        decimals: 18,
        symbol: "ETH",
        logoURI: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
        tags: ["native"]
      },
      {
        chainId: 1,
        address: "0xa0b86a33e6441b8c4c8c8c8c8c8c8c8c8c8c8c8",
        name: "USD Coin",
        decimals: 6,
        symbol: "USDC",
        logoURI: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
        tags: ["tokens"]
      },
      {
        chainId: 1,
        address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
        name: "Tether USD",
        decimals: 6,
        symbol: "USDT",
        logoURI: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
        tags: ["tokens"]
      }
    ],
    137: [
      {
        chainId: 137,
        address: "0x0000000000000000000000000000000000000000",
        name: "Polygon",
        decimals: 18,
        symbol: "MATIC",
        logoURI: "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png",
        tags: ["native"]
      },
      {
        chainId: 137,
        address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
        name: "USD Coin",
        decimals: 6,
        symbol: "USDC",
        logoURI: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
        tags: ["tokens"]
      }
    ],
    42161: [
      {
        chainId: 42161,
        address: "0x0000000000000000000000000000000000000000",
        name: "Ethereum",
        decimals: 18,
        symbol: "ETH",
        logoURI: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
        tags: ["native"]
      },
      {
        chainId: 42161,
        address: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
        name: "USD Coin",
        decimals: 6,
        symbol: "USDC",
        logoURI: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
        tags: ["tokens"]
      }
    ]
  };

  return mockTokens[chainId] || [
    {
      chainId: chainId,
      address: "0x0000000000000000000000000000000000000000",
      name: "Native Token",
      decimals: 18,
      symbol: "NATIVE",
      logoURI: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
      tags: ["native"]
    }
  ];
}

// Helper function to filter tokens by search term
export function filterTokens(tokens: Token[], searchTerm: string): Token[] {
  if (!searchTerm) return tokens;
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  return tokens.filter(token => 
    token.name.toLowerCase().includes(lowerSearchTerm) ||
    token.symbol.toLowerCase().includes(lowerSearchTerm) ||
    token.address.toLowerCase().includes(lowerSearchTerm)
  );
}

// Helper function to get native tokens (tokens with 'native' tag)
export function getNativeTokens(tokens: Token[]): Token[] {
  return tokens.filter(token => token.tags.includes('native'));
}

// Helper function to get popular tokens (first 20 tokens)
export function getPopularTokens(tokens: Token[]): Token[] {
  return tokens.slice(0, 20);
} 
export interface Chain {
  id: number;
  name: string;
  logo: string;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export const chains: Chain[] = [
  {
    id: 1,
    name: "Ethereum Mainnet",
    logo: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    rpcUrl: "https://api.1inch.dev/web3/1",
    blockExplorer: "https://etherscan.io",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
  {
    id: 42161,
    name: "Arbitrum",
    logo: "https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21-47-00.jpg",
    rpcUrl: "https://api.1inch.dev/web3/42161",
    blockExplorer: "https://arbiscan.io",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
  {
    id: 43114,
    name: "Avalanche",
    logo: "https://cryptologos.cc/logos/avalanche-avax-logo.png?v=040",
    rpcUrl: "https://api.1inch.dev/web3/43114",
    blockExplorer: "https://snowtrace.io",
    nativeCurrency: {
      name: "Avalanche",
      symbol: "AVAX",
      decimals: 18,
    },
  },
  {
    id: 56,
    name: "BNB Chain",
    logo: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
    rpcUrl: "https://api.1inch.dev/web3/56",
    blockExplorer: "https://bscscan.com",
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18,
    },
  },
  {
    id: 100,
    name: "Gnosis",
    logo: "https://assets.coingecko.com/coins/images/662/small/logo_square_simple_300px.png",
    rpcUrl: "https://api.1inch.dev/web3/100",
    blockExplorer: "https://gnosisscan.io",
    nativeCurrency: {
      name: "xDAI",
      symbol: "XDAI",
      decimals: 18,
    },
  },
  {
    id: 1399811150,
    name: "Solana",
    logo: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
    rpcUrl: "https://api.1inch.dev/web3/1399811150",
    blockExplorer: "https://explorer.solana.com",
    nativeCurrency: {
      name: "Solana",
      symbol: "SOL",
      decimals: 9,
    },
  },
  {
    id: 1001,
    name: "Sonic",
    logo: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    rpcUrl: "https://api.1inch.dev/web3/1001",
    blockExplorer: "https://explorer.sonic.network",
    nativeCurrency: {
      name: "Sonic",
      symbol: "SONIC",
      decimals: 18,
    },
  },
  {
    id: 10,
    name: "Optimism",
    logo: "https://assets.coingecko.com/coins/images/25244/small/Optimism.png",
    rpcUrl: "https://api.1inch.dev/web3/10",
    blockExplorer: "https://optimistic.etherscan.io",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
  {
    id: 137,
    name: "Polygon",
    logo: "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png",
    rpcUrl: "https://api.1inch.dev/web3/137",
    blockExplorer: "https://polygonscan.com",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
  },
  {
    id: 324,
    name: "zkSync Era",
    logo: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    rpcUrl: "https://api.1inch.dev/web3/324",
    blockExplorer: "https://explorer.zksync.io",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
  {
    id: 8453,
    name: "Base",
    logo: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    rpcUrl: "https://api.1inch.dev/web3/8453",
    blockExplorer: "https://basescan.org",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
  {
    id: 59144,
    name: "Linea",
    logo: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    rpcUrl: "https://api.1inch.dev/web3/59144",
    blockExplorer: "https://lineascan.build",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
  },
  {
    id: 1002,
    name: "Unichain",
    logo: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    rpcUrl: "https://api.1inch.dev/web3/1002",
    blockExplorer: "https://explorer.unichain.world",
    nativeCurrency: {
      name: "Unichain",
      symbol: "UNI",
      decimals: 18,
    },
  },
];

// Helper function to get chain by ID
export const getChainById = (id: number): Chain | undefined => {
  return chains.find(chain => chain.id === id);
};

// Helper function to get chain by name
export const getChainByName = (name: string): Chain | undefined => {
  return chains.find(chain => chain.name.toLowerCase() === name.toLowerCase());
};

// Helper function to get all chain names
export const getChainNames = (): string[] => {
  return chains.map(chain => chain.name);
};

// Helper function to get all chain IDs
export const getChainIds = (): number[] => {
  return chains.map(chain => chain.id);
}; 
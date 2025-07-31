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
    logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
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
    logo: "https://cryptologos.cc/logos/arbitrum-new-logo.png",
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
    logo: "https://cryptologos.cc/logos/avalanche-avax-logo.png",
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
    logo: "https://cryptologos.cc/logos/bnb-bnb-logo.png",
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
    logo: "https://cryptologos.cc/logos/gnosis-gno-logo.png",
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
    logo: "https://cryptologos.cc/logos/solana-sol-logo.png",
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
    logo: "https://cryptologos.cc/logos/sonic-sonic-logo.png",
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
    logo: "https://cryptologos.cc/logos/optimism-new-logo.png",
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
    logo: "https://cryptologos.cc/logos/polygon-new-logo.png",
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
    logo: "https://cryptologos.cc/logos/zksync-era-logo.png",
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
    logo: "https://cryptologos.cc/logos/base-logo.png",
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
    logo: "https://cryptologos.cc/logos/linea-logo.png",
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
    logo: "https://cryptologos.cc/logos/unichain-logo.png",
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
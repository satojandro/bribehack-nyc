/**
 * Smart Contract Configuration
 * 
 * This file contains deployed contract addresses and ABIs for different networks.
 * After deploying contracts, update the addresses here to connect the frontend.
 */

// Contract addresses by network
export const CONTRACT_ADDRESSES = {
  // Sepolia Testnet (Chain ID: 11155111)
  sepolia: {
    bribehack: '0x22a81e4c78ec3bc0469f23e34ce130242bbf7ca0',
  },
  // Base Sepolia (Chain ID: 84532) - Deploy here next
  baseSepolia: {
    bribehack: '', // Deploy and update this address
  },
  // Production addresses (when ready)
  mainnet: {
    bribehack: '',
  },
  base: {
    bribehack: '',
  },
} as const;

// Type for network names
export type NetworkName = keyof typeof CONTRACT_ADDRESSES;

/**
 * Get contract address for current network
 * @param network - Network name (sepolia, baseSepolia, etc.)
 * @param contract - Contract name (bribehack)
 * @returns Contract address or throws error if not found
 */
export function getContractAddress(
  network: NetworkName,
  contract: keyof typeof CONTRACT_ADDRESSES.sepolia
): string {
  const address = CONTRACT_ADDRESSES[network]?.[contract];
  if (!address) {
    throw new Error(`Contract ${contract} not deployed on ${network}`);
  }
  return address;
}

/**
 * Get contract address by chain ID
 * @param chainId - Chain ID number
 * @param contract - Contract name
 * @returns Contract address or throws error
 */
export function getContractAddressByChainId(
  chainId: number,
  contract: keyof typeof CONTRACT_ADDRESSES.sepolia
): string {
  const networkMap: Record<number, NetworkName> = {
    1: 'mainnet',
    8453: 'base',
    11155111: 'sepolia',
    84532: 'baseSepolia',
  };
  
  const network = networkMap[chainId];
  if (!network) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }
  
  return getContractAddress(network, contract);
}
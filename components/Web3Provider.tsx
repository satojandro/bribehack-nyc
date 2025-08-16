/**
 * Web3Provider Component
 * 
 * This provider sets up the Dynamic wallet connection system.
 * Dynamic is a sponsor for ETHGlobal NYC and provides:
 * - Easy wallet connection with multiple wallet support
 * - Built-in user authentication
 * - Cross-chain support
 * - Beautiful UI components
 * 
 * This replaces RainbowKit from the original implementation.
 * 
 * Dynamic docs: https://docs.dynamic.xyz
 */

'use client';

import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { DynamicWagmiConnector } from '@dynamic-labs/wagmi-connector';
import { WagmiProvider, createConfig } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http } from 'viem';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  baseSepolia,
  sepolia,
} from 'viem/chains';

/**
 * Create a QueryClient instance for React Query
 * This handles caching and synchronization of server state
 */
const queryClient = new QueryClient();

/**
 * Wagmi configuration
 * Sets up the chains and transports for blockchain interactions
 * Includes mainnet, testnets (Sepolia, Base Sepolia), and popular L2s for cross-chain support
 */
const wagmiConfig = createConfig({
  chains: [mainnet, polygon, optimism, arbitrum, base, baseSepolia, sepolia],
  multiInjectedProviderDiscovery: false,
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
    [baseSepolia.id]: http(),
    [sepolia.id]: http(),
  },
});

const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    /**
     * DynamicContextProvider is the main provider from Dynamic
     * It handles:
     * - Wallet connection UI
     * - User authentication
     * - Multi-wallet support
     * - Social login (if configured)
     */
    <DynamicContextProvider
      settings={{
        // Get your environment ID from https://app.dynamic.xyz
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || '',
        
        // Configure which wallets to support
        walletConnectors: [EthereumWalletConnectors],
        
        // App info displayed in wallet connection modal
        appName: 'Bribehack',
        appLogoUrl: '/logo.png', // Add your logo to public folder
        
        // Explicit network configuration for testnet support
        overrides: {
          evmNetworks: [
            // Sepolia Testnet - Primary deployment target for hackathon
            {
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
              chainId: 11155111,
              networkId: 11155111,
              name: 'Sepolia',
              rpcUrls: ['https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
              iconUrls: ['https://icons.llamao.fi/icons/chains/rsz_ethereum.jpg'],
              nativeCurrency: {
                name: 'Sepolia Ether',
                symbol: 'ETH',
                decimals: 18,
              },
            },
            // Base Sepolia Testnet - Secondary deployment target
            {
              blockExplorerUrls: ['https://sepolia.basescan.org'],
              chainId: 84532,
              networkId: 84532,
              name: 'Base Sepolia',
              rpcUrls: ['https://sepolia.base.org'],
              iconUrls: ['https://icons.llamao.fi/icons/chains/rsz_base.jpg'],
              nativeCurrency: {
                name: 'Ether',
                symbol: 'ETH',
                decimals: 18,
              },
            },
            // Ethereum Mainnet - For production deployment
            {
              blockExplorerUrls: ['https://etherscan.io'],
              chainId: 1,
              networkId: 1,
              name: 'Ethereum',
              rpcUrls: ['https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
              iconUrls: ['https://icons.llamao.fi/icons/chains/rsz_ethereum.jpg'],
              nativeCurrency: {
                name: 'Ether',
                symbol: 'ETH',
                decimals: 18,
              },
            },
            // Base Mainnet - For production L2 deployment
            {
              blockExplorerUrls: ['https://basescan.org'],
              chainId: 8453,
              networkId: 8453,
              name: 'Base',
              rpcUrls: ['https://mainnet.base.org'],
              iconUrls: ['https://icons.llamao.fi/icons/chains/rsz_base.jpg'],
              nativeCurrency: {
                name: 'Ether',
                symbol: 'ETH',
                decimals: 18,
              },
            },
          ]
        },
        
        // Theme configuration to match our dark theme
        cssOverrides: `
          --dynamic-font-family: 'Inter', sans-serif;
          --dynamic-base-background-color: #1a1a1a;
          --dynamic-base-text-color: #e5e7eb;
          --dynamic-button-primary-background: #9f7aea;
          --dynamic-button-primary-text: #ffffff;
          --dynamic-button-primary-hover: #8b5cf6;
          --dynamic-border-color: #2a2a2a;
        `,
      }}
    >
      {/* WagmiProvider for wagmi hooks compatibility */}
      <WagmiProvider config={wagmiConfig}>
        {/* QueryClientProvider for React Query */}
        <QueryClientProvider client={queryClient}>
          {/* DynamicWagmiConnector bridges Dynamic with wagmi */}
          <DynamicWagmiConnector>
            {children}
          </DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  );
};

export default Web3Provider;
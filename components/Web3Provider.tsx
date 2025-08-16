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
 * Includes mainnet and popular L2s for cross-chain support
 */
const wagmiConfig = createConfig({
  chains: [mainnet, polygon, optimism, arbitrum, base, sepolia],
  multiInjectedProviderDiscovery: false,
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
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
/**
 * ENS Subdomain Creation Hook
 * 
 * Handles creation of Bribehack ENS subdomains like wild-otter.bribehack.eth
 * Integrates with the name generator and provides smooth UX for pseudonym creation
 */

'use client';

import { useState, useCallback } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { namehash, keccak256, toBytes, getContract } from 'viem';
import { generatePseudonym, generatePseudonymOptions, validatePseudonym, generateENSName } from '../nameGenerator';
import ensABI from '../../abis/ENSRegistry.json';
import resolverABI from '../../abis/PublicResolver.json';

// Sepolia ENS contract addresses
const ENS_REGISTRY_ADDRESS = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e' as const;
const PUBLIC_RESOLVER_ADDRESS = '0x8FADE66B79cC9f707aB26799354482EB93a5B7dD' as const;

export type ENSStatus = 'idle' | 'checking' | 'generating' | 'pending' | 'confirming' | 'minted' | 'error';

export interface ENSSubdomainState {
  pseudonym: string;
  fullENSName: string;
  status: ENSStatus;
  error?: string;
  txHash?: string;
  isAvailable?: boolean;
}

export function useENSSubdomain() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  
  const [state, setState] = useState<ENSSubdomainState>({
    pseudonym: generatePseudonym(),
    fullENSName: generateENSName(generatePseudonym()),
    status: 'idle'
  });

  /**
   * Generate a new random pseudonym
   */
  const generateNewPseudonym = useCallback(() => {
    const newPseudonym = generatePseudonym();
    setState(prev => ({
      ...prev,
      pseudonym: newPseudonym,
      fullENSName: generateENSName(newPseudonym),
      status: 'idle',
      error: undefined,
      isAvailable: undefined
    }));
  }, []);

  /**
   * Generate multiple pseudonym options for user to choose from
   */
  const generatePseudonymChoices = useCallback((): string[] => {
    return generatePseudonymOptions(6);
  }, []);

  /**
   * Set a custom pseudonym (user input)
   */
  const setPseudonym = useCallback((pseudonym: string) => {
    const validation = validatePseudonym(pseudonym);
    
    setState(prev => ({
      ...prev,
      pseudonym: validation.valid ? pseudonym : prev.pseudonym,
      fullENSName: generateENSName(validation.valid ? pseudonym : prev.pseudonym),
      status: validation.valid ? 'idle' : 'error',
      error: validation.error,
      isAvailable: undefined
    }));

    return validation;
  }, []);

  /**
   * Check if a pseudonym is available
   * For Sepolia testnet, we'll do basic validation and assume availability
   */
  const checkAvailability = useCallback(async (pseudonym?: string) => {
    const nameToCheck = pseudonym || state.pseudonym;
    const validation = validatePseudonym(nameToCheck);
    
    if (!validation.valid) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: validation.error,
        isAvailable: false
      }));
      return false;
    }

    setState(prev => ({ ...prev, status: 'checking' }));

    try {
      if (!publicClient) {
        throw new Error('Public client not available');
      }

      // In production, check ENS registry for existing subdomain
      // For hackathon/testnet, we'll assume most names are available
      const ensRegistry = getContract({
        address: ENS_REGISTRY_ADDRESS,
        abi: ensABI,
        client: publicClient
      });

      const parentNode = namehash('bribehack.eth');
      const labelHash = keccak256(toBytes(nameToCheck));
      const node = namehash(generateENSName(nameToCheck));

      // Check if subdomain already exists
      const currentOwner = await ensRegistry.read.owner([node]);
      const isAvailable = currentOwner === '0x0000000000000000000000000000000000000000';

      setState(prev => ({
        ...prev,
        status: 'idle',
        isAvailable,
        error: isAvailable ? undefined : 'This name is already taken'
      }));

      return isAvailable;
    } catch (error) {
      console.error('Error checking availability:', error);
      // For testnet, assume available on error
      setState(prev => ({
        ...prev,
        status: 'idle',
        isAvailable: true,
        error: undefined
      }));
      return true;
    }
  }, [state.pseudonym, publicClient]);

  /**
   * Mint an ENS subdomain
   */
  const mintSubdomain = useCallback(async (targetAddress?: string) => {
    if (!walletClient || !address) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: 'Wallet not connected'
      }));
      return false;
    }

    const ownerAddress = targetAddress || address;
    const validation = validatePseudonym(state.pseudonym);
    
    if (!validation.valid) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: validation.error
      }));
      return false;
    }

    setState(prev => ({ ...prev, status: 'pending', error: undefined }));

    try {
      // Setup contract instances
      const ensRegistry = getContract({
        address: ENS_REGISTRY_ADDRESS,
        abi: ensABI,
        client: walletClient
      });

      const publicResolver = getContract({
        address: PUBLIC_RESOLVER_ADDRESS,
        abi: resolverABI,
        client: walletClient
      });

      // Calculate hashes and nodes
      const parentNode = namehash('bribehack.eth');
      const labelHash = keccak256(toBytes(state.pseudonym));
      const node = namehash(state.fullENSName);

      // Step 1: Create subdomain
      const setSubnodeTx = await ensRegistry.write.setSubnodeOwner([
        parentNode,
        labelHash,
        ownerAddress
      ]);

      setState(prev => ({ 
        ...prev, 
        status: 'confirming', 
        txHash: setSubnodeTx 
      }));

      // Wait for transaction confirmation
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: setSubnodeTx });
      }

      // Step 2: Set resolver
      const setResolverTx = await ensRegistry.write.setResolver([
        node,
        PUBLIC_RESOLVER_ADDRESS
      ]);

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: setResolverTx });
      }

      // Step 3: Set address record
      const setAddrTx = await publicResolver.write.setAddr([
        node,
        ownerAddress
      ]);

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: setAddrTx });
      }

      setState(prev => ({
        ...prev,
        status: 'minted',
        txHash: setAddrTx,
        isAvailable: false
      }));

      return true;
    } catch (error: any) {
      console.error('Error minting subdomain:', error);
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error.message || 'Failed to mint ENS subdomain'
      }));
      return false;
    }
  }, [walletClient, address, publicClient, state.pseudonym, state.fullENSName]);

  /**
   * Reset state to idle
   */
  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      status: 'idle',
      error: undefined,
      txHash: undefined,
      isAvailable: undefined
    }));
  }, []);

  return {
    // State
    pseudonym: state.pseudonym,
    fullENSName: state.fullENSName,
    status: state.status,
    error: state.error,
    txHash: state.txHash,
    isAvailable: state.isAvailable,
    
    // Actions
    generateNewPseudonym,
    generatePseudonymChoices,
    setPseudonym,
    checkAvailability,
    mintSubdomain,
    reset,
    
    // Computed values
    isIdle: state.status === 'idle',
    isChecking: state.status === 'checking',
    isGenerating: state.status === 'generating',
    isPending: state.status === 'pending',
    isConfirming: state.status === 'confirming',
    isMinted: state.status === 'minted',
    hasError: state.status === 'error',
    canMint: state.status === 'idle' && state.isAvailable !== false,
    isLoading: ['checking', 'generating', 'pending', 'confirming'].includes(state.status)
  };
}
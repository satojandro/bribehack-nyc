/**
 * Bribehack Contract Hooks
 * 
 * Custom React hooks for interacting with the deployed Bribehack contract.
 * These hooks use wagmi for type-safe contract interactions and handle
 * network switching automatically.
 */

'use client';

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useAccount, useChainId } from 'wagmi';
import { parseEther } from 'viem';
import { toast } from 'react-hot-toast';
import { BRIBEHACK_ABI } from './bribehack-abi';
import { getContractAddressByChainId } from './contracts';

/**
 * Hook to get the current Bribehack contract address for the connected chain
 */
export function useBribehackContract() {
  const chainId = useChainId();
  
  try {
    const address = getContractAddressByChainId(chainId, 'bribehack');
    return { address: address as `0x${string}`, abi: BRIBEHACK_ABI };
  } catch (error) {
    console.warn(`Bribehack not deployed on chain ${chainId}`);
    return { address: undefined, abi: BRIBEHACK_ABI };
  }
}

/**
 * Hook to read a hacker's commitment
 */
export function useGetCommitment(hackerAddress?: `0x${string}`) {
  const contract = useBribehackContract();
  
  return useReadContract({
    ...contract,
    functionName: 'getCommitment',
    args: hackerAddress ? [hackerAddress] : undefined,
    query: {
      enabled: !!hackerAddress && !!contract.address,
    },
  });
}

/**
 * Hook to read a bounty's details
 */
export function useGetBounty(bountyId?: string) {
  const contract = useBribehackContract();
  
  return useReadContract({
    ...contract,
    functionName: 'getBounty',
    args: bountyId ? [bountyId] : undefined,
    query: {
      enabled: !!bountyId && !!contract.address,
    },
  });
}

/**
 * Hook to read bribes for a hacker
 */
export function useGetBribes(hackerAddress?: `0x${string}`) {
  const contract = useBribehackContract();
  
  return useReadContract({
    ...contract,
    functionName: 'getBribes',
    args: hackerAddress ? [hackerAddress] : undefined,
    query: {
      enabled: !!hackerAddress && !!contract.address,
    },
  });
}

/**
 * Hook to commit to bounties
 */
export function useCommitToBounties() {
  const contract = useBribehackContract();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  const commitToBounties = async (
    bountyIds: string[],
    ensPseudonym: string = '',
    ipfsHash: string = ''
  ) => {
    if (!contract.address) {
      toast.error('Contract not available on this network');
      return;
    }

    try {
      writeContract({
        ...contract,
        functionName: 'commitToBounties',
        args: [bountyIds, ensPseudonym, ipfsHash],
      });
    } catch (err) {
      console.error('Commit error:', err);
      toast.error('Failed to commit to bounties');
    }
  };

  return {
    commitToBounties,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
  };
}

/**
 * Hook to sponsor a bounty
 */
export function useSponsorBounty() {
  const contract = useBribehackContract();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  const sponsorBounty = async (bountyId: string, amount: string) => {
    if (!contract.address) {
      toast.error('Contract not available on this network');
      return;
    }

    try {
      writeContract({
        ...contract,
        functionName: 'sponsorBounty',
        args: [bountyId],
        value: parseEther(amount),
      });
    } catch (err) {
      console.error('Sponsor error:', err);
      toast.error('Failed to sponsor bounty');
    }
  };

  return {
    sponsorBounty,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
  };
}

/**
 * Hook to bribe a hacker
 */
export function useBribeHacker() {
  const contract = useBribehackContract();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  const bribeHacker = async (
    hackerAddress: `0x${string}`,
    bountyId: string,
    amount: string
  ) => {
    if (!contract.address) {
      toast.error('Contract not available on this network');
      return;
    }

    try {
      writeContract({
        ...contract,
        functionName: 'bribeHacker',
        args: [hackerAddress, bountyId],
        value: parseEther(amount),
      });
    } catch (err) {
      console.error('Bribe error:', err);
      toast.error('Failed to send bribe');
    }
  };

  return {
    bribeHacker,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
  };
}
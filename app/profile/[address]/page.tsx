/**
 * Dynamic Profile Page Component
 * 
 * Shows a hacker's profile based on their wallet address.
 * Features:
 * - Displays commits made to bounties
 * - Shows bribes received with accept/decline actions
 * - ENS name resolution
 * - Reputation score
 * - Total earnings
 * 
 * URL format: /profile/[address] where address can be:
 * - Ethereum address: 0x123...
 * - ENS name: vitalik.eth
 */

'use client';

import { useParams } from 'next/navigation';
import { useEnsName, useEnsAddress } from 'wagmi';
import { mockProfileData, getBountyById, type HackerProfile } from '@/lib/mockData';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import { isAddress } from 'viem';
import { mainnet } from 'viem/chains';
import { useGetCommitment, useGetBribes } from '@/lib/useBribehack';

const ProfilePage = () => {
  const params = useParams();
  const addressParam = params.address as string;
  
  // State for bribe actions
  const [processingBribes, setProcessingBribes] = useState<Set<number>>(new Set());
  
  // Determine if param is ENS or address
  const isEns = addressParam?.endsWith('.eth');
  
  // Resolve ENS to address if needed
  const { data: resolvedAddress } = useEnsAddress({
    name: isEns ? addressParam : undefined,
    chainId: mainnet.id,
  });
  
  // Use resolved address or direct address
  const address = (isEns ? resolvedAddress : addressParam) as `0x${string}`;
  
  // Fetch ENS name for display
  const { data: ensName, isLoading: ensLoading } = useEnsName({
    address: address && isAddress(address) ? address : undefined,
    chainId: mainnet.id,
  });

  // Get real contract data
  const { data: commitment, isLoading: commitmentLoading } = useGetCommitment(address);
  const { data: bribes, isLoading: bribesLoading } = useGetBribes(address);

  // Fallback to mock data if no contract data
  const profile: HackerProfile = address && mockProfileData[address] 
    ? mockProfileData[address] 
    : { commits: [], bribes: [], totalEarned: 0, reputation: 0 };

  // Process contract data if available
  const realCommits = commitment ? [{
    bountyId: 'contract-commitment',
    bountyTitle: `Committed to ${commitment.bountyIds?.length || 0} bounties`,
    date: new Date(Number(commitment.timestamp) * 1000).toISOString(),
    ipfsHash: commitment.ipfsHash || undefined
  }] : [];

  const realBribes = bribes ? bribes.map((bribe, index) => ({
    id: index,
    from: bribe.briber,
    amount: Number(bribe.amount) / 1e18, // Convert from wei to ETH
    targetBountyTitle: bribe.bountyId,
    message: '',
    status: 'pending' as const,
    date: new Date(Number(bribe.timestamp) * 1000).toISOString()
  })) : [];

  // Use real data if available, otherwise fallback to mock
  const displayProfile = {
    commits: realCommits.length > 0 ? realCommits : profile.commits,
    bribes: realBribes.length > 0 ? realBribes : profile.bribes,
    totalEarned: realBribes.reduce((sum, b) => sum + b.amount, 0) || profile.totalEarned,
    reputation: profile.reputation // Keep mock reputation for now
  };

  /**
   * Handle bribe response (accept/decline)
   * In production, this would call the smart contract
   */
  const handleBribeResponse = async (accept: boolean, bribeId: number) => {
    setProcessingBribes(prev => new Set(prev).add(bribeId));
    
    try {
      // Mock contract interaction
      // In production: await contract.respondToBribe(bribeId, accept)
      console.log(`Bribe ${bribeId} ${accept ? 'accepted' : 'declined'}`);
      
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(
        accept 
          ? '✅ Bribe accepted! Switching bounty...' 
          : '❌ Bribe declined'
      );
      
      // In production, would refetch profile data here
    } catch (error) {
      console.error('Bribe response error:', error);
      toast.error('Transaction failed. Please try again.');
    } finally {
      setProcessingBribes(prev => {
        const newSet = new Set(prev);
        newSet.delete(bribeId);
        return newSet;
      });
    }
  };

  // Display name logic
  const displayName = ensName || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Unknown');

  // Handle loading and error states
  if (!address || !isAddress(address)) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-red-500">Invalid Address</h1>
        <p className="text-gray-400 mt-2">Please provide a valid Ethereum address or ENS name</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="max-w-4xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Profile header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold break-all">
          {ensLoading ? 'Loading...' : displayName}
        </h1>
        {!ensName && (
          <p className="text-sm text-gray-500 font-mono mt-1">{address}</p>
        )}
        
        {/* Profile stats */}
        <div className="flex gap-6 mt-4">
          <div>
            <p className="text-xs text-gray-400">Reputation</p>
            <p className="text-xl font-bold text-primary">{displayProfile.reputation}/100</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Total Earned</p>
            <p className="text-xl font-bold text-secondary">{displayProfile.totalEarned.toFixed(4)} ETH</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Commits</p>
            <p className="text-xl font-bold text-gray-200">{displayProfile.commits.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Bribes</p>
            <p className="text-xl font-bold text-accent">{displayProfile.bribes.length}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Commits Made Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-primary">
            Commits Made
            <span className="text-xs text-gray-500 ml-2">
              ({displayProfile.commits.length} total)
              {commitmentLoading && ' - Loading...'}
            </span>
          </h2>
          <div className="space-y-4">
            {displayProfile.commits.length > 0 ? (
              displayProfile.commits.map((commit, index) => (
                <motion.div 
                  key={`${commit.bountyId}-${index}`} 
                  className="card p-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <p className="font-bold text-gray-200">{commit.bountyTitle}</p>
                  <p className="text-xs text-gray-500 font-mono">{commit.bountyId}</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Committed: {new Date(commit.date).toLocaleDateString()}
                  </p>
                  {commit.ipfsHash && (
                    <p className="text-xs text-gray-500 mt-1 font-mono truncate">
                      IPFS: {commit.ipfsHash}
                    </p>
                  )}
                </motion.div>
              ))
            ) : (
              <p className="text-gray-500">No commits made yet</p>
            )}
          </div>
        </div>

        {/* Bribes Received Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-secondary">
            Bribes Received
            <span className="text-xs text-gray-500 ml-2">
              ({displayProfile.bribes.length} total)
              {bribesLoading && ' - Loading...'}
            </span>
          </h2>
          <div className="space-y-4">
            {displayProfile.bribes.length > 0 ? (
              displayProfile.bribes.map((bribe, index) => {
                const isProcessing = processingBribes.has(bribe.id);
                
                return (
                  <motion.div 
                    key={bribe.id} 
                    className="card p-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {/* Bribe amount and status */}
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-accent">{bribe.amount} ETH</p>
                      <span className={`
                        text-xs px-2 py-1 rounded
                        ${bribe.status === 'accepted' 
                          ? 'bg-green-900/50 text-green-400' 
                          : bribe.status === 'declined'
                            ? 'bg-red-900/50 text-red-400'
                            : 'bg-yellow-900/50 text-yellow-400'}
                      `}>
                        {bribe.status}
                      </span>
                    </div>
                    
                    {/* From address */}
                    <p className="text-sm text-gray-400">
                      From: {`${bribe.from.slice(0, 6)}...${bribe.from.slice(-4)}`}
                    </p>
                    
                    {/* Target bounty */}
                    <p className="text-sm text-gray-300 mt-1">
                      Switch to: <span className="font-semibold">{bribe.targetBountyTitle}</span>
                    </p>
                    
                    {/* Message if provided */}
                    {bribe.message && (
                      <p className="text-xs text-gray-500 mt-2 italic">
                        "{bribe.message}"
                      </p>
                    )}
                    
                    {/* Action buttons for pending bribes */}
                    {bribe.status === 'pending' && (
                      <div className="flex gap-2 mt-3">
                        <button 
                          onClick={() => handleBribeResponse(true, bribe.id)} 
                          className="btn btn-secondary text-xs px-3 py-1 disabled:opacity-50"
                          disabled={isProcessing}
                        >
                          {isProcessing ? 'Processing...' : 'Accept'}
                        </button>
                        <button 
                          onClick={() => handleBribeResponse(false, bribe.id)} 
                          className="btn bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 disabled:opacity-50"
                          disabled={isProcessing}
                        >
                          {isProcessing ? 'Processing...' : 'Decline'}
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })
            ) : (
              <p className="text-gray-500">No bribes received yet</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Activity feed or additional info */}
      <motion.div 
        className="mt-12 p-4 bg-gray-dark border border-gray-medium rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-sm font-semibold text-gray-300 mb-2">
          📊 Profile Analytics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <p className="text-gray-500">Acceptance Rate</p>
            <p className="text-lg font-bold text-gray-200">
              {displayProfile.bribes.length > 0 
                ? Math.round((displayProfile.bribes.filter(b => b.status === 'accepted').length / displayProfile.bribes.length) * 100)
                : 0}%
            </p>
          </div>
          <div>
            <p className="text-gray-500">Avg Bribe</p>
            <p className="text-lg font-bold text-gray-200">
              {displayProfile.bribes.length > 0
                ? (displayProfile.bribes.reduce((sum, b) => sum + b.amount, 0) / displayProfile.bribes.length).toFixed(4)
                : '0'} ETH
            </p>
          </div>
          <div>
            <p className="text-gray-500">Active Bounties</p>
            <p className="text-lg font-bold text-gray-200">
              {displayProfile.commits.filter(c => {
                // In production, would check if bounty is still active
                return true;
              }).length}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Profile Views</p>
            <p className="text-lg font-bold text-gray-200">
              {Math.floor(Math.random() * 100) + 50} {/* Mock data */}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProfilePage;
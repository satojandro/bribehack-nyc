/**
 * Commit Page Component
 * 
 * Where hackers commit to working on specific bounties.
 * Features:
 * - Multi-select bounty selection (max 3)
 * - Optional ENS pseudonym for privacy
 * - Optional IPFS hash for idea submission
 * - Wallet connection required
 * 
 * This creates an on-chain commitment that:
 * 1. Locks the hacker into specific bounties
 * 2. Makes them eligible for bribes
 * 3. Tracks their participation for reputation
 */

'use client';

import { useState, useEffect } from 'react';
import { bounties } from '@/lib/prizeData';
import { useAccount } from 'wagmi';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useCommitToBounties, useGetCommitment } from '@/lib/useBribehack';
import { 
  useCommitmentsByHacker, 
  useRecentCommitments, 
  useGlobalStats 
} from '@/lib/hooks/useSubgraphData';
import { formatEthAmount, getDisplayName, formatTimeAgo } from '@/lib/graphql/utils';
import { useENSSubdomain } from '@/lib/hooks/useENSSubdomain';
import { getDisplayNameWithEmoji } from '@/lib/nameGenerator';

const CommitPage = () => {
  // State for form inputs
  const [selectedBounties, setSelectedBounties] = useState<string[]>([]);
  const [ipfsHash, setIpfsHash] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useCustomENS, setUseCustomENS] = useState(false);
  const [customENS, setCustomENS] = useState('');
  const [pseudonymChoices, setPseudonymChoices] = useState<string[]>([]);
  
  // Get wallet connection status
  const { address, isConnected: wagmiConnected } = useAccount();
  const { user } = useDynamicContext();
  
  // For Dynamic embedded wallets, prioritize having an address
  const isConnected = !!address || (!!user && wagmiConnected);
  
  // Debug log for troubleshooting
  console.log('Connection Debug:', { address, wagmiConnected, user: !!user, isConnected });
  
  // Contract hooks
  const { commitToBounties, isPending: isCommitting, isConfirming, isConfirmed, error } = useCommitToBounties();
  const { data: existingCommitment } = useGetCommitment(address);
  
  // ENS subdomain hook
  const {
    pseudonym,
    fullENSName,
    status: ensStatus,
    error: ensError,
    isAvailable,
    generateNewPseudonym,
    generatePseudonymChoices,
    setPseudonym,
    checkAvailability,
    mintSubdomain,
    canMint,
    isLoading: ensLoading,
    isMinted
  } = useENSSubdomain();

  // Subgraph data hooks
  const { data: userCommitments, isLoading: commitmentsLoading } = useCommitmentsByHacker(
    address || '', 
    !!address
  );
  const { data: recentCommitments, isLoading: recentLoading } = useRecentCommitments(5);
  const { data: globalStats } = useGlobalStats();
  
  // Generate pseudonym choices after mount to avoid hydration issues
  useEffect(() => {
    if (pseudonymChoices.length === 0) {
      setPseudonymChoices(generatePseudonymChoices());
    }
  }, [generatePseudonymChoices]);

  /**
   * Handle bounty selection toggle
   * Enforces max 3 bounties rule
   */
  const handleBountyToggle = (bountyId: string) => {
    setSelectedBounties(prev => {
      if (prev.includes(bountyId)) {
        // Remove if already selected
        return prev.filter(id => id !== bountyId);
      } else {
        // Add if not selected (max 3)
        if (prev.length >= 3) {
          toast.error('Maximum 3 bounties allowed per commit');
          return prev;
        }
        return [...prev, bountyId];
      }
    });
  };

  /**
   * Handle form submission
   * Calls the smart contract to commit to bounties
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (selectedBounties.length === 0) {
      toast.error('Please select at least one bounty');
      return;
    }
    
    try {
      // Determine which ENS name to use
      const ensToUse = useCustomENS ? customENS : (isMinted ? fullENSName : '');
      
      console.log('Submitting commitment:', {
        bounties: selectedBounties,
        ens: ensToUse,
        ipfsHash: ipfsHash || ''
      });
      
      // Call the smart contract
      await commitToBounties(selectedBounties, ensToUse, ipfsHash);
      
    } catch (error) {
      console.error('Commit error:', error);
      toast.error('Failed to commit. Please try again.');
    }
  };
  
  // Handle successful transaction
  useEffect(() => {
    if (isConfirmed) {
      toast.success(
        `Successfully committed to ${selectedBounties.length} ${
          selectedBounties.length === 1 ? 'bounty' : 'bounties'
        }!`
      );
      
      // Reset form
      setSelectedBounties([]);
      setCustomENS('');
      setIpfsHash('');
    }
  }, [isConfirmed, selectedBounties.length]);
  
  // Handle transaction errors
  useEffect(() => {
    if (error) {
      toast.error('Transaction failed. Please try again.');
    }
  }, [error]);

  return (
    <motion.div 
      className="max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-primary">Commit to Bounties</h1>
        <p className="text-gray-400">
          Select up to 3 bounties you want to work on. 
          <span className="text-xs ml-2 text-yellow-500">
            ⚠️ Commits are binding on-chain
          </span>
        </p>
      </div>
      
      {/* Main commit form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Bounty selection grid */}
        <div className="card">
          <label className="block text-sm font-medium text-gray-300 mb-4">
            Select Bounties 
            <span className="text-xs text-gray-500 ml-2">
              ({selectedBounties.length}/3 selected)
            </span>
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {bounties.map(bounty => {
              const isSelected = selectedBounties.includes(bounty.id);
              
              return (
                <button
                  type="button"
                  key={bounty.id}
                  onClick={() => handleBountyToggle(bounty.id)}
                  className={`
                    p-4 border-2 rounded-lg text-left transition-all duration-200
                    ${isSelected 
                      ? 'bg-primary/10 border-primary shadow-glow-primary' 
                      : 'bg-gray-medium/50 border-gray-light hover:border-primary/50'}
                  `}
                  disabled={isSubmitting}
                >
                  {/* Bounty card content */}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-semibold text-sm ${isSelected ? 'text-primary' : 'text-gray-200'}`}>
                      {bounty.title}
                    </h3>
                    {isSelected && (
                      <span className="text-xs bg-primary text-white px-2 py-1 rounded">
                        Selected
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-400 mb-2">
                    {bounty.sponsor} • {bounty.chain}
                  </p>
                  
                  <div className="flex justify-between text-xs">
                    <span className="text-secondary">
                      ${bounty.currentPrizePool.toLocaleString()}
                    </span>
                    <span className="text-gray-500">
                      {bounty.commits} hackers
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ENS Pseudonym Creation */}
        <div className="card space-y-6">
          <h2 className="text-lg font-semibold text-gray-200 flex items-center">
            🔮 Create Your Hacker Identity
            <span className="ml-2 text-xs bg-purple-600 text-white px-2 py-1 rounded">
              Get .bribehack.eth
            </span>
          </h2>
          <p className="text-sm text-gray-400">
            Mint a free ENS subdomain to create your hacker persona and hide your real address
          </p>
          
          {/* ENS Generation Options */}
          <div className="space-y-4">
            {/* Toggle between generated and custom ENS */}
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setUseCustomENS(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !useCustomENS 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-medium text-gray-300 hover:bg-gray-light'
                }`}
                disabled={isSubmitting || ensLoading}
              >
                🎲 Generate Pseudonym
              </button>
              <button
                type="button"
                onClick={() => setUseCustomENS(true)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  useCustomENS 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-medium text-gray-300 hover:bg-gray-light'
                }`}
                disabled={isSubmitting || ensLoading}
              >
                ✏️ Use Custom ENS
              </button>
            </div>

            {!useCustomENS ? (
              /* Generated Pseudonym Section */
              <div className="space-y-4">
                {/* Current Generated Name */}
                <div className="p-4 bg-purple-900/20 border border-purple-700/50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-purple-300">
                        {pseudonym ? getDisplayNameWithEmoji(pseudonym) : 'Generating...'}
                      </h3>
                      <p className="text-sm text-purple-400 font-mono">
                        {fullENSName || 'Generating...'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isAvailable === true && (
                        <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                          Available
                        </span>
                      )}
                      {isAvailable === false && (
                        <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">
                          Taken
                        </span>
                      )}
                      {isMinted && (
                        <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                          ✅ Minted
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={generateNewPseudonym}
                      className="text-xs bg-gray-medium hover:bg-gray-light text-gray-300 px-3 py-2 rounded transition-colors"
                      disabled={isSubmitting || ensLoading}
                    >
                      🎲 Generate New
                    </button>
                    
                    {!isMinted && isAvailable !== true && (
                      <button
                        type="button"
                        onClick={() => checkAvailability()}
                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded transition-colors"
                        disabled={isSubmitting || ensLoading}
                      >
                        {ensLoading ? 'Checking...' : 'Check Availability'}
                      </button>
                    )}
                    
                    {canMint && !isMinted && (
                      <button
                        type="button"
                        onClick={() => mintSubdomain()}
                        className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded transition-colors"
                        disabled={isSubmitting || ensLoading}
                      >
                        {ensLoading ? 'Minting...' : '⚡ Mint ENS'}
                      </button>
                    )}
                  </div>
                  
                  {ensError && (
                    <p className="text-xs text-red-400 mt-2">
                      {ensError}
                    </p>
                  )}
                </div>

                {/* Quick Options */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2">
                    Or pick from these options:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {pseudonymChoices.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setPseudonym(option)}
                        className="text-xs bg-gray-dark hover:bg-gray-medium text-gray-300 px-3 py-2 rounded border border-gray-light/20 hover:border-primary/50 transition-colors"
                        disabled={isSubmitting || ensLoading}
                      >
                        {getDisplayNameWithEmoji(option).split(' ')[0]} {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Custom ENS Section */
              <div>
                <label htmlFor="customENS" className="block text-sm font-medium text-gray-300 mb-2">
                  Custom ENS Name
                  <span className="text-xs text-gray-500 ml-2">
                    (Use your existing ENS)
                  </span>
                </label>
                <input 
                  type="text" 
                  id="customENS"
                  value={customENS}
                  onChange={(e) => setCustomENS(e.target.value)}
                  placeholder="vitalik.eth or your-name.bribehack.eth"
                  className="w-full"
                  disabled={isSubmitting}
                />
              </div>
            )}
          </div>
        </div>

        {/* Optional Information */}
        <div className="card space-y-6">
          <h2 className="text-lg font-semibold text-gray-200">
            Optional Information
          </h2>

          {/* IPFS Hash field */}
          <div>
            <label htmlFor="ipfsHash" className="block text-sm font-medium text-gray-300 mb-2">
              Idea Submission (IPFS Hash)
              <span className="text-xs text-gray-500 ml-2">
                (Share your approach)
              </span>
            </label>
            <input 
              type="text" 
              id="ipfsHash"
              value={ipfsHash}
              onChange={(e) => setIpfsHash(e.target.value)}
              placeholder="QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco"
              className="w-full font-mono text-sm"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Submit button */}
        <button 
          type="submit" 
          className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed" 
          disabled={!isConnected || isCommitting || isConfirming || selectedBounties.length === 0}
        >
          {!isConnected 
            ? 'Connect Wallet to Commit' 
            : isCommitting 
              ? 'Submitting Transaction...' 
              : isConfirming
                ? 'Confirming Transaction...'
                : `Commit to ${selectedBounties.length || 0} ${selectedBounties.length === 1 ? 'Bounty' : 'Bounties'}`}
        </button>
      </form>
      
      {/* Live Activity Section */}
      <motion.div 
        className="mt-8 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {/* User's Previous Commitments */}
        {address && userCommitments && userCommitments.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              📊 Your Previous Commitments
              <span className="ml-2 text-xs bg-primary text-white px-2 py-1 rounded">
                {userCommitments.length}
              </span>
            </h3>
            <div className="space-y-3">
              {userCommitments.slice(0, 3).map((commitment) => (
                <div 
                  key={commitment.id}
                  className="p-3 bg-gray-medium/30 rounded-lg border border-gray-light/20"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="text-sm text-gray-300">
                        Committed to <span className="text-primary font-medium">
                          {commitment.bountyCount} bounties
                        </span>
                      </p>
                      {commitment.ensPseudonym && (
                        <p className="text-xs text-gray-400 mt-1">
                          as {commitment.ensPseudonym}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {commitment.timeAgo}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {commitment.bountyIds.map((bountyId) => (
                      <span 
                        key={bountyId}
                        className="text-xs bg-gray-dark px-2 py-1 rounded"
                      >
                        {bountyId}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Platform Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            🔥 Recent Commits
            {globalStats && (
              <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded">
                {globalStats.totalCommitments} total
              </span>
            )}
          </h3>
          
          {recentLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-medium/30 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : recentCommitments && recentCommitments.length > 0 ? (
            <div className="space-y-3">
              {recentCommitments.map((commitment) => (
                <div 
                  key={commitment.id}
                  className="p-3 bg-gray-medium/30 rounded-lg border border-gray-light/20"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="text-sm text-gray-300">
                        <span className="text-blue-400 font-mono text-xs">
                          {getDisplayName(commitment.hacker, commitment.ensPseudonym)}
                        </span>
                        {' '}committed to <span className="text-primary font-medium">
                          {commitment.bountyCount} bounties
                        </span>
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {commitment.timeAgo}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {commitment.bountyIds.slice(0, 3).map((bountyId) => (
                      <span 
                        key={bountyId}
                        className="text-xs bg-gray-dark px-2 py-1 rounded"
                      >
                        {bountyId}
                      </span>
                    ))}
                    {commitment.bountyIds.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{commitment.bountyIds.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No recent commitments found</p>
              <p className="text-xs mt-1">Be the first to commit to bounties!</p>
            </div>
          )}
        </div>
      </motion.div>
      
      {/* Info box */}
      <motion.div 
        className="mt-8 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-sm font-semibold text-yellow-500 mb-2">
          ⚡ How Commits Work
        </h3>
        <ul className="text-xs text-yellow-600 space-y-1">
          <li>• Commits are recorded on-chain and cannot be undone</li>
          <li>• You become eligible for bribes once committed</li>
          <li>• Sponsors can see your commitment and may bribe you to switch</li>
          <li>• Your reputation score increases with successful submissions</li>
        </ul>
      </motion.div>
    </motion.div>
  );
};

export default CommitPage;
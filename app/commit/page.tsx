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

import { useState } from 'react';
import { bounties } from '@/lib/mockData';
import { useAccount } from 'wagmi';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useCommitToBounties, useGetCommitment } from '@/lib/useBribehack';

const CommitPage = () => {
  // State for form inputs
  const [selectedBounties, setSelectedBounties] = useState<string[]>([]);
  const [ensName, setEnsName] = useState('');
  const [ipfsHash, setIpfsHash] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get wallet connection status
  const { address } = useAccount();
  const { user } = useDynamicContext();
  const isConnected = !!user && !!address;
  
  // Contract hooks
  const { commitToBounties, isPending: isCommitting, isConfirming, isConfirmed, error } = useCommitToBounties();
  const { data: existingCommitment } = useGetCommitment(address);

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
      console.log('Submitting commitment:', {
        bounties: selectedBounties,
        ens: ensName || '',
        ipfsHash: ipfsHash || ''
      });
      
      // Call the smart contract
      await commitToBounties(selectedBounties, ensName, ipfsHash);
      
    } catch (error) {
      console.error('Commit error:', error);
      toast.error('Failed to commit. Please try again.');
    }
  };
  
  // Handle successful transaction
  if (isConfirmed) {
    toast.success(
      `Successfully committed to ${selectedBounties.length} ${
        selectedBounties.length === 1 ? 'bounty' : 'bounties'
      }!`
    );
    
    // Reset form
    setSelectedBounties([]);
    setEnsName('');
    setIpfsHash('');
  }
  
  // Handle transaction errors
  if (error) {
    toast.error('Transaction failed. Please try again.');
  }

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

        {/* Optional fields */}
        <div className="card space-y-6">
          <h2 className="text-lg font-semibold text-gray-200">
            Optional Information
          </h2>
          
          {/* ENS Pseudonym field */}
          <div>
            <label htmlFor="ensName" className="block text-sm font-medium text-gray-300 mb-2">
              ENS Pseudonym
              <span className="text-xs text-gray-500 ml-2">
                (Hide your address on leaderboard)
              </span>
            </label>
            <input 
              type="text" 
              id="ensName"
              value={ensName}
              onChange={(e) => setEnsName(e.target.value)}
              placeholder="vitalik.eth"
              className="w-full"
              disabled={isSubmitting}
            />
          </div>

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
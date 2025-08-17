/**
 * Sponsor Page Component
 * 
 * Dual-purpose page for sponsors to:
 * 1. Add funds to bounty prize pools
 * 2. Send direct bribes to specific hackers
 * 
 * This is where the "market" aspect of Bribehack comes alive.
 * Sponsors can strategically incentivize hackers to work on
 * their preferred bounties through transparent on-chain bribes.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { bounties } from '@/lib/prizeData';
import { useAccount } from 'wagmi';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { isAddress } from 'viem';
import { useSponsorBounty, useBribeHacker } from '@/lib/useBribehack';
import { 
  useRecentBribes, 
  useRecentSponsorships, 
  useTopHackers,
  useGlobalStats 
} from '@/lib/hooks/useSubgraphData';
import { formatEthAmount, getDisplayName, shortenAddress } from '@/lib/graphql/utils';

const SponsorPage = () => {
  // State for sponsor bounty form
  const [selectedBounty, setSelectedBounty] = useState('');
  const [sponsorAmount, setSponsorAmount] = useState('');
  
  // State for bribe form
  const [bribeAddress, setBribeAddress] = useState('');
  const [bribeAmount, setBribeAmount] = useState('');
  const [bribeMessage, setBribeMessage] = useState('');
  const [targetBounty, setTargetBounty] = useState('');
  
  // Get wallet connection status
  const { address, isConnected: wagmiConnected } = useAccount();
  const { user } = useDynamicContext();
  
  // For Dynamic embedded wallets, prioritize having an address
  const isConnected = !!address || (!!user && wagmiConnected);

  // Contract hooks
  const { 
    sponsorBounty, 
    isPending: isSponsorPending, 
    isConfirming: isSponsorConfirming, 
    isConfirmed: isSponsorConfirmed,
    error: sponsorError 
  } = useSponsorBounty();
  
  // Subgraph data hooks
  const { data: recentBribes, isLoading: bribesLoading } = useRecentBribes(10);
  const { data: recentSponsorships, isLoading: sponsorshipsLoading } = useRecentSponsorships(10);
  const { data: topHackers, isLoading: hackersLoading } = useTopHackers(10);
  const { data: globalStats } = useGlobalStats();
  
  const { 
    bribeHacker, 
    isPending: isBribePending, 
    isConfirming: isBribeConfirming, 
    isConfirmed: isBribeConfirmed,
    error: bribeError 
  } = useBribeHacker();

  /**
   * Handle sponsor bounty submission
   * Adds funds to a bounty's prize pool
   */
  const handleSponsorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }
    if (!selectedBounty || !sponsorAmount) {
      toast.error('Please select a bounty and enter an amount');
      return;
    }
    
    const amount = parseFloat(sponsorAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    try {
      console.log('Sponsoring bounty:', {
        sponsor: address,
        bounty: selectedBounty,
        amount: sponsorAmount
      });
      
      // Call the smart contract
      await sponsorBounty(selectedBounty, sponsorAmount);
      
    } catch (error) {
      console.error('Sponsor error:', error);
      toast.error('Transaction failed. Please try again.');
    }
  };
  
  // Handle successful sponsor transaction
  useEffect(() => {
    if (isSponsorConfirmed) {
      const bounty = bounties.find(b => b.id === selectedBounty);
      toast.success(`Successfully sponsored ${bounty?.title} with ${sponsorAmount} ETH!`);
      
      // Reset form
      setSelectedBounty('');
      setSponsorAmount('');
    }
  }, [isSponsorConfirmed, selectedBounty, sponsorAmount]);
  
  // Handle sponsor errors
  useEffect(() => {
    if (sponsorError) {
      toast.error('Sponsor transaction failed. Please try again.');
    }
  }, [sponsorError]);
  
  /**
   * Handle bribe submission
   * Sends a direct bribe to a specific hacker
   */
  const handleBribeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }
    
    // Validate address (handles both ENS and hex addresses)
    if (!bribeAddress) {
      toast.error('Please enter a hacker address or ENS name');
      return;
    }
    
    // Check if it's a valid ethereum address (if not ENS)
    if (!bribeAddress.endsWith('.eth') && !isAddress(bribeAddress)) {
      toast.error('Please enter a valid Ethereum address or ENS name');
      return;
    }
    
    const amount = parseFloat(bribeAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid bribe amount');
      return;
    }
    
    if (!targetBounty) {
      toast.error('Please select a target bounty for the hacker');
      return;
    }
    
    try {
      console.log('Sending bribe:', {
        from: address,
        to: bribeAddress,
        amount: bribeAmount,
        targetBounty: targetBounty,
        message: bribeMessage || null
      });
      
      // Call the smart contract
      await bribeHacker(bribeAddress as `0x${string}`, targetBounty, bribeAmount);
      
    } catch (error) {
      console.error('Bribe error:', error);
      toast.error('Transaction failed. Please try again.');
    }
  };
  
  // Handle successful bribe transaction
  useEffect(() => {
    if (isBribeConfirmed) {
      toast.success(`Successfully bribed ${bribeAddress} with ${bribeAmount} ETH!`);
      
      // Reset form
      setBribeAddress('');
      setBribeAmount('');
      setBribeMessage('');
      setTargetBounty('');
    }
  }, [isBribeConfirmed, bribeAddress, bribeAmount]);
  
  // Handle bribe errors
  useEffect(() => {
    if (bribeError) {
      toast.error('Bribe transaction failed. Please try again.');
    }
  }, [bribeError]);

  return (
    <motion.div 
      className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Sponsor a Bounty Section */}
      <div>
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2 text-secondary">Sponsor a Bounty</h1>
          <p className="text-gray-400">
            Increase the prize pool to attract more hackers
          </p>
        </div>
        
        <form onSubmit={handleSponsorSubmit} className="card space-y-6">
          {/* Bounty selection */}
          <div>
            <label htmlFor="bountySelect" className="block text-sm font-medium text-gray-300 mb-2">
              Select Bounty
            </label>
            <select 
              id="bountySelect" 
              value={selectedBounty}
              onChange={(e) => setSelectedBounty(e.target.value)}
              className="w-full"
              disabled={isSponsorPending || isSponsorConfirming}
            >
              <option value="" disabled>Choose a bounty...</option>
              {bounties.map(bounty => (
                <option key={bounty.id} value={bounty.id}>
                  {bounty.title} (${bounty.currentPrizePool})
                </option>
              ))}
            </select>
          </div>
          
          {/* Show selected bounty details */}
          {selectedBounty && (
            <div className="p-3 bg-gray-medium rounded-lg text-sm">
              {(() => {
                const bounty = bounties.find(b => b.id === selectedBounty);
                return bounty ? (
                  <>
                    <p className="text-gray-300 mb-1">{bounty.description}</p>
                    <p className="text-xs text-gray-500">
                      Current pool: ${bounty.currentPrizePool} • 
                      {bounty.commits} hackers committed
                    </p>
                  </>
                ) : null;
              })()}
            </div>
          )}
          
          {/* ETH amount input */}
          <div>
            <label htmlFor="sponsorAmount" className="block text-sm font-medium text-gray-300 mb-2">
              ETH Amount
              <span className="text-xs text-gray-500 ml-2">
                (Min: 0.01 ETH)
              </span>
            </label>
            <input 
              type="number" 
              id="sponsorAmount"
              step="0.01"
              min="0.01"
              value={sponsorAmount}
              onChange={(e) => setSponsorAmount(e.target.value)}
              placeholder="0.1"
              className="w-full"
              disabled={isSponsorPending || isSponsorConfirming}
            />
          </div>
          
          {/* Submit button */}
          <button 
            type="submit" 
            className="btn btn-secondary w-full disabled:opacity-50" 
            disabled={!isConnected || isSponsorPending || isSponsorConfirming}
          >
            {!isConnected 
              ? 'Connect Wallet to Sponsor' 
              : isSponsorPending
                ? 'Submitting Transaction...'
                : isSponsorConfirming
                  ? 'Confirming Transaction...'
                  : 'Sponsor Bounty'}
          </button>
        </form>
      </div>

      {/* Bribe a Hacker Section */}
      <div>
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2 text-accent">Bribe a Hacker</h1>
          <p className="text-gray-400">
            Incentivize specific hackers to switch bounties
          </p>
        </div>
        
        <form onSubmit={handleBribeSubmit} className="card space-y-6">
          {/* Hacker address input */}
          <div>
            <label htmlFor="bribeAddress" className="block text-sm font-medium text-gray-300 mb-2">
              Hacker Address or ENS
            </label>
            <input 
              type="text" 
              id="bribeAddress"
              value={bribeAddress}
              onChange={(e) => setBribeAddress(e.target.value)}
              placeholder="vitalik.eth or 0x..."
              className="w-full font-mono text-sm"
              disabled={isBribePending || isBribeConfirming}
            />
          </div>
          
          {/* Target bounty selection */}
          <div>
            <label htmlFor="targetBounty" className="block text-sm font-medium text-gray-300 mb-2">
              Target Bounty
              <span className="text-xs text-gray-500 ml-2">
                (Where you want them to work)
              </span>
            </label>
            <select 
              id="targetBounty" 
              value={targetBounty}
              onChange={(e) => setTargetBounty(e.target.value)}
              className="w-full"
              disabled={isBribePending || isBribeConfirming}
            >
              <option value="" disabled>Select target bounty...</option>
              {bounties.map(bounty => (
                <option key={bounty.id} value={bounty.id}>
                  {bounty.title}
                </option>
              ))}
            </select>
          </div>
          
          {/* Bribe amount input */}
          <div>
            <label htmlFor="bribeAmount" className="block text-sm font-medium text-gray-300 mb-2">
              Bribe Amount (ETH)
              <span className="text-xs text-gray-500 ml-2">
                (Competitive bribes work better)
              </span>
            </label>
            <input 
              type="number" 
              id="bribeAmount"
              step="0.01"
              min="0.01"
              value={bribeAmount}
              onChange={(e) => setBribeAmount(e.target.value)}
              placeholder="0.05"
              className="w-full"
              disabled={isBribePending || isBribeConfirming}
            />
          </div>
          
          {/* Optional message */}
          <div>
            <label htmlFor="bribeMessage" className="block text-sm font-medium text-gray-300 mb-2">
              Message (Optional)
              <span className="text-xs text-gray-500 ml-2">
                (Convince them!)
              </span>
            </label>
            <textarea 
              id="bribeMessage"
              value={bribeMessage}
              onChange={(e) => setBribeMessage(e.target.value)}
              placeholder="Join us on this bounty! We have cookies..."
              className="w-full h-20 resize-none"
              maxLength={200}
              disabled={isBribePending || isBribeConfirming}
            />
            <p className="text-xs text-gray-500 mt-1">
              {bribeMessage.length}/200 characters
            </p>
          </div>
          
          {/* Submit button */}
          <button 
            type="submit" 
            className="btn btn-primary w-full disabled:opacity-50" 
            disabled={!isConnected || isBribePending || isBribeConfirming}
          >
            {!isConnected 
              ? 'Connect Wallet to Bribe' 
              : isBribePending
                ? 'Submitting Transaction...'
                : isBribeConfirming
                  ? 'Confirming Transaction...'
                  : 'Send Bribe'}
          </button>
        </form>
      </div>
      
      {/* Live Activity Section spanning both columns */}
      <motion.div 
        className="lg:col-span-2 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {/* Top Hackers to Bribe */}
        <div className="card">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            🎯 Top Hackers Available for Bribes
            {globalStats && (
              <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded">
                {globalStats.totalHackers} active
              </span>
            )}
          </h3>
          
          {hackersLoading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-medium/30 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : topHackers && topHackers.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topHackers.slice(0, 6).map((hacker) => (
                <div 
                  key={hacker.address}
                  className="p-4 bg-gray-medium/30 rounded-lg border border-gray-light/20 hover:border-primary/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        {getDisplayName(hacker.address, hacker.ensPseudonym)}
                      </p>
                      <p className="text-xs text-gray-400 font-mono">
                        {shortenAddress(hacker.address)}
                      </p>
                    </div>
                    <span className="text-xs bg-primary text-white px-2 py-1 rounded">
                      #{hacker.id?.slice(-4)}
                    </span>
                  </div>
                  
                  <div className="space-y-1 mb-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Total Received:</span>
                      <span className="text-green-400 font-medium">
                        {formatEthAmount(hacker.totalBribesReceivedWei || '0', 3)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Commitments:</span>
                      <span className="text-blue-400">{hacker.commitmentCount}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Bounties:</span>
                      <span className="text-purple-400">{hacker.bountyIds.length}</span>
                    </div>
                  </div>
                  
                  <button 
                    className="w-full text-xs bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 py-2 rounded transition-colors"
                    onClick={() => setBribeAddress(hacker.address)}
                  >
                    🎯 Target for Bribe
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No hackers found</p>
              <p className="text-xs mt-1">Waiting for hackers to commit...</p>
            </div>
          )}
        </div>

        {/* Recent Activity Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Bribes */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              💰 Recent Bribes
              {globalStats && (
                <span className="ml-2 text-xs bg-red-600 text-white px-2 py-1 rounded">
                  {globalStats.totalBribes} total
                </span>
              )}
            </h3>
            
            {bribesLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-medium/30 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : recentBribes && recentBribes.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {recentBribes.map((bribe) => (
                  <div 
                    key={bribe.id}
                    className="p-3 bg-gray-medium/30 rounded-lg border border-gray-light/20"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="text-sm text-gray-300">
                          <span className="text-blue-400 font-mono text-xs">
                            {shortenAddress(bribe.briber)}
                          </span>
                          {' → '}
                          <span className="text-green-400 font-mono text-xs">
                            {shortenAddress(bribe.hacker)}
                          </span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          for <span className="text-purple-400">{bribe.bountyId}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-400">
                          {formatEthAmount(bribe.amountWei, 3)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {bribe.timeAgo}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No bribes yet</p>
                <p className="text-xs mt-1">Be the first to bribe a hacker!</p>
              </div>
            )}
          </div>

          {/* Recent Sponsorships */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              🏆 Recent Sponsorships
              {globalStats && (
                <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">
                  {globalStats.totalSponsors} total
                </span>
              )}
            </h3>
            
            {sponsorshipsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-medium/30 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : recentSponsorships && recentSponsorships.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {recentSponsorships.map((sponsorship) => (
                  <div 
                    key={sponsorship.id}
                    className="p-3 bg-gray-medium/30 rounded-lg border border-gray-light/20"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="text-sm text-gray-300">
                          <span className="text-blue-400 font-mono text-xs">
                            {shortenAddress(sponsorship.sponsor)}
                          </span>
                          {' sponsored '}
                          <span className="text-purple-400 font-medium">
                            {sponsorship.bounty.bountyId}
                          </span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Pool: {formatEthAmount(sponsorship.bounty.prizePoolEth || '0', 3)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-yellow-400">
                          +{formatEthAmount(sponsorship.amount || '0', 3)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {sponsorship.timeAgo}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No sponsorships yet</p>
                <p className="text-xs mt-1">Be the first to sponsor a bounty!</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
      
      {/* Info section spanning both columns */}
      <motion.div 
        className="lg:col-span-2 p-4 bg-purple-900/20 border border-purple-700 rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-sm font-semibold text-purple-400 mb-2">
          💰 How Bribehack Economics Work
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-xs text-purple-500">
          <div>
            <p className="font-semibold mb-1">Sponsoring:</p>
            <ul className="space-y-1">
              <li>• Increases the official prize pool</li>
              <li>• Attracts more hackers to the bounty</li>
              <li>• Shows sponsor commitment</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-1">Bribing:</p>
            <ul className="space-y-1">
              <li>• Direct incentive to specific hackers</li>
              <li>• Transparent on-chain negotiation</li>
              <li>• Hackers can accept or decline</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SponsorPage;
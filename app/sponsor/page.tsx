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

import { useState } from 'react';
import { bounties } from '@/lib/mockData';
import { useAccount } from 'wagmi';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { isAddress } from 'viem';

const SponsorPage = () => {
  // State for sponsor bounty form
  const [selectedBounty, setSelectedBounty] = useState('');
  const [sponsorAmount, setSponsorAmount] = useState('');
  const [isSponsorSubmitting, setIsSponsorSubmitting] = useState(false);
  
  // State for bribe form
  const [bribeAddress, setBribeAddress] = useState('');
  const [bribeAmount, setBribeAmount] = useState('');
  const [bribeMessage, setBribeMessage] = useState('');
  const [targetBounty, setTargetBounty] = useState('');
  const [isBribeSubmitting, setIsBribeSubmitting] = useState(false);
  
  // Get wallet connection status
  const { address } = useAccount();
  const { user } = useDynamicContext();
  const isConnected = !!user && !!address;

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
    
    setIsSponsorSubmitting(true);
    
    try {
      // Mock contract call
      // In production: await contract.sponsorBounty(selectedBounty, { value: parseEther(sponsorAmount) })
      console.log('Sponsoring bounty:', {
        sponsor: address,
        bounty: selectedBounty,
        amount: sponsorAmount,
        timestamp: new Date().toISOString()
      });
      
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const bounty = bounties.find(b => b.id === selectedBounty);
      toast.success(`Successfully sponsored ${bounty?.title} with ${sponsorAmount} ETH!`);
      
      // Reset form
      setSelectedBounty('');
      setSponsorAmount('');
    } catch (error) {
      console.error('Sponsor error:', error);
      toast.error('Transaction failed. Please try again.');
    } finally {
      setIsSponsorSubmitting(false);
    }
  };
  
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
    
    setIsBribeSubmitting(true);
    
    try {
      // Mock contract call
      // In production: await contract.bribeHacker(bribeAddress, targetBounty, bribeMessage, { value: parseEther(bribeAmount) })
      console.log('Sending bribe:', {
        from: address,
        to: bribeAddress,
        amount: bribeAmount,
        targetBounty: targetBounty,
        message: bribeMessage || null,
        timestamp: new Date().toISOString()
      });
      
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`Successfully bribed ${bribeAddress} with ${bribeAmount} ETH!`);
      
      // Reset form
      setBribeAddress('');
      setBribeAmount('');
      setBribeMessage('');
      setTargetBounty('');
    } catch (error) {
      console.error('Bribe error:', error);
      toast.error('Transaction failed. Please try again.');
    } finally {
      setIsBribeSubmitting(false);
    }
  };

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
              disabled={isSponsorSubmitting}
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
              disabled={isSponsorSubmitting}
            />
          </div>
          
          {/* Submit button */}
          <button 
            type="submit" 
            className="btn btn-secondary w-full disabled:opacity-50" 
            disabled={!isConnected || isSponsorSubmitting}
          >
            {!isConnected 
              ? 'Connect Wallet to Sponsor' 
              : isSponsorSubmitting
                ? 'Processing Transaction...'
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
              disabled={isBribeSubmitting}
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
              disabled={isBribeSubmitting}
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
              disabled={isBribeSubmitting}
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
              disabled={isBribeSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              {bribeMessage.length}/200 characters
            </p>
          </div>
          
          {/* Submit button */}
          <button 
            type="submit" 
            className="btn btn-primary w-full disabled:opacity-50" 
            disabled={!isConnected || isBribeSubmitting}
          >
            {!isConnected 
              ? 'Connect Wallet to Bribe' 
              : isBribeSubmitting
                ? 'Processing Transaction...'
                : 'Send Bribe'}
          </button>
        </form>
      </div>
      
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
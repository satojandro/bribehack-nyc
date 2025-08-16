/**
 * Leaderboard Page Component
 * 
 * Displays all active bounties in a trading-dashboard style table.
 * Features:
 * - Real-time bounty data (currently mocked)
 * - Heat score visualization (popularity metric)
 * - Chain indicators
 * - Prize and bribe pool amounts
 * - Number of hacker commits
 * 
 * This is the main discovery page where hackers can see what's hot
 * and sponsors can see where the action is.
 */

'use client';

import { bounties } from '@/lib/mockData';
import { motion } from 'framer-motion';
import { FireIcon, CubeTransparentIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

/**
 * Get chain-specific styling and icon
 * In production, would use actual chain logos
 * @param chain - The blockchain name
 */
const getChainStyle = (chain: string) => {
  const chainColors: { [key: string]: string } = {
    'Polygon': 'text-purple-400',
    'Base': 'text-blue-400',
    'Optimism': 'text-red-400',
    'Zora': 'text-green-400',
    'Scroll': 'text-yellow-400',
  };
  
  return {
    icon: <CubeTransparentIcon className={`h-5 w-5 ${chainColors[chain] || 'text-gray-400'}`} />,
    color: chainColors[chain] || 'text-gray-400'
  };
};

/**
 * Get heat score color based on value
 * Higher scores = hotter colors (red/orange)
 * Lower scores = cooler colors (yellow)
 */
const getHeatScoreColor = (score: number) => {
  if (score > 80) return 'text-red-500';
  if (score > 60) return 'text-orange-500';
  if (score > 40) return 'text-yellow-500';
  return 'text-gray-500';
};

const LeaderboardPage = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-secondary">Bounty Leaderboard</h1>
        <p className="text-gray-400">
          Real-time hacker commitments and sponsor incentives. 
          <span className="text-xs ml-2 text-gray-500">
            Updates every block
          </span>
        </p>
      </div>

      {/* Stats cards - Quick overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-4">
          <p className="text-xs text-gray-400 uppercase">Total Bounties</p>
          <p className="text-2xl font-bold text-primary">{bounties.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-400 uppercase">Total Prize Pool</p>
          <p className="text-2xl font-bold text-secondary">
            ${bounties.reduce((sum, b) => sum + b.currentPrizePool, 0).toLocaleString()}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-400 uppercase">Total Bribes</p>
          <p className="text-2xl font-bold text-accent">
            {bounties.reduce((sum, b) => sum + (b.bribePool || 0), 0).toFixed(1)} ETH
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-gray-400 uppercase">Active Hackers</p>
          <p className="text-2xl font-bold text-gray-200">
            {bounties.reduce((sum, b) => sum + b.commits, 0)}
          </p>
        </div>
      </div>

      {/* Main bounties table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-medium">
          <thead className="bg-gray-dark">
            <tr>
              {/* Table headers with uppercase styling */}
              <th scope="col" className="px-6 py-3 text-left text-xs font-mono font-medium text-gray-300 uppercase tracking-wider">
                Bounty
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-mono font-medium text-gray-300 uppercase tracking-wider">
                Sponsor
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-mono font-medium text-gray-300 uppercase tracking-wider">
                Prize Pool
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-mono font-medium text-gray-300 uppercase tracking-wider">
                Hackers
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-mono font-medium text-gray-300 uppercase tracking-wider">
                Bribe Pool
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-mono font-medium text-gray-300 uppercase tracking-wider">
                Chain
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-mono font-medium text-gray-300 uppercase tracking-wider">
                Heat
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-dark/50 divide-y divide-gray-medium">
            {bounties.map((bounty, index) => {
              const chainStyle = getChainStyle(bounty.chain);
              const heatColor = getHeatScoreColor(bounty.heatScore || 0);
              
              return (
                <motion.tr 
                  key={bounty.id} 
                  className="hover:bg-gray-dark transition-colors duration-200 cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => {
                    // In production, this would navigate to bounty details
                    console.log('Navigate to bounty:', bounty.id);
                  }}
                >
                  {/* Bounty title with truncation for mobile */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-200">
                      <p className="truncate max-w-xs">{bounty.title}</p>
                      <p className="text-xs text-gray-500">{bounty.id}</p>
                    </div>
                  </td>
                  
                  {/* Sponsor name */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {bounty.sponsor}
                  </td>
                  
                  {/* Prize pool in USD */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-secondary">
                      ${bounty.currentPrizePool.toLocaleString()}
                    </span>
                  </td>
                  
                  {/* Number of committed hackers */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {bounty.commits}
                  </td>
                  
                  {/* Bribe pool in ETH */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-accent">
                      {bounty.bribePool || 0} ETH
                    </span>
                  </td>
                  
                  {/* Chain indicator with icon */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {chainStyle.icon}
                      <span className={`text-sm ${chainStyle.color}`}>
                        {bounty.chain}
                      </span>
                    </div>
                  </td>
                  
                  {/* Heat score with fire icon */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FireIcon className={`h-5 w-5 ${heatColor}`} />
                      <span className={`ml-2 text-sm ${heatColor}`}>
                        {bounty.heatScore || 0}
                      </span>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Footer info */}
      <div className="mt-8 text-center text-xs text-gray-500">
        <p>Data refreshes every block • Gas prices may affect bribe execution</p>
      </div>
    </motion.div>
  );
};

export default LeaderboardPage;
/**
 * Leaderboard Page
 * 
 * Live leaderboard of top hackers ranked by total bribes received,
 * commitments made, and recent activity. Shows real subgraph data
 * with filtering, searching, and detailed stats.
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLeaderboard, useGlobalStats, useDashboardData } from '@/lib/hooks/useSubgraphData';
import { 
  formatEthAmount, 
  getDisplayName, 
  shortenAddress,
  formatTimeAgo 
} from '@/lib/graphql/utils';

const LeaderboardPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'bribes' | 'commitments' | 'activity'>('bribes');
  const [filterMinBribes, setFilterMinBribes] = useState(0);

  // Fetch leaderboard and global stats
  const { data: leaderboard, isLoading, error } = useLeaderboard(100);
  const { data: globalStats } = useGlobalStats();
  const { data: dashboardData } = useDashboardData();

  // Filter and sort leaderboard
  const filteredLeaderboard = leaderboard?.filter(hacker => {
    const matchesSearch = searchTerm === '' || 
      hacker.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (hacker.ensPseudonym && hacker.ensPseudonym.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const meetsMinBribes = hacker.totalBribesReceived >= filterMinBribes;
    
    return matchesSearch && meetsMinBribes;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'bribes':
        return b.totalBribesReceived - a.totalBribesReceived;
      case 'commitments':
        return b.commitmentCount - a.commitmentCount;
      case 'activity':
        return b.lastActive.getTime() - a.lastActive.getTime();
      default:
        return 0;
    }
  });

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500 text-yellow-900';
    if (rank === 2) return 'bg-gray-400 text-gray-900';
    if (rank === 3) return 'bg-amber-600 text-amber-100';
    if (rank <= 10) return 'bg-primary text-white';
    return 'bg-gray-600 text-gray-200';
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    if (rank <= 10) return '🏆';
    return '🔥';
  };

  return (
    <motion.div 
      className="max-w-7xl mx-auto space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          🏆 Bribehack Leaderboard
        </h1>
        <p className="text-xl text-gray-300 mb-6">
          Top hackers ranked by total bribes received, commitments, and activity
        </p>
        
        {/* Global Stats */}
        {globalStats && (
          <div className="flex justify-center space-x-8 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {formatEthAmount(globalStats.totalBribeVolume || '0', 2)}
              </div>
              <div className="text-gray-400">Total Bribes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {globalStats.totalHackers}
              </div>
              <div className="text-gray-400">Active Hackers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {globalStats.totalCommitments}
              </div>
              <div className="text-gray-400">Commitments</div>
            </div>
          </div>
        )}
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="grid md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search Hackers
            </label>
            <input
              type="text"
              placeholder="Address or ENS name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-dark border border-gray-light rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-gray-dark border border-gray-light rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
            >
              <option value="bribes">Total Bribes</option>
              <option value="commitments">Commitments</option>
              <option value="activity">Recent Activity</option>
            </select>
          </div>

          {/* Min Bribes Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Min Bribes (ETH)
            </label>
            <input
              type="number"
              min="0"
              step="0.001"
              placeholder="0.0"
              value={filterMinBribes || ''}
              onChange={(e) => setFilterMinBribes(parseFloat(e.target.value) || 0)}
              className="w-full bg-gray-dark border border-gray-light rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary"
            />
          </div>

          {/* Results Count */}
          <div className="flex items-end">
            <div className="text-sm text-gray-400">
              {filteredLeaderboard?.length || 0} hackers found
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="card">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-medium/30 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-400">
            <p className="text-lg font-semibold mb-2">Error loading leaderboard</p>
            <p className="text-sm">Please try again later</p>
          </div>
        ) : filteredLeaderboard && filteredLeaderboard.length > 0 ? (
          <div className="space-y-4">
            {filteredLeaderboard.map((hacker, index) => {
              const displayRank = index + 1;
              
              return (
                <motion.div
                  key={hacker.address}
                  className={`
                    p-6 rounded-lg border transition-all duration-200 hover:scale-[1.02]
                    ${displayRank <= 3 
                      ? 'bg-gradient-to-r from-yellow-900/20 to-yellow-800/20 border-yellow-500/50 shadow-glow-yellow' 
                      : displayRank <= 10
                        ? 'bg-gray-medium/50 border-primary/30 hover:border-primary/50'
                        : 'bg-gray-medium/30 border-gray-light/20 hover:border-gray-light/40'
                    }
                  `}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-center justify-between">
                    {/* Rank and Hacker Info */}
                    <div className="flex items-center space-x-4">
                      {/* Rank Badge */}
                      <div className={`
                        flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg
                        ${getRankBadgeColor(displayRank)}
                      `}>
                        {getRankEmoji(displayRank)}
                      </div>

                      {/* Hacker Details */}
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-white">
                            {getDisplayName(hacker.address, hacker.ensPseudonym)}
                          </h3>
                          <span className="text-xs bg-gray-dark text-gray-300 px-2 py-1 rounded font-mono">
                            {shortenAddress(hacker.address)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>#{displayRank}</span>
                          <span>Last active: {formatTimeAgo(hacker.lastActive.getTime() / 1000)}</span>
                          <span>{hacker.bountyIds.length} bounties</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="text-right space-y-2">
                      <div className="text-2xl font-bold text-green-400">
                        {formatEthAmount(hacker.totalBribesReceived.toString(), 3)}
                      </div>
                      <div className="text-sm text-gray-400">
                        Total Bribes Received
                      </div>
                      
                      <div className="flex space-x-4 text-xs">
                        <div className="text-center">
                          <div className="text-blue-400 font-semibold">
                            {hacker.commitmentCount}
                          </div>
                          <div className="text-gray-500">Commits</div>
                        </div>
                        <div className="text-center">
                          <div className="text-purple-400 font-semibold">
                            {hacker.bribeCount}
                          </div>
                          <div className="text-gray-500">Bribes</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bounty Tags */}
                  {hacker.bountyIds.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-light/20">
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs text-gray-400 mr-2">Working on:</span>
                        {hacker.bountyIds.slice(0, 5).map((bountyId) => (
                          <span 
                            key={bountyId}
                            className="text-xs bg-purple-900/30 text-purple-300 px-2 py-1 rounded"
                          >
                            {bountyId}
                          </span>
                        ))}
                        {hacker.bountyIds.length > 5 && (
                          <span className="text-xs text-gray-500">
                            +{hacker.bountyIds.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-semibold mb-2">No hackers found</p>
            <p className="text-sm">Adjust your filters or wait for hackers to start committing</p>
          </div>
        )}
      </div>

      {/* Recent Activity Preview */}
      {dashboardData && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Commitments */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">
              🔥 Latest Commitments
            </h3>
            <div className="space-y-3">
              {dashboardData.recentCommitments?.slice(0, 5).map((commitment) => (
                <div 
                  key={commitment.id}
                  className="p-3 bg-gray-medium/30 rounded-lg border border-gray-light/20"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-300">
                        <span className="text-blue-400 font-mono text-xs">
                          {getDisplayName(commitment.hacker, commitment.ensPseudonym)}
                        </span>
                        {' committed to '}
                        <span className="text-primary font-medium">
                          {commitment.bountyCount} bounties
                        </span>
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {commitment.timeAgo}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Bribes */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">
              💰 Latest Bribes
            </h3>
            <div className="space-y-3">
              {dashboardData.recentBribes?.slice(0, 5).map((bribe) => (
                <div 
                  key={bribe.id}
                  className="p-3 bg-gray-medium/30 rounded-lg border border-gray-light/20"
                >
                  <div className="flex justify-between items-start">
                    <div>
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
                        {formatEthAmount(bribe.amountWei, 3)}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {bribe.timeAgo}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default LeaderboardPage;
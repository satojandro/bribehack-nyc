/**
 * Real Prize Data from ETHGlobal NYC 2024
 * 
 * This file loads and transforms the actual hackathon prize data
 * from data/prizes.json into the format expected by the Bribehack UI.
 */

import prizeDataRaw from '@/data/prizes.json';
import { Bounty } from './mockData';

/**
 * Prize interface from the JSON file
 */
interface Prize {
  id: string;
  title: string;
  sponsor: string;
  prize: string;
  description: string;
  tags: string[];
  link: string;
}

/**
 * Transform prize data into bounty format
 */
const transformPrizeToBounty = (prize: Prize): Bounty => {
  // Extract numeric amount from prize string (e.g., "$12,500" -> 12500)
  const prizeAmount = parseFloat(prize.prize.replace(/[$,]/g, '')) || 0;
  
  // Determine chain based on sponsor or tags
  const getChain = (prize: Prize): string => {
    const sponsor = prize.sponsor.toLowerCase();
    const tags = prize.tags.join(' ').toLowerCase();
    
    // Chain mappings based on sponsors
    if (sponsor.includes('base') || sponsor.includes('coinbase')) return 'Base';
    if (sponsor.includes('polygon') || sponsor.includes('katana')) return 'Polygon';
    if (sponsor.includes('optimism')) return 'Optimism';
    if (sponsor.includes('arbitrum')) return 'Arbitrum';
    if (sponsor.includes('flow')) return 'Flow';
    if (sponsor.includes('zircuit')) return 'Zircuit';
    if (sponsor.includes('flare')) return 'Flare';
    if (sponsor.includes('hedera')) return 'Hedera';
    if (sponsor.includes('chiliz')) return 'Chiliz';
    if (sponsor.includes('saga')) return 'Saga';
    if (sponsor.includes('scroll')) return 'Scroll';
    if (sponsor.includes('zora')) return 'Zora';
    
    // Default to Ethereum mainnet for major sponsors
    if (sponsor.includes('ethereum') || sponsor.includes('ens') || 
        sponsor.includes('uniswap') || sponsor.includes('chainlink')) return 'Ethereum';
    
    // Default chain
    return 'Ethereum';
  };
  
  // Generate mock metrics for UI display
  const generateMockMetrics = (prize: Prize) => {
    // Use prize amount and sponsor name to generate consistent "randomness"
    const seed = prizeAmount + prize.sponsor.length + prize.id.length;
    const random = (seed * 9301 + 49297) % 233280;
    
    // Generate commits based on prize amount (higher prizes = more interest)
    const baseCommits = Math.floor(prizeAmount / 1000);
    const commits = Math.max(1, Math.min(15, baseCommits + (random % 5)));
    
    // Generate bribe pool (0.1% - 0.5% of prize amount in ETH)
    const bribeMultiplier = 0.001 + (random % 100) / 100000;
    const bribePool = Number((prizeAmount * bribeMultiplier / 3000).toFixed(2)); // Assuming ETH ~$3000
    
    // Generate heat score based on commits, prize amount, and bribe pool
    const commitScore = Math.min(commits * 5, 50);
    const prizeScore = Math.min(prizeAmount / 200, 30);
    const bribeScore = Math.min(bribePool * 50, 20);
    const heatScore = Math.round(commitScore + prizeScore + bribeScore);
    
    return {
      commits,
      bribePool,
      heatScore: Math.min(100, Math.max(10, heatScore))
    };
  };
  
  const metrics = generateMockMetrics(prize);
  
  return {
    id: prize.id,
    title: prize.title,
    sponsor: prize.sponsor,
    chain: getChain(prize),
    description: prize.description,
    currentPrizePool: prizeAmount,
    commits: metrics.commits,
    bribePool: metrics.bribePool,
    heatScore: metrics.heatScore
  };
};

/**
 * Load and transform all prize data
 */
export const bounties: Bounty[] = (prizeDataRaw as Prize[])
  .map(transformPrizeToBounty)
  .sort((a, b) => (b.heatScore || 0) - (a.heatScore || 0)); // Sort by heat score

/**
 * Helper function to get bounty by ID
 */
export const getBountyById = (id: string): Bounty | undefined => {
  return bounties.find(bounty => bounty.id === id);
};

/**
 * Helper function to get top bounties by heat score
 */
export const getTopBounties = (limit: number = 5): Bounty[] => {
  return bounties.slice(0, limit);
};

/**
 * Get bounties by sponsor
 */
export const getBountiesBySponsor = (sponsor: string): Bounty[] => {
  return bounties.filter(bounty => 
    bounty.sponsor.toLowerCase().includes(sponsor.toLowerCase())
  );
};

/**
 * Get bounties by chain
 */
export const getBountiesByChain = (chain: string): Bounty[] => {
  return bounties.filter(bounty => 
    bounty.chain.toLowerCase() === chain.toLowerCase()
  );
};

/**
 * Prize statistics
 */
export const getPrizeStats = () => {
  const totalPrizes = bounties.length;
  const totalPrizePool = bounties.reduce((sum, bounty) => sum + bounty.currentPrizePool, 0);
  const avgPrizeAmount = totalPrizePool / totalPrizes;
  
  const sponsorCounts = bounties.reduce((counts, bounty) => {
    counts[bounty.sponsor] = (counts[bounty.sponsor] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
  
  const chainCounts = bounties.reduce((counts, bounty) => {
    counts[bounty.chain] = (counts[bounty.chain] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
  
  return {
    totalPrizes,
    totalPrizePool,
    avgPrizeAmount,
    uniqueSponsors: Object.keys(sponsorCounts).length,
    uniqueChains: Object.keys(chainCounts).length,
    sponsorCounts,
    chainCounts,
    topPrize: Math.max(...bounties.map(b => b.currentPrizePool)),
    medianPrize: bounties.sort((a, b) => a.currentPrizePool - b.currentPrizePool)[Math.floor(bounties.length / 2)]?.currentPrizePool || 0
  };
};

// Export prize statistics for easy access
export const prizeStats = getPrizeStats();

// Export the raw prize data as well
export { prizeDataRaw as rawPrizeData };
export type { Prize };
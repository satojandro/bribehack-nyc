/**
 * GraphQL Data Utilities
 * 
 * Helper functions for data transformation, validation, and formatting
 * specific to Bribehack subgraph data.
 */

import { formatEther, parseEther, isAddress } from 'viem';
import type { 
  Commitment, 
  Bribe, 
  Hacker, 
  FormattedHacker,
  FormattedBribe,
  FormattedCommitment,
  LeaderboardEntry 
} from './types';
import { getDisplayNameWithEmoji, extractPseudonym } from '../nameGenerator';

// === ADDRESS UTILITIES ===

export function normalizeAddress(address: string): string {
  return address.toLowerCase();
}

export function isValidAddress(address: string): boolean {
  return isAddress(address);
}

export function shortenAddress(address: string, chars = 4): string {
  if (!isValidAddress(address)) return address;
  return `${address.slice(0, 2 + chars)}...${address.slice(-chars)}`;
}

// === ETHEREUM AMOUNT UTILITIES ===

export function weiToEth(weiAmount: string | bigint): number {
  try {
    const bigIntAmount = typeof weiAmount === 'string' ? BigInt(weiAmount) : weiAmount;
    return parseFloat(formatEther(bigIntAmount));
  } catch (error) {
    console.warn('Failed to convert wei to ETH:', weiAmount, error);
    return 0;
  }
}

export function ethToWei(ethAmount: string | number): bigint {
  try {
    const ethString = typeof ethAmount === 'number' ? ethAmount.toString() : ethAmount;
    return parseEther(ethString);
  } catch (error) {
    console.warn('Failed to convert ETH to wei:', ethAmount, error);
    return BigInt(0);
  }
}

export function formatEthAmount(weiAmount: string, decimals = 4): string {
  const ethAmount = weiToEth(weiAmount);
  if (ethAmount === 0) return '0 ETH';
  if (ethAmount < 0.0001) return '< 0.0001 ETH';
  return `${ethAmount.toFixed(decimals)} ETH`;
}

export function formatCompactEthAmount(weiAmount: string): string {
  const ethAmount = weiToEth(weiAmount);
  if (ethAmount === 0) return '0';
  if (ethAmount < 0.01) return '< 0.01';
  if (ethAmount < 1) return ethAmount.toFixed(3);
  if (ethAmount < 1000) return ethAmount.toFixed(2);
  return `${(ethAmount / 1000).toFixed(1)}K`;
}

// === TIME UTILITIES ===

export function timestampToDate(timestamp: string | number): Date {
  const ts = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
  return new Date(ts * 1000);
}

export function formatTimeAgo(timestamp: string | number): string {
  const date = timestampToDate(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return `${Math.floor(diffInSeconds / 604800)}w ago`;
}

export function formatDetailedTime(timestamp: string | number): string {
  const date = timestampToDate(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

export function isRecentActivity(timestamp: string | number, hoursAgo = 24): boolean {
  const date = timestampToDate(timestamp);
  const cutoff = new Date(Date.now() - (hoursAgo * 60 * 60 * 1000));
  return date > cutoff;
}

// === ENS UTILITIES ===

export function normalizeENS(ensName: string): string {
  return ensName.toLowerCase().trim();
}

export function isValidENS(ensName: string): boolean {
  return ensName.endsWith('.eth') && ensName.length > 4;
}

export function getDisplayName(address: string, ensName?: string): string {
  if (ensName && ensName.trim()) {
    // If it's a bribehack.eth subdomain, add emoji
    if (ensName.endsWith('.bribehack.eth')) {
      const pseudonym = extractPseudonym(ensName);
      return getDisplayNameWithEmoji(pseudonym);
    }
    return ensName;
  }
  return shortenAddress(address);
}

// === BOUNTY UTILITIES ===

export function getBountyDisplay(bountyId: string): string {
  // Convert bounty ID to display format
  // e.g., "gitcoin-123" -> "Gitcoin #123"
  const parts = bountyId.split('-');
  if (parts.length >= 2) {
    const platform = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    const id = parts.slice(1).join('-');
    return `${platform} #${id}`;
  }
  return bountyId;
}

export function getBountyUrl(bountyId: string): string {
  // Generate URL based on bounty ID format
  // This is a mock implementation - adjust based on actual bounty platforms
  if (bountyId.startsWith('gitcoin-')) {
    const id = bountyId.replace('gitcoin-', '');
    return `https://gitcoin.co/bounty/${id}`;
  }
  if (bountyId.startsWith('buidlguidl-')) {
    const id = bountyId.replace('buidlguidl-', '');
    return `https://buidlguidl.com/build/${id}`;
  }
  return '#';
}

// === RANKING UTILITIES ===

export function calculateHackerScore(hacker: FormattedHacker): number {
  // Weighted scoring algorithm for hacker ranking
  const bribeWeight = 0.4;
  const commitmentWeight = 0.3;
  const activityWeight = 0.2;
  const diversityWeight = 0.1;
  
  const bribeScore = Math.log(hacker.totalBribesReceived + 1) * bribeWeight;
  const commitmentScore = Math.log(hacker.commitmentCount + 1) * commitmentWeight;
  
  // Activity score based on recent activity
  const daysSinceActive = (Date.now() - hacker.lastActive.getTime()) / (1000 * 60 * 60 * 24);
  const activityScore = Math.max(0, (30 - daysSinceActive) / 30) * activityWeight;
  
  // Diversity score based on unique bounties
  const diversityScore = Math.log(hacker.bountyIds.length + 1) * diversityWeight;
  
  return bribeScore + commitmentScore + activityScore + diversityScore;
}

export function sortHackersByScore(hackers: FormattedHacker[]): FormattedHacker[] {
  return [...hackers].sort((a, b) => calculateHackerScore(b) - calculateHackerScore(a));
}

export function generateLeaderboard(hackers: Hacker[]): LeaderboardEntry[] {
  const formatted = hackers.map(hacker => ({
    address: hacker.address,
    ensPseudonym: hacker.ensPseudonym,
    totalBribesReceived: weiToEth(hacker.totalBribesReceived),
    commitmentCount: hacker.commitments.length,
    bribeCount: hacker.bribesReceived.length,
    bountyIds: hacker.bountyIds,
    lastActive: timestampToDate(hacker.lastActive),
    score: 0 // Will be calculated
  }));
  
  // Sort by total bribes received for now (can be enhanced with score)
  const sorted = formatted.sort((a, b) => b.totalBribesReceived - a.totalBribesReceived);
  
  // Add ranks
  return sorted.map((entry, index) => ({
    ...entry,
    rank: index + 1
  }));
}

// === VALIDATION UTILITIES ===

export function validateCommitment(commitment: Commitment): boolean {
  return (
    isValidAddress(commitment.hacker) &&
    Array.isArray(commitment.bountyIds) &&
    commitment.bountyIds.length > 0 &&
    commitment.bountyIds.length <= 3 &&
    commitment.timestamp !== '0'
  );
}

export function validateBribe(bribe: Bribe): boolean {
  return (
    isValidAddress(bribe.briber) &&
    isValidAddress(bribe.hacker) &&
    bribe.amount !== '0' &&
    bribe.bountyId.trim() !== '' &&
    bribe.timestamp !== '0'
  );
}

// === SEARCH UTILITIES ===

export function searchHackers(hackers: FormattedHacker[], query: string): FormattedHacker[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery) return hackers;
  
  return hackers.filter(hacker => 
    hacker.address.toLowerCase().includes(normalizedQuery) ||
    (hacker.ensPseudonym && hacker.ensPseudonym.toLowerCase().includes(normalizedQuery)) ||
    hacker.bountyIds.some(bountyId => bountyId.toLowerCase().includes(normalizedQuery))
  );
}

export function filterBribesByAmount(bribes: FormattedBribe[], minAmount: number): FormattedBribe[] {
  return bribes.filter(bribe => bribe.amount >= minAmount);
}

export function filterRecentActivity<T extends { timestamp: Date }>(
  items: T[], 
  hoursAgo = 24
): T[] {
  const cutoff = new Date(Date.now() - (hoursAgo * 60 * 60 * 1000));
  return items.filter(item => item.timestamp > cutoff);
}

// === AGGREGATION UTILITIES ===

export function aggregateBribesByBounty(bribes: FormattedBribe[]): Record<string, {
  bountyId: string;
  totalAmount: number;
  count: number;
  averageAmount: number;
  topBribe: FormattedBribe;
}> {
  const aggregated: Record<string, any> = {};
  
  bribes.forEach(bribe => {
    if (!aggregated[bribe.bountyId]) {
      aggregated[bribe.bountyId] = {
        bountyId: bribe.bountyId,
        totalAmount: 0,
        count: 0,
        bribes: []
      };
    }
    
    aggregated[bribe.bountyId].totalAmount += bribe.amount;
    aggregated[bribe.bountyId].count += 1;
    aggregated[bribe.bountyId].bribes.push(bribe);
  });
  
  // Calculate averages and find top bribes
  Object.keys(aggregated).forEach(bountyId => {
    const data = aggregated[bountyId];
    data.averageAmount = data.totalAmount / data.count;
    data.topBribe = data.bribes.reduce((max: FormattedBribe, bribe: FormattedBribe) => 
      bribe.amount > max.amount ? bribe : max
    );
    delete data.bribes; // Clean up temporary array
  });
  
  return aggregated;
}

export function calculatePlatformMetrics(
  commitments: FormattedCommitment[],
  bribes: FormattedBribe[],
  _hackers: FormattedHacker[]
) {
  const totalCommitments = commitments.length;
  const totalBribes = bribes.length;
  const totalBribeVolume = bribes.reduce((sum, bribe) => sum + bribe.amount, 0);
  const uniqueHackers = new Set(commitments.map(c => c.hacker)).size;
  const uniqueBribers = new Set(bribes.map(b => b.briber)).size;
  const uniqueBounties = new Set([
    ...commitments.flatMap(c => c.bountyIds),
    ...bribes.map(b => b.bountyId)
  ]).size;
  
  const averageBribeAmount = totalBribes > 0 ? totalBribeVolume / totalBribes : 0;
  const averageCommitmentsPerHacker = uniqueHackers > 0 ? totalCommitments / uniqueHackers : 0;
  
  return {
    totalCommitments,
    totalBribes,
    totalBribeVolume,
    uniqueHackers,
    uniqueBribers,
    uniqueBounties,
    averageBribeAmount,
    averageCommitmentsPerHacker,
    bribeToCommitmentRatio: totalCommitments > 0 ? totalBribes / totalCommitments : 0
  };
}
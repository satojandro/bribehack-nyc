/**
 * Bribehack Subgraph Data Hooks
 * 
 * Custom React hooks for fetching and managing subgraph data with
 * React Query for caching, background updates, and error handling.
 * All hooks are optimized for performance and user experience.
 */

'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { formatEther } from 'viem';
import { executeQuery } from '../graphql/client';
import {
  GET_RECENT_COMMITMENTS,
  GET_COMMITMENTS_BY_HACKER,
  GET_RECENT_BRIBES,
  GET_BRIBES_FOR_HACKER,
  GET_HACKER_PROFILE,
  GET_TOP_HACKERS_BY_BRIBES,
  GET_GLOBAL_STATS,
  GET_DASHBOARD_DATA,
  GET_LEADERBOARD,
  GET_BOUNTY_DETAILS,
  GET_ALL_BOUNTIES,
  GET_RECENT_SPONSORSHIPS
} from '../graphql/queries';
import {
  CommitmentsResponse,
  BribesResponse,
  HackerResponse,
  HackersResponse,
  GlobalStatsResponse,
  BountyResponse,
  BountiesResponse,
  Commitment,
  Bribe,
  Hacker,
  FormattedHacker,
  FormattedBribe,
  FormattedCommitment,
  LeaderboardEntry,
  GlobalStats
} from '../graphql/types';

// Utility functions for data formatting
export const formatTimeAgo = (timestamp: string): string => {
  const date = new Date(parseInt(timestamp) * 1000);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

export const formatWeiToEth = (weiAmount: string): number => {
  try {
    return parseFloat(formatEther(BigInt(weiAmount)));
  } catch {
    return 0;
  }
};

export const formatCommitment = (commitment: Commitment): FormattedCommitment => ({
  ...commitment,
  timestamp: new Date(parseInt(commitment.timestamp) * 1000),
  timeAgo: formatTimeAgo(commitment.timestamp),
  bountyCount: commitment.bountyIds.length
});

export const formatBribe = (bribe: Bribe): FormattedBribe => ({
  ...bribe,
  amount: formatWeiToEth(bribe.amount),
  amountWei: bribe.amount,
  timestamp: new Date(parseInt(bribe.timestamp) * 1000),
  timeAgo: formatTimeAgo(bribe.timestamp)
});

export const formatHacker = (hacker: Hacker): FormattedHacker => {
  const totalBribesEth = formatWeiToEth(hacker.totalBribesReceived);
  const bribeCount = hacker.bribesReceived.length;
  
  return {
    ...hacker,
    totalBribesReceived: totalBribesEth,
    totalBribesReceivedWei: hacker.totalBribesReceived,
    lastActive: new Date(parseInt(hacker.lastActive) * 1000),
    lastActiveAgo: formatTimeAgo(hacker.lastActive),
    commitmentCount: hacker.commitments.length,
    bribeCount,
    averageBribeAmount: bribeCount > 0 ? totalBribesEth / bribeCount : 0
  };
};

// === COMMITMENT HOOKS ===

export function useRecentCommitments(limit = 10): UseQueryResult<FormattedCommitment[]> {
  return useQuery({
    queryKey: ['commitments', 'recent', limit],
    queryFn: async () => {
      const data = await executeQuery<CommitmentsResponse>(GET_RECENT_COMMITMENTS, { first: limit });
      return data.commitments.map(formatCommitment);
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

export function useCommitmentsByHacker(hackerAddress: string, enabled = true): UseQueryResult<FormattedCommitment[]> {
  return useQuery({
    queryKey: ['commitments', 'hacker', hackerAddress.toLowerCase()],
    queryFn: async () => {
      const data = await executeQuery<CommitmentsResponse>(GET_COMMITMENTS_BY_HACKER, { 
        hacker: hackerAddress.toLowerCase() 
      });
      return data.commitments.map(formatCommitment);
    },
    enabled: enabled && !!hackerAddress,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// === BRIBE HOOKS ===

export function useRecentBribes(limit = 20): UseQueryResult<FormattedBribe[]> {
  return useQuery({
    queryKey: ['bribes', 'recent', limit],
    queryFn: async () => {
      const data = await executeQuery<BribesResponse>(GET_RECENT_BRIBES, { first: limit });
      return data.bribes.map(formatBribe);
    },
    staleTime: 30 * 1000,
    refetchInterval: 45 * 1000,
  });
}

export function useBribesForHacker(hackerAddress: string, enabled = true): UseQueryResult<FormattedBribe[]> {
  return useQuery({
    queryKey: ['bribes', 'hacker', hackerAddress.toLowerCase()],
    queryFn: async () => {
      const data = await executeQuery<BribesResponse>(GET_BRIBES_FOR_HACKER, { 
        hacker: hackerAddress.toLowerCase() 
      });
      return data.bribes.map(formatBribe);
    },
    enabled: enabled && !!hackerAddress,
    staleTime: 2 * 60 * 1000,
  });
}

// === HACKER HOOKS ===

export function useHackerProfile(address: string, enabled = true): UseQueryResult<FormattedHacker | null> {
  return useQuery({
    queryKey: ['hacker', 'profile', address.toLowerCase()],
    queryFn: async () => {
      const data = await executeQuery<HackerResponse>(GET_HACKER_PROFILE, { 
        address: address.toLowerCase() 
      });
      return data.hacker ? formatHacker(data.hacker) : null;
    },
    enabled: enabled && !!address,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTopHackers(limit = 10, minAmount = '0'): UseQueryResult<FormattedHacker[]> {
  return useQuery({
    queryKey: ['hackers', 'top', limit, minAmount],
    queryFn: async () => {
      const data = await executeQuery<HackersResponse>(GET_TOP_HACKERS_BY_BRIBES, { 
        first: limit, 
        minAmount 
      });
      return data.hackers.map(formatHacker);
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // Every 5 minutes
  });
}

export function useLeaderboard(limit = 50): UseQueryResult<LeaderboardEntry[]> {
  return useQuery({
    queryKey: ['leaderboard', limit],
    queryFn: async () => {
      const data = await executeQuery<HackersResponse>(GET_LEADERBOARD, { first: limit });
      
      return data.hackers.map((hacker, index): LeaderboardEntry => ({
        rank: index + 1,
        address: hacker.address,
        ensPseudonym: hacker.ensPseudonym,
        totalBribesReceived: formatWeiToEth(hacker.totalBribesReceived),
        commitmentCount: hacker.commitments.length,
        bribeCount: hacker.bribesReceived.length,
        bountyIds: hacker.bountyIds,
        lastActive: new Date(parseInt(hacker.lastActive) * 1000)
      }));
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 3 * 60 * 1000,
  });
}

// === BOUNTY HOOKS ===

export function useBountyDetails(bountyId: string, enabled = true): UseQueryResult<any> {
  return useQuery({
    queryKey: ['bounty', 'details', bountyId.toLowerCase()],
    queryFn: async () => {
      const data = await executeQuery<BountyResponse>(GET_BOUNTY_DETAILS, { 
        bountyId: bountyId.toLowerCase() 
      });
      
      if (!data.bounty) return null;
      
      return {
        ...data.bounty,
        prizePoolEth: formatWeiToEth(data.bounty.prizePool),
        sponsors: data.bounty.sponsors.map(sponsor => ({
          ...sponsor,
          amountEth: formatWeiToEth(sponsor.amount),
          timeAgo: formatTimeAgo(sponsor.timestamp)
        })),
        commitments: data.bounty.commitments.map(formatCommitment),
        bribes: data.bounty.bribes.map(formatBribe)
      };
    },
    enabled: enabled && !!bountyId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useAllBounties(): UseQueryResult<any[]> {
  return useQuery({
    queryKey: ['bounties', 'all'],
    queryFn: async () => {
      const data = await executeQuery<BountiesResponse>(GET_ALL_BOUNTIES);
      return data.bounties.map(bounty => ({
        ...bounty,
        prizePoolEth: formatWeiToEth(bounty.prizePool),
        lastUpdatedAgo: formatTimeAgo(bounty.lastUpdated)
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}

// === SPONSOR HOOKS ===

export function useRecentSponsorships(limit = 20): UseQueryResult<any[]> {
  return useQuery({
    queryKey: ['sponsorships', 'recent', limit],
    queryFn: async () => {
      const data = await executeQuery<any>(GET_RECENT_SPONSORSHIPS, { first: limit });
      return data.sponsors.map((sponsor: any) => ({
        ...sponsor,
        amountEth: formatWeiToEth(sponsor.amount),
        timeAgo: formatTimeAgo(sponsor.timestamp),
        bounty: {
          ...sponsor.bounty,
          prizePoolEth: formatWeiToEth(sponsor.bounty.prizePool)
        }
      }));
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  });
}

// === GLOBAL STATS HOOKS ===

export function useGlobalStats(): UseQueryResult<GlobalStats | null> {
  return useQuery({
    queryKey: ['stats', 'global'],
    queryFn: async () => {
      const data = await executeQuery<GlobalStatsResponse>(GET_GLOBAL_STATS);
      
      if (!data.globalStats) return null;
      
      return {
        ...data.globalStats,
        totalBribeVolumeEth: formatWeiToEth(data.globalStats.totalBribeVolume),
        totalSponsorVolumeEth: formatWeiToEth(data.globalStats.totalSponsorVolume),
        lastUpdatedAgo: formatTimeAgo(data.globalStats.lastUpdated)
      } as GlobalStats;
    },
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Every 2 minutes
  });
}

// === DASHBOARD HOOK ===

export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const data = await executeQuery<any>(GET_DASHBOARD_DATA);
      
      return {
        globalStats: data.globalStats ? {
          ...data.globalStats,
          totalBribeVolumeEth: formatWeiToEth(data.globalStats.totalBribeVolume),
          totalSponsorVolumeEth: formatWeiToEth(data.globalStats.totalSponsorVolume)
        } : null,
        recentCommitments: data.commitments.map(formatCommitment),
        recentBribes: data.bribes.map(formatBribe),
        topHackers: data.hackers.map(formatHacker),
        activeBounties: data.bounties.map((bounty: any) => ({
          ...bounty,
          prizePoolEth: formatWeiToEth(bounty.prizePool)
        }))
      };
    },
    staleTime: 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  });
}

// === UTILITY HOOKS ===

export function useIsDataStale(queryKey: string[], maxAgeMinutes = 5): boolean {
  return useQuery({
    queryKey: ['data-freshness', ...queryKey],
    queryFn: () => Date.now(),
    staleTime: maxAgeMinutes * 60 * 1000,
    select: (timestamp) => {
      const now = Date.now();
      const ageMinutes = (now - timestamp) / (1000 * 60);
      return ageMinutes > maxAgeMinutes;
    }
  }).data || false;
}
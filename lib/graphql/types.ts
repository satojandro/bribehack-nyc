/**
 * TypeScript Types for Bribehack Subgraph
 * 
 * Comprehensive type definitions matching the GraphQL schema
 * for type-safe data fetching and manipulation.
 */

// Core entity types matching subgraph schema
export interface Commitment {
  id: string;
  hacker: string; // Ethereum address as hex string
  bountyIds: string[];
  ensPseudonym?: string;
  ipfsHash?: string;
  timestamp: string; // BigInt as string
  transactionHash: string;
  blockNumber: string; // BigInt as string
}

export interface Bounty {
  id: string;
  bountyId: string;
  prizePool: string; // BigInt as string (wei)
  totalSponsors: number;
  commitments: Commitment[];
  sponsors: Sponsor[];
  bribes: Bribe[];
  lastUpdated: string; // BigInt as string
}

export interface Sponsor {
  id: string;
  sponsor: string; // Ethereum address
  bounty: Bounty;
  amount: string; // BigInt as string (wei)
  timestamp: string; // BigInt as string
  transactionHash: string;
}

export interface Bribe {
  id: string;
  briber: string; // Ethereum address
  hacker: string; // Ethereum address
  bounty: Bounty;
  bountyId: string;
  amount: string; // BigInt as string (wei)
  message?: string;
  timestamp: string; // BigInt as string
  transactionHash: string;
  blockNumber: string; // BigInt as string
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Hacker {
  id: string;
  address: string; // Ethereum address
  commitments: Commitment[];
  bribesReceived: Bribe[];
  totalBribesReceived: string; // BigInt as string (wei)
  bountyIds: string[];
  ensPseudonym?: string;
  ipfsHash?: string;
  lastActive: string; // BigInt as string
}

export interface GlobalStats {
  id: string;
  totalCommitments: number;
  totalBribes: number;
  totalBribeVolume: string; // BigInt as string (wei)
  totalSponsors: number;
  totalSponsorVolume: string; // BigInt as string (wei)
  totalHackers: number;
  lastUpdated: string; // BigInt as string
}

// Query response types
export interface CommitmentsResponse {
  commitments: Commitment[];
}

export interface BountiesResponse {
  bounties: Bounty[];
}

export interface BribesResponse {
  bribes: Bribe[];
}

export interface HackersResponse {
  hackers: Hacker[];
}

export interface GlobalStatsResponse {
  globalStats: GlobalStats | null;
}

export interface HackerResponse {
  hacker: Hacker | null;
}

export interface BountyResponse {
  bounty: Bounty | null;
}

// Query variables types
export interface PaginationArgs {
  first?: number;
  skip?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface CommitmentFilters extends PaginationArgs {
  hacker?: string;
  bountyIds?: string[];
  timestamp_gte?: string;
  timestamp_lte?: string;
}

export interface BribeFilters extends PaginationArgs {
  hacker?: string;
  briber?: string;
  bountyId?: string;
  amount_gte?: string;
  status?: string;
}

export interface HackerFilters extends PaginationArgs {
  address?: string;
  totalBribesReceived_gte?: string;
  bountyIds_contains?: string[];
}

// Utility types for data transformation
export interface FormattedBribe extends Omit<Bribe, 'amount' | 'timestamp'> {
  amount: number; // Converted to ETH
  amountWei: string; // Original wei amount
  timestamp: Date; // Converted to Date
  timeAgo: string; // Human-readable time
}

export interface FormattedCommitment extends Omit<Commitment, 'timestamp'> {
  timestamp: Date;
  timeAgo: string;
  bountyCount: number;
}

export interface FormattedHacker extends Omit<Hacker, 'totalBribesReceived' | 'lastActive'> {
  totalBribesReceived: number; // Converted to ETH
  totalBribesReceivedWei: string; // Original wei amount
  lastActive: Date;
  lastActiveAgo: string;
  commitmentCount: number;
  bribeCount: number;
  averageBribeAmount: number; // In ETH
}

export interface LeaderboardEntry {
  rank: number;
  address: string;
  ensPseudonym?: string;
  totalBribesReceived: number; // In ETH
  commitmentCount: number;
  bribeCount: number;
  bountyIds: string[];
  lastActive: Date;
}
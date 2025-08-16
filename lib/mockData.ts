/**
 * Mock Data for Bribehack
 * 
 * This file contains all mock data to simulate backend/subgraph responses.
 * In production, this would be replaced with:
 * - The Graph Protocol subgraph queries
 * - Direct smart contract reads
 * - API calls to backend services
 * 
 * Data structure represents the core entities in Bribehack:
 * - Bounties: Sponsor challenges with prize pools
 * - Hackers: Commitments and bribes
 * - Profiles: User activity and reputation
 */

/**
 * Bounty interface definition
 * Represents a sponsor's challenge/bounty in the hackathon
 */
export interface Bounty {
  id: string;                  // Unique identifier (slug format)
  title: string;               // Human-readable bounty name
  sponsor: string;             // Sponsor organization name
  chain: string;               // Blockchain where bounty is deployed
  description: string;         // Full description of the challenge
  currentPrizePool: number;    // Current prize amount in USD
  commits: number;             // Number of hackers committed
  bribePool?: number;          // Total bribes attached (in ETH)
  heatScore?: number;          // Calculated popularity score (0-100)
}

/**
 * Main bounties array
 * This represents all active bounties in the hackathon
 * Sorted by default based on activity/popularity
 */
export const bounties: Bounty[] = [
  {
    id: "the-graph-hypergraph",
    title: "The Graph / Hypergraph Integration",
    sponsor: "The Graph",
    chain: "Polygon",
    description: "Build real-time data indexing for cross-chain snapshot commits using Hypergraph.",
    currentPrizePool: 5000,
    commits: 12,
    bribePool: 2.5,
    heatScore: 92
  },
  {
    id: "nora-vibecoding",
    title: "VibeCoding Solidity Automation",
    sponsor: "Nora",
    chain: "Base",
    description: "Use Nora to generate or validate smart contract workflows.",
    currentPrizePool: 3000,
    commits: 6,
    bribePool: 1.2,
    heatScore: 65
  },
  {
    id: "ens-pseudonyms",
    title: "ENS-Enabled Hacker Pseudonyms",
    sponsor: "ENS",
    chain: "Optimism",
    description: "Incorporate ENS-based pseudonyms for hacker identity and leaderboard presence.",
    currentPrizePool: 4000,
    commits: 8,
    bribePool: 1.8,
    heatScore: 78
  },
  {
    id: "layerzero-omnichain",
    title: "Omnichain Snapshot Sync",
    sponsor: "LayerZero",
    chain: "Zora",
    description: "Enable snapshot commits and bounty updates across multiple chains using LayerZero messaging.",
    currentPrizePool: 4500,
    commits: 5,
    bribePool: 2.1,
    heatScore: 70
  },
  {
    id: "dynamic-walletkit",
    title: "Sponsor-Aligned WalletKit UX",
    sponsor: "Dynamic",
    chain: "Polygon",
    description: "Build the Bribehack UI using Dynamic's wallet login kit.",
    currentPrizePool: 2000,
    commits: 7,
    bribePool: 0.8,
    heatScore: 72
  },
  {
    id: "privy-auth",
    title: "Auth Layer with Privy",
    sponsor: "Privy",
    chain: "Base",
    description: "Use Privy as a sponsor-aligned authentication method for all hacker flows.",
    currentPrizePool: 2500,
    commits: 3,
    bribePool: 0.5,
    heatScore: 45
  },
  {
    id: "scroll-scaling-bridge",
    title: "Scroll L2 Bridge Scaling",
    sponsor: "Scroll",
    chain: "Scroll",
    description: "Integrate Scroll's L2 bridge mechanics into Bribehack for faster snapshot confirmation.",
    currentPrizePool: 3200,
    commits: 4,
    bribePool: 1.0,
    heatScore: 55
  },
  {
    id: "fiat-ramps-onboarding",
    title: "Fiat Onboarding UX",
    sponsor: "Transak",
    chain: "Base",
    description: "Build a seamless fiat-to-wallet onboarding flow using Transak.",
    currentPrizePool: 2700,
    commits: 2,
    bribePool: 0.3,
    heatScore: 35
  },
  {
    id: "zora-mint-tracking",
    title: "NFT Mint Heatmaps",
    sponsor: "Zora",
    chain: "Zora",
    description: "Create real-time analytics for minting patterns and bounty usage on Zora.",
    currentPrizePool: 3500,
    commits: 5,
    bribePool: 1.5,
    heatScore: 68
  },
  {
    id: "ai-pitch-matchmaker",
    title: "AI Pitch Matching Engine",
    sponsor: "OpenDevs AI",
    chain: "Polygon",
    description: "Train an AI model to suggest bounty matches for submitted ideas.",
    currentPrizePool: 1500,
    commits: 1,
    bribePool: 0.1,
    heatScore: 25
  }
];

/**
 * Profile data structure
 * Represents a hacker's activity and received bribes
 */
export interface HackerProfile {
  commits: {
    bountyId: string;
    bountyTitle: string;
    date: string;
    ipfsHash?: string;
  }[];
  bribes: {
    id: number;
    from: string;
    amount: number;
    targetBounty: string;
    targetBountyTitle: string;
    status: 'pending' | 'accepted' | 'declined';
    message?: string;
  }[];
  totalEarned: number;
  reputation: number;
}

/**
 * Mock profile data for demo addresses
 * In production, this would be fetched from the blockchain or a subgraph
 * Key is the wallet address (checksummed)
 */
export const mockProfileData: { [key: string]: HackerProfile } = {
  // Demo wallet 1 - Active hacker with multiple commits
  '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266': {
    commits: [
      { 
        bountyId: 'the-graph-hypergraph', 
        bountyTitle: 'The Graph / Hypergraph Integration',
        date: '2025-01-15T10:30:00Z',
        ipfsHash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco'
      },
      { 
        bountyId: 'dynamic-walletkit', 
        bountyTitle: 'Sponsor-Aligned WalletKit UX',
        date: '2025-01-14T15:45:00Z',
        ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'
      },
    ],
    bribes: [
      { 
        id: 1, 
        from: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', 
        amount: 0.5, 
        targetBounty: 'ens-pseudonyms',
        targetBountyTitle: 'ENS-Enabled Hacker Pseudonyms',
        status: 'pending',
        message: 'Switch to ENS bounty - we need more builders there!'
      },
      { 
        id: 2, 
        from: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', 
        amount: 0.3, 
        targetBounty: 'layerzero-omnichain',
        targetBountyTitle: 'Omnichain Snapshot Sync',
        status: 'declined',
        message: 'Join us on the LayerZero challenge!'
      },
    ],
    totalEarned: 0,
    reputation: 85
  },
  
  // Demo wallet 2 - New hacker with one commit
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8': {
    commits: [
      { 
        bountyId: 'zora-mint-tracking', 
        bountyTitle: 'NFT Mint Heatmaps',
        date: '2025-01-16T09:00:00Z'
      },
    ],
    bribes: [],
    totalEarned: 0,
    reputation: 50
  },
  
  // Demo wallet 3 - Experienced hacker with accepted bribes
  '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC': {
    commits: [
      { 
        bountyId: 'scroll-scaling-bridge', 
        bountyTitle: 'Scroll L2 Bridge Scaling',
        date: '2025-01-13T14:20:00Z',
        ipfsHash: 'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB'
      },
      { 
        bountyId: 'privy-auth', 
        bountyTitle: 'Auth Layer with Privy',
        date: '2025-01-15T18:30:00Z'
      },
      { 
        bountyId: 'fiat-ramps-onboarding', 
        bountyTitle: 'Fiat Onboarding UX',
        date: '2025-01-16T11:15:00Z'
      },
    ],
    bribes: [
      { 
        id: 3, 
        from: '0x90F79bf6EB2c4f870365E785982E1f101E93b906', 
        amount: 0.8, 
        targetBounty: 'the-graph-hypergraph',
        targetBountyTitle: 'The Graph / Hypergraph Integration',
        status: 'accepted',
        message: 'Great work! Join The Graph bounty for bonus rewards'
      },
    ],
    totalEarned: 0.8,
    reputation: 95
  }
};

/**
 * Helper function to get bounty by ID
 * @param id - The bounty ID to look up
 * @returns The bounty object or undefined if not found
 */
export const getBountyById = (id: string): Bounty | undefined => {
  return bounties.find(bounty => bounty.id === id);
};

/**
 * Helper function to calculate heat score
 * Heat score represents the "hotness" of a bounty based on:
 * - Number of commits
 * - Bribe pool size
 * - Prize pool size
 * 
 * @param bounty - The bounty to calculate heat score for
 * @returns A number between 0-100 representing the heat score
 */
export const calculateHeatScore = (bounty: Bounty): number => {
  const commitWeight = 0.4;
  const bribeWeight = 0.3;
  const prizeWeight = 0.3;
  
  // Normalize values (these max values should be adjusted based on real data)
  const normalizedCommits = Math.min(bounty.commits / 20, 1) * 100;
  const normalizedBribe = Math.min((bounty.bribePool || 0) / 5, 1) * 100;
  const normalizedPrize = Math.min(bounty.currentPrizePool / 10000, 1) * 100;
  
  return Math.round(
    normalizedCommits * commitWeight +
    normalizedBribe * bribeWeight +
    normalizedPrize * prizeWeight
  );
};

/**
 * Helper function to get top bounties by heat score
 * @param limit - Maximum number of bounties to return
 * @returns Array of top bounties sorted by heat score
 */
export const getTopBounties = (limit: number = 5): Bounty[] => {
  return [...bounties]
    .sort((a, b) => (b.heatScore || 0) - (a.heatScore || 0))
    .slice(0, limit);
};
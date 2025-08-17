/**
 * Bribehack GraphQL Queries
 * 
 * Comprehensive collection of optimized GraphQL queries for all
 * Bribehack data needs. Queries are structured for performance
 * and include all necessary fields for the frontend.
 */

import { gql } from 'graphql-request';

// Core fragment definitions for reusability
export const COMMITMENT_FRAGMENT = gql`
  fragment CommitmentFields on Commitment {
    id
    hacker
    bountyIds
    ensPseudonym
    ipfsHash
    timestamp
    transactionHash
    blockNumber
  }
`;

export const BRIBE_FRAGMENT = gql`
  fragment BribeFields on Bribe {
    id
    briber
    hacker
    bountyId
    amount
    timestamp
    transactionHash
    blockNumber
    status
  }
`;

export const HACKER_FRAGMENT = gql`
  fragment HackerFields on Hacker {
    id
    address
    totalBribesReceived
    bountyIds
    ensPseudonym
    ipfsHash
    lastActive
  }
`;

export const SPONSOR_FRAGMENT = gql`
  fragment SponsorFields on Sponsor {
    id
    sponsor
    amount
    timestamp
    transactionHash
  }
`;

// === COMMITMENT QUERIES ===

export const GET_RECENT_COMMITMENTS = gql`
  ${COMMITMENT_FRAGMENT}
  query GetRecentCommitments($first: Int = 10, $skip: Int = 0) {
    commitments(
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      ...CommitmentFields
    }
  }
`;

export const GET_COMMITMENTS_BY_HACKER = gql`
  ${COMMITMENT_FRAGMENT}
  query GetCommitmentsByHacker($hacker: String!, $first: Int = 10) {
    commitments(
      where: { hacker: $hacker }
      first: $first
      orderBy: timestamp
      orderDirection: desc
    ) {
      ...CommitmentFields
    }
  }
`;

export const GET_COMMITMENTS_BY_BOUNTY = gql`
  ${COMMITMENT_FRAGMENT}
  query GetCommitmentsByBounty($bountyId: String!, $first: Int = 50) {
    commitments(
      where: { bountyIds_contains: [$bountyId] }
      first: $first
      orderBy: timestamp
      orderDirection: desc
    ) {
      ...CommitmentFields
    }
  }
`;

// === BRIBE QUERIES ===

export const GET_RECENT_BRIBES = gql`
  ${BRIBE_FRAGMENT}
  query GetRecentBribes($first: Int = 20, $skip: Int = 0) {
    bribes(
      first: $first
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      ...BribeFields
    }
  }
`;

export const GET_BRIBES_FOR_HACKER = gql`
  ${BRIBE_FRAGMENT}
  query GetBribesForHacker($hacker: String!, $first: Int = 50) {
    bribes(
      where: { hacker: $hacker }
      first: $first
      orderBy: timestamp
      orderDirection: desc
    ) {
      ...BribeFields
    }
  }
`;

export const GET_BRIBES_BY_BOUNTY = gql`
  ${BRIBE_FRAGMENT}
  query GetBribesByBounty($bountyId: String!, $first: Int = 50) {
    bribes(
      where: { bountyId: $bountyId }
      first: $first
      orderBy: amount
      orderDirection: desc
    ) {
      ...BribeFields
    }
  }
`;

export const GET_TOP_BRIBES = gql`
  ${BRIBE_FRAGMENT}
  query GetTopBribes($first: Int = 10, $minAmount: String = "0") {
    bribes(
      where: { amount_gte: $minAmount }
      first: $first
      orderBy: amount
      orderDirection: desc
    ) {
      ...BribeFields
    }
  }
`;

// === HACKER QUERIES ===

export const GET_HACKER_PROFILE = gql`
  ${HACKER_FRAGMENT}
  ${COMMITMENT_FRAGMENT}
  ${BRIBE_FRAGMENT}
  query GetHackerProfile($address: String!) {
    hacker(id: $address) {
      ...HackerFields
      commitments(orderBy: timestamp, orderDirection: desc) {
        ...CommitmentFields
      }
      bribesReceived(orderBy: timestamp, orderDirection: desc) {
        ...BribeFields
      }
    }
  }
`;

export const GET_TOP_HACKERS_BY_BRIBES = gql`
  ${HACKER_FRAGMENT}
  query GetTopHackersByBribes($first: Int = 10, $minAmount: String = "0") {
    hackers(
      where: { totalBribesReceived_gte: $minAmount }
      first: $first
      orderBy: totalBribesReceived
      orderDirection: desc
    ) {
      ...HackerFields
    }
  }
`;

export const GET_ACTIVE_HACKERS = gql`
  ${HACKER_FRAGMENT}
  query GetActiveHackers($first: Int = 20, $since: String!) {
    hackers(
      where: { lastActive_gte: $since }
      first: $first
      orderBy: lastActive
      orderDirection: desc
    ) {
      ...HackerFields
    }
  }
`;

// === BOUNTY QUERIES ===

export const GET_BOUNTY_DETAILS = gql`
  ${SPONSOR_FRAGMENT}
  ${COMMITMENT_FRAGMENT}
  ${BRIBE_FRAGMENT}
  query GetBountyDetails($bountyId: String!) {
    bounty(id: $bountyId) {
      id
      bountyId
      prizePool
      totalSponsors
      lastUpdated
      sponsors(orderBy: timestamp, orderDirection: desc) {
        ...SponsorFields
      }
      commitments(orderBy: timestamp, orderDirection: desc) {
        ...CommitmentFields
      }
      bribes(orderBy: amount, orderDirection: desc) {
        ...BribeFields
      }
    }
  }
`;

export const GET_ALL_BOUNTIES = gql`
  query GetAllBounties($first: Int = 50) {
    bounties(
      first: $first
      orderBy: prizePool
      orderDirection: desc
    ) {
      id
      bountyId
      prizePool
      totalSponsors
      lastUpdated
    }
  }
`;

export const GET_BOUNTIES_WITH_ACTIVITY = gql`
  ${COMMITMENT_FRAGMENT}
  query GetBountiesWithActivity($first: Int = 20) {
    bounties(
      where: { totalSponsors_gt: 0 }
      first: $first
      orderBy: lastUpdated
      orderDirection: desc
    ) {
      id
      bountyId
      prizePool
      totalSponsors
      lastUpdated
      commitments(first: 5, orderBy: timestamp, orderDirection: desc) {
        ...CommitmentFields
      }
    }
  }
`;

// === SPONSOR QUERIES ===

export const GET_RECENT_SPONSORSHIPS = gql`
  ${SPONSOR_FRAGMENT}
  query GetRecentSponsorships($first: Int = 20) {
    sponsors(
      first: $first
      orderBy: timestamp
      orderDirection: desc
    ) {
      ...SponsorFields
      bounty {
        bountyId
        prizePool
      }
    }
  }
`;

export const GET_SPONSORSHIPS_BY_ADDRESS = gql`
  ${SPONSOR_FRAGMENT}
  query GetSponsorshipsByAddress($sponsor: String!, $first: Int = 50) {
    sponsors(
      where: { sponsor: $sponsor }
      first: $first
      orderBy: timestamp
      orderDirection: desc
    ) {
      ...SponsorFields
      bounty {
        bountyId
        prizePool
      }
    }
  }
`;

// === GLOBAL STATS QUERIES ===

export const GET_GLOBAL_STATS = gql`
  query GetGlobalStats {
    globalStats(id: "global") {
      id
      totalCommitments
      totalBribes
      totalBribeVolume
      totalSponsors
      totalSponsorVolume
      totalHackers
      lastUpdated
    }
  }
`;

// === DASHBOARD QUERIES ===

export const GET_DASHBOARD_DATA = gql`
  ${COMMITMENT_FRAGMENT}
  ${BRIBE_FRAGMENT}
  ${HACKER_FRAGMENT}
  query GetDashboardData {
    # Global stats
    globalStats(id: "global") {
      totalCommitments
      totalBribes
      totalBribeVolume
      totalSponsors
      totalSponsorVolume
      totalHackers
      lastUpdated
    }
    
    # Recent activity
    commitments(first: 5, orderBy: timestamp, orderDirection: desc) {
      ...CommitmentFields
    }
    
    bribes(first: 5, orderBy: timestamp, orderDirection: desc) {
      ...BribeFields
    }
    
    # Top performers
    hackers(first: 5, orderBy: totalBribesReceived, orderDirection: desc) {
      ...HackerFields
    }
    
    # Active bounties
    bounties(
      where: { totalSponsors_gt: 0 }
      first: 5
      orderBy: prizePool
      orderDirection: desc
    ) {
      id
      bountyId
      prizePool
      totalSponsors
    }
  }
`;

// === SEARCH QUERIES ===

export const SEARCH_HACKERS = gql`
  ${HACKER_FRAGMENT}
  query SearchHackers($searchTerm: String!, $first: Int = 10) {
    hackers(
      where: {
        or: [
          { address_contains: $searchTerm }
          { ensPseudonym_contains: $searchTerm }
        ]
      }
      first: $first
      orderBy: totalBribesReceived
      orderDirection: desc
    ) {
      ...HackerFields
    }
  }
`;

export const GET_LEADERBOARD = gql`
  ${HACKER_FRAGMENT}
  ${COMMITMENT_FRAGMENT}
  query GetLeaderboard($first: Int = 50) {
    hackers(
      first: $first
      orderBy: totalBribesReceived
      orderDirection: desc
    ) {
      ...HackerFields
      commitments(first: 1, orderBy: timestamp, orderDirection: desc) {
        timestamp
      }
    }
  }
`;
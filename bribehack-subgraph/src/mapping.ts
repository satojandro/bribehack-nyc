import { BigInt, Bytes, store } from "@graphprotocol/graph-ts";
import {
  NewCommitment,
  BountySponsored,
  HackerBribed
} from "../generated/Bribehack/Bribehack";
import {
  Commitment,
  Bounty,
  Bribe,
  Hacker,
  Sponsor,
  GlobalStats
} from "../generated/schema";

function getOrCreateGlobalStats(): GlobalStats {
  let stats = GlobalStats.load("global");
  if (!stats) {
    stats = new GlobalStats("global");
    stats.totalCommitments = 0;
    stats.totalBribes = 0;
    stats.totalBribeVolume = BigInt.zero();
    stats.totalSponsors = 0;
    stats.totalSponsorVolume = BigInt.zero();
    stats.totalHackers = 0;
    stats.lastUpdated = BigInt.zero();
  }
  return stats;
}

function getOrCreateHacker(address: Bytes): Hacker {
  let hackerId = address.toHexString().toLowerCase(); // Normalize address
  let hacker = Hacker.load(hackerId);
  if (!hacker) {
    hacker = new Hacker(hackerId);
    hacker.address = address;
    hacker.commitments = [];
    hacker.bribesReceived = [];
    hacker.totalBribesReceived = BigInt.zero();
    hacker.bountyIds = [];
    hacker.lastActive = BigInt.zero();
    
    // Update global stats
    let stats = getOrCreateGlobalStats();
    stats.totalHackers = stats.totalHackers + 1;
    stats.save();
  }
  return hacker;
}

function getOrCreateBounty(bountyId: string): Bounty {
  // Ensure consistent bounty ID format
  let normalizedId = bountyId.toLowerCase();
  let bounty = Bounty.load(normalizedId);
  if (!bounty) {
    bounty = new Bounty(normalizedId);
    bounty.bountyId = bountyId; // Store original format
    bounty.prizePool = BigInt.zero();
    bounty.totalSponsors = 0;
    bounty.commitments = [];
    bounty.lastUpdated = BigInt.zero();
  }
  return bounty;
}

function normalizeENS(ens: string): string {
  // Normalize ENS names to lowercase for consistent querying
  return ens ? ens.toLowerCase() : "";
}

function getValidTimestamp(timestamp: BigInt, blockTimestamp: BigInt): BigInt {
  // Use block timestamp as fallback if event timestamp is zero
  return timestamp.equals(BigInt.zero()) ? blockTimestamp : timestamp;
}

export function handleNewCommitment(event: NewCommitment): void {
  // Create commitment entity with unique ID
  let commitmentId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let commitment = new Commitment(commitmentId);
  
  commitment.hacker = event.params.hacker;
  commitment.bountyIds = event.params.bountyIds;
  commitment.ensPseudonym = normalizeENS(event.params.ensPseudonym);
  commitment.ipfsHash = event.params.ipfsHash;
  commitment.timestamp = getValidTimestamp(event.params.timestamp, event.block.timestamp);
  commitment.transactionHash = event.transaction.hash;
  commitment.blockNumber = event.block.number;
  commitment.save();
  
  // Update hacker entity
  let hacker = getOrCreateHacker(event.params.hacker);
  let hackerCommitments = hacker.commitments;
  hackerCommitments.push(commitmentId);
  hacker.commitments = hackerCommitments;
  hacker.bountyIds = event.params.bountyIds;
  hacker.ensPseudonym = normalizeENS(event.params.ensPseudonym);
  hacker.ipfsHash = event.params.ipfsHash;
  hacker.lastActive = event.block.timestamp;
  hacker.save();
  
  // Update bounties with normalized IDs
  for (let i = 0; i < event.params.bountyIds.length; i++) {
    let bounty = getOrCreateBounty(event.params.bountyIds[i]);
    let bountyCommitments = bounty.commitments;
    bountyCommitments.push(commitmentId);
    bounty.commitments = bountyCommitments;
    bounty.lastUpdated = event.block.timestamp;
    bounty.save();
  }
  
  // Update global stats
  let stats = getOrCreateGlobalStats();
  stats.totalCommitments = stats.totalCommitments + 1;
  stats.lastUpdated = event.block.timestamp;
  stats.save();
}

export function handleBountySponsored(event: BountySponsored): void {
  // Create sponsor entity with unique ID
  let sponsorId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let sponsor = new Sponsor(sponsorId);
  
  // Convert Bytes to string for bountyId (it's indexed as Bytes in the event)
  let bountyIdString = event.params.bountyId.toString();
  
  // Get the normalized bounty entity
  let bounty = getOrCreateBounty(bountyIdString);
  
  sponsor.sponsor = event.params.sponsor;
  sponsor.bounty = bounty.id; // Use the normalized bounty ID for the relation
  sponsor.amount = event.params.amount;
  sponsor.timestamp = event.block.timestamp;
  sponsor.transactionHash = event.transaction.hash;
  sponsor.save();
  
  // Update bounty entity
  bounty.prizePool = event.params.newTotal;
  bounty.totalSponsors = bounty.totalSponsors + 1;
  bounty.lastUpdated = event.block.timestamp;
  bounty.save();
  
  // Update global stats
  let stats = getOrCreateGlobalStats();
  stats.totalSponsors = stats.totalSponsors + 1;
  stats.totalSponsorVolume = stats.totalSponsorVolume.plus(event.params.amount);
  stats.lastUpdated = event.block.timestamp;
  stats.save();
}

export function handleHackerBribed(event: HackerBribed): void {
  // Create bribe entity with unique ID
  let bribeId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let bribe = new Bribe(bribeId);
  
  // Convert Bytes to string for bountyId (it's indexed as Bytes in the event)
  let bountyIdString = event.params.bountyId.toString();
  
  // Get the normalized bounty entity
  let bounty = getOrCreateBounty(bountyIdString);
  
  bribe.briber = event.params.briber;
  bribe.hacker = event.params.hacker;
  bribe.bounty = bounty.id; // Use the normalized bounty ID for the relation
  bribe.bountyId = bountyIdString; // Store original format for display
  bribe.amount = event.params.amount;
  bribe.timestamp = getValidTimestamp(event.params.timestamp, event.block.timestamp);
  bribe.transactionHash = event.transaction.hash;
  bribe.blockNumber = event.block.number;
  bribe.status = "pending";
  bribe.save();
  
  // Update hacker entity
  let hacker = getOrCreateHacker(event.params.hacker);
  let hackerBribes = hacker.bribesReceived;
  hackerBribes.push(bribeId);
  hacker.bribesReceived = hackerBribes;
  hacker.totalBribesReceived = hacker.totalBribesReceived.plus(event.params.amount);
  hacker.lastActive = event.block.timestamp;
  hacker.save();
  
  // Update bounty
  bounty.lastUpdated = event.block.timestamp;
  bounty.save();
  
  // Update global stats
  let stats = getOrCreateGlobalStats();
  stats.totalBribes = stats.totalBribes + 1;
  stats.totalBribeVolume = stats.totalBribeVolume.plus(event.params.amount);
  stats.lastUpdated = event.block.timestamp;
  stats.save();
}
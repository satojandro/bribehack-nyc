/**
 * Bribehack Contract ABI
 * 
 * This contains the essential function signatures for interacting with
 * the deployed Bribehack smart contract from the frontend.
 */

export const BRIBEHACK_ABI = [
  // Public read functions
  {
    inputs: [{ name: "_hacker", type: "address" }],
    name: "getCommitment",
    outputs: [
      {
        components: [
          { name: "hacker", type: "address" },
          { name: "bountyIds", type: "string[]" },
          { name: "ensPseudonym", type: "string" },
          { name: "ipfsHash", type: "string" },
          { name: "timestamp", type: "uint256" }
        ],
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "_bountyId", type: "string" }],
    name: "getBounty",
    outputs: [
      {
        components: [
          { name: "bountyId", type: "string" },
          { name: "prizePool", type: "uint256" },
          { name: "sponsors", type: "address[]" }
        ],
        name: "",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "_hacker", type: "address" }],
    name: "getBribes",
    outputs: [
      {
        components: [
          { name: "briber", type: "address" },
          { name: "hacker", type: "address" },
          { name: "bountyId", type: "string" },
          { name: "amount", type: "uint256" },
          { name: "timestamp", type: "uint256" }
        ],
        name: "",
        type: "tuple[]"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  
  // Write functions
  {
    inputs: [
      { name: "bountyIds", type: "string[]" },
      { name: "ensPseudonym", type: "string" },
      { name: "ipfsHash", type: "string" }
    ],
    name: "commitToBounties",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "bountyId", type: "string" }],
    name: "sponsorBounty",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      { name: "hacker", type: "address" },
      { name: "bountyId", type: "string" }
    ],
    name: "bribeHacker",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "hacker", type: "address" },
      { indexed: false, name: "bountyIds", type: "string[]" },
      { indexed: false, name: "ipfsHash", type: "string" }
    ],
    name: "NewCommitment",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "bountyId", type: "string" },
      { indexed: true, name: "sponsor", type: "address" },
      { indexed: false, name: "amount", type: "uint256" }
    ],
    name: "BountySponsored",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "briber", type: "address" },
      { indexed: true, name: "hacker", type: "address" },
      { indexed: false, name: "bountyId", type: "string" },
      { indexed: false, name: "amount", type: "uint256" }
    ],
    name: "HackerBribed",
    type: "event"
  }
] as const;
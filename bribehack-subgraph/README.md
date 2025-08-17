# Bribehack Subgraph

This subgraph indexes all Bribehack smart contract events on Sepolia testnet, providing a queryable GraphQL API for:
- Hacker commitments to bounties
- Bounty sponsorships and prize pools
- Bribes sent between sponsors and hackers
- Global statistics and leaderboards

## Setup

### Install Dependencies
```bash
npm install
# or
yarn install
```

### Install Graph CLI globally
```bash
npm install -g @graphprotocol/graph-cli
```

## Development

### Generate TypeScript types from schema
```bash
npm run codegen
```

### Build the subgraph
```bash
npm run build
```

## Deployment

### Deploy to The Graph Studio
1. Create a subgraph at [The Graph Studio](https://thegraph.com/studio/)
2. Get your deploy key
3. Authenticate:
```bash
graph auth --studio YOUR_DEPLOY_KEY
```
4. Deploy:
```bash
graph deploy --studio bribehack-sepolia
```

### Deploy to Hosted Service (deprecated but still works)
```bash
npm run deploy:sepolia
```

### Local Development with Graph Node
```bash
# Start local Graph Node (requires Docker)
docker-compose up

# Create local subgraph
npm run create-local

# Deploy to local node
npm run deploy-local
```

## Example Queries

### Get Recent Commitments
```graphql
{
  commitments(first: 10, orderBy: timestamp, orderDirection: desc) {
    id
    hacker
    bountyIds
    ensPseudonym
    timestamp
  }
}
```

### Get Top Bribed Hackers
```graphql
{
  hackers(first: 10, orderBy: totalBribesReceived, orderDirection: desc) {
    address
    ensPseudonym
    totalBribesReceived
    bountyIds
  }
}
```

### Get Bounty Stats
```graphql
{
  bounties {
    bountyId
    prizePool
    totalSponsors
    commitments {
      hacker
    }
  }
}
```

### Get Global Stats
```graphql
{
  globalStats(id: "global") {
    totalCommitments
    totalBribes
    totalBribeVolume
    totalSponsors
    totalSponsorVolume
    totalHackers
  }
}
```

## Contract Details

- **Network**: Sepolia Testnet
- **Contract Address**: `0x22a81e4c78ec3bc0469f23e34ce130242bbf7ca0`
- **Start Block**: 6000000

## Entity Schema

### Core Entities
- **Commitment**: Hacker's commitment to work on bounties
- **Bounty**: Bounty with prize pool and sponsor information
- **Bribe**: Direct payment from sponsor to hacker
- **Hacker**: Aggregated hacker profile with stats
- **Sponsor**: Individual sponsorship transaction
- **GlobalStats**: Platform-wide statistics

## Features

✅ **Type-safe mappings** with normalized IDs and ENS names
✅ **Timestamp validation** with fallback to block timestamp
✅ **Lowercase normalization** for addresses and ENS names
✅ **Unique composite IDs** for preventing duplicates
✅ **Global statistics tracking** for dashboards
✅ **Relation mappings** between entities
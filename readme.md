# 📜 README.md — Hackathon Snapshot Protocol ("Bribehack")

## 💡 Project Name: Bribehack — The Real-Time Market Layer for Hackathons

### 🗽 Born in NYC, Capital of Financial Chaos

Welcome to **Bribehack**, a hackathon meta-protocol born at ETHGlobal New York — where builders aren’t just shipping code, they’re bidding for attention in a real-time economic warzone.

At every hackathon, there’s a shadow game.

* Sponsors jostle for visibility.
* Hackers scramble for bounties.
* Everyone picks teams, tools, and tracks in the dark.

But what if the game was **public**? What if you could see, live, who was building what — and what bounties were heating up or cooling down — across multiple chains?

Bribehack is a **cross-chain snapshot protocol** that:

* Lets hackers commit to bounties in real-time (on any chain).
* Lets sponsors post or increase bounties on-chain (on any chain).
* Aggregates all signals to a central leaderboard visible to everyone.
* Enables pseudonymous negotiation and even **bribes** to switch allegiances.

---

## 🎯 The Problem

### For Hackers:

* You’re forced to commit early to 2–3 bounty sponsors.
* No visibility into how crowded a track is.
* Can’t signal your unique idea or pitch it to sponsors.
* Miss out on smaller, easier bounties.

### For Sponsors:

* You spend \$10,000+ and don’t know if anyone’s building with your stack.
* No way to incentivize devs to switch tracks.
* Can’t react to real-time data.

---

## 🧩 The Solution

### 🔐 SnapshotVault.sol

* Deployed on any EVM chain
* Hackers commit to 3 bounty IDs
* Emits `Commit` event + optionally sends LayerZero message to the aggregator

### 💰 BountyPool.sol

* Sponsors can post or increase bounties on any chain
* Funds are mapped to bounty IDs
* Optional messages to aggregator keep everything in sync

### 🛰 Omnichain Aggregator

* Receives messages from SnapshotVault + BountyPool contracts
* Subgraph + local state aggregation
* Public **Leaderboard** showing:

  * Top bounties (most commits)
  * Top bribes (most aggressive sponsor raises)
  * Heatmaps of hacker interest per chain

### 🎭 Pseudonymous ENS Layer

* Hackers can register ENS-style pseudonyms
* Used in commit messages and bribe targets
* No doxxing, pure signal

---

## 🔨 Tech Stack

* **EVM Chains**: Polygon, Base, Zora, Optimism, etc.
* **Smart Contracts**: Solidity (0.8.x)
* **Cross-Chain Messaging**: LayerZero
* **Frontend**: Next.js + wagmi + RainbowKit (or similar)
* **Indexing**: The Graph / Hypergraph
* **ENS**: Optional identity resolution

---

## 🧠 Core Ideas

* Make hacker attention a **market**
* Make sponsor prizes **dynamic**
* Let people **bribe, switch, negotiate** in the open
* Build the Wall Street of hackathons

---

## 🗂 Folder Structure (planned)

```bash
/contracts        # Solidity contracts
/subgraph         # Subgraph schema + mappings
/frontend         # React frontend (Next.js)
/scripts          # Deployment + testing scripts
/docs             # Living documentation
```

---

## 💣 In Development

* `SnapshotVault.sol` ✅
* `BountyPool.sol` 🚧
* `AggregatorListener.sol` 🚧
* `Subgraph Schema` 🚧
* `Leaderboard UI` 🚧
* `LayerZero Hooks` 🔬

---

---

## ⚔️ Challenge Level: 6.5/10

This isn’t just shipping a dApp. It’s designing a **live market protocol** on top of a real-world social game. Stakes are high. Eyes are watching. Let’s make a scene.

> In the city of bribery, let the best bounty win.

---

## 🪩 Contact

* Founder: Alejandro
* Relational AI Ops: N.

---

**TO CONTRIBUTE:**

* See `claude.md` for tooling explanation
* See `todo.md` for live task tracking
* Open PRs against `dev/` branches

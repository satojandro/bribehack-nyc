/**
 * ENS Subdomain Creation Script
 * 
 * Deployable script for creating Bribehack ENS subdomains like wild-otter.bribehack.eth
 * Supports both Sepolia testnet and mainnet deployment
 * 
 * Usage:
 * npx tsx scripts/createSubdomain.ts --label wild-otter --address 0x1234...
 * npx tsx scripts/createSubdomain.ts --batch ./subdomains.json
 */

import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';
import ensABI from '../abis/ENSRegistry.json';
import resolverABI from '../abis/PublicResolver.json';
import { generatePseudonym, validatePseudonym, generateENSName } from '../lib/nameGenerator';

// Contract addresses for different networks
const NETWORKS = {
  sepolia: {
    chainId: 11155111,
    ensRegistry: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    publicResolver: '0x8FADE66B79cC9f707aB26799354482EB93a5B7dD',
    rpcUrl: process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID'
  },
  mainnet: {
    chainId: 1,
    ensRegistry: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    publicResolver: '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63',
    rpcUrl: process.env.MAINNET_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID'
  }
};

interface SubdomainRequest {
  label: string;
  address: string;
  reverse?: boolean; // Set reverse record
}

interface BatchRequest {
  subdomains: SubdomainRequest[];
  network: 'sepolia' | 'mainnet';
}

class ENSSubdomainManager {
  private provider: ethers.providers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private ensRegistry: ethers.Contract;
  private publicResolver: ethers.Contract;
  private network: keyof typeof NETWORKS;

  constructor(network: keyof typeof NETWORKS = 'sepolia') {
    this.network = network;
    const config = NETWORKS[network];
    
    this.provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('PRIVATE_KEY environment variable is required');
    }
    
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    
    this.ensRegistry = new ethers.Contract(
      config.ensRegistry,
      ensABI,
      this.wallet
    );
    
    this.publicResolver = new ethers.Contract(
      config.publicResolver,
      resolverABI,
      this.wallet
    );
  }

  /**
   * Check if a subdomain already exists
   */
  async checkSubdomainExists(label: string): Promise<boolean> {
    try {
      const fullName = generateENSName(label);
      const node = ethers.utils.namehash(fullName);
      
      const owner = await this.ensRegistry.owner(node);
      return owner !== ethers.constants.AddressZero;
    } catch (error) {
      console.error(`Error checking subdomain ${label}:`, error);
      return false;
    }
  }

  /**
   * Create a single ENS subdomain
   */
  async createSubdomain(request: SubdomainRequest): Promise<{
    success: boolean;
    txHashes?: string[];
    error?: string;
  }> {
    try {
      console.log(`\n🔮 Creating subdomain: ${request.label}.bribehack.eth → ${request.address}`);
      
      // Validate inputs
      const validation = validatePseudonym(request.label);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }
      
      if (!ethers.utils.isAddress(request.address)) {
        return { success: false, error: 'Invalid Ethereum address' };
      }
      
      // Check if subdomain already exists
      const exists = await this.checkSubdomainExists(request.label);
      if (exists) {
        return { success: false, error: 'Subdomain already exists' };
      }
      
      // Calculate hashes and nodes
      const parentName = 'bribehack.eth';
      const fullName = generateENSName(request.label);
      const parentNode = ethers.utils.namehash(parentName);
      const labelHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(request.label));
      const node = ethers.utils.namehash(fullName);
      
      const txHashes: string[] = [];
      
      // Step 1: Create subdomain (setSubnodeOwner)
      console.log('  📝 Step 1: Creating subdomain...');
      const setSubnodeTx = await this.ensRegistry.setSubnodeOwner(
        parentNode,
        labelHash,
        request.address,
        { gasLimit: 100000 }
      );
      txHashes.push(setSubnodeTx.hash);
      console.log(`     Tx: ${setSubnodeTx.hash}`);
      await setSubnodeTx.wait();
      
      // Step 2: Set resolver
      console.log('  🔧 Step 2: Setting resolver...');
      const setResolverTx = await this.ensRegistry.setResolver(
        node,
        this.publicResolver.address,
        { gasLimit: 100000 }
      );
      txHashes.push(setResolverTx.hash);
      console.log(`     Tx: ${setResolverTx.hash}`);
      await setResolverTx.wait();
      
      // Step 3: Set address record
      console.log('  📍 Step 3: Setting address record...');
      const setAddrTx = await this.publicResolver.setAddr(
        node,
        request.address,
        { gasLimit: 100000 }
      );
      txHashes.push(setAddrTx.hash);
      console.log(`     Tx: ${setAddrTx.hash}`);
      await setAddrTx.wait();
      
      // Step 4: Set reverse record if requested
      if (request.reverse) {
        console.log('  🔄 Step 4: Setting reverse record...');
        try {
          const setNameTx = await this.publicResolver.setName(
            node,
            fullName,
            { gasLimit: 100000 }
          );
          txHashes.push(setNameTx.hash);
          console.log(`     Tx: ${setNameTx.hash}`);
          await setNameTx.wait();
        } catch (error) {
          console.warn('     ⚠️ Reverse record failed (non-critical):', error);
        }
      }
      
      console.log(`  ✅ Successfully created: ${fullName}`);
      return { success: true, txHashes };
      
    } catch (error: any) {
      console.error(`  ❌ Failed to create subdomain:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create multiple subdomains in batch
   */
  async createBatchSubdomains(requests: SubdomainRequest[]): Promise<{
    successful: number;
    failed: number;
    results: Array<{ label: string; success: boolean; error?: string; txHashes?: string[] }>;
  }> {
    console.log(`\n🚀 Creating ${requests.length} subdomains in batch...\n`);
    
    const results = [];
    let successful = 0;
    let failed = 0;
    
    for (const request of requests) {
      const result = await this.createSubdomain(request);
      
      results.push({
        label: request.label,
        success: result.success,
        error: result.error,
        txHashes: result.txHashes
      });
      
      if (result.success) {
        successful++;
      } else {
        failed++;
      }
      
      // Add delay between transactions to avoid nonce issues
      if (requests.length > 1) {
        console.log('     💤 Waiting 2 seconds before next transaction...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log(`\n📊 Batch Results: ${successful} successful, ${failed} failed`);
    return { successful, failed, results };
  }

  /**
   * Generate and create a random subdomain
   */
  async createRandomSubdomain(address: string, attempts = 5): Promise<{
    success: boolean;
    label?: string;
    fullName?: string;
    txHashes?: string[];
    error?: string;
  }> {
    for (let i = 0; i < attempts; i++) {
      const label = generatePseudonym();
      const exists = await this.checkSubdomainExists(label);
      
      if (!exists) {
        const result = await this.createSubdomain({ label, address });
        if (result.success) {
          return {
            success: true,
            label,
            fullName: generateENSName(label),
            txHashes: result.txHashes
          };
        }
      }
      
      console.log(`  🎲 ${label} is taken, trying another...`);
    }
    
    return { 
      success: false, 
      error: `Could not find available subdomain after ${attempts} attempts` 
    };
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🔮 Bribehack ENS Subdomain Creator

Usage:
  Single subdomain:
    npx tsx scripts/createSubdomain.ts --label wild-otter --address 0x1234...
    
  Random subdomain:
    npx tsx scripts/createSubdomain.ts --random --address 0x1234...
    
  Batch creation:
    npx tsx scripts/createSubdomain.ts --batch ./subdomains.json
    
  Network options:
    --network sepolia (default)
    --network mainnet

Environment variables required:
  PRIVATE_KEY=0x...
  SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/...
  MAINNET_RPC_URL=https://mainnet.infura.io/v3/...
    `);
    return;
  }
  
  try {
    // Parse arguments
    const network = (args.includes('--network') 
      ? args[args.indexOf('--network') + 1] 
      : 'sepolia') as 'sepolia' | 'mainnet';
    
    const manager = new ENSSubdomainManager(network);
    
    if (args.includes('--batch')) {
      // Batch creation
      const batchFilePath = args[args.indexOf('--batch') + 1];
      const batchData: BatchRequest = JSON.parse(
        fs.readFileSync(path.resolve(batchFilePath), 'utf8')
      );
      
      await manager.createBatchSubdomains(batchData.subdomains);
      
    } else if (args.includes('--random')) {
      // Random subdomain
      const address = args[args.indexOf('--address') + 1];
      if (!address) {
        throw new Error('--address is required for random subdomain creation');
      }
      
      const result = await manager.createRandomSubdomain(address);
      if (result.success) {
        console.log(`\n🎉 Created random subdomain: ${result.fullName}`);
      } else {
        console.error(`\n❌ Failed: ${result.error}`);
      }
      
    } else {
      // Single subdomain
      const label = args[args.indexOf('--label') + 1];
      const address = args[args.indexOf('--address') + 1];
      
      if (!label || !address) {
        throw new Error('Both --label and --address are required');
      }
      
      const result = await manager.createSubdomain({ label, address });
      if (!result.success) {
        console.error(`\n❌ Failed: ${result.error}`);
        process.exit(1);
      }
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

// Export for use as library
export { ENSSubdomainManager, SubdomainRequest, BatchRequest };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
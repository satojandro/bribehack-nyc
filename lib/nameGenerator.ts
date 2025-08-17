/**
 * Bribehack Pseudonym Name Generator
 * 
 * Generates fun, memorable pseudonyms for hackers using a combination
 * of adjectives and animals. Used for ENS subdomain creation like:
 * wild-otter.bribehack.eth, turbo-badger.bribehack.eth
 */

const ADJECTIVES = [
  "turbo", "dirty", "feisty", "electric", "wild", "sneaky", "fierce", "stubborn",
  "crafty", "blazing", "rogue", "swift", "quantum", "cyber", "neon", "shadow",
  "toxic", "atomic", "crypto", "digital", "hacker", "ninja", "stealth", "viral",
  "matrix", "binary", "pixel", "glitch", "chaos", "rebel", "phantom", "ghost",
  "dark", "bright", "flash", "storm", "thunder", "lightning", "fire", "ice",
  "steel", "iron", "gold", "silver", "diamond", "ruby", "emerald", "sapphire"
];

const ANIMALS = [
  "otter", "carrot", "tiger", "badger", "beast", "hawk", "ferret", "mongo",
  "wolf", "fox", "bear", "lion", "eagle", "shark", "whale", "dolphin",
  "cat", "dog", "rabbit", "mouse", "rat", "bat", "owl", "crow",
  "snake", "spider", "scorpion", "mantis", "dragon", "phoenix", "unicorn", "griffin",
  "lynx", "panther", "cheetah, jaguar", "leopard", "rhino", "elephant", "hippo",
  "giraffe", "zebra", "kangaroo", "koala", "panda", "penguin", "seal", "walrus"
];

const TECH_TERMS = [
  "dev", "code", "hack", "byte", "bit", "node", "chain", "block",
  "hash", "fork", "merge", "push", "pull", "commit", "deploy", "build",
  "stack", "layer", "protocol", "token", "coin", "wallet", "vault", "key"
];

/**
 * Generate a random pseudonym using adjective + animal format
 */
export function generatePseudonym(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return `${adj}-${animal}`;
}

/**
 * Generate a tech-focused pseudonym using adjective + tech term format
 */
export function generateTechPseudonym(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const tech = TECH_TERMS[Math.floor(Math.random() * TECH_TERMS.length)];
  return `${adj}-${tech}`;
}

/**
 * Generate multiple pseudonym options for user to choose from
 */
export function generatePseudonymOptions(count = 5): string[] {
  const options = new Set<string>();
  
  while (options.size < count) {
    // Mix regular and tech pseudonyms
    const pseudonym = Math.random() > 0.5 ? generatePseudonym() : generateTechPseudonym();
    options.add(pseudonym);
  }
  
  return Array.from(options);
}

/**
 * Validate pseudonym format and check if it's suitable for ENS
 */
export function validatePseudonym(name: string): { 
  valid: boolean; 
  error?: string; 
  suggestion?: string; 
} {
  // Basic validation
  if (!name || name.length === 0) {
    return { valid: false, error: "Name cannot be empty" };
  }
  
  if (name.length < 3) {
    return { valid: false, error: "Name must be at least 3 characters", suggestion: generatePseudonym() };
  }
  
  if (name.length > 32) {
    return { valid: false, error: "Name must be less than 32 characters", suggestion: generatePseudonym() };
  }
  
  // ENS-specific validation
  const ensPattern = /^[a-z0-9-]+$/;
  if (!ensPattern.test(name.toLowerCase())) {
    return { 
      valid: false, 
      error: "Name can only contain lowercase letters, numbers, and hyphens",
      suggestion: name.toLowerCase().replace(/[^a-z0-9-]/g, '-')
    };
  }
  
  // Cannot start or end with hyphen
  if (name.startsWith('-') || name.endsWith('-')) {
    return { 
      valid: false, 
      error: "Name cannot start or end with a hyphen",
      suggestion: name.replace(/^-+|-+$/g, '')
    };
  }
  
  // Cannot have consecutive hyphens
  if (name.includes('--')) {
    return { 
      valid: false, 
      error: "Name cannot have consecutive hyphens",
      suggestion: name.replace(/-+/g, '-')
    };
  }
  
  return { valid: true };
}

/**
 * Check if a pseudonym is available (not taken)
 * In production, this would check against ENS registry
 */
export async function checkPseudonymAvailability(name: string): Promise<{
  available: boolean;
  suggestion?: string;
}> {
  // Mock implementation - in production would query ENS
  const validation = validatePseudonym(name);
  if (!validation.valid) {
    return { 
      available: false, 
      suggestion: validation.suggestion || generatePseudonym() 
    };
  }
  
  // Simulate some names being taken
  const commonNames = ['hacker', 'dev', 'crypto', 'bitcoin', 'ethereum', 'web3'];
  const isTaken = commonNames.some(common => name.toLowerCase().includes(common));
  
  if (isTaken) {
    return { 
      available: false, 
      suggestion: generatePseudonym() 
    };
  }
  
  return { available: true };
}

/**
 * Generate the full ENS name for Bribehack subdomains
 */
export function generateENSName(pseudonym: string): string {
  return `${pseudonym.toLowerCase()}.bribehack.eth`;
}

/**
 * Extract pseudonym from full ENS name
 */
export function extractPseudonym(ensName: string): string {
  if (ensName.endsWith('.bribehack.eth')) {
    return ensName.replace('.bribehack.eth', '');
  }
  return ensName;
}

/**
 * Get display name with emoji for different pseudonym types
 */
export function getDisplayNameWithEmoji(pseudonym: string): string {
  const lowerName = pseudonym.toLowerCase();
  
  // Tech-themed names get special emojis
  if (TECH_TERMS.some(term => lowerName.includes(term))) {
    return `⚡ ${pseudonym}`;
  }
  
  // Animal-themed names get animal emojis
  const animalEmojis: { [key: string]: string } = {
    'tiger': '🐅', 'wolf': '🐺', 'fox': '🦊', 'bear': '🐻', 'lion': '🦁',
    'eagle': '🦅', 'shark': '🦈', 'whale': '🐋', 'dolphin': '🐬', 'cat': '🐱',
    'dog': '🐶', 'rabbit': '🐰', 'bat': '🦇', 'owl': '🦉', 'snake': '🐍',
    'dragon': '🐲', 'unicorn': '🦄', 'penguin': '🐧', 'panda': '🐼'
  };
  
  for (const [animal, emoji] of Object.entries(animalEmojis)) {
    if (lowerName.includes(animal)) {
      return `${emoji} ${pseudonym}`;
    }
  }
  
  return `🔥 ${pseudonym}`;
}
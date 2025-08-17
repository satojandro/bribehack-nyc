/**
 * Bribehack GraphQL Client
 * 
 * High-performance GraphQL client for querying The Graph subgraph.
 * Provides typed queries for all Bribehack on-chain data with automatic
 * error handling and caching via React Query.
 */

import { GraphQLClient } from 'graphql-request';

// Subgraph endpoint - live data from Sepolia testnet
export const SUBGRAPH_ENDPOINT = 'https://api.studio.thegraph.com/query/118881/bribehack-sepolia/v1.0.0';

// Create GraphQL client with error handling
export const graphqlClient = new GraphQLClient(SUBGRAPH_ENDPOINT, {
  headers: {
    'Content-Type': 'application/json',
  },
  // Add request timeout
  timeout: 10000,
});

// Helper function for executing queries with error handling
export async function executeQuery<T>(query: string, variables?: any): Promise<T> {
  try {
    const data = await graphqlClient.request<T>(query, variables);
    return data;
  } catch (error) {
    console.error('GraphQL Query Error:', error);
    throw new Error(`Failed to fetch data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
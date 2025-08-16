/**
 * Landing Page Component
 * 
 * The main entry point for Bribehack.
 * Features:
 * - Animated hero section with gradient text
 * - Call-to-action for wallet connection
 * - Quick link to leaderboard
 * 
 * This page sets the tone: "The Hackathon Has a Market"
 * Emphasizes the gamified, high-stakes nature of the protocol
 */

'use client';

import { motion } from 'framer-motion';
import { DynamicWidget } from '@dynamic-labs/sdk-react-core';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import Link from 'next/link';

export default function LandingPage() {
  // Get wallet connection status from Dynamic
  const { user } = useDynamicContext();
  const isConnected = !!user;

  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[calc(100vh-10rem)]">
      {/* Main headline with animated gradient */}
      <motion.h1 
        className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        The Hackathon Has a Market.
      </motion.h1>
      
      {/* Subheadline in monospace font for that tech feel */}
      <motion.p 
        className="text-2xl md:text-4xl font-mono text-gray-300 mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Welcome to Bribehack.
      </motion.p>
      
      {/* CTA section with wallet connection and leaderboard link */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* 
           * Show different CTAs based on connection status
           * Connected users see commit/sponsor options
           * Non-connected users see wallet connection prompt
           */}
          {isConnected ? (
            <>
              <Link href="/commit" className="btn btn-primary">
                Commit to Bounties
              </Link>
              <Link href="/sponsor" className="btn btn-secondary">
                Sponsor & Bribe
              </Link>
            </>
          ) : (
            <>
              {/* Dynamic wallet connection widget */}
              <div className="scale-110">
                <DynamicWidget />
              </div>
              <Link href="/leaderboard" className="btn btn-secondary">
                View Leaderboard
              </Link>
            </>
          )}
        </div>
      </motion.div>
      
      {/* Additional info section */}
      <motion.div
        className="mt-16 max-w-2xl text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <p className="text-sm">
          Bribehack is a cross-chain bounty protocol where sponsors can incentivize hackers
          to work on specific challenges through transparent on-chain bribes.
        </p>
      </motion.div>
    </div>
  );
}
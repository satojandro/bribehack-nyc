/**
 * Root Layout Component
 * 
 * This is the main layout wrapper for the entire application.
 * It includes:
 * - Dynamic wallet provider setup (replaces RainbowKit)
 * - Global header navigation
 * - Toast notifications
 * - Font configuration
 * 
 * All pages in the app will be wrapped with this layout
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Web3Provider from "@/components/Web3Provider";
import Header from "@/components/Header";
import { Toaster } from "react-hot-toast";

// Configure Inter font for the application
const inter = Inter({ subsets: ["latin"] });

// SEO metadata for the application
export const metadata: Metadata = {
  title: "Bribehack | The Hackathon Has a Market",
  description: "A decentralized protocol for gamified hackathon incentives. Cross-chain bounty + bribery protocol for ETHGlobal NYC.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Web3Provider wraps the entire app with Dynamic wallet context */}
        <Web3Provider>
          <div className="min-h-screen flex flex-col">
            {/* Global header with navigation and wallet connection */}
            <Header />
            
            {/* Main content area - all pages render here */}
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            
            {/* Toast notifications positioned at bottom-right */}
            <Toaster 
              position="bottom-right" 
              toastOptions={{
                style: {
                  background: '#1a1a1a',  // Dark background to match theme
                  color: '#e5e7eb',       // Light gray text
                  border: '1px solid #2a2a2a'  // Subtle border
                }
              }} 
            />
          </div>
        </Web3Provider>
      </body>
    </html>
  );
}
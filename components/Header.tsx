/**
 * Header Component
 * 
 * Global navigation header that appears on all pages.
 * Features:
 * - Bribehack logo/brand
 * - Navigation links with active state highlighting
 * - Dynamic wallet connection button
 * - Responsive design (mobile-friendly)
 * 
 * Uses Dynamic's DynamicWidget for wallet connection instead of RainbowKit
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DynamicWidget } from '@dynamic-labs/sdk-react-core';

/**
 * Navigation links configuration
 * Add new pages here to include them in the navigation
 */
const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/commit', label: 'Commit' },
    { href: '/sponsor', label: 'Sponsor' },
];

const Header = () => {
    // Get current pathname to highlight active nav link
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-gray-medium">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Left side: Logo and Navigation */}
                    <div className="flex items-center space-x-8">
                        {/* Logo/Brand - Links to home */}
                        <Link 
                            href="/" 
                            className="text-2xl font-bold text-secondary font-mono hover:text-green-300 transition-colors"
                        >
                           BribeHack
                        </Link>
                        
                        {/* Navigation links - Hidden on mobile, visible on md+ */}
                        <nav className="hidden md:flex items-center space-x-6">
                            {navLinks.map(link => (
                                <Link 
                                    key={link.href} 
                                    href={link.href} 
                                    className={`
                                        text-sm font-medium transition-colors
                                        ${pathname === link.href 
                                            ? 'text-primary' // Active link color
                                            : 'text-gray-400 hover:text-primary'} // Inactive link color
                                    `}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    
                    {/* Right side: Wallet Connection */}
                    <div className="flex items-center">
                        {/* 
                         * DynamicWidget replaces RainbowKit's ConnectButton
                         * It handles:
                         * - Wallet connection/disconnection
                         * - Account display
                         * - Network switching
                         * - User profile (if configured)
                         */}
                        <DynamicWidget />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
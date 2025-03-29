'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@/contexts/WalletContext';
import WalletConnection from '@/components/WalletConnection';

export default function Header() {
    const { isConnected } = useWallet();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Only show main header if not connected (otherwise WalletLayout handles navigation)
    if (isConnected) return null;

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-decode-green/20 bg-decode-black/90 backdrop-blur-lg">
                <div className="container mx-auto flex h-20 items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center gap-3">
                            <img src="/assets/logo/tajiri-logo.svg" alt="Tajiri Logo" className="h-10" />
                            <span className="text-2xl font-bold decode-gradient bg-clip-text text-transparent">Tajiri</span>
                        </Link>
                    </div>
                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="/" className="text-sm font-medium text-decode-white hover:text-decode-green transition-colors">
                            HOME
                        </Link>
                        <Link href="/marketplace" className="text-sm font-medium text-decode-white hover:text-decode-green transition-colors">
                            MARKETPLACE
                        </Link>
                        <Link href="/trading" className="text-sm font-medium text-decode-white hover:text-decode-green transition-colors">
                            P2P TRADING
                        </Link>
                        <Link href="/wallet" className="text-sm font-medium text-decode-white hover:text-decode-green transition-colors">
                            PORTFOLIO
                        </Link>
                        <div className="h-5 w-px bg-decode-green/30 mx-2"></div>
                        <WalletConnection />
                    </nav>

                    {/* Mobile menu button */}
                    <button
                        className="p-2 rounded-md text-decode-white md:hidden"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </header>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-decode-black/95 md:hidden">
                    <div className="flex justify-end p-4">
                        <button
                            className="text-decode-white p-2"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <nav className="flex flex-col items-center gap-6 p-6">
                        <Link
                            href="/"
                            className="text-lg font-medium text-decode-white hover:text-decode-green transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            HOME
                        </Link>
                        <Link
                            href="/marketplace"
                            className="text-lg font-medium text-decode-white hover:text-decode-green transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            MARKETPLACE
                        </Link>
                        <Link
                            href="/trading"
                            className="text-lg font-medium text-decode-white hover:text-decode-green transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            P2P TRADING
                        </Link>
                        <Link
                            href="/wallet"
                            className="text-lg font-medium text-decode-white hover:text-decode-green transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            PORTFOLIO
                        </Link>
                        <div className="my-4">
                            <WalletConnection />
                        </div>
                    </nav>
                </div>
            )}
        </>
    );
} 
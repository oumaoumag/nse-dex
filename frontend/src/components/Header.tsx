'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@/contexts/WalletContext';
import { useKYC, KYCStatus } from '@/contexts/KYCContext';
import WalletConnection from '@/components/WalletConnection';

export default function Header() {
    const { isConnected } = useWallet();
    const { kycStatus } = useKYC();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Only show main header if not connected (otherwise WalletLayout handles navigation)
    if (isConnected) return null;

    const needsKYC = kycStatus === KYCStatus.NONE || kycStatus === KYCStatus.REJECTED;

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
                        {needsKYC && isConnected && (
                            <Link
                                href="/kyc"
                                className="text-sm font-medium text-yellow-500 hover:text-yellow-400 transition-colors flex items-center gap-1"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                </svg>
                                COMPLETE KYC
                            </Link>
                        )}
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
                        {needsKYC && isConnected && (
                            <Link
                                href="/kyc"
                                className="text-lg font-medium text-yellow-500 hover:text-yellow-400 transition-colors flex items-center gap-2"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                </svg>
                                COMPLETE KYC
                            </Link>
                        )}
                        <div className="my-4">
                            <WalletConnection />
                        </div>
                    </nav>
                </div>
            )}
        </>
    );
} 
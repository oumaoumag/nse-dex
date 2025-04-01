'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import { WalletStatusIndicator } from './WalletStatusIndicator';

export default function Header() {
    const { data: session, status } = useSession();
    const isAuthenticated = status === 'authenticated';

    const [mounted, setMounted] = useState(false);
    const [currentPath, setCurrentPath] = useState('/');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Handle mounting and path setting after component mounts
    useEffect(() => {
        setMounted(true);

        // Get current path without router
        if (typeof window !== 'undefined') {
            setCurrentPath(window.location.pathname);
        }
    }, []);

    // Safe isActive function that works without router
    const isActive = (path: string) => {
        if (!mounted) return false;
        return currentPath === path;
    };

    // Check if marketplace or market paths are active for the Finance Hub link
    const isFinanceHubActive = () => {
        if (!mounted) return false;
        return currentPath === '/marketplace' || currentPath.startsWith('/market');
    };

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-decode-green/20 bg-decode-black/90 backdrop-blur-lg">
                <div className="container mx-auto flex h-20 items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center gap-3">
                            <img
                                src="/assets/logo/tajiri-logo.svg"
                                alt="Tajiri Logo"
                                className="h-10 w-10"
                                onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                            <span className="text-2xl font-bold text-decode-green">Tajiri</span>
                        </Link>
                    </div>
                    <nav className="hidden md:flex items-center gap-6">
                        <Link
                            href="/"
                            className={`text-sm font-medium ${isActive('/')
                                ? 'text-decode-green'
                                : 'text-decode-white hover:text-decode-green'
                                }`}
                        >
                            HOME
                        </Link>
                        <Link
                            href="/marketplace"
                            className={`text-sm font-medium ${isFinanceHubActive()
                                ? 'text-decode-green'
                                : 'text-decode-white hover:text-decode-green'
                                }`}
                        >
                            FINANCE HUB
                        </Link>
                        <Link
                            href="/trading"
                            className={`text-sm font-medium ${isActive('/trading')
                                ? 'text-decode-green'
                                : 'text-decode-white hover:text-decode-green'
                                }`}
                        >
                            P2P TRADING
                        </Link>
                        <Link
                            href="/wallet"
                            className={`text-sm font-medium ${isActive('/wallet')
                                ? 'text-decode-green'
                                : 'text-decode-white hover:text-decode-green'
                                }`}
                        >
                            PORTFOLIO
                        </Link>
                        {isAuthenticated && (
                            <Link
                                href="/stocks"
                                className={`text-sm font-medium ${isActive('/stocks')
                                    ? 'text-decode-green'
                                    : 'text-decode-white hover:text-decode-green'
                                    }`}
                            >
                                STOCKS
                            </Link>
                        )}
                        <div className="h-5 w-px bg-decode-green/30 mx-2"></div>
                        {isAuthenticated && <WalletStatusIndicator className="mr-3" />}
                        <GoogleLoginButton />
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
                    <div className="flex justify-between items-center p-4">
                        <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                            <img
                                src="/assets/logo/tajiri-logo.svg"
                                alt="Tajiri Logo"
                                className="h-8 w-8"
                                onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                            <span className="text-xl font-bold text-decode-green">Tajiri</span>
                        </Link>
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
                            className={`text-lg font-medium ${isActive('/')
                                ? 'text-decode-green'
                                : 'text-decode-white hover:text-decode-green'
                                }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            HOME
                        </Link>
                        <Link
                            href="/marketplace"
                            className={`text-lg font-medium ${isFinanceHubActive()
                                ? 'text-decode-green'
                                : 'text-decode-white hover:text-decode-green'
                                }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            FINANCE HUB
                        </Link>
                        <Link
                            href="/trading"
                            className={`text-lg font-medium ${isActive('/trading')
                                ? 'text-decode-green'
                                : 'text-decode-white hover:text-decode-green'
                                }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            P2P TRADING
                        </Link>
                        <Link
                            href="/wallet"
                            className={`text-lg font-medium ${isActive('/wallet')
                                ? 'text-decode-green'
                                : 'text-decode-white hover:text-decode-green'
                                }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            PORTFOLIO
                        </Link>
                        {isAuthenticated && (
                            <Link
                                href="/stocks"
                                className={`text-lg font-medium ${isActive('/stocks')
                                    ? 'text-decode-green'
                                    : 'text-decode-white hover:text-decode-green'
                                    }`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                STOCKS
                            </Link>
                        )}
                        {isAuthenticated && <WalletStatusIndicator className="my-2" />}
                        <div className="my-4">
                            <GoogleLoginButton />
                        </div>
                    </nav>
                </div>
            )}
        </>
    );
} 
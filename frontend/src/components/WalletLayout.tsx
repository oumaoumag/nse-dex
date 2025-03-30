'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import { useKYC, KYCStatus } from '@/contexts/KYCContext';

// Updated navigation to match routes used in the root layout
const navigation = [
  { name: 'Portfolio', href: '/wallet' },
  { name: 'Marketplace', href: '/marketplace' },
  { name: 'P2P Trading', href: '/trading' },
  { name: 'Lending', href: '/lend' },
  { name: 'Security & Recovery', href: '/security' },
  { name: 'KYC', href: '/kyc' },
  { name: 'Learn', href: '/learn' },
];

export default function WalletLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isConnected } = useWallet();
  const { kycStatus, canTrade } = useKYC();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getKYCStatusIndicator = () => {
    switch (kycStatus) {
      case KYCStatus.APPROVED:
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 rounded-md">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span className="text-xs font-medium">KYC Approved</span>
          </div>
        );
      case KYCStatus.PENDING:
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 text-yellow-500 rounded-md">
            <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="text-xs font-medium">KYC Pending</span>
          </div>
        );
      case KYCStatus.REJECTED:
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-md">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            <span className="text-xs font-medium">KYC Rejected</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-500 rounded-md">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="text-xs font-medium">KYC Required</span>
          </div>
        );
    }
  };

// We'll always render the children, but only show the side navigation when connected
  return (
    <div className="flex min-h-screen">
      {isConnected && (
        <>
          {/* Mobile menu button */}
          <button
            className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-decode-green/10 text-decode-green"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {/* Sidebar Navigation - Desktop and Mobile */}
          <div className={`w-64 bg-decode-black border-r border-decode-green/20 fixed inset-y-0 left-0 z-40 
            transform transition duration-200 ease-in-out
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
          >
            <div className="h-20 flex items-center justify-center border-b border-decode-green/20">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-xl font-bold decode-gradient bg-clip-text text-transparent">Tajiri</span>
              </Link>
            </div>

            {/* KYC Status */}
            <div className="px-4 py-4">
              {getKYCStatusIndicator()}
            </div>

            <nav className="mt-2">
              <div className="px-2 space-y-1">
                {navigation.map((item) => {
                  // Block access to trading and marketplace if KYC isn't approved
                  const isRestrictedRoute = (item.href === '/marketplace' || item.href === '/trading') && !canTrade;

                  return (
                    <Link
                      key={item.name}
                      href={isRestrictedRoute ? '/kyc' : item.href}
                      className={`${pathname === item.href
                        ? 'bg-decode-green/10 text-decode-green'
                        : 'text-gray-300 hover:bg-decode-green/5 hover:text-decode-green'
                        } group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors
                        ${isRestrictedRoute ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                      {isRestrictedRoute && (
                        <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                        </svg>
                      )}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>

          {/* Overlay for mobile menu */}
          {isMobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            ></div>
          )}
        </>
      )}

      {/* Content area */}
      <div className={`flex-1 ${isConnected ? 'md:ml-64' : ''}`}>
        <div className={`p-4 md:p-8 ${isConnected ? 'pt-16 md:pt-8' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
} 
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';

// Updated navigation to match routes used in the root layout
const navigation = [
  { name: 'Portfolio', href: '/wallet' },
  { name: 'Marketplace', href: '/marketplace' },
  { name: 'P2P Trading', href: '/trading' },
  { name: 'Lending', href: '/lend' },
  { name: 'Security & Recovery', href: '/security' },
  { name: 'Learn', href: '/learn' },
];

export default function WalletLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isConnected } = useWallet();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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
                <img
                  src="/assets/logo/tajiri-logo.svg"
                  alt="Tajiri Logo"
                  className="h-8 w-8"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className="text-xl font-bold">Tajiri</span>
              </Link>
            </div>

            <nav className="mt-8">
              <div className="px-2 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${pathname === item.href
                      ? 'bg-decode-green/10 text-decode-green'
                      : 'text-gray-300 hover:bg-decode-green/5 hover:text-decode-green'
                      } group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
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
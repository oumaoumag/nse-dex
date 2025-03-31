'use client';

import React, { useState, useEffect } from 'react';
import StockMarketplace from '@/components/StockMarketplace';
import MarketDataDisplay from '@/components/MarketDataDisplay';
import { StockProvider } from '@/contexts/StockContext';
import { useSearchParams } from 'next/navigation';

export default function MarketplacePage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'trading' | 'market'>('trading');

  // Set initial tab based on URL parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'market') {
      setActiveTab('market');
    }
  }, [searchParams]);

  return (
    <StockProvider>
      <div className="flex flex-col min-h-screen bg-decode-black">
        {/* Compact Header with Title */}
        <div className="border-b border-decode-green/20 py-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <h1 className="text-2xl font-bold text-white">
                <span className="bg-gradient-to-r from-primary-600 to-secondary-500 inline-block text-transparent bg-clip-text">Finance Hub</span>
              </h1>
              
              <div className="flex space-x-2">
                <a href="/marketplace/watchlist" className="text-sm text-decode-green hover:text-decode-green/80 flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Watchlist
                </a>
                <a href="/trading" className="text-sm text-decode-green hover:text-decode-green/80 flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  P2P Trading
                </a>
                <a href="/wallet" className="text-sm text-decode-green hover:text-decode-green/80 flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Portfolio
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Tabbed Interface */}
        <section className="flex-grow py-6">
          <div className="container mx-auto px-4">
            {/* Tab Navigation */}
            <div className="flex border-b border-decode-green/20 mb-6">
              <button
                onClick={() => setActiveTab('trading')}
                className={`py-3 px-6 font-medium text-sm ${activeTab === 'trading'
                  ? 'text-decode-green border-b-2 border-decode-green'
                  : 'text-gray-400 hover:text-gray-200'
                  }`}
              >
                TRADING MARKETPLACE
              </button>
              <button
                onClick={() => setActiveTab('market')}
                className={`py-3 px-6 font-medium text-sm ${activeTab === 'market'
                  ? 'text-decode-green border-b-2 border-decode-green'
                  : 'text-gray-400 hover:text-gray-200'
                  }`}
              >
                MARKET DATA & RESEARCH
              </button>
            </div>

            {/* Tab Content */}
            <div className="py-4">
              {activeTab === 'trading' ? (
                <StockMarketplace />
              ) : (
                <MarketDataDisplay />
              )}
            </div>
          </div>
        </section>
      </div>
    </StockProvider>
  );
}
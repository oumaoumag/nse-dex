'use client';

import React from 'react';
import StockMarketplace from '@/components/StockMarketplace';
import { StockProvider } from '@/contexts/StockContext';
import Link from 'next/link';

export default function MarketplacePage() {

  return (
    <StockProvider>
      <div className="flex flex-col min-h-screen">
        {/* Hero Section - Safaricom Decode style */}
        <section className="relative bg-decode-black py-20 md:py-32 overflow-hidden">
          {/* Abstract decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-decode-green opacity-5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-decode-blue opacity-5 rounded-full blur-3xl"></div>
            <div className="absolute top-1/4 left-1/3 w-1 h-40 bg-decode-green/20"></div>
            <div className="absolute bottom-1/3 right-1/4 w-40 h-1 bg-decode-green/20"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <div className="inline-block mb-3">
                <div className="h-1 w-16 bg-decode-green mb-6 mx-auto"></div>
                <h1 className="text-3xl md:text-4xl font-bold text-primary-900 dark:text-white mb-4">
                  Tokenized <span className="bg-gradient-to-r from-primary-600 to-secondary-500 inline-block text-transparent bg-clip-text">Stock</span> Marketplace
                </h1>
              </div>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                Trade tokenized stocks from the Nairobi Securities Exchange with the security and efficiency of Hedera's blockchain technology.
              </p>
              
              {/* Feature Quick Access Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10 max-w-4xl mx-auto">
                <Link href="/marketplace" className="decode-card border border-decode-green/30 p-5 rounded-lg text-left hover:border-decode-green/50 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-decode-green/10 p-2 rounded-full">
                      <svg className="h-6 w-6 text-decode-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <p className="font-bold text-decode-white text-lg">Trade Stocks</p>
                  </div>
                  <p className="text-sm text-gray-400">Buy and sell tokenized NSE stocks with seamless blockchain transactions.</p>
                </Link>

                <Link href="/marketplace" className="decode-card border border-decode-blue/30 p-5 rounded-lg text-left hover:border-decode-blue/50 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-decode-blue/10 p-2 rounded-full">
                      <svg className="h-6 w-6 text-decode-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <p className="font-bold text-decode-white text-lg">Track Portfolio</p>
                  </div>
                  <p className="text-sm text-gray-400">Monitor your investments with real-time data and performance analytics.</p>
                </Link>

                <Link href="/lend" className="decode-card border border-decode-green/30 p-5 rounded-lg text-left hover:border-decode-green/50 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-decode-green/10 p-2 rounded-full">
                      <svg className="h-6 w-6 text-decode-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="font-bold text-decode-white text-lg">P2P Trading</p>
                  </div>
                  <p className="text-sm text-gray-400">Trade directly with other users at your preferred prices with secure escrow protection.</p>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stock Marketplace Section */}
        <section className="py-20 bg-decode-black">
          <div className="container mx-auto px-4">
            <StockMarketplace />
          </div>
        </section>
      
        {/* Account Abstraction Benefits Section */}
        <section className="py-24 bg-decode-black border-t border-decode-green/20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <div className="h-px w-12 bg-decode-green mb-6 mx-auto"></div>
              <h2 className="text-2xl md:text-3xl font-bold text-primary-900 dark:text-white mb-4">
                Benefits of Account <span className="bg-gradient-to-r from-primary-600 to-secondary-500 inline-block text-transparent bg-clip-text">Abstraction</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">Experience seamless blockchain interaction with smart contract wallets</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="decode-card p-8 rounded-lg">
                <div className="rounded-full border border-decode-green/30 w-14 h-14 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-decode-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-decode-white mb-4">
                  Gas Fee Optimization
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  The platform can pay for transaction fees on your behalf, eliminating the need for you to hold HBAR just for gas.
                </p>
              </div>
              
              <div className="decode-card p-8 rounded-lg">
                <div className="rounded-full border border-decode-green/30 w-14 h-14 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-decode-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                </div>
                <h3 className="text-xl font-bold text-decode-white mb-4">
                  Enhanced Security
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Social recovery options protect your assets if you lose access to your account. Guardians can help recover your wallet.
              </p>
            </div>
            
            <div className="decode-card p-8 rounded-lg">
              <div className="rounded-full border border-decode-green/30 w-14 h-14 flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-decode-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-decode-white mb-4">
                Simplified Experience
              </h3>
              <p className="text-gray-400 leading-relaxed">
                No need to understand blockchain complexities. Trade stocks just like you would on traditional platforms.
              </p>
            </div>
          </div>
        </div>
      </section>
      </div>
    </StockProvider>
  );
}
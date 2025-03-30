'use client';

import React from 'react';
import StockMarketplace from '@/components/StockMarketplace';
import { useWallet } from '@/contexts/WalletContext';
import { StockProvider } from '@/contexts/StockContext';

export default function MarketplacePage() {
  const { isConnected, smartWalletId } = useWallet();

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
                <h1 className="decode-heading text-4xl md:text-6xl text-decode-white mb-6">
                  TOKENIZED <span className="text-decode-green">STOCK</span> MARKETPLACE
                </h1>
              </div>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                Trade tokenized stocks from the Nairobi Securities Exchange with the security and efficiency of Hedera's blockchain technology.
              </p>
              
              {/* Wallet status indicators with Safaricom Decode styling */}
              {isConnected && smartWalletId ? (
                <div className="decode-card border border-decode-green/30 p-4 rounded-lg mb-10 max-w-md mx-auto text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-decode-green">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="font-bold text-decode-white">Account Abstraction Enabled</p>
                  </div>
                  <p className="text-sm text-gray-400 pl-9">You're using a smart contract wallet that handles gas fees and simplifies transactions.</p>
                </div>
              ) : isConnected ? (
                <div className="decode-card border border-yellow-500/30 p-4 rounded-lg mb-10 max-w-md mx-auto text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-yellow-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <p className="font-bold text-decode-white">Create a Smart Wallet</p>
                  </div>
                  <p className="text-sm text-gray-400 pl-9">Connect your wallet and create a smart wallet to enable account abstraction for seamless trading.</p>
                </div>
              ) : (
                <div className="decode-card border border-decode-blue/30 p-4 rounded-lg mb-10 max-w-md mx-auto text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-decode-blue">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="font-bold text-decode-white">Connect Your Wallet</p>
                  </div>
                  <p className="text-sm text-gray-400 pl-9">Connect your wallet to start trading with the benefits of account abstraction.</p>
                </div>
              )}
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
              <h2 className="decode-heading text-3xl md:text-4xl text-decode-white mb-3">
                BENEFITS OF ACCOUNT ABSTRACTION
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
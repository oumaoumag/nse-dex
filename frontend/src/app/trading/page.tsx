'use client';

import React from 'react';
import P2PTrading from '@/components/P2PTrading';
import { useWallet } from '@/contexts/WalletContext';
import { StockProvider } from '@/contexts/StockContext';

export default function TradingPage() {
  const { isConnected, smartWalletId } = useWallet();

  return (
    <StockProvider>
      <div className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-primary-50 via-primary-100 to-white dark:from-primary-950 dark:via-primary-900 dark:to-primary-950 py-12 md:py-20 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-secondary-400 opacity-10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 -left-24 w-80 h-80 bg-primary-400 opacity-10 rounded-full blur-3xl"></div>
          </div>
          <div className="container mx-auto px-4 relative">
            <h1 className="text-3xl md:text-4xl font-bold text-primary-900 dark:text-white mb-4">
              P2P Stock <span className="bg-gradient-to-r from-primary-600 to-secondary-500 inline-block text-transparent bg-clip-text">Trading</span>
            </h1>
            <p className="text-lg text-primary-700 dark:text-primary-300 max-w-2xl mb-6">
              Create buy and sell offers for tokenized stocks or trade directly with other users on the Hedera network.
            </p>
            
            {isConnected && smartWalletId ? (
              <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 p-4 rounded-lg mb-6 max-w-md">
                <p className="font-medium">✓ Ready to Trade</p>
                <p className="text-sm">Your smart contract wallet is connected and ready for P2P trading.</p>
              </div>
            ) : isConnected ? (
              <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 p-4 rounded-lg mb-6 max-w-md">
                <p className="font-medium">⚠️ Create a Smart Wallet</p>
                <p className="text-sm">You need to create a smart wallet before you can participate in P2P trading.</p>
              </div>
            ) : (
              <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 p-4 rounded-lg mb-6 max-w-md">
                <p className="font-medium">ℹ️ Connect Your Wallet</p>
                <p className="text-sm">Connect your wallet to start trading with other users.</p>
              </div>
            )}
          </div>
        </section>

        {/* P2P Trading Section */}
        <section className="py-16 bg-white dark:bg-primary-950">
          <div className="container mx-auto px-4">
            <P2PTrading />
          </div>
        </section>

        {/* How P2P Trading Works Section */}
        <section className="py-16 bg-primary-50 dark:bg-primary-900">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-primary-900 dark:text-white mb-10 text-center">
              How P2P Trading Works
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="bg-white dark:bg-primary-800 p-6 rounded-xl shadow-md">
                <div className="rounded-full bg-primary-100 dark:bg-primary-700 w-12 h-12 flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-primary-600 dark:text-primary-300">1</span>
                </div>
                <h3 className="text-xl font-semibold text-primary-900 dark:text-white mb-3">
                  Get Tokens
                </h3>
                <p className="text-primary-600 dark:text-primary-400">
                  First, visit the marketplace to mint stock tokens using HBAR or associate existing tokens with your wallet.
                </p>
              </div>
              
              <div className="bg-white dark:bg-primary-800 p-6 rounded-xl shadow-md">
                <div className="rounded-full bg-primary-100 dark:bg-primary-700 w-12 h-12 flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-primary-600 dark:text-primary-300">2</span>
                </div>
                <h3 className="text-xl font-semibold text-primary-900 dark:text-white mb-3">
                  Create an Offer
                </h3>
                <p className="text-primary-600 dark:text-primary-400">
                  Create a buy offer by locking HBAR as escrow, or create a sell offer by putting your tokens in escrow.
                </p>
              </div>
              
              <div className="bg-white dark:bg-primary-800 p-6 rounded-xl shadow-md">
                <div className="rounded-full bg-primary-100 dark:bg-primary-700 w-12 h-12 flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-primary-600 dark:text-primary-300">3</span>
                </div>
                <h3 className="text-xl font-semibold text-primary-900 dark:text-white mb-3">
                  Wait or Execute
                </h3>
                <p className="text-primary-600 dark:text-primary-400">
                  Wait for someone else to take your offer, or execute an existing offer from another trader.
                </p>
              </div>
              
              <div className="bg-white dark:bg-primary-800 p-6 rounded-xl shadow-md">
                <div className="rounded-full bg-primary-100 dark:bg-primary-700 w-12 h-12 flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-primary-600 dark:text-primary-300">4</span>
                </div>
                <h3 className="text-xl font-semibold text-primary-900 dark:text-white mb-3">
                  Trade Complete
                </h3>
                <p className="text-primary-600 dark:text-primary-400">
                  When a trade executes, tokens and HBAR are securely exchanged between the parties through the escrow system.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </StockProvider>
  );
}

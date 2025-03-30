'use client';

import React from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { StockProvider } from '@/contexts/StockContext';
import WalletConnection from '@/components/WalletConnection';
import GuardianManager from '@/components/GuardianManager';
import Portfolio from '@/components/Portfolio';

export default function WalletPage() {
  const { isConnected, smartWalletId } = useWallet();

  return (
    <StockProvider>
      <div className="flex flex-col min-h-screen">
      {/* Header Section */}
      <section className="relative bg-gradient-to-b from-primary-50 via-primary-100 to-white dark:from-primary-950 dark:via-primary-900 dark:to-primary-950 py-12 md:py-20 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-secondary-400 opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 -left-24 w-80 h-80 bg-primary-400 opacity-10 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative">
          <h1 className="text-3xl md:text-4xl font-bold text-primary-900 dark:text-white mb-4">
            Smart Wallet <span className="bg-gradient-to-r from-primary-600 to-secondary-500 inline-block text-transparent bg-clip-text">Management</span>
          </h1>
          <p className="text-lg text-primary-700 dark:text-primary-300 max-w-2xl mb-6">
            Manage your smart contract wallet with advanced features like social recovery, guardian management, and transaction batching.
          </p>
          
          {isConnected && smartWalletId ? (
            <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 p-4 rounded-lg mb-6 max-w-md">
              <p className="font-medium">✓ Smart Wallet Active</p>
              <p className="text-sm">Your smart wallet is ready with account abstraction features.</p>
            </div>
          ) : isConnected ? (
            <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 p-4 rounded-lg mb-6 max-w-md">
              <p className="font-medium">⚠️ Create a Smart Wallet</p>
              <p className="text-sm">Connect your wallet and create a smart wallet to enable account abstraction.</p>
            </div>
          ) : (
            <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 p-4 rounded-lg mb-6 max-w-md">
              <p className="font-medium">ℹ️ Connect Your Wallet</p>
              <p className="text-sm">Connect your wallet to get started with smart wallet features.</p>
            </div>
          )}
        </div>
      </section>

      {/* Wallet Management Section */}
      <section className="py-12 bg-white dark:bg-primary-950">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <WalletConnection />
            </div>
            
            <div className="md:col-span-2">
              <GuardianManager />
            </div>
          </div>
        </div>
      </section>
      
      {/* Account Abstraction Features Section */}
      <section className="py-16 bg-primary-50 dark:bg-primary-900">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-900 dark:text-white mb-10 text-center">
            Account Abstraction Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-primary-800 p-6 rounded-xl shadow-md">
              <div className="rounded-full bg-primary-100 dark:bg-primary-700 w-12 h-12 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600 dark:text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary-900 dark:text-white mb-3">
                Social Recovery
              </h3>
              <p className="text-primary-600 dark:text-primary-400">
                Designate trusted friends or family as guardians who can help you recover your wallet if you lose access to your keys.
              </p>
            </div>
            
            <div className="bg-white dark:bg-primary-800 p-6 rounded-xl shadow-md">
              <div className="rounded-full bg-primary-100 dark:bg-primary-700 w-12 h-12 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600 dark:text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary-900 dark:text-white mb-3">
                Gasless Transactions
              </h3>
              <p className="text-primary-600 dark:text-primary-400">
                Execute transactions without worrying about gas fees. The platform can sponsor transactions on your behalf.
              </p>
            </div>
            
            <div className="bg-white dark:bg-primary-800 p-6 rounded-xl shadow-md">
              <div className="rounded-full bg-primary-100 dark:bg-primary-700 w-12 h-12 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600 dark:text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary-900 dark:text-white mb-3">
                Batched Transactions
              </h3>
              <p className="text-primary-600 dark:text-primary-400">
                Execute multiple transactions in a single operation, saving time and reducing costs when performing complex operations.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Learn More Section */}
      <section className="py-16 bg-white dark:bg-primary-950">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-900 dark:text-white mb-6">
            Learn More About Account Abstraction
          </h2>
          <p className="text-lg text-primary-700 dark:text-primary-300 max-w-2xl mx-auto mb-8">
            Account abstraction simplifies blockchain interactions by handling complex operations through smart contracts, making Web3 more accessible.
          </p>
          <a 
            href="https://hedera.com/blog/account-abstraction-making-web3-more-accessible" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-primary-600 to-secondary-600 px-6 py-3 text-base font-medium text-white shadow-lg hover:from-primary-700 hover:to-secondary-700 transition-all"
          >
            Explore Hedera Account Abstraction
          </a>
        </div>
      </section>
      
      {/* Portfolio Section */}
      {isConnected && smartWalletId && (
        <section className="py-16 bg-white dark:bg-primary-950">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-primary-900 dark:text-white mb-8">
              Your Token Portfolio
            </h2>
            <Portfolio />
          </div>
        </section>
      )}
      </div>
    </StockProvider>
  );
} 
'use client';

import React, { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { StockProvider } from '@/contexts/StockContext';
import WalletConnection from '@/components/WalletConnection';
import GuardianManager from '@/components/GuardianManager';
import Portfolio from '@/components/Portfolio';

export default function WalletPage() {
  const { isConnected, smartWalletId } = useWallet();
  const [activeTab, setActiveTab] = useState<'portfolio' | 'security' | 'advanced'>('portfolio');

  // Helper function to decide which tab to show based on connection status
  const getInitialTab = () => {
    if (!isConnected) return 'security'; // If not connected, show the connection tab
    if (isConnected && !smartWalletId) return 'security'; // If connected but no smart wallet, show security tab
    return 'portfolio'; // Default to portfolio for connected users with smart wallet
  };

  // Set initial active tab based on connection status
  React.useEffect(() => {
    setActiveTab(getInitialTab());
  }, [isConnected, smartWalletId]);

  return (
    <StockProvider>
      <div className="flex flex-col min-h-screen bg-decode-black">
        {/* Compact Header */}
        <div className="border-b border-decode-green/20 py-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <svg className="h-6 w-6 text-decode-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h1 className="text-2xl font-bold text-white">
                  <span className="bg-gradient-to-r from-primary-600 to-secondary-500 inline-block text-transparent bg-clip-text">Finance Portal</span>
                </h1>
              </div>

              {/* Wallet Status Indicator - Compact View */}
              <div className="flex space-x-2">
                {isConnected && (
                  <WalletConnection compact={true} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <section className="flex-grow py-6">
          <div className="container mx-auto px-4">

            {/* Connection Status Banner - Shows only when not connected or no smart wallet */}
            {(!isConnected || !smartWalletId) && (
              <div className={`mb-6 p-4 rounded-lg ${!isConnected
                ? 'bg-decode-blue/10 border border-decode-blue/30'
                : 'bg-decode-green/10 border border-decode-green/30'}`}>

                <div className="flex items-start md:items-center gap-4 flex-col md:flex-row">
                  <div className="flex-grow">
                    <h2 className="text-lg font-semibold text-white mb-1">
                      {!isConnected
                        ? 'Connect Your Wallet to Access Features'
                        : 'Create a Smart Wallet for Enhanced Security'}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      {!isConnected
                        ? 'Connect your Hedera wallet to manage your portfolio and access trading features.'
                        : 'Smart wallets provide social recovery, gasless transactions, and enhanced security.'}
                    </p>
                  </div>

                  {!isConnected && (
                    <button
                      onClick={() => setActiveTab('security')}
                      className="px-4 py-2 bg-decode-blue hover:bg-decode-blue/80 text-white rounded-md text-sm font-medium"
                    >
                      Connect Now
                    </button>
                  )}

                  {isConnected && !smartWalletId && (
                    <button
                      onClick={() => setActiveTab('security')}
                      className="px-4 py-2 bg-decode-green hover:bg-decode-green/80 text-white rounded-md text-sm font-medium"
                    >
                      Create Smart Wallet
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Tabs Navigation */}
            <div className="flex border-b border-decode-green/20 mb-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('portfolio')}
                className={`py-3 px-6 font-medium text-sm whitespace-nowrap ${activeTab === 'portfolio'
                    ? 'text-decode-green border-b-2 border-decode-green'
                    : 'text-gray-400 hover:text-gray-200'
                  }`}
              >
                PORTFOLIO & ASSETS
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`py-3 px-6 font-medium text-sm whitespace-nowrap ${activeTab === 'security'
                    ? 'text-decode-green border-b-2 border-decode-green'
                    : 'text-gray-400 hover:text-gray-200'
                  }`}
              >
                WALLET & SECURITY
              </button>
              <button
                onClick={() => setActiveTab('advanced')}
                className={`py-3 px-6 font-medium text-sm whitespace-nowrap ${activeTab === 'advanced'
                    ? 'text-decode-green border-b-2 border-decode-green'
                    : 'text-gray-400 hover:text-gray-200'
                  }`}
              >
                ADVANCED FEATURES
              </button>
            </div>

            {/* Tab Content */}
            <div className="py-4">
              {activeTab === 'portfolio' && (
                <div className="space-y-8">
                  {isConnected && smartWalletId ? (
                    <Portfolio />
                  ) : (
                    <div className="text-center py-16 bg-white/5 rounded-lg border border-white/10">
                      <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m-6-8h6M5 12a2 2 0 110-4h14a2 2 0 110 4H5zm0 8a2 2 0 110-4h14a2 2 0 110 4H5z" />
                      </svg>
                      <h3 className="text-xl font-bold text-white mb-2">Portfolio Not Available</h3>
                      <p className="text-gray-400 max-w-md mx-auto mb-6">
                        {!isConnected
                          ? 'Connect your wallet to view your portfolio and asset holdings.'
                          : 'Create a smart wallet to access your portfolio and manage your assets.'}
                      </p>
                      <button
                        onClick={() => setActiveTab('security')}
                        className="px-6 py-2 bg-decode-green hover:bg-decode-green/80 text-white rounded-md font-medium"
                      >
                        {!isConnected ? 'Connect Wallet' : 'Create Smart Wallet'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'security' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Wallet Connection Panel */}
                  <div className="lg:col-span-1 order-1">
                    <WalletConnection />
                  </div>

                  {/* Guardian Management */}
                  <div className="lg:col-span-2 order-2">
                    <GuardianManager />
                  </div>
                </div>
              )}

              {activeTab === 'advanced' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Account Abstraction Features Cards */}
                  <div className="decode-card p-6 rounded-lg border border-decode-green/20">
                    <div className="rounded-full bg-decode-green/10 w-12 h-12 flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-decode-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">
                      Social Recovery
                    </h3>
                    <p className="text-gray-400 mb-4">
                      Designate trusted guardians to help recover your wallet if you lose access to your keys.
                    </p>
                    <button
                      onClick={() => setActiveTab('security')}
                      className="text-decode-green hover:text-decode-green/80 text-sm font-medium"
                    >
                      Manage Guardians →
                    </button>
                  </div>

                  <div className="decode-card p-6 rounded-lg border border-decode-green/20">
                    <div className="rounded-full bg-decode-green/10 w-12 h-12 flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-decode-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">
                      Gasless Transactions
                    </h3>
                    <p className="text-gray-400 mb-4">
                      Execute transactions without worrying about gas fees. The platform can sponsor transactions on your behalf.
                    </p>
                    <div className="text-decode-green/50 text-sm">
                      Coming Soon
                    </div>
                  </div>

                  <div className="decode-card p-6 rounded-lg border border-decode-green/20">
                    <div className="rounded-full bg-decode-green/10 w-12 h-12 flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-decode-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">
                      Batched Transactions
                    </h3>
                    <p className="text-gray-400 mb-4">
                      Execute multiple transactions in a single operation, saving time and reducing costs.
                    </p>
                    <div className="text-decode-green/50 text-sm">
                      Coming Soon
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </StockProvider>
  );
} 
'use client';

import React, { useState } from 'react';
import { StockProvider } from '@/contexts/StockContext';
import { useWallet } from '@/contexts/WalletContext';
import BorrowLoanTab from '@/components/Lending/BorrowLoanTab';
import LendFundsTab from '@/components/Lending/LendFundsTab';
import MyLoansTab from '@/components/Lending/MyLoansTab';

const LendingPage = () => {
    const { isConnected, smartWalletId } = useWallet();
    const [activeTab, setActiveTab] = useState<'borrow' | 'lend' | 'myLoans'>('borrow');

    return (
      <StockProvider>
          <div className="flex flex-col min-h-screen bg-decode-black">
              {/* Compact Header */}
              <div className="border-b border-decode-green/20 py-4">
                  <div className="container mx-auto px-4">
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                          <div className="flex items-center gap-3">
                              <svg className="h-6 w-6 text-decode-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <h1 className="text-2xl font-bold text-white">
                                  <span className="bg-gradient-to-r from-primary-600 to-secondary-500 inline-block text-transparent bg-clip-text">P2P Lending Marketplace</span>
                              </h1>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Main Content */}
              <section className="flex-grow py-6">
                  <div className="container mx-auto px-4">

                      {/* Connection Status Banner */}
                      {!isConnected && (
                          <div className="mb-6 p-4 rounded-lg bg-decode-blue/10 border border-decode-blue/30">
                              <div className="flex items-start md:items-center gap-4 flex-col md:flex-row">
                                  <div className="flex-grow">
                                      <h2 className="text-lg font-semibold text-white mb-1">
                                          Connect Your Wallet to Access Lending Features
                                      </h2>
                                      <p className="text-gray-400 text-sm">
                                          Connect your Hedera wallet to borrow, lend, and manage loans using your stock tokens as collateral.
                                      </p>
                                  </div>

                                  <a
                                      href="/wallet"
                                      className="px-4 py-2 bg-decode-blue hover:bg-decode-blue/80 text-white rounded-md text-sm font-medium"
                                  >
                                      Connect Now
                                  </a>
                              </div>
                          </div>
                      )}

                      {/* How It Works */}
                      <div className="mb-6 p-6 rounded-lg bg-white/5 border border-white/10">
                          <h2 className="text-xl font-bold text-white mb-4">How P2P Lending Works</h2>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="bg-white/5 p-4 rounded-lg">
                                  <div className="flex items-center gap-3 mb-2">
                                      <div className="w-8 h-8 bg-decode-green/20 rounded-full flex items-center justify-center text-decode-green font-bold">
                                          1
                                      </div>
                                      <h3 className="text-white font-medium">Stake Collateral</h3>
                                  </div>
                                  <p className="text-gray-400 text-sm">
                                      Use your stock tokens as collateral to secure a loan in USDC, USDT, or other stablecoins.
                                  </p>
                              </div>

                              <div className="bg-white/5 p-4 rounded-lg">
                                  <div className="flex items-center gap-3 mb-2">
                                      <div className="w-8 h-8 bg-decode-green/20 rounded-full flex items-center justify-center text-decode-green font-bold">
                                          2
                                      </div>
                                      <h3 className="text-white font-medium">Get a Loan</h3>
                                  </div>
                                  <p className="text-gray-400 text-sm">
                                      Browse loan offers or create a request for funds. Negotiate terms with lenders.
                                  </p>
                              </div>

                              <div className="bg-white/5 p-4 rounded-lg">
                                  <div className="flex items-center gap-3 mb-2">
                                      <div className="w-8 h-8 bg-decode-green/20 rounded-full flex items-center justify-center text-decode-green font-bold">
                                          3
                                      </div>
                                      <h3 className="text-white font-medium">Repay & Reclaim</h3>
                                  </div>
                                  <p className="text-gray-400 text-sm">
                                      Repay your loan with interest to reclaim your collateral, or earn interest as a lender.
                                  </p>
                              </div>
                          </div>
                      </div>

                      {/* Tabs Navigation */}
                      <div className="flex border-b border-decode-green/20 mb-6 overflow-x-auto">
                          <button
                              onClick={() => setActiveTab('borrow')}
                              className={`py-3 px-6 font-medium text-sm whitespace-nowrap ${activeTab === 'borrow'
                                      ? 'text-decode-green border-b-2 border-decode-green'
                                      : 'text-gray-400 hover:text-gray-200'
                                  }`}
                          >
                              BORROW FUNDS
                          </button>
                          <button
                              onClick={() => setActiveTab('lend')}
                              className={`py-3 px-6 font-medium text-sm whitespace-nowrap ${activeTab === 'lend'
                                      ? 'text-decode-green border-b-2 border-decode-green'
                                      : 'text-gray-400 hover:text-gray-200'
                                  }`}
                          >
                              LEND FUNDS
                          </button>
                          <button
                              onClick={() => setActiveTab('myLoans')}
                              className={`py-3 px-6 font-medium text-sm whitespace-nowrap ${activeTab === 'myLoans'
                                      ? 'text-decode-green border-b-2 border-decode-green'
                                      : 'text-gray-400 hover:text-gray-200'
                                  }`}
                          >
                              MY LOANS
                          </button>
                      </div>

                      {/* Tab Content */}
                      <div className="py-4">
                          {isConnected ? (
                              <>
                                  {activeTab === 'borrow' && <BorrowLoanTab />}
                                  {activeTab === 'lend' && <LendFundsTab />}
                                  {activeTab === 'myLoans' && <MyLoansTab />}
                              </>
                          ) : (
                              <div className="text-center py-16">
                                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-decode-green/10 flex items-center justify-center">
                                      <svg className="w-8 h-8 text-decode-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                      </svg>
                                  </div>
                                  <h3 className="text-xl font-bold text-white mb-2">Wallet Connection Required</h3>
                                  <p className="text-gray-400 max-w-md mx-auto mb-6">
                                      Please connect your wallet to access the P2P lending marketplace features.
                                  </p>
                                  <a
                                      href="/wallet"
                                      className="px-6 py-2 bg-decode-green hover:bg-decode-green/80 text-white rounded-md font-medium"
                                  >
                                      Go to Wallet Page
                                  </a>
                              </div>
                          )}
                      </div>
                  </div>
              </section>

              {/* Educational Section */}
              <section className="py-12 border-t border-decode-green/20">
                  <div className="container mx-auto px-4">
                      <h2 className="text-2xl font-bold text-white mb-8 text-center">Benefits of P2P Lending</h2>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          <div className="decode-card p-6 rounded-lg border border-decode-green/20">
                              <div className="rounded-full bg-decode-green/10 w-12 h-12 flex items-center justify-center mb-4">
                                  <svg className="w-6 h-6 text-decode-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                              </div>
                              <h3 className="text-xl font-semibold text-white mb-3">
                                  Liquidity Without Selling
                              </h3>
                              <p className="text-gray-400">
                                  Access cash without having to sell your stock tokens, keeping your long-term investments intact.
                              </p>
                          </div>

                          <div className="decode-card p-6 rounded-lg border border-decode-green/20">
                              <div className="rounded-full bg-decode-green/10 w-12 h-12 flex items-center justify-center mb-4">
                                  <svg className="w-6 h-6 text-decode-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                  </svg>
                              </div>
                              <h3 className="text-xl font-semibold text-white mb-3">
                                  Secure Collateral
                              </h3>
                              <p className="text-gray-400">
                                  Smart contracts automatically handle collateral, ensuring security for both borrowers and lenders.
                              </p>
                          </div>

                          <div className="decode-card p-6 rounded-lg border border-decode-green/20">
                              <div className="rounded-full bg-decode-green/10 w-12 h-12 flex items-center justify-center mb-4">
                                  <svg className="w-6 h-6 text-decode-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                  </svg>
                              </div>
                              <h3 className="text-xl font-semibold text-white mb-3">
                                  Competitive Rates
                              </h3>
                              <p className="text-gray-400">
                                  Negotiate directly with peers for better interest rates than traditional financial institutions.
                              </p>
                          </div>

                          <div className="decode-card p-6 rounded-lg border border-decode-green/20">
                              <div className="rounded-full bg-decode-green/10 w-12 h-12 flex items-center justify-center mb-4">
                                  <svg className="w-6 h-6 text-decode-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                  </svg>
                              </div>
                              <h3 className="text-xl font-semibold text-white mb-3">
                                  Flexible Terms
                              </h3>
                              <p className="text-gray-400">
                                  Choose from various loan durations and terms that fit your specific financial needs.
                              </p>
                          </div>
                      </div>
                  </div>
              </section>
          </div>
      </StockProvider>
  );
};

export default LendingPage; 
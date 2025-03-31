'use client';

import React from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useWallet } from '@/contexts/WalletContext';

export default function AboutPage() {
  const { data: session, status } = useSession();
  const { isConnected, smartWalletId } = useWallet();
  const isAuthenticated = status === 'authenticated';

  const handleSignIn = (e: React.MouseEvent) => {
    e.preventDefault();
    signIn('google');
  };

  return (
    <div className="min-h-screen bg-decode-black text-decode-white">
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4 relative overflow-hidden">
        <div className="container mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="decode-gradient bg-clip-text text-transparent">African Stocks</span>,
                <br />Meet Blockchain.
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-8">
                Tajiri revolutionizes stock trading on the Nairobi Securities Exchange (NSE) by tokenizing stocks on the Hedera blockchain.
              </p>

              {!isAuthenticated ? (
                <button
                  className="bg-decode-green hover:bg-decode-green/80 text-white py-3 px-6 rounded-lg font-medium transition duration-300"
                  onClick={handleSignIn}
                >
                  Sign In to Get Started
                </button>
              ) : (
                <div className="bg-decode-green/10 border border-decode-green/30 rounded-lg p-4 text-sm">
                  <p className="text-decode-green">You're signed in and ready to go!</p>
                  {smartWalletId && <p className="text-gray-300 mt-2">Your wallet is set up and good to go.</p>}
                </div>
              )}
            </div>

            <div className="relative">
              <div className="bg-gradient-to-r from-decode-blue/30 to-decode-green/30 rounded-lg p-1">
                <div className="bg-decode-black rounded-lg p-6">
                  <img
                    src="/assets/images/trading-platform.png"
                    alt="Tajiri Trading Platform"
                    className="rounded-lg shadow-lg"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "https://via.placeholder.com/600x400?text=Tajiri+Trading";
                    }}
                  />
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-decode-blue/20 blur-3xl rounded-full"></div>
              <div className="absolute -top-6 -left-6 w-40 h-40 bg-decode-green/20 blur-3xl rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="absolute top-0 left-0 right-0 h-full bg-gradient-radial from-decode-blue/10 to-transparent opacity-40"></div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-decode-black/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">
            <span className="decode-gradient bg-clip-text text-transparent">Features</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-decode-green/5 border border-decode-green/20 rounded-lg p-6 hover:bg-decode-green/10 transition duration-300">
              <div className="w-12 h-12 bg-decode-green/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-decode-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-decode-white">Tokenized NSE Stocks</h3>
              <p className="text-gray-400">
                Own fractional shares of Nairobi Securities Exchange stocks through blockchain tokens.
              </p>
            </div>

            <div className="bg-decode-green/5 border border-decode-green/20 rounded-lg p-6 hover:bg-decode-green/10 transition duration-300">
              <div className="w-12 h-12 bg-decode-green/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-decode-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-decode-white">Smart Wallets</h3>
              <p className="text-gray-400">
                Securely store and manage your assets with smart wallets featuring social recovery.
              </p>
            </div>

            <div className="bg-decode-green/5 border border-decode-green/20 rounded-lg p-6 hover:bg-decode-green/10 transition duration-300">
              <div className="w-12 h-12 bg-decode-green/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-decode-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-decode-white">P2P Trading</h3>
              <p className="text-gray-400">
                Trade directly with other users through our secure peer-to-peer marketplace.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">
            <span className="decode-gradient bg-clip-text text-transparent">How It Works</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-decode-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-decode-green text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-decode-white">Sign Up</h3>
              <p className="text-gray-400">
                Create an account with just your email and get access to your smart wallet.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-decode-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-decode-green text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-decode-white">Add Funds</h3>
              <p className="text-gray-400">
                Fund your account with HBAR or stablecoins to start trading stocks.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-decode-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-decode-green text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-decode-white">Trade & Earn</h3>
              <p className="text-gray-400">
                Buy and sell tokenized stocks, or trade with other users in the P2P marketplace.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 
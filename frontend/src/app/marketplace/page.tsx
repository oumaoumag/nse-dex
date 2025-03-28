'use client';

import React from 'react';
import MarketplaceItem from '@/components/MarketplaceItem';
import { useWallet } from '@/contexts/WalletContext';

export default function MarketplacePage() {
  const { isConnected, smartWalletId } = useWallet();

  // Mock data for marketplace items - in a real app, this would come from an API
  const stockItems = [
    {
      id: "0.0.1234567",
      name: "Safaricom PLC",
      symbol: "SCOM",
      price: 24.75,
      change: 2.5,
      image: "https://seeklogo.com/images/S/safaricom-logo-6FA31107D7-seeklogo.com.png",
    },
    {
      id: "0.0.1234568",
      name: "Equity Group",
      symbol: "EQTY",
      price: 38.20,
      change: -0.8,
      image: "https://www.equitygroupholdings.com/wp-content/uploads/2019/10/equity-group-holdings.jpg",
    },
    {
      id: "0.0.1234569",
      name: "Kenya Airways",
      symbol: "KQ",
      price: 12.45,
      change: 1.2,
      image: "https://logos-download.com/wp-content/uploads/2016/03/Kenya_Airways_logo_logotype_emblem.png",
    },
    {
      id: "0.0.1234570",
      name: "East African Breweries",
      symbol: "EABL",
      price: 145.60,
      change: 0.5,
      image: "https://www.eabl.com/sites/eabl_ke/files/2020-01/EABL_Logo.jpg",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary-50 via-primary-100 to-white dark:from-primary-950 dark:via-primary-900 dark:to-primary-950 py-12 md:py-20 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-secondary-400 opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 -left-24 w-80 h-80 bg-primary-400 opacity-10 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative">
          <h1 className="text-3xl md:text-4xl font-bold text-primary-900 dark:text-white mb-4">
            Tokenized Stock <span className="bg-gradient-to-r from-primary-600 to-secondary-500 inline-block text-transparent bg-clip-text">Marketplace</span>
          </h1>
          <p className="text-lg text-primary-700 dark:text-primary-300 max-w-2xl mb-6">
            Trade tokenized stocks from the Nairobi Securities Exchange with the security and efficiency of Hedera's blockchain.
          </p>
          
          {isConnected && smartWalletId ? (
            <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 p-4 rounded-lg mb-6 max-w-md">
              <p className="font-medium">✓ Account Abstraction Enabled</p>
              <p className="text-sm">You're using a smart contract wallet that handles gas fees and simplifies transactions.</p>
            </div>
          ) : isConnected ? (
            <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 p-4 rounded-lg mb-6 max-w-md">
              <p className="font-medium">⚠️ Create a Smart Wallet</p>
              <p className="text-sm">Connect your wallet and create a smart wallet to enable account abstraction for seamless trading.</p>
            </div>
          ) : (
            <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 p-4 rounded-lg mb-6 max-w-md">
              <p className="font-medium">ℹ️ Connect Your Wallet</p>
              <p className="text-sm">Connect your wallet to start trading with the benefits of account abstraction.</p>
            </div>
          )}
        </div>
      </section>

      {/* Marketplace Grid */}
      <section className="py-16 bg-white dark:bg-primary-950">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stockItems.map((item) => (
              <MarketplaceItem
                key={item.id}
                id={item.id}
                name={item.name}
                symbol={item.symbol}
                price={item.price}
                change={item.change}
                image={item.image}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* Account Abstraction Benefits Section */}
      <section className="py-16 bg-primary-50 dark:bg-primary-900">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-900 dark:text-white mb-10 text-center">
            Benefits of Account Abstraction
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-primary-800 p-6 rounded-xl shadow-md">
              <div className="rounded-full bg-primary-100 dark:bg-primary-700 w-12 h-12 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600 dark:text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary-900 dark:text-white mb-3">
                Gas Fee Optimization
              </h3>
              <p className="text-primary-600 dark:text-primary-400">
                The platform can pay for transaction fees on your behalf, eliminating the need for you to hold HBAR just for gas.
              </p>
            </div>
            
            <div className="bg-white dark:bg-primary-800 p-6 rounded-xl shadow-md">
              <div className="rounded-full bg-primary-100 dark:bg-primary-700 w-12 h-12 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600 dark:text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary-900 dark:text-white mb-3">
                Enhanced Security
              </h3>
              <p className="text-primary-600 dark:text-primary-400">
                Social recovery options protect your assets if you lose access to your account. Guardians can help recover your wallet.
              </p>
            </div>
            
            <div className="bg-white dark:bg-primary-800 p-6 rounded-xl shadow-md">
              <div className="rounded-full bg-primary-100 dark:bg-primary-700 w-12 h-12 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary-600 dark:text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary-900 dark:text-white mb-3">
                Simplified Experience
              </h3>
              <p className="text-primary-600 dark:text-primary-400">
                No need to understand blockchain complexities. Trade stocks just like you would on traditional platforms.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 
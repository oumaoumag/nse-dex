'use client';

import React, { useState, useEffect } from 'react';
import { useStock } from '../contexts/StockContext';
import { Stock } from '@/types/stock';
import StockMintRedeem from './StockTokens/StockMintRedeem';
import Link from 'next/link';

const StockMarketplace: React.FC = () => {
  const { stocks, isLoading, error, exchangeRate } = useStock();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortOption, setSortOption] = useState<'name' | 'priceAsc' | 'priceDesc'>('name');

  // Apply search filter and sorting
  const filteredStocks = stocks
    .filter(stock =>
      stock.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.longName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortOption) {
        case 'name':
          return a.shortName.localeCompare(b.shortName);
        case 'priceAsc':
          return a.priceHbar - b.priceHbar;
        case 'priceDesc':
          return b.priceHbar - a.priceHbar;
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      {/* Stock Minting & Redemption */}
      <StockMintRedeem />

      {/* Stock Marketplace */}
      <div className="bg-white dark:bg-primary-900 rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          {/* Market Stats Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-primary-50 dark:bg-primary-800/50 p-3 rounded-lg">
              <p className="text-xs text-primary-500 dark:text-primary-400">NSE Stocks Available</p>
              <p className="text-xl font-bold text-primary-900 dark:text-white">{stocks.length}</p>
            </div>
            <div className="bg-primary-50 dark:bg-primary-800/50 p-3 rounded-lg">
              <p className="text-xs text-primary-500 dark:text-primary-400">HBAR Exchange Rate</p>
              <p className="text-xl font-bold text-primary-900 dark:text-white">${exchangeRate.toFixed(4)}</p>
            </div>
            <div className="bg-primary-50 dark:bg-primary-800/50 p-3 rounded-lg">
              <p className="text-xs text-primary-500 dark:text-primary-400">Trading Volume (24h)</p>
              <p className="text-xl font-bold text-primary-900 dark:text-white">8,452 HBAR</p>
            </div>
            <div className="bg-primary-50 dark:bg-primary-800/50 p-3 rounded-lg">
              <p className="text-xs text-primary-500 dark:text-primary-400">Active Traders</p>
              <p className="text-xl font-bold text-primary-900 dark:text-white">124</p>
            </div>
          </div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary-900 dark:text-white">Stock Marketplace</h2>
            <div className="flex space-x-2">
              <Link 
                href="/trading" 
                className="px-3 py-1.5 bg-secondary-600 hover:bg-secondary-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                Advanced Trading
              </Link>
              <Link 
                href="/market/watchlist" 
                className="px-3 py-1.5 border border-secondary-500 text-secondary-600 dark:text-secondary-400 text-sm font-medium rounded-md hover:bg-secondary-50 dark:hover:bg-secondary-900/20 transition-colors"
              >
                My Watchlist
              </Link>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md">
              {error}
            </div>
          )}

          {/* Search and Filter */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex-1 min-w-[200px] relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-primary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search stocks by name or symbol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-md border border-primary-300 dark:border-primary-700 bg-white dark:bg-primary-800 
                pl-10 pr-4 py-2 text-sm text-primary-900 dark:text-white shadow-sm focus:outline-none focus:ring-1 focus:ring-secondary-500"
              />
            </div>
            <div className="flex space-x-2">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as 'name' | 'priceAsc' | 'priceDesc')}
                className="rounded-md border border-primary-300 dark:border-primary-700 bg-white dark:bg-primary-800 
                px-3 py-2 text-sm text-primary-900 dark:text-white shadow-sm focus:outline-none focus:ring-1 focus:ring-secondary-500"
              >
                <option value="name">Sort by Name</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              {/* Stock List */}
              {filteredStocks.length === 0 ? (
                <div className="text-center py-16 text-primary-500 dark:text-primary-400">
                  <svg className="mx-auto h-12 w-12 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-4 text-lg">No stocks found matching your search.</p>
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="mt-4 px-4 py-2 text-sm font-medium text-white bg-secondary-600 rounded-md hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-primary-200 dark:divide-primary-700">
                        <thead className="bg-primary-50 dark:bg-primary-800">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 dark:text-primary-400 uppercase tracking-wider">Stock</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 dark:text-primary-400 uppercase tracking-wider">Token Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 dark:text-primary-400 uppercase tracking-wider">USD Value</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 dark:text-primary-400 uppercase tracking-wider">Token Type</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-primary-500 dark:text-primary-400 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-primary-900 divide-y divide-primary-200 dark:divide-primary-800">
                          {filteredStocks.map((stock) => (
                            <tr key={stock.id} className="hover:bg-primary-50 dark:hover:bg-primary-800/40">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-8 w-8 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center text-xs font-medium text-primary-800 dark:text-primary-200">
                                    {stock.shortName.substring(0, 2)}
                                  </div>
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-primary-900 dark:text-white">
                                      {stock.shortName}
                                </div>
                                <div className="text-xs text-primary-500 dark:text-primary-400">
                                  {stock.longName}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-900 dark:text-white">
                            {stock.priceHbar.toFixed(6)} HBAR
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-900 dark:text-white">
                            ${(stock.priceHbar * exchangeRate).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${stock.isHederaToken
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                              }`}>
                              {stock.isHederaToken ? 'Hedera Token Service' : 'ERC20 Token'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button className="text-secondary-600 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-secondary-300">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                              </button>
                              <button className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                        </tbody>
                      </table>
                    </div>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockMarketplace;

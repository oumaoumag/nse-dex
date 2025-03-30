'use client';

import React, { useState, useEffect } from 'react';
import { useStock } from '../contexts/StockContext';
import { Stock } from '@/types/stock';
import { useWallet } from '../contexts/WalletContext';
import StockMintRedeem from './StockTokens/StockMintRedeem';

const StockMarketplace: React.FC = () => {
  const { stocks, isLoading, error, exchangeRate } = useStock();
  const { isConnected } = useWallet();
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
          <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-6">Stock Marketplace</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md">
              {error}
            </div>
          )}

          {/* Search and Filter */}
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search stocks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-md border border-primary-300 dark:border-primary-700 bg-white dark:bg-primary-800 
                px-3 py-2 text-sm text-primary-900 dark:text-white shadow-sm focus:outline-none focus:ring-1 focus:ring-secondary-500"
              />
            </div>
            <div>
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
                <div className="text-center py-8 text-primary-500 dark:text-primary-400">
                  No stocks found matching your search.
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
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-primary-900 divide-y divide-primary-200 dark:divide-primary-800">
                          {filteredStocks.map((stock) => (
                            <tr key={stock.id} className="hover:bg-primary-50 dark:hover:bg-primary-800/40">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="ml-2">
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

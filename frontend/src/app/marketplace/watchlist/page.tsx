'use client';

import React, { useState, useEffect } from 'react';
import { useStock } from '@/contexts/StockContext';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Stock } from '@/types/stock';

export default function MarketplaceWatchlistPage() {
    const { stocks, isLoading: stocksLoading, exchangeRate } = useStock();
    const [isLoading, setIsLoading] = useState(true);
    const [watchlistStocks, setWatchlistStocks] = useState<Stock[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState<'name' | 'priceAsc' | 'priceDesc'>('name');

    // Initialize watchlist data
    useEffect(() => {
        if (!stocksLoading && stocks.length > 0) {
            // Mock watchlist - in a real app, this would come from a database or localStorage
            // For now, let's select a few stocks to simulate a user's watchlist
            const mockWatchlistIds = ['saf-001', 'eqty-002', 'kcb-003', 'eabl-004'];
            const watchlist = stocks.filter(stock => mockWatchlistIds.includes(stock.id));
            setWatchlistStocks(watchlist);
            setIsLoading(false);
        }
    }, [stocks, stocksLoading]);

    // Filter watchlist based on search term
    const filteredWatchlist = watchlistStocks
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

    const handleRemoveFromWatchlist = (stockId: string) => {
        setWatchlistStocks(prev => prev.filter(stock => stock.id !== stockId));
        toast.success('Stock removed from watchlist');
    };

    const handleAddToWatchlist = (stockId: string) => {
        const stockToAdd = stocks.find(stock => stock.id === stockId);
        if (stockToAdd && !watchlistStocks.some(s => s.id === stockId)) {
            setWatchlistStocks(prev => [...prev, stockToAdd]);
            toast.success('Stock added to watchlist');
        }
    };

    if (isLoading || stocksLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-primary-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-decode-black">
            <div className="max-w-6xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl md:text-4xl font-bold text-white">
                        <span className="bg-gradient-to-r from-primary-600 to-secondary-500 inline-block text-transparent bg-clip-text">Marketplace</span> Watchlist
                    </h1>
                    <Link
                        href="/marketplace"
                        className="px-4 py-2 bg-secondary-600 hover:bg-secondary-700 text-white rounded-md transition-colors"
                    >
                        Back to Marketplace
                    </Link>
                </div>

                {/* Search and Filter */}
                <div className="bg-white dark:bg-primary-900 rounded-xl shadow-md overflow-hidden p-6 mb-8">
                    <div className="flex flex-wrap gap-3 mb-4">
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

                    <div className="text-sm text-primary-500 dark:text-primary-400">
                        <p>{watchlistStocks.length} stocks in your watchlist</p>
                    </div>
                </div>

                {/* Watchlist Stocks */}
                {filteredWatchlist.length === 0 ? (
                    <div className="bg-white dark:bg-primary-900 rounded-xl shadow-md p-10 text-center">
                        <svg className="mx-auto h-12 w-12 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="mt-4 text-lg text-primary-500 dark:text-primary-400">
                            {searchTerm ? 'No stocks match your search criteria.' : 'Your watchlist is empty.'}
                        </p>
                        <Link
                            href="/marketplace"
                            className="mt-6 inline-block px-4 py-2 bg-secondary-600 hover:bg-secondary-700 text-white text-sm rounded-md transition-colors"
                        >
                            Browse Marketplace
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-primary-900 rounded-xl shadow-md overflow-hidden mb-8">
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
                                    {filteredWatchlist.map((stock) => (
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
                                                <button
                                                    onClick={() => handleRemoveFromWatchlist(stock.id)}
                                                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Recommended Stocks */}
                <div className="mt-10">
                    <h2 className="text-2xl font-bold text-white mb-4">
                        Recommended <span className="bg-gradient-to-r from-primary-600 to-secondary-500 inline-block text-transparent bg-clip-text">Tokens</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {stocks
                            .filter(stock => !watchlistStocks.some(s => s.id === stock.id))
                            .slice(0, 6)
                            .map(stock => (
                                <div key={stock.id} className="bg-white dark:bg-primary-900 rounded-xl shadow-md p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center text-sm font-medium text-primary-800 dark:text-primary-200">
                                                {stock.shortName.substring(0, 2)}
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-sm font-medium text-primary-900 dark:text-white">{stock.shortName}</div>
                                                <div className="text-xs text-primary-500 dark:text-primary-400">{stock.longName}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-primary-900 dark:text-white">
                                                ${(stock.priceHbar * exchangeRate).toFixed(2)}
                                            </div>
                                            <div className="text-xs text-primary-500 dark:text-primary-400">
                                                {stock.priceHbar.toFixed(6)} HBAR
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex justify-between items-center">
                                        <span className={`px-2 py-1 text-xs rounded-full ${stock.isHederaToken
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                            }`}>
                                            {stock.isHederaToken ? 'HTS' : 'ERC20'}
                                        </span>
                                        <button
                                            onClick={() => handleAddToWatchlist(stock.id)}
                                            className="text-sm px-3 py-1 bg-secondary-600 hover:bg-secondary-700 text-white rounded-md transition-colors"
                                        >
                                            Add to Watchlist
                                        </button>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    );
} 
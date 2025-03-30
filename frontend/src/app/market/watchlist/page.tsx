'use client';

import React, { useState, useEffect } from 'react';
import { useStock } from '@/contexts/StockContext';
import { initializeStockData, Stock } from '@/data/nseStockData';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function WatchlistPage() {
    const { exchangeRate } = useStock();
    const [isLoading, setIsLoading] = useState(true);
    const [allStocks, setAllStocks] = useState<Stock[]>([]);
    const [watchlistStocks, setWatchlistStocks] = useState<Stock[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Initialize stock data
    useEffect(() => {
        const stocks = initializeStockData();
        setAllStocks(stocks);

        // Mock watchlist - in a real app, this would come from a database or localStorage
        // For now, let's select a few stocks to simulate a user's watchlist
        const mockWatchlistIds = ['saf-001', 'eqty-002', 'kcb-003', 'eabl-004', 'coop-006'];
        const watchlist = stocks.filter(stock => mockWatchlistIds.includes(stock.id));
        setWatchlistStocks(watchlist);

        setIsLoading(false);
    }, []);

    // Filter watchlist based on search term
    const filteredWatchlist = watchlistStocks.filter(stock =>
        stock.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.longName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.sector.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRemoveFromWatchlist = (stockId: string) => {
        setWatchlistStocks(prev => prev.filter(stock => stock.id !== stockId));
        toast.success('Stock removed from watchlist');
    };

    const handleAddToWatchlist = (stockId: string) => {
        const stockToAdd = allStocks.find(stock => stock.id === stockId);
        if (stockToAdd && !watchlistStocks.some(s => s.id === stockId)) {
            setWatchlistStocks(prev => [...prev, stockToAdd]);
            toast.success('Stock added to watchlist');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-decode-green"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-6xl mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl md:text-4xl font-bold text-primary-900 dark:text-white">
                        My <span className="bg-gradient-to-r from-decode-green to-blue-400 inline-block text-transparent bg-clip-text">Watchlist</span>
                    </h1>
                    <Link
                        href="/market"
                        className="px-4 py-2 bg-decode-green hover:bg-decode-green/90 text-black rounded-md transition-colors"
                    >
                        Back to Market
                    </Link>
                </div>

                <div className="mb-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                            </svg>
                        </div>
                        <input
                            type="search"
                            id="stock-search"
                            className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-decode-green focus:border-decode-green dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-decode-green dark:focus:border-decode-green"
                            placeholder="Search for stocks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {filteredWatchlist.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
                        <p className="text-lg text-gray-600 dark:text-gray-300">
                            {searchTerm ? 'No stocks match your search criteria.' : 'Your watchlist is empty.'}
                        </p>
                        <Link
                            href="/market"
                            className="mt-4 inline-block px-4 py-2 bg-decode-green hover:bg-decode-green/90 text-black rounded-md transition-colors"
                        >
                            Explore Stocks
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stock</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Price</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">24h Change</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Market Cap</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                    {filteredWatchlist.map(stock => (
                                        <tr key={stock.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{stock.shortName}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{stock.longName}</div>
                                                    <div className="text-xs text-gray-400 dark:text-gray-500">{stock.sector}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    ${(stock.priceHbar * exchangeRate).toFixed(2)}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {stock.priceHbar.toFixed(2)} ℏ
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`text-sm font-semibold ${stock.change24h > 0 ? 'text-green-500' :
                                                        stock.change24h < 0 ? 'text-red-500' :
                                                            'text-gray-500'
                                                    }`}>
                                                    {stock.change24h > 0 ? '+' : ''}{stock.change24h.toFixed(2)}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 dark:text-white">
                                                    ${(stock.marketCap / 1e9).toFixed(2)}B
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
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

                {/* Stocks to Add Section */}
                <div className="mt-10">
                    <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-4">
                        Recommended Stocks
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {allStocks
                            .filter(stock => !watchlistStocks.some(s => s.id === stock.id))
                            .slice(0, 6)
                            .map(stock => (
                                <div key={stock.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{stock.shortName}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{stock.longName}</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{stock.sector}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-medium text-gray-900 dark:text-white">
                                                ${(stock.priceHbar * exchangeRate).toFixed(2)}
                                            </p>
                                            <p className={`text-sm font-medium ${stock.change24h > 0 ? 'text-green-500' :
                                                    stock.change24h < 0 ? 'text-red-500' :
                                                        'text-gray-500'
                                                }`}>
                                                {stock.change24h > 0 ? '+' : ''}{stock.change24h.toFixed(2)}%
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleAddToWatchlist(stock.id)}
                                        className="mt-4 w-full py-2 bg-decode-green hover:bg-decode-green/90 text-black rounded-md transition-colors"
                                    >
                                        Add to Watchlist
                                    </button>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    );
} 
'use client';

import React, { useState, useEffect } from 'react';
import { useStock } from '@/contexts/StockContext';
import { useWallet } from '@/contexts/WalletContext';
import { Stock } from '@/types/stock';

export default function StockDataDisplay() {
    const { stocks, fetchStocks, exchangeRate, userBalances, error: stockError } = useStock();
    const { isConnected, accountId, error: walletError } = useWallet();
    const [isLoading, setIsLoading] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Initial fetch
        const initialize = async () => {
            setIsLoading(true);
            await fetchStocks();
            setIsLoading(false);
        };

        initialize();

        // Set up refresh interval (every 60 seconds)
        const interval = setInterval(() => {
            fetchStocks();
        }, 60000);

        setRefreshInterval(interval);

        // Cleanup on unmount
        return () => {
            if (refreshInterval) clearInterval(refreshInterval);
        };
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Show connection status indicator
    const renderConnectionStatus = () => {
        if (walletError || stockError) {
            return (
                <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded-lg">
                    <h3 className="font-medium text-red-800 dark:text-red-400">Connection Issues</h3>
                    <p className="text-sm text-red-700 dark:text-red-400">
                        Using simulated data. Wallet or network connection issues detected.
                    </p>
                </div>
            );
        }

        if (!isConnected) {
            return (
                <div className="mb-6 p-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-800 rounded-lg">
                    <h3 className="font-medium text-yellow-800 dark:text-yellow-400">Wallet Not Connected</h3>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                        Connect your wallet to access full platform features.
                    </p>
                </div>
            );
        }

        return (
            <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800 rounded-lg">
                <h3 className="font-medium text-green-800 dark:text-green-400">Connected</h3>
                <p className="text-sm text-green-700 dark:text-green-400">
                    {accountId ? `Account ID: ${accountId}` : 'Wallet connected to platform'}
                </p>
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl md:text-4xl font-bold text-primary-900 dark:text-white mb-6">
                Sample <span className="bg-gradient-to-r from-primary-600 to-secondary-500 inline-block text-transparent bg-clip-text">Stocks</span>
            </h1>

            {renderConnectionStatus()}

            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Symbol
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Price (USD)
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Price (HBAR)
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Your Balance
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {stocks.map((stock) => (
                                <tr key={stock.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                                        {stock.shortName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                        {stock.longName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                        ${(stock.priceHbar * (exchangeRate || 0.66)).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                        {stock.priceHbar.toFixed(2)} ℏ
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                        {userBalances?.[stock.id] ? parseFloat(userBalances[stock.id]).toFixed(2) : '0.00'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={!isConnected}>
                                            Buy
                                        </button>
                                        <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={!isConnected || !userBalances?.[stock.id] || parseFloat(userBalances[stock.id]) <= 0}>
                                            Sell
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                <p>Note: This is a demo using simulated stock data. The stock prices refresh every minute.</p>
                {!isConnected && (
                    <p className="mt-2">Connect your wallet to enable trading features.</p>
                )}
            </div>
        </div>
    );
} 
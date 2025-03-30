'use client';

import React, { useState } from 'react';
import { useStock } from '@/contexts/StockContext';
import { useWallet } from '@/contexts/WalletContext';
import { Stock } from '@/types/stock';
import MintWithStablecoin from './MintWithStablecoin';

const StockMintRedeem: React.FC = () => {
    const {
        stocks,
        isLoading,
        error,
        mintStock,
        redeemStock,
        exchangeRate
    } = useStock();

    const { isConnected, smartWalletId, balance } = useWallet();

    // UI state
    const [activeTab, setActiveTab] = useState<'mint-hbar' | 'mint-stablecoin' | 'redeem'>('mint-hbar');

    // Form state
    const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
    const [hbarAmount, setHbarAmount] = useState<number>(1);
    const [tokenAmount, setTokenAmount] = useState<number>(1);
    const [transactionStatus, setTransactionStatus] = useState<string | null>(null);
    const [processing, setProcessing] = useState<boolean>(false);

    // Calculate stock tokens to mint based on HBAR input
    const calculateStockTokens = (): number => {
        if (!selectedStock || !hbarAmount) return 0;
        return hbarAmount / selectedStock.priceHbar;
    };

    // Calculate HBAR to receive when redeeming tokens
    const calculateHbarForRedemption = (): number => {
        if (!selectedStock || !tokenAmount) return 0;
        return tokenAmount * selectedStock.priceHbar;
    };

    // Handle stock minting with HBAR
    const handleMintStock = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isConnected || !smartWalletId) {
            setTransactionStatus('Please connect your wallet first');
            return;
        }

        if (!selectedStock) {
            setTransactionStatus('Please select a stock to mint');
            return;
        }

        // Check if user has sufficient HBAR balance
        if (parseFloat(balance || '0') < hbarAmount) {
            setTransactionStatus('Insufficient HBAR balance');
            return;
        }

        setProcessing(true);
        setTransactionStatus('Processing transaction...');

        try {
            const success = await mintStock(selectedStock.id, hbarAmount);

            if (success) {
                setTransactionStatus(`Successfully minted ${calculateStockTokens().toFixed(2)} ${selectedStock.shortName} tokens`);
                // Reset amount after successful transaction
                setHbarAmount(1);
            } else {
                setTransactionStatus('Transaction failed. Please try again.');
            }
        } catch (error: any) {
            setTransactionStatus(`Error: ${error.message}`);
            console.error('Mint stock error:', error);
        } finally {
            setProcessing(false);

            // Clear status after delay
            setTimeout(() => {
                setTransactionStatus(null);
            }, 5000);
        }
    };

    // Handle stock redemption
    const handleRedeemStock = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isConnected || !smartWalletId) {
            setTransactionStatus('Please connect your wallet first');
            return;
        }

        if (!selectedStock) {
            setTransactionStatus('Please select a stock to redeem');
            return;
        }

        setProcessing(true);
        setTransactionStatus('Processing transaction...');

        try {
            const success = await redeemStock(selectedStock.id, tokenAmount);

            if (success) {
                setTransactionStatus(`Successfully redeemed ${tokenAmount} ${selectedStock.shortName} tokens for ${calculateHbarForRedemption().toFixed(6)} HBAR`);
                // Reset amount after successful transaction
                setTokenAmount(1);
            } else {
                setTransactionStatus('Transaction failed. Please try again.');
            }
        } catch (error: any) {
            setTransactionStatus(`Error: ${error.message}`);
            console.error('Redeem stock error:', error);
        } finally {
            setProcessing(false);

            // Clear status after delay
            setTimeout(() => {
                setTransactionStatus(null);
            }, 5000);
        }
    };

    return (
        <div className="bg-white dark:bg-primary-900 rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
                <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-6">
                    Stock Tokens
                </h2>

                {/* Error message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md">
                        {error}
                    </div>
                )}

                {/* Transaction status */}
                {transactionStatus && (
                    <div
                        className={`mb-4 p-3 rounded-md ${transactionStatus.includes('Error') || transactionStatus.includes('failed')
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            }`}
                    >
                        {transactionStatus}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex mb-6 border-b border-primary-200 dark:border-primary-700">
                    <button
                        className={`px-4 py-2 font-medium text-sm ${activeTab === 'mint-hbar'
                            ? 'text-secondary-600 border-b-2 border-secondary-600'
                            : 'text-primary-600 dark:text-primary-400 hover:text-secondary-500 dark:hover:text-secondary-400'
                            }`}
                        onClick={() => setActiveTab('mint-hbar')}
                    >
                        Mint with HBAR
                    </button>
                    <button
                        className={`px-4 py-2 font-medium text-sm ${activeTab === 'mint-stablecoin'
                            ? 'text-secondary-600 border-b-2 border-secondary-600'
                            : 'text-primary-600 dark:text-primary-400 hover:text-secondary-500 dark:hover:text-secondary-400'
                            }`}
                        onClick={() => setActiveTab('mint-stablecoin')}
                    >
                        Mint with Stablecoin
                    </button>
                    <button
                        className={`px-4 py-2 font-medium text-sm ${activeTab === 'redeem'
                            ? 'text-secondary-600 border-b-2 border-secondary-600'
                            : 'text-primary-600 dark:text-primary-400 hover:text-secondary-500 dark:hover:text-secondary-400'
                            }`}
                        onClick={() => setActiveTab('redeem')}
                    >
                        Redeem Tokens
                    </button>
                </div>

                {/* Content based on active tab */}
                {activeTab === 'mint-hbar' && (
                    <form onSubmit={handleMintStock} className="space-y-4 max-w-md mx-auto">
                        {/* Stock Selection */}
                        <div>
                            <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                                Select Stock to Mint
                            </label>
                            <select
                                value={selectedStock?.id || ''}
                                onChange={(e) => {
                                    const stockId = e.target.value;
                                    const stock = stocks.find(s => s.id === stockId) || null;
                                    setSelectedStock(stock);
                                }}
                                className="w-full rounded-md border border-primary-300 dark:border-primary-700 bg-white dark:bg-primary-800 
                  px-3 py-2 text-sm text-primary-900 dark:text-white shadow-sm focus:outline-none focus:ring-1 focus:ring-secondary-500"
                                required
                                disabled={processing}
                            >
                                <option value="">Select a stock</option>
                                {stocks.map((stock) => (
                                    <option key={stock.id} value={stock.id}>
                                        {stock.shortName} - {stock.longName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* HBAR Amount Input */}
                        <div>
                            <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                                HBAR Amount
                            </label>
                            <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={hbarAmount}
                                onChange={(e) => setHbarAmount(Math.max(0.01, Number(e.target.value)))}
                                className="w-full rounded-md border border-primary-300 dark:border-primary-700 bg-white dark:bg-primary-800 
                  px-3 py-2 text-sm text-primary-900 dark:text-white shadow-sm focus:outline-none focus:ring-1 focus:ring-secondary-500"
                                required
                                disabled={processing}
                            />
                            <p className="mt-1 text-xs text-primary-500 dark:text-primary-400">
                                Your balance: {balance || '0'} HBAR
                            </p>
                        </div>

                        {/* Summary */}
                        {selectedStock && (
                            <div className="p-3 bg-primary-50 dark:bg-primary-800/40 rounded-md">
                                <h3 className="text-sm font-medium text-primary-900 dark:text-white mb-2">Transaction Summary</h3>
                                <div className="grid grid-cols-2 gap-1 text-sm">
                                    <div className="text-primary-600 dark:text-primary-400">Stock:</div>
                                    <div className="text-primary-900 dark:text-white">{selectedStock.shortName}</div>

                                    <div className="text-primary-600 dark:text-primary-400">Price per token:</div>
                                    <div className="text-primary-900 dark:text-white">
                                        {selectedStock.priceHbar.toFixed(6)} HBAR
                                        <span className="text-xs text-primary-500 dark:text-primary-400 ml-1">
                                            (${(selectedStock.priceHbar * exchangeRate).toFixed(2)})
                                        </span>
                                    </div>

                                    <div className="text-primary-600 dark:text-primary-400">Payment:</div>
                                    <div className="text-primary-900 dark:text-white">
                                        {hbarAmount.toFixed(6)} HBAR
                                        <span className="text-xs text-primary-500 dark:text-primary-400 ml-1">
                                            (${(hbarAmount * exchangeRate).toFixed(2)})
                                        </span>
                                    </div>

                                    <div className="text-primary-600 dark:text-primary-400">You will receive:</div>
                                    <div className="font-medium text-primary-900 dark:text-white">
                                        {calculateStockTokens().toFixed(4)} {selectedStock.shortName} tokens
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={processing || !isConnected || !selectedStock}
                                className="w-full bg-secondary-600 hover:bg-secondary-700 text-white font-medium py-2 px-4 rounded-md 
                  shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 
                  disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {processing ? 'Processing...' : 'Mint with HBAR'}
                            </button>
                        </div>
                    </form>
                )}

                {activeTab === 'mint-stablecoin' && (
                    <MintWithStablecoin />
                )}

                {activeTab === 'redeem' && (
                    <form onSubmit={handleRedeemStock} className="space-y-4 max-w-md mx-auto">
                        {/* Stock Selection */}
                        <div>
                            <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                                Select Stock to Redeem
                            </label>
                            <select
                                value={selectedStock?.id || ''}
                                onChange={(e) => {
                                    const stockId = e.target.value;
                                    const stock = stocks.find(s => s.id === stockId) || null;
                                    setSelectedStock(stock);
                                }}
                                className="w-full rounded-md border border-primary-300 dark:border-primary-700 bg-white dark:bg-primary-800 
                  px-3 py-2 text-sm text-primary-900 dark:text-white shadow-sm focus:outline-none focus:ring-1 focus:ring-secondary-500"
                                required
                                disabled={processing}
                            >
                                <option value="">Select a stock</option>
                                {stocks.filter(stock => parseFloat(stock.balance || '0') > 0).map((stock) => (
                                    <option key={stock.id} value={stock.id}>
                                        {stock.shortName} - {stock.longName}
                                    </option>
                                ))}
                            </select>
                            {selectedStock && (
                                <p className="mt-1 text-xs text-primary-500 dark:text-primary-400">
                                    Your balance: {selectedStock.balance || '0'} tokens
                                </p>
                            )}
                        </div>

                        {/* Token Amount Input */}
                        <div>
                            <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                                Token Amount to Redeem
                            </label>
                            <input
                                type="number"
                                min="1"
                                step="1"
                                value={tokenAmount}
                                onChange={(e) => setTokenAmount(Math.max(1, Number(e.target.value)))}
                                className="w-full rounded-md border border-primary-300 dark:border-primary-700 bg-white dark:bg-primary-800 
                  px-3 py-2 text-sm text-primary-900 dark:text-white shadow-sm focus:outline-none focus:ring-1 focus:ring-secondary-500"
                                required
                                disabled={processing}
                            />
                        </div>

                        {/* Summary */}
                        {selectedStock && (
                            <div className="p-3 bg-primary-50 dark:bg-primary-800/40 rounded-md">
                                <h3 className="text-sm font-medium text-primary-900 dark:text-white mb-2">Transaction Summary</h3>
                                <div className="grid grid-cols-2 gap-1 text-sm">
                                    <div className="text-primary-600 dark:text-primary-400">Stock:</div>
                                    <div className="text-primary-900 dark:text-white">{selectedStock.shortName}</div>

                                    <div className="text-primary-600 dark:text-primary-400">Price per token:</div>
                                    <div className="text-primary-900 dark:text-white">
                                        {selectedStock.priceHbar.toFixed(6)} HBAR
                                        <span className="text-xs text-primary-500 dark:text-primary-400 ml-1">
                                            (${(selectedStock.priceHbar * exchangeRate).toFixed(2)})
                                        </span>
                                    </div>

                                    <div className="text-primary-600 dark:text-primary-400">Redeeming:</div>
                                    <div className="text-primary-900 dark:text-white">
                                        {tokenAmount} {selectedStock.shortName} tokens
                                    </div>

                                    <div className="text-primary-600 dark:text-primary-400">You will receive:</div>
                                    <div className="font-medium text-primary-900 dark:text-white">
                                        {calculateHbarForRedemption().toFixed(6)} HBAR
                                        <span className="text-xs text-primary-500 dark:text-primary-400 ml-1">
                                            (${(calculateHbarForRedemption() * exchangeRate).toFixed(2)})
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={processing || !isConnected || !selectedStock}
                                className="w-full bg-secondary-600 hover:bg-secondary-700 text-white font-medium py-2 px-4 rounded-md 
                  shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 
                  disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {processing ? 'Processing...' : 'Redeem Tokens'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default StockMintRedeem; 
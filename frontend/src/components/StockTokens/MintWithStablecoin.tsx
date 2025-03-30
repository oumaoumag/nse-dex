'use client';

import React, { useState, useEffect } from 'react';
import { useStock } from '@/contexts/StockContext';
import { useWallet } from '@/contexts/WalletContext';
import { Stock } from '@/types/stock';
import { SUPPORTED_TOKENS } from '@/services/stablecoinService';

const MintWithStablecoin: React.FC = () => {
    const {
        stocks,
        isLoading,
        error,
        stablecoinBalances,
        mintStockWithStablecoin,
        exchangeRate
    } = useStock();

    const { isConnected, smartWalletId } = useWallet();

    // Form state
    const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
    const [amount, setAmount] = useState<number>(10);
    const [tokenSymbol, setTokenSymbol] = useState<'USDC' | 'USDT'>('USDC');
    const [transactionStatus, setTransactionStatus] = useState<string | null>(null);
    const [processing, setProcessing] = useState<boolean>(false);

    // Calculate the HBAR equivalent of the stablecoin amount
    const calculateHbarEquivalent = (): number => {
        if (!amount || !exchangeRate || exchangeRate === 0) return 0;
        // Convert USD to HBAR: USD amount / USD per HBAR = HBAR amount
        return amount / exchangeRate;
    };

    // Calculate the number of stock tokens that will be minted
    const calculateStockTokens = (): number => {
        if (!selectedStock || !amount) return 0;

        // Convert stablecoin amount to HBAR first
        const hbarAmount = calculateHbarEquivalent();

        // Then calculate stock tokens: HBAR amount / Stock price in HBAR
        return hbarAmount / selectedStock.priceHbar;
    };

    // Get the user's balance of the selected stablecoin
    const getSelectedTokenBalance = (): string => {
        return stablecoinBalances[tokenSymbol] || '0';
    };

    // Handle token minting
    const handleMintWithStablecoin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isConnected || !smartWalletId) {
            setTransactionStatus('Please connect your wallet first');
            return;
        }

        if (!selectedStock) {
            setTransactionStatus('Please select a stock to mint');
            return;
        }

        // Check if user has sufficient balance
        const userBalance = parseFloat(getSelectedTokenBalance());
        if (userBalance < amount) {
            setTransactionStatus(`Insufficient ${tokenSymbol} balance`);
            return;
        }

        setProcessing(true);
        setTransactionStatus('Processing transaction...');

        try {
            const success = await mintStockWithStablecoin(
                selectedStock.id,
                amount,
                tokenSymbol
            );

            if (success) {
                setTransactionStatus(`Successfully minted ${calculateStockTokens().toFixed(2)} ${selectedStock.shortName} tokens`);
                // Reset amount after successful transaction
                setAmount(10);
            } else {
                setTransactionStatus('Transaction failed. Please try again.');
            }
        } catch (error: any) {
            setTransactionStatus(`Error: ${error.message}`);
            console.error('Mint with stablecoin error:', error);
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
                <h2 className="text-xl font-bold text-primary-900 dark:text-white mb-4">
                    Mint Stocks with Stablecoin
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

                <form onSubmit={handleMintWithStablecoin} className="space-y-4">
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

                    {/* Stablecoin Selection */}
                    <div>
                        <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                            Pay with
                        </label>
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                onClick={() => setTokenSymbol('USDC')}
                                className={`flex-1 py-2 px-4 text-center border ${tokenSymbol === 'USDC'
                                        ? 'bg-secondary-600 text-white border-secondary-700'
                                        : 'bg-white dark:bg-primary-800 text-primary-700 dark:text-primary-300 border-primary-300 dark:border-primary-700'
                                    } rounded-md`}
                                disabled={processing}
                            >
                                USDC
                            </button>
                            <button
                                type="button"
                                onClick={() => setTokenSymbol('USDT')}
                                className={`flex-1 py-2 px-4 text-center border ${tokenSymbol === 'USDT'
                                        ? 'bg-secondary-600 text-white border-secondary-700'
                                        : 'bg-white dark:bg-primary-800 text-primary-700 dark:text-primary-300 border-primary-300 dark:border-primary-700'
                                    } rounded-md`}
                                disabled={processing}
                            >
                                USDT
                            </button>
                        </div>
                        <p className="mt-1 text-xs text-primary-500 dark:text-primary-400">
                            Your balance: {getSelectedTokenBalance()} {tokenSymbol}
                        </p>
                    </div>

                    {/* Amount Input */}
                    <div>
                        <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                            Amount ({tokenSymbol})
                        </label>
                        <input
                            type="number"
                            min="1"
                            step="1"
                            value={amount}
                            onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
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

                                <div className="text-primary-600 dark:text-primary-400">Payment:</div>
                                <div className="text-primary-900 dark:text-white">
                                    {amount.toFixed(2)} {tokenSymbol}
                                </div>

                                <div className="text-primary-600 dark:text-primary-400">HBAR equivalent:</div>
                                <div className="text-primary-900 dark:text-white">
                                    {calculateHbarEquivalent().toFixed(6)} HBAR
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
                            {processing ? 'Processing...' : `Mint with ${tokenSymbol}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MintWithStablecoin; 
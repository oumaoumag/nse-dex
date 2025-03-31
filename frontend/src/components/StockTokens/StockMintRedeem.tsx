'use client';

import React, { useState, useEffect } from 'react';
import { useStock } from '@/contexts/StockContext';
import { Stock } from '@/types/stock';
import MintWithStablecoin from './MintWithStablecoin';
import { TokenMinter } from '@/components/TokenMinter';

const StockMintRedeem: React.FC = () => {
    const {
        stocks,
        isLoading,
        error,
        mintStock,
        redeemStock,
        exchangeRate
    } = useStock();

    // Simulate balance for now - this would come from the contract directly after wallet creation
    const [userBalance, setUserBalance] = useState<number>(125.5);
    const [userTokenBalances, setUserTokenBalances] = useState<{[key: string]: number}>({});

    // UI state
    const [activeTab, setActiveTab] = useState<'mint-hbar' | 'mint-stablecoin' | 'redeem' | 'multi-token'>('mint-hbar');

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
    // Initialize with mock token balances for demo stocks
    useEffect(() => {
        if (stocks.length > 0) {
            const mockBalances: {[key: string]: number} = {};
            stocks.slice(0, 3).forEach(stock => {
                mockBalances[stock.id] = Math.floor(Math.random() * 10) + 1;
            });
            setUserTokenBalances(mockBalances);
        }
    }, [stocks]);

    const handleMintStock = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedStock) {
            setTransactionStatus('Please select a stock to mint');
            return;
        }

        // Check if user has sufficient HBAR balance
        if (userBalance < hbarAmount) {
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

    // Check if user has sufficient token balance for redemption
    const checkRedemptionEligibility = (): boolean => {
        if (!selectedStock) return false;
        const userBalance = userTokenBalances[selectedStock.id] || 0;
        return userBalance >= tokenAmount;
    };

    // Handle transaction success from TokenMinter
    const handleMintSuccess = (txId: string) => {
        setTransactionStatus(`Transaction successful. TxID: ${txId}`);

        // Clear status after delay
        setTimeout(() => {
            setTransactionStatus(null);
        }, 5000);
    };

    return (
        <div className="bg-white dark:bg-primary-900 rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-primary-900 dark:text-white">
                        Stock Tokens
                    </h2>
                    <div className="text-right">
                        <p className="text-sm text-primary-600 dark:text-primary-400">Your Balance</p>
                        <p className="text-lg font-bold text-primary-900 dark:text-white">{userBalance.toFixed(4)} HBAR</p>
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md">
                        {error}
                    </div>
                )}

                {/* Transaction status */}
                {transactionStatus && (
                    <div
                        className={`mb-4 p-3 rounded-md flex items-start ${transactionStatus.includes('Error') || transactionStatus.includes('failed')
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            }`}
                    >
                        <div className="mr-3 flex-shrink-0 mt-0.5">
                            {transactionStatus.includes('Error') || transactionStatus.includes('failed') ? (
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                        <div>{transactionStatus}</div>
                    </div>
                )}

                {/* User token balances */}
                {Object.keys(userTokenBalances).length > 0 && (
                    <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-800/40 rounded-lg">
                        <h3 className="text-sm font-medium text-primary-900 dark:text-white mb-3">Your Token Holdings</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {Object.entries(userTokenBalances).map(([stockId, amount]) => {
                                const stock = stocks.find(s => s.id === stockId);
                                if (!stock) return null;
                                return (
                                    <div key={stockId} className="flex justify-between items-center p-2 bg-white dark:bg-primary-700/30 rounded">
                                        <div className="flex items-center">
                                            <div className="h-6 w-6 bg-primary-200 dark:bg-primary-600 rounded-full flex items-center justify-center text-xs font-medium text-primary-800 dark:text-primary-200">
                                                {stock.shortName.substring(0, 2)}
                                            </div>
                                            <span className="ml-2 text-sm font-medium text-primary-900 dark:text-white">{stock.shortName}</span>
                                        </div>
                                        <span className="text-sm font-semibold text-primary-900 dark:text-white">{amount} tokens</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                
                {/* Tab interface */}
                <div className="mb-6">
                    <div className="flex space-x-1 border-b border-primary-200 dark:border-primary-700">
                        <button
                            onClick={() => setActiveTab('mint-hbar')}
                            className={`py-2 px-4 text-sm font-medium ${activeTab === 'mint-hbar'
                                    ? 'border-b-2 border-secondary-500 text-secondary-600 dark:text-secondary-400'
                                    : 'text-primary-500 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300'
                                }`}
                        >
                            Mint with HBAR
                        </button>
                        <button
                            onClick={() => setActiveTab('mint-stablecoin')}
                            className={`py-2 px-4 text-sm font-medium ${activeTab === 'mint-stablecoin'
                                    ? 'border-b-2 border-secondary-500 text-secondary-600 dark:text-secondary-400'
                                    : 'text-primary-500 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300'
                                }`}
                        >
                            Mint with Stablecoin
                        </button>
                        <button
                            onClick={() => setActiveTab('multi-token')}
                            className={`py-2 px-4 text-sm font-medium ${activeTab === 'multi-token'
                                    ? 'border-b-2 border-secondary-500 text-secondary-600 dark:text-secondary-400'
                                    : 'text-primary-500 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300'
                            }`}
                        >
                            Multi-Token Minting
                        </button>
                        <button
                            onClick={() => setActiveTab('redeem')}
                            className={`py-2 px-4 text-sm font-medium ${activeTab === 'redeem'
                                    ? 'border-b-2 border-secondary-500 text-secondary-600 dark:text-secondary-400'
                                    : 'text-primary-500 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300'
                                }`}
                        >
                            Redeem Tokens
                        </button>
                    </div>
                </div>

                {/* Active Tab Content */}
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
                                Your balance: {userBalance.toFixed(4)} HBAR
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
                                disabled={processing || !selectedStock || userBalance < hbarAmount}
                                className="w-full bg-secondary-600 hover:bg-secondary-700 text-white font-medium py-2 px-4 rounded-md 
                  shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 
                  disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {processing ? 'Processing...' : userBalance < hbarAmount ? 'Insufficient Balance' : 'Mint with HBAR'}
                            </button>
                        </div>
                    </form>
                )}

                {activeTab === 'mint-stablecoin' && (
                    <MintWithStablecoin />
                )}

                {activeTab === 'multi-token' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-medium text-primary-900 dark:text-white mb-4">
                                Multi-Token Minting
                            </h3>
                            <p className="text-sm text-primary-600 dark:text-primary-400 mb-6">
                                Use different tokens (HBAR, USDC, USDT) to mint stock tokens with automatic conversion.
                                Gas fees are covered by the deployment account.
                            </p>

                            {selectedStock ? (
                                <div className="p-4 bg-primary-50 dark:bg-primary-800/50 rounded-lg mb-4">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 bg-primary-200 dark:bg-primary-700 rounded-full flex items-center justify-center font-medium text-primary-800 dark:text-primary-200">
                                            {selectedStock.shortName.substring(0, 2)}
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-primary-900 dark:text-white font-semibold">{selectedStock.shortName}</p>
                                            <p className="text-xs text-primary-500 dark:text-primary-400">{selectedStock.longName}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <p className="text-xs text-primary-500 dark:text-primary-400">Price in HBAR</p>
                                            <p className="font-semibold text-primary-900 dark:text-white">{selectedStock.priceHbar.toFixed(6)} HBAR</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-primary-500 dark:text-primary-400">USD Equivalent</p>
                                            <p className="font-semibold text-primary-900 dark:text-white">${(selectedStock.priceHbar * exchangeRate).toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-primary-50 dark:bg-primary-800/50 rounded-lg mb-4">
                                    <p className="text-center text-primary-600 dark:text-primary-400">
                                        Please select a stock from the dropdown
                                    </p>
                                </div>
                            )}

                            <div className="mb-4">
                                <label htmlFor="stock-select" className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                                    Select Stock
                                </label>
                                <select
                                    id="stock-select"
                                    value={selectedStock?.id || ''}
                                    onChange={(e) => {
                                        const stockId = e.target.value;
                                        const stock = stocks.find(s => s.id === stockId);
                                        setSelectedStock(stock || null);
                                    }}
                                    className="w-full rounded-md border border-primary-300 dark:border-primary-700 
                                    bg-white dark:bg-primary-800 px-3 py-2 text-primary-900 dark:text-white 
                                    shadow-sm focus:outline-none focus:ring-1 focus:ring-secondary-500"
                                    disabled={isLoading || processing}
                                >
                                    <option value="">-- Select a stock --</option>
                                    {stocks.map((stock) => (
                                        <option key={stock.id} value={stock.id}>
                                            {stock.shortName} - {stock.longName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            {selectedStock && (
                                <TokenMinter
                                    contractId={selectedStock.id}
                                    onSuccess={handleMintSuccess}
                                />
                            )}
                        </div>
                    </div>
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
                                {stocks.filter(stock => (userTokenBalances[stock.id] || 0) > 0).map((stock) => (
                                    <option key={stock.id} value={stock.id}>
                                        {stock.shortName} - {stock.longName}
                                    </option>
                                ))}
                            </select>
                            {selectedStock && (
                                <p className="mt-1 text-xs text-primary-500 dark:text-primary-400">
                                    Your balance: {userTokenBalances[selectedStock.id] || 0} tokens
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
                                disabled={processing || !selectedStock || !checkRedemptionEligibility()}
                                className="w-full bg-secondary-600 hover:bg-secondary-700 text-white font-medium py-2 px-4 rounded-md 
                  shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 
                  disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {processing ? 'Processing...' : !checkRedemptionEligibility() ? 'Insufficient Token Balance' : 'Redeem Tokens'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default StockMintRedeem; 
'use client';

import React, { useState } from 'react';
import { useStock } from '../contexts/StockContext';
import { Stock } from '@/types/stock';
import { useWallet } from '../contexts/WalletContext';

const StockMarketplace: React.FC = () => {
  const {
    stocks,
    userBalances,
    isLoading,
    error,
    mintStock,
    redeemStock,
    exchangeRate
  } = useStock();

  const { isConnected, smartWalletId } = useWallet();
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [transactionType, setTransactionType] = useState<'mint' | 'redeem'>('mint');
  const [amount, setAmount] = useState<number>(1);
  const [transactionStatus, setTransactionStatus] = useState<string | null>(null);

  // Calculate the HBAR or token amount based on stock price and input amount
  const calculateAmount = (stock: Stock, inputAmount: number): number => {
    if (transactionType === 'mint') {
      // When minting, show how many tokens they'll receive
      return inputAmount / stock.priceHbar;
    } else {
      // When redeeming, show how many HBAR they'll receive
      return inputAmount * stock.priceHbar;
    }
  };

  // Calculate USD value based on exchange rate
  const calculateUsdValue = (hbarAmount: number): number => {
    return hbarAmount * exchangeRate;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !smartWalletId) {
      setTransactionStatus('Please connect your wallet and create a smart wallet first');
      return;
    }

    if (!selectedStock) {
      setTransactionStatus('Please select a stock');
      return;
    }

    try {
      setTransactionStatus('Processing transaction...');

      let success = false;
      if (transactionType === 'mint') {
        // Convert amount to HBAR for minting
        const hbarAmount = amount;
        success = await mintStock(selectedStock.id, hbarAmount);
      } else {
        // Amount is in tokens for redemption
        success = await redeemStock(selectedStock.id, amount);
      }

      if (success) {
        setTransactionStatus(`${transactionType === 'mint' ? 'Mint' : 'Redeem'} transaction completed successfully!`);
        // Reset form after successful transaction
        setAmount(1);
      } else {
        setTransactionStatus(`Transaction failed. Please try again.`);
      }

      // Clear status after 3 seconds
      setTimeout(() => {
        setTransactionStatus(null);
      }, 3000);
    } catch (error: any) {
      setTransactionStatus(`Transaction failed: ${error.message}`);
      console.error('Transaction failed:', error);
    }
  };

  const getStockBalance = (stockId: string): string => {
    return userBalances[stockId] || '0';
  };

  return (
    <div className="bg-white dark:bg-primary-900 rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-6">Stock Marketplace</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md">
            {error}
          </div>
        )}

        {transactionStatus && (
          <div className={`mb-4 p-3 rounded-md ${transactionStatus.includes('failed')
              ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
              : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
            }`}>
            {transactionStatus}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {isLoading ? (
            <div className="col-span-3 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : stocks.length === 0 ? (
            <div className="col-span-3 text-center text-primary-600 dark:text-primary-400">
              No stocks available. Please check back later.
            </div>
          ) : (
            stocks.map(stock => (
              <div
                key={stock.id}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${selectedStock?.id === stock.id
                    ? 'border-secondary-500 bg-secondary-50 dark:bg-secondary-900/20'
                    : 'border-primary-200 dark:border-primary-700 hover:border-secondary-300 dark:hover:border-secondary-700'
                  }`}
                onClick={() => setSelectedStock(stock)}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-primary-900 dark:text-white">{stock.longName}</h3>
                  <span className="text-sm font-medium bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-primary-300 px-2 py-1 rounded">
                    {stock.shortName}
                  </span>
                </div>

                <div className="flex justify-between items-center mb-3">
                  <p className="text-primary-600 dark:text-primary-400">Price:</p>
                  <p className="font-semibold text-primary-900 dark:text-white">
                    {stock.priceHbar.toFixed(2)} HBAR
                    <span className="text-xs ml-1 text-primary-500 dark:text-primary-500">
                      (${calculateUsdValue(stock.priceHbar).toFixed(2)})
                    </span>
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-primary-600 dark:text-primary-400">Your Balance:</p>
                  <p className="font-semibold text-primary-900 dark:text-white">
                    {getStockBalance(stock.id)} tokens
                  </p>
                </div>

                <div className="mt-4 text-xs text-primary-500 dark:text-primary-400">
                  {stock.isHederaToken ? "Hedera Token Service" : "ERC20 Token"}
                </div>
              </div>
            ))
          )}
        </div>

        {selectedStock && (
          <form onSubmit={handleSubmit} className="bg-primary-50 dark:bg-primary-800 rounded-lg p-4">
            <h3 className="text-lg font-bold text-primary-900 dark:text-white mb-4">
              {selectedStock.longName} ({selectedStock.shortName})
            </h3>

            <div className="flex mb-4">
              <button
                type="button"
                className={`flex-1 py-2 px-4 text-center ${transactionType === 'mint'
                    ? 'bg-secondary-600 text-white'
                    : 'bg-primary-200 dark:bg-primary-700 text-primary-800 dark:text-primary-300'
                  } rounded-l-md transition-colors`}
                onClick={() => setTransactionType('mint')}
              >
                Mint Tokens
              </button>
              <button
                type="button"
                className={`flex-1 py-2 px-4 text-center ${transactionType === 'redeem'
                    ? 'bg-secondary-600 text-white'
                    : 'bg-primary-200 dark:bg-primary-700 text-primary-800 dark:text-primary-300'
                  } rounded-r-md transition-colors`}
                onClick={() => setTransactionType('redeem')}
              >
                Redeem Tokens
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                {transactionType === 'mint' ? 'HBAR Amount to Spend' : 'Token Amount to Redeem'}
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(Math.max(0.01, parseFloat(e.target.value) || 0))}
                className="w-full p-2 border border-primary-300 dark:border-primary-600 rounded-md bg-white dark:bg-primary-900 text-primary-900 dark:text-white"
              />
            </div>

            <div className="mb-6 p-3 bg-primary-100 dark:bg-primary-700 rounded-md">
              {transactionType === 'mint' ? (
                <>
                  <p className="text-sm text-primary-700 dark:text-primary-300">
                    You will receive approximately:
                  </p>
                  <p className="text-lg font-bold text-primary-900 dark:text-white">
                    {calculateAmount(selectedStock, amount).toFixed(4)} {selectedStock.shortName} tokens
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-primary-700 dark:text-primary-300">
                    You will receive approximately:
                  </p>
                  <p className="text-lg font-bold text-primary-900 dark:text-white">
                    {calculateAmount(selectedStock, amount).toFixed(4)} HBAR
                    <span className="text-sm ml-1 text-primary-500 dark:text-primary-400">
                      (${calculateUsdValue(calculateAmount(selectedStock, amount)).toFixed(2)})
                    </span>
                  </p>
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !isConnected || !smartWalletId}
              className="w-full py-3 px-4 bg-gradient-to-r from-secondary-600 to-secondary-700 hover:from-secondary-700 hover:to-secondary-800 text-white font-medium rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading
                ? 'Processing...'
                : transactionType === 'mint'
                  ? 'Mint Tokens'
                  : 'Redeem Tokens'
              }
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default StockMarketplace;

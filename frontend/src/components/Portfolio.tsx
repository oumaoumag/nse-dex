'use client';

import React, { useState, useEffect } from 'react';
import { useStock } from '../contexts/StockContext';
import { Stock } from '@/types/stock';
import { useWallet } from '../contexts/WalletContext';

const Portfolio: React.FC = () => {
  const {
    stocks,
    userBalances,
    isLoading,
    fetchUserBalances,
    exchangeRate
  } = useStock();

  const { isConnected, smartWalletId, associateToken } = useWallet();
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [associating, setAssociating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Calculate the total portfolio value in HBAR and USD
  const calculatePortfolioValue = (): { hbar: number, usd: number } => {
    let totalHbar = 0;

    stocks.forEach(stock => {
      const balance = parseFloat(userBalances[stock.id] || '0');
      totalHbar += balance * stock.priceHbar;
    });

    return {
      hbar: totalHbar,
      usd: totalHbar * exchangeRate
    };
  };

  // Get stocks with non-zero balances
  const getOwnedStocks = (): { stock: Stock, balance: string }[] => {
    return stocks
      .filter(stock => parseFloat(userBalances[stock.id] || '0') > 0)
      .map(stock => ({
        stock,
        balance: userBalances[stock.id] || '0'
      }))
      .sort((a, b) => {
        const aValue = parseFloat(a.balance) * a.stock.priceHbar;
        const bValue = parseFloat(b.balance) * b.stock.priceHbar;
        return bValue - aValue; // Sort by value, descending
      });
  };

  // Associate a Hedera token with the wallet
  const handleAssociateToken = async (stockId: string) => {
    if (!isConnected || !smartWalletId) {
      setStatusMessage('Please connect your wallet and create a smart wallet first');
      return;
    }

    try {
      setAssociating(true);
      setStatusMessage('Associating token with your wallet...');

      const success = await associateToken(stockId);

      if (success) {
        setStatusMessage('Token associated successfully!');
        // Refresh user balances
        await fetchUserBalances();
      } else {
        setStatusMessage('Failed to associate token. Please try again.');
      }

      // Clear status after 3 seconds
      setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
    } catch (error: any) {
      setStatusMessage(`Association failed: ${error.message}`);
      console.error('Token association failed:', error);
    } finally {
      setAssociating(false);
    }
  };

  // Portfolio statistics
  const portfolioValue = calculatePortfolioValue();
  const ownedStocks = getOwnedStocks();
  const totalOwnedStocks = ownedStocks.length;

  return (
    <div className="bg-white dark:bg-primary-900 rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-6">Your Portfolio</h2>

        {statusMessage && (
          <div className={`mb-4 p-3 rounded-md ${statusMessage.includes('failed') || statusMessage.includes('Failed')
              ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
              : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
            }`}>
            {statusMessage}
          </div>
        )}

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-primary-50 dark:bg-primary-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-primary-500 dark:text-primary-400 mb-1">Total Portfolio Value</h3>
            <p className="text-2xl font-bold text-primary-900 dark:text-white">
              {portfolioValue.hbar.toFixed(2)} HBAR
            </p>
            <p className="text-sm text-primary-600 dark:text-primary-400">
              ${portfolioValue.usd.toFixed(2)} USD
            </p>
          </div>

          <div className="bg-primary-50 dark:bg-primary-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-primary-500 dark:text-primary-400 mb-1">Stocks Owned</h3>
            <p className="text-2xl font-bold text-primary-900 dark:text-white">
              {totalOwnedStocks}
            </p>
            <p className="text-sm text-primary-600 dark:text-primary-400">
              out of {stocks.length} available
            </p>
          </div>

          <div className="bg-primary-50 dark:bg-primary-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-primary-500 dark:text-primary-400 mb-1">HBAR Exchange Rate</h3>
            <p className="text-2xl font-bold text-primary-900 dark:text-white">
              ${exchangeRate.toFixed(4)}
            </p>
            <p className="text-sm text-primary-600 dark:text-primary-400">
              per HBAR
            </p>
          </div>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        )}

        {/* Token Balances */}
        {!isLoading && (
          <>
            <h3 className="text-lg font-semibold text-primary-900 dark:text-white mb-4">
              Your Token Balances
            </h3>

            {ownedStocks.length === 0 ? (
              <div className="bg-primary-50 dark:bg-primary-800 rounded-lg p-6 text-center">
                <p className="text-primary-600 dark:text-primary-400 mb-4">
                  You don't own any stocks yet.
                </p>
                <p className="text-sm text-primary-500 dark:text-primary-400">
                  Visit the marketplace to mint your first stock tokens!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-primary-200 dark:divide-primary-700">
                  <thead className="bg-primary-50 dark:bg-primary-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-primary-500 dark:text-primary-400 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-primary-500 dark:text-primary-400 uppercase tracking-wider">
                        Balance
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-primary-500 dark:text-primary-400 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-primary-500 dark:text-primary-400 uppercase tracking-wider">
                        Value
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-primary-500 dark:text-primary-400 uppercase tracking-wider">
                        Token Type
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-primary-900 divide-y divide-primary-200 dark:divide-primary-800">
                    {ownedStocks.map(({ stock, balance }) => {
                      const value = parseFloat(balance) * stock.priceHbar;

                      return (
                        <tr key={stock.id} className="hover:bg-primary-50 dark:hover:bg-primary-800/50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-primary-900 dark:text-white">
                              {stock.shortName}
                            </div>
                            <div className="text-xs text-primary-500 dark:text-primary-400">
                              {stock.longName}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-primary-900 dark:text-white">
                            {parseFloat(balance).toFixed(4)} tokens
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-primary-900 dark:text-white">
                              {stock.priceHbar.toFixed(4)} HBAR
                            </div>
                            <div className="text-xs text-primary-500 dark:text-primary-400">
                              ${(stock.priceHbar * exchangeRate).toFixed(2)}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-primary-900 dark:text-white">
                              {value.toFixed(4)} HBAR
                            </div>
                            <div className="text-xs text-primary-500 dark:text-primary-400">
                              ${(value * exchangeRate).toFixed(2)}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${stock.isHederaToken
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                              }`}>
                              {stock.isHederaToken ? 'Hedera Token Service' : 'ERC20 Token'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Available Tokens for Association */}
            <h3 className="text-lg font-semibold text-primary-900 dark:text-white mt-8 mb-4">
              Available Tokens
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {stocks
                .filter(stock => !userBalances[stock.id] && stock.isHederaToken)
                .map(stock => (
                  <div key={stock.id} className="border border-primary-200 dark:border-primary-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-md font-medium text-primary-900 dark:text-white">{stock.shortName}</h4>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        HTS
                      </span>
                    </div>
                    <p className="text-sm text-primary-600 dark:text-primary-400 mb-3">{stock.longName}</p>
                    <button
                      onClick={() => handleAssociateToken(stock.id)}
                      disabled={associating || !isConnected || !smartWalletId}
                      className="w-full py-2 px-3 text-sm bg-secondary-600 hover:bg-secondary-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {associating ? 'Associating...' : 'Associate Token'}
                    </button>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Portfolio;

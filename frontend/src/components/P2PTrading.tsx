'use client';

import React, { useState, useEffect } from 'react';
import { useStock } from '../contexts/StockContext';
import { Stock, BuyOffer, SellOffer, calculateTotalHbar, calculateUsdValue } from '@/types/stock';
import { useWallet } from '../contexts/WalletContext';

const P2PTrading: React.FC = () => {
  const {
    stocks,
    userBalances,
    buyOffers,
    sellOffers,
    isLoading,
    error,
    createBuyOffer,
    createSellOffer,
    deleteBuyOffer,
    deleteSellOffer,
    sellToOffer,
    buyFromOffer,
    fetchOffers,
    exchangeRate
  } = useStock();

  const { isConnected, smartWalletId, accountId } = useWallet();

  // State for new offer creation
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [offerType, setOfferType] = useState<'buy' | 'sell'>('buy');
  const [tokenAmount, setTokenAmount] = useState<number>(1);
  const [pricePerToken, setPricePerToken] = useState<number>(0);
  const [transactionStatus, setTransactionStatus] = useState<string | null>(null);

  // Tabs for navigating between viewing offers and creating offers
  const [activeTab, setActiveTab] = useState<'view' | 'create'>('view');
  // Tabs for filtering offer types when viewing
  const [viewTab, setViewTab] = useState<'buy' | 'sell' | 'my'>('buy');

  // Get stock details by contract address
  const getStockDetails = (stockContract: string): Stock | undefined => {
    return stocks.find(stock => stock.id === stockContract);
  };

  // Create a new offer
  const handleCreateOffer = async (e: React.FormEvent) => {
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

      let offerId = '';
      if (offerType === 'buy') {
        offerId = await createBuyOffer(selectedStock.id, tokenAmount, pricePerToken);
      } else {
        offerId = await createSellOffer(selectedStock.id, tokenAmount, pricePerToken);
      }

      if (offerId) {
        setTransactionStatus(`${offerType === 'buy' ? 'Buy' : 'Sell'} offer created successfully!`);
        // Reset form after successful transaction
        setTokenAmount(1);
        setPricePerToken(0);
      } else {
        setTransactionStatus(`Failed to create offer. Please try again.`);
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

  // Handle deleting an offer
  const handleDeleteOffer = async (offerId: string, isBuyOffer: boolean) => {
    try {
      setTransactionStatus('Deleting offer...');

      const success = isBuyOffer
        ? await deleteBuyOffer(offerId)
        : await deleteSellOffer(offerId);

      if (success) {
        setTransactionStatus('Offer deleted successfully!');
      } else {
        setTransactionStatus('Failed to delete offer. Please try again.');
      }

      // Clear status after 3 seconds
      setTimeout(() => {
        setTransactionStatus(null);
      }, 3000);
    } catch (error: any) {
      setTransactionStatus(`Failed to delete offer: ${error.message}`);
      console.error('Delete offer failed:', error);
    }
  };

  // Handle executing a trade
  const handleExecuteTrade = async (offerId: string, isBuyOffer: boolean) => {
    try {
      setTransactionStatus('Executing trade...');

      const success = isBuyOffer
        ? await sellToOffer(offerId) // Selling to a buy offer
        : await buyFromOffer(offerId); // Buying from a sell offer

      if (success) {
        setTransactionStatus('Trade executed successfully!');
      } else {
        setTransactionStatus('Failed to execute trade. Please try again.');
      }

      // Clear status after 3 seconds
      setTimeout(() => {
        setTransactionStatus(null);
      }, 3000);
    } catch (error: any) {
      setTransactionStatus(`Failed to execute trade: ${error.message}`);
      console.error('Trade execution failed:', error);
    }
  };

  // Filter offers based on the selected tab
  const filteredBuyOffers = viewTab === 'my'
    ? buyOffers.filter(offer => offer.createdByUser === accountId)
    : buyOffers;

  const filteredSellOffers = viewTab === 'my'
    ? sellOffers.filter(offer => offer.createdByUser === accountId)
    : sellOffers;

  // Helper function to get token balance
  const getStockBalance = (stockId: string): string => {
    return userBalances[stockId] || '0';
  };

  // Refresh offers when component mounts or when the viewTab changes
  useEffect(() => {
    if (isConnected) {
      fetchOffers();
    }
  }, [isConnected, viewTab]);

  return (
    <div className="bg-white dark:bg-primary-900 rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-6">P2P Trading</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md">
            {error}
          </div>
        )}

        {transactionStatus && (
          <div className={`mb-4 p-3 rounded-md ${transactionStatus.includes('failed') || transactionStatus.includes('Failed')
            ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
            : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
            }`}>
            {transactionStatus}
          </div>
        )}

        {/* Tabs */}
        <div className="flex mb-6 border-b border-primary-200 dark:border-primary-700">
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'view'
              ? 'text-secondary-600 border-b-2 border-secondary-600'
              : 'text-primary-600 dark:text-primary-400 hover:text-secondary-500 dark:hover:text-secondary-400'
              }`}
            onClick={() => setActiveTab('view')}
          >
            View Offers
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'create'
              ? 'text-secondary-600 border-b-2 border-secondary-600'
              : 'text-primary-600 dark:text-primary-400 hover:text-secondary-500 dark:hover:text-secondary-400'
              }`}
            onClick={() => setActiveTab('create')}
          >
            Create Offer
          </button>
        </div>

        {/* View Offers Section */}
        {activeTab === 'view' && (
          <div>
            {/* View Tab Filters */}
            <div className="flex mb-4 bg-primary-50 dark:bg-primary-800 rounded-lg p-1">
              <button
                className={`flex-1 py-2 px-4 text-center rounded-md text-sm font-medium ${viewTab === 'buy'
                  ? 'bg-white dark:bg-primary-700 shadow-sm'
                  : 'text-primary-600 dark:text-primary-400 hover:bg-white/50 dark:hover:bg-primary-700/50'
                  }`}
                onClick={() => setViewTab('buy')}
              >
                Buy Offers
              </button>
              <button
                className={`flex-1 py-2 px-4 text-center rounded-md text-sm font-medium ${viewTab === 'sell'
                  ? 'bg-white dark:bg-primary-700 shadow-sm'
                  : 'text-primary-600 dark:text-primary-400 hover:bg-white/50 dark:hover:bg-primary-700/50'
                  }`}
                onClick={() => setViewTab('sell')}
              >
                Sell Offers
              </button>
              <button
                className={`flex-1 py-2 px-4 text-center rounded-md text-sm font-medium ${viewTab === 'my'
                  ? 'bg-white dark:bg-primary-700 shadow-sm'
                  : 'text-primary-600 dark:text-primary-400 hover:bg-white/50 dark:hover:bg-primary-700/50'
                  }`}
                onClick={() => setViewTab('my')}
              >
                My Offers
              </button>
            </div>

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-center my-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            )}

            {/* Buy Offers Table */}
            {!isLoading && viewTab !== 'sell' && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-primary-900 dark:text-white mb-3">
                  Buy Offers
                </h3>

                {filteredBuyOffers.length === 0 ? (
                  <p className="text-primary-600 dark:text-primary-400 text-center py-4">
                    No buy offers available
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-primary-200 dark:divide-primary-700">
                      <thead className="bg-primary-50 dark:bg-primary-800">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-primary-500 dark:text-primary-400 uppercase tracking-wider">
                            Stock
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-primary-500 dark:text-primary-400 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-primary-500 dark:text-primary-400 uppercase tracking-wider">
                            Price (HBAR)
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-primary-500 dark:text-primary-400 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-primary-500 dark:text-primary-400 uppercase tracking-wider">
                            Creator
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-primary-500 dark:text-primary-400 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-primary-900 divide-y divide-primary-200 dark:divide-primary-800">
                        {filteredBuyOffers.map(offer => {
                          const stock = getStockDetails(offer.stockContract);
                          const isMine = offer.createdByUser === accountId;

                          return (
                            <tr key={offer.offerId} className="hover:bg-primary-50 dark:hover:bg-primary-800/50">
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-primary-900 dark:text-white">
                                  {stock?.shortName || 'Unknown'}
                                </div>
                                <div className="text-xs text-primary-500 dark:text-primary-400">
                                  {stock?.longName || 'Unknown Stock'}
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-primary-900 dark:text-white">
                                {offer.stockAmount} tokens
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-primary-900 dark:text-white">
                                {offer.offerPriceHbar.toFixed(4)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm text-primary-900 dark:text-white">
                                  {calculateTotalHbar(offer.stockAmount, offer.offerPriceHbar).toFixed(4)} HBAR
                                </div>
                                <div className="text-xs text-primary-500 dark:text-primary-400">
                                  ${calculateUsdValue(calculateTotalHbar(offer.stockAmount, offer.offerPriceHbar), exchangeRate).toFixed(2)}
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-primary-500 dark:text-primary-400">
                                {isMine ? 'You' : offer.createdByUser.substring(0, 6) + '...'}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {isMine ? (
                                  <button
                                    onClick={() => handleDeleteOffer(offer.offerId, true)}
                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                  >
                                    Cancel
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleExecuteTrade(offer.offerId, true)}
                                    disabled={!isConnected || !smartWalletId}
                                    className="text-secondary-600 hover:text-secondary-800 dark:text-secondary-400 dark:hover:text-secondary-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Sell to Buyer
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Sell Offers Table */}
            {!isLoading && viewTab !== 'buy' && (
              <div>
                <h3 className="text-lg font-semibold text-primary-900 dark:text-white mb-3">
                  Sell Offers
                </h3>

                {filteredSellOffers.length === 0 ? (
                  <p className="text-primary-600 dark:text-primary-400 text-center py-4">
                    No sell offers available
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-primary-200 dark:divide-primary-700">
                      <thead className="bg-primary-50 dark:bg-primary-800">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-primary-500 dark:text-primary-400 uppercase tracking-wider">
                            Stock
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-primary-500 dark:text-primary-400 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-primary-500 dark:text-primary-400 uppercase tracking-wider">
                            Price (HBAR)
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-primary-500 dark:text-primary-400 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-primary-500 dark:text-primary-400 uppercase tracking-wider">
                            Creator
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-primary-500 dark:text-primary-400 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-primary-900 divide-y divide-primary-200 dark:divide-primary-800">
                        {filteredSellOffers.map(offer => {
                          const stock = getStockDetails(offer.stockContract);
                          const isMine = offer.createdByUser === accountId;

                          return (
                            <tr key={offer.offerId} className="hover:bg-primary-50 dark:hover:bg-primary-800/50">
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-primary-900 dark:text-white">
                                  {stock?.shortName || 'Unknown'}
                                </div>
                                <div className="text-xs text-primary-500 dark:text-primary-400">
                                  {stock?.longName || 'Unknown Stock'}
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-primary-900 dark:text-white">
                                {offer.stockAmount} tokens
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-primary-900 dark:text-white">
                                {offer.offerPriceHbar.toFixed(4)}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="text-sm text-primary-900 dark:text-white">
                                  {calculateTotalHbar(offer.stockAmount, offer.offerPriceHbar).toFixed(4)} HBAR
                                </div>
                                <div className="text-xs text-primary-500 dark:text-primary-400">
                                  ${calculateUsdValue(calculateTotalHbar(offer.stockAmount, offer.offerPriceHbar), exchangeRate).toFixed(2)}
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-primary-500 dark:text-primary-400">
                                {isMine ? 'You' : offer.createdByUser.substring(0, 6) + '...'}
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {isMine ? (
                                  <button
                                    onClick={() => handleDeleteOffer(offer.offerId, false)}
                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                  >
                                    Cancel
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleExecuteTrade(offer.offerId, false)}
                                    disabled={!isConnected || !smartWalletId}
                                    className="text-secondary-600 hover:text-secondary-800 dark:text-secondary-400 dark:hover:text-secondary-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Buy from Seller
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Create Offer Section */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateOffer} className="bg-primary-50 dark:bg-primary-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-primary-900 dark:text-white mb-4">
              Create New Offer
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                Select Stock
              </label>
              <select
                value={selectedStock?.id || ''}
                onChange={(e) => {
                  const selected = stocks.find(s => s.id === e.target.value);
                  setSelectedStock(selected || null);
                  // Set default price based on stock price
                  if (selected) {
                    setPricePerToken(selected.priceHbar);
                  }
                }}
                className="w-full p-2 border border-primary-300 dark:border-primary-600 rounded-md bg-white dark:bg-primary-900 text-primary-900 dark:text-white"
                required
              >
                <option value="">Select a stock</option>
                {stocks.map(stock => (
                  <option key={stock.id} value={stock.id}>
                    {stock.shortName} - {stock.longName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex mb-4">
              <button
                type="button"
                className={`flex-1 py-2 px-4 text-center ${offerType === 'buy'
                  ? 'bg-secondary-600 text-white'
                  : 'bg-primary-200 dark:bg-primary-700 text-primary-800 dark:text-primary-300'
                  } rounded-l-md transition-colors`}
                onClick={() => setOfferType('buy')}
              >
                Buy Offer
              </button>
              <button
                type="button"
                className={`flex-1 py-2 px-4 text-center ${offerType === 'sell'
                  ? 'bg-secondary-600 text-white'
                  : 'bg-primary-200 dark:bg-primary-700 text-primary-800 dark:text-primary-300'
                  } rounded-r-md transition-colors`}
                onClick={() => setOfferType('sell')}
              >
                Sell Offer
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                Token Amount
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={tokenAmount}
                onChange={(e) => setTokenAmount(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full p-2 border border-primary-300 dark:border-primary-600 rounded-md bg-white dark:bg-primary-900 text-primary-900 dark:text-white"
                required
              />
              {selectedStock && offerType === 'sell' && (
                <p className="mt-1 text-xs text-primary-500 dark:text-primary-400">
                  Your balance: {getStockBalance(selectedStock.id)} tokens
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                Price per Token (HBAR)
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={pricePerToken}
                onChange={(e) => setPricePerToken(Math.max(0.01, parseFloat(e.target.value) || 0))}
                className="w-full p-2 border border-primary-300 dark:border-primary-600 rounded-md bg-white dark:bg-primary-900 text-primary-900 dark:text-white"
                required
              />
              {selectedStock && (
                <p className="mt-1 text-xs text-primary-500 dark:text-primary-400">
                  Market price: {selectedStock.priceHbar.toFixed(2)} HBAR
                </p>
              )}
            </div>

            <div className="mb-6 p-3 bg-primary-100 dark:bg-primary-700 rounded-md">
              <p className="text-sm text-primary-700 dark:text-primary-300">
                Total Order Value:
              </p>
              <p className="text-lg font-bold text-primary-900 dark:text-white">
                {calculateTotalHbar(tokenAmount, pricePerToken).toFixed(4)} HBAR
                <span className="text-sm ml-1 text-primary-500 dark:text-primary-400">
                  (${calculateUsdValue(calculateTotalHbar(tokenAmount, pricePerToken), exchangeRate).toFixed(2)})
                </span>
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !isConnected || !smartWalletId || !selectedStock}
              className="w-full py-3 px-4 bg-gradient-to-r from-secondary-600 to-secondary-700 hover:from-secondary-700 hover:to-secondary-800 text-white font-medium rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading
                ? 'Processing...'
                : `Create ${offerType === 'buy' ? 'Buy' : 'Sell'} Offer`
              }
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default P2PTrading;

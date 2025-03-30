'use client';

import React, { useState, useEffect } from 'react';
import { useStock } from '../contexts/StockContext';
import { Stock, BuyOffer, SellOffer, calculateTotalHbar, calculateUsdValue } from '@/types/stock';
import { useWallet } from '../contexts/WalletContext';
import { SUPPORTED_TOKENS } from '@/services/stablecoinService';

const P2PTrading: React.FC = () => {
  const {
    stocks,
    userBalances,
    stablecoinBalances,
    buyOffers,
    sellOffers,
    isLoading,
    error,
    createBuyOffer,
    createBuyOfferWithStablecoin,
    createSellOffer,
    deleteBuyOffer,
    deleteSellOffer,
    sellToOffer,
    buyFromOffer,
    buyFromOfferWithStablecoin,
    fetchOffers,
    exchangeRate
  } = useStock();

  const { isConnected, smartWalletId, accountId, balance } = useWallet();

  // State for new offer creation
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [offerType, setOfferType] = useState<'buy' | 'sell'>('buy');
  const [tokenAmount, setTokenAmount] = useState<number>(1);
  const [pricePerToken, setPricePerToken] = useState<number>(0);
  const [transactionStatus, setTransactionStatus] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'HBAR' | 'USDC' | 'USDT'>('HBAR');

  // Tabs for navigating between viewing offers and creating offers
  const [activeTab, setActiveTab] = useState<'view' | 'create'>('view');
  // Tabs for filtering offer types when viewing
  const [viewTab, setViewTab] = useState<'buy' | 'sell' | 'my'>('buy');
  // State for filter and sort options
  const [sortOption, setSortOption] = useState<'newest' | 'priceAsc' | 'priceDesc' | 'amountAsc' | 'amountDesc'>('newest');
  const [filterStock, setFilterStock] = useState<string>('all');

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
        // For buy offers, we can use either HBAR or stablecoins
        if (paymentMethod === 'HBAR') {
          offerId = await createBuyOffer(selectedStock.id, tokenAmount, pricePerToken);
        } else if (paymentMethod === 'USDC' || paymentMethod === 'USDT') {
          offerId = await createBuyOfferWithStablecoin(
            selectedStock.id,
            tokenAmount,
            pricePerToken,
            paymentMethod
          );
        }
      } else {
        // For sell offers, we only need to use the standard method
        offerId = await createSellOffer(selectedStock.id, tokenAmount, pricePerToken);
      }

      if (offerId) {
        setTransactionStatus(`${offerType === 'buy' ? 'Buy' : 'Sell'} offer created successfully!`);
        // Reset form after successful transaction
        setTokenAmount(1);
        setPricePerToken(0);
        fetchOffers(); // Refresh offers
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

      let success = false;

      if (isBuyOffer) {
        // Selling to a buy offer - always uses HBAR
        success = await sellToOffer(offerId);
      } else {
        // Buying from a sell offer - can use HBAR or stablecoins
        if (paymentMethod === 'HBAR') {
          success = await buyFromOffer(offerId);
        } else if (paymentMethod === 'USDC' || paymentMethod === 'USDT') {
          success = await buyFromOfferWithStablecoin(offerId, paymentMethod);
        }
      }

      if (success) {
        setTransactionStatus('Trade executed successfully!');
        fetchOffers(); // Refresh offers after successful trade
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

  // Apply filters and sorting to offers
  const applyFiltersAndSort = (offers: BuyOffer[] | SellOffer[]): (BuyOffer | SellOffer)[] => {
    // First apply stock filter if not 'all'
    let filtered = offers;
    if (filterStock !== 'all') {
      filtered = offers.filter(offer => offer.stockContract === filterStock);
    }

    // Then apply sorting
    return [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          // Assuming higher IDs are newer
          return Number(b.offerId) - Number(a.offerId);
        case 'priceAsc':
          return a.offerPriceHbar - b.offerPriceHbar;
        case 'priceDesc':
          return b.offerPriceHbar - a.offerPriceHbar;
        case 'amountAsc':
          return a.stockAmount - b.stockAmount;
        case 'amountDesc':
          return b.stockAmount - a.stockAmount;
        default:
          return 0;
      }
    });
  };

  // Filter offers based on the selected tab and apply additional filters
  const filteredBuyOffers = applyFiltersAndSort(
    viewTab === 'my'
      ? buyOffers.filter(offer => offer.createdByUser === accountId)
      : buyOffers
  );

  const filteredSellOffers = applyFiltersAndSort(
    viewTab === 'my'
      ? sellOffers.filter(offer => offer.createdByUser === accountId)
      : sellOffers
  );

  // Get unique stock symbols for the filter dropdown
  const uniqueStocks = React.useMemo(() => {
    const stockIds = new Set<string>();

    // Add stock IDs from both buy and sell offers
    buyOffers.forEach(offer => stockIds.add(offer.stockContract));
    sellOffers.forEach(offer => stockIds.add(offer.stockContract));

    // Map IDs to stock details
    return Array.from(stockIds).map(id => {
      const stock = getStockDetails(id);
      return {
        id,
        name: stock ? stock.shortName : 'Unknown'
      };
    });
  }, [buyOffers, sellOffers, stocks]);

  // Helper function to format price with currency
  const formatPrice = (price: number): string => {
    if (paymentMethod === 'HBAR') {
      return `${price.toFixed(6)} HBAR`;
    } else {
      // For stablecoins, convert HBAR price to USD equivalent
      const usdPrice = price * exchangeRate;
      return `$${usdPrice.toFixed(2)} ${paymentMethod}`;
    }
  };

  // Helper function to get token balance
  const getStockBalance = (stockId: string): string => {
    return userBalances[stockId] || '0';
  };

  // Helper function to get stablecoin balance
  const getStablecoinBalance = (symbol: 'USDC' | 'USDT'): string => {
    return stablecoinBalances[symbol] || '0';
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

        {activeTab === 'view' ? (
          <div>
            {/* Sub-tabs for view */}
            <div className="flex mb-4">
              <button
                className={`mr-4 px-3 py-1 rounded-full text-sm font-medium ${viewTab === 'buy'
                  ? 'bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-primary-200'
                  : 'text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-800/50'
                  }`}
                onClick={() => setViewTab('buy')}
              >
                Buy Offers
              </button>
              <button
                className={`mr-4 px-3 py-1 rounded-full text-sm font-medium ${viewTab === 'sell'
                  ? 'bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-primary-200'
                  : 'text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-800/50'
                  }`}
                onClick={() => setViewTab('sell')}
              >
                Sell Offers
              </button>
              <button
                className={`px-3 py-1 rounded-full text-sm font-medium ${viewTab === 'my'
                  ? 'bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-primary-200'
                  : 'text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-800/50'
                  }`}
                onClick={() => setViewTab('my')}
              >
                My Offers
              </button>
            </div>

            {/* Filter and sort controls */}
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-medium text-primary-700 dark:text-primary-300 mb-1">
                  Filter by Stock
                </label>
                <select
                  value={filterStock}
                  onChange={(e) => setFilterStock(e.target.value)}
                  className="w-full rounded-md border border-primary-300 dark:border-primary-700 bg-white dark:bg-primary-800 
                  px-3 py-2 text-sm text-primary-900 dark:text-white shadow-sm focus:outline-none focus:ring-1 focus:ring-secondary-500"
                >
                  <option value="all">All Stocks</option>
                  {uniqueStocks.map((stock) => (
                    <option key={stock.id} value={stock.id}>
                      {stock.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-medium text-primary-700 dark:text-primary-300 mb-1">
                  Sort by
                </label>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as any)}
                  className="w-full rounded-md border border-primary-300 dark:border-primary-700 bg-white dark:bg-primary-800 
                  px-3 py-2 text-sm text-primary-900 dark:text-white shadow-sm focus:outline-none focus:ring-1 focus:ring-secondary-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                  <option value="amountAsc">Amount: Low to High</option>
                  <option value="amountDesc">Amount: High to Low</option>
                </select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-medium text-primary-700 dark:text-primary-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as 'HBAR' | 'USDC' | 'USDT')}
                  className="w-full rounded-md border border-primary-300 dark:border-primary-700 bg-white dark:bg-primary-800 
                  px-3 py-2 text-sm text-primary-900 dark:text-white shadow-sm focus:outline-none focus:ring-1 focus:ring-secondary-500"
                >
                  <option value="HBAR">HBAR</option>
                  <option value="USDC">USDC</option>
                  <option value="USDT">USDT</option>
                </select>
              </div>
            </div>

            {/* No offers message */}
            {((viewTab === 'buy' && filteredBuyOffers.length === 0) ||
              (viewTab === 'sell' && filteredSellOffers.length === 0) ||
              (viewTab === 'my' && filteredBuyOffers.length === 0 && filteredSellOffers.length === 0)) && (
                <div className="text-center py-8 text-primary-500 dark:text-primary-400">
                  No offers found. {viewTab === 'my' ? 'Create an offer to get started!' : 'Check back later!'}
                </div>
              )}

            {/* Display offers */}
            <div className="space-y-4">
              {/* Render based on the active view tab */}
              {viewTab === 'buy' || (viewTab === 'my' && filteredBuyOffers.length > 0) ? (
                <div>
                  {viewTab === 'my' && <h3 className="text-lg font-medium mb-2">My Buy Offers</h3>}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-primary-200 dark:divide-primary-700">
                      <thead className="bg-primary-50 dark:bg-primary-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 dark:text-primary-400 uppercase tracking-wider">Stock</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 dark:text-primary-400 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 dark:text-primary-400 uppercase tracking-wider">Price per Token</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 dark:text-primary-400 uppercase tracking-wider">Total Value</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 dark:text-primary-400 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-primary-900 divide-y divide-primary-200 dark:divide-primary-800">
                        {filteredBuyOffers.map((offer) => {
                          const stock = getStockDetails(offer.stockContract);
                          const totalValue = calculateTotalHbar(offer.stockAmount, offer.offerPriceHbar);
                          const usdValue = calculateUsdValue(totalValue, exchangeRate);
                          const isOwnOffer = offer.createdByUser === accountId;

                          return (
                            <tr key={offer.offerId} className="hover:bg-primary-50 dark:hover:bg-primary-800/40">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="ml-2">
                                    <div className="text-sm font-medium text-primary-900 dark:text-white">
                                      {stock?.shortName || 'Unknown'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-900 dark:text-white">
                                {offer.stockAmount.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-900 dark:text-white">
                                {offer.offerPriceHbar.toFixed(6)} HBAR
                                <span className="block text-xs text-primary-500 dark:text-primary-400">
                                  (${(offer.offerPriceHbar * exchangeRate).toFixed(2)})
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-900 dark:text-white">
                                {totalValue.toFixed(6)} HBAR
                                <span className="block text-xs text-primary-500 dark:text-primary-400">
                                  (${usdValue.toFixed(2)})
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {isOwnOffer ? (
                                  <button
                                    onClick={() => handleDeleteOffer(offer.offerId, true)}
                                    className="text-red-600 hover:text-red-900 dark:text-red-500 dark:hover:text-red-400"
                                  >
                                    Delete
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleExecuteTrade(offer.offerId, true)}
                                      className="text-secondary-600 hover:text-secondary-900 dark:text-secondary-500 dark:hover:text-secondary-400"
                                  >
                                      Sell to this offer
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}

              {viewTab === 'sell' || (viewTab === 'my' && filteredSellOffers.length > 0) ? (
                <div className="mt-6">
                  {viewTab === 'my' && <h3 className="text-lg font-medium mb-2">My Sell Offers</h3>}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-primary-200 dark:divide-primary-700">
                      <thead className="bg-primary-50 dark:bg-primary-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 dark:text-primary-400 uppercase tracking-wider">Stock</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 dark:text-primary-400 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 dark:text-primary-400 uppercase tracking-wider">Price per Token</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 dark:text-primary-400 uppercase tracking-wider">Total Value</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 dark:text-primary-400 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-primary-900 divide-y divide-primary-200 dark:divide-primary-800">
                        {filteredSellOffers.map((offer) => {
                          const stock = getStockDetails(offer.stockContract);
                          const totalValue = calculateTotalHbar(offer.stockAmount, offer.offerPriceHbar);
                          const usdValue = calculateUsdValue(totalValue, exchangeRate);
                          const isOwnOffer = offer.createdByUser === accountId;

                          return (
                            <tr key={offer.offerId} className="hover:bg-primary-50 dark:hover:bg-primary-800/40">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="ml-2">
                                    <div className="text-sm font-medium text-primary-900 dark:text-white">
                                      {stock?.shortName || 'Unknown'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-900 dark:text-white">
                                {offer.stockAmount.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-900 dark:text-white">
                                {offer.offerPriceHbar.toFixed(6)} HBAR
                                <span className="block text-xs text-primary-500 dark:text-primary-400">
                                  (${(offer.offerPriceHbar * exchangeRate).toFixed(2)})
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-900 dark:text-white">
                                {totalValue.toFixed(6)} HBAR
                                <span className="block text-xs text-primary-500 dark:text-primary-400">
                                  (${usdValue.toFixed(2)})
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {isOwnOffer ? (
                                  <button
                                    onClick={() => handleDeleteOffer(offer.offerId, false)}
                                    className="text-red-600 hover:text-red-900 dark:text-red-500 dark:hover:text-red-400"
                                  >
                                    Delete
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleExecuteTrade(offer.offerId, false)}
                                      className="text-secondary-600 hover:text-secondary-900 dark:text-secondary-500 dark:hover:text-secondary-400"
                                  >
                                      Buy from this offer
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="max-w-lg mx-auto">
            <h3 className="text-lg font-medium text-primary-900 dark:text-white mb-4">Create a new {offerType === 'buy' ? 'Buy' : 'Sell'} Offer</h3>

              <form onSubmit={handleCreateOffer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                    Offer Type
                  </label>
                  <div className="flex">
                    <button
                      type="button"
                      className={`flex-1 py-2 px-4 text-center border ${offerType === 'buy'
                        ? 'bg-secondary-600 text-white border-secondary-700'
                        : 'bg-white dark:bg-primary-800 text-primary-700 dark:text-primary-300 border-primary-300 dark:border-primary-700'
                        } rounded-l-md`}
                      onClick={() => setOfferType('buy')}
                    >
                      Buy
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-2 px-4 text-center border ${offerType === 'sell'
                        ? 'bg-secondary-600 text-white border-secondary-700'
                        : 'bg-white dark:bg-primary-800 text-primary-700 dark:text-primary-300 border-primary-300 dark:border-primary-700'
                        } rounded-r-md`}
                      onClick={() => setOfferType('sell')}
                    >
                      Sell
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                    Select Stock
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
                  >
                    <option value="">Select a stock</option>
                    {stocks.map((stock) => (
                      <option key={stock.id} value={stock.id}>
                        {stock.shortName} - {stock.longName}
                      </option>
                    ))}
                  </select>
                  {selectedStock && offerType === 'sell' && (
                    <p className="mt-1 text-xs text-primary-500 dark:text-primary-400">
                      Your balance: {getStockBalance(selectedStock.id)} tokens
                    </p>
                  )}
                </div>

                {offerType === 'buy' && (
                  <div>
                    <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as 'HBAR' | 'USDC' | 'USDT')}
                      className="w-full rounded-md border border-primary-300 dark:border-primary-700 bg-white dark:bg-primary-800 
                    px-3 py-2 text-sm text-primary-900 dark:text-white shadow-sm focus:outline-none focus:ring-1 focus:ring-secondary-500"
                    >
                      <option value="HBAR">HBAR</option>
                      <option value="USDC">USDC</option>
                      <option value="USDT">USDT</option>
                    </select>
                    <p className="mt-1 text-xs text-primary-500 dark:text-primary-400">
                      {paymentMethod === 'HBAR' ?
                        `Your balance: ${balance} HBAR` :
                        `Your balance: ${getStablecoinBalance(paymentMethod as 'USDC' | 'USDT')} ${paymentMethod}`}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                    Token Amount
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={tokenAmount}
                    onChange={(e) => setTokenAmount(Number(e.target.value))}
                    className="w-full rounded-md border border-primary-300 dark:border-primary-700 bg-white dark:bg-primary-800 
                  px-3 py-2 text-sm text-primary-900 dark:text-white shadow-sm focus:outline-none focus:ring-1 focus:ring-secondary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">
                    Price per Token (in HBAR)
                  </label>
                  <input
                    type="number"
                    min="0.000001"
                    step="0.000001"
                    value={pricePerToken}
                    onChange={(e) => setPricePerToken(Number(e.target.value))}
                    className="w-full rounded-md border border-primary-300 dark:border-primary-700 bg-white dark:bg-primary-800 
                  px-3 py-2 text-sm text-primary-900 dark:text-white shadow-sm focus:outline-none focus:ring-1 focus:ring-secondary-500"
                    required
                  />
                  {pricePerToken > 0 && (
                    <p className="mt-1 text-xs text-primary-500 dark:text-primary-400">
                      ≈ ${(pricePerToken * exchangeRate).toFixed(4)} USD per token
                    </p>
                  )}
                </div>

                {pricePerToken > 0 && tokenAmount > 0 && (
                  <div className="p-3 bg-primary-50 dark:bg-primary-800/40 rounded-md">
                    <h4 className="text-sm font-medium text-primary-900 dark:text-white mb-1">Summary</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-primary-600 dark:text-primary-400">Token Amount:</div>
                      <div className="text-primary-900 dark:text-white text-right">{tokenAmount.toLocaleString()}</div>

                      <div className="text-primary-600 dark:text-primary-400">Price per Token:</div>
                      <div className="text-primary-900 dark:text-white text-right">
                        {pricePerToken.toFixed(6)} HBAR (${(pricePerToken * exchangeRate).toFixed(2)})
                      </div>

                      <div className="text-primary-600 dark:text-primary-400">Total Value:</div>
                      <div className="font-medium text-primary-900 dark:text-white text-right">
                        {(tokenAmount * pricePerToken).toFixed(6)} HBAR
                        <span className="block text-xs text-primary-500 dark:text-primary-400">
                          (${(tokenAmount * pricePerToken * exchangeRate).toFixed(2)} USD)
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-secondary-600 hover:bg-secondary-700 text-white font-medium py-2 px-4 rounded-md 
                  shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 
                  disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Processing...' : `Create ${offerType === 'buy' ? 'Buy' : 'Sell'} Offer`}
                  </button>
                </div>
              </form>
            </div>
        )}
      </div>
    </div>
  );
};

export default P2PTrading;

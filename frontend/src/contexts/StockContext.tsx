'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Client, ContractId, ContractCallQuery, ContractExecuteTransaction,
  Hbar, ContractFunctionParameters, ContractFunctionResult
} from '@hashgraph/sdk';
import { useWallet } from './WalletContext';
import { withErrorHandling, validateWallet, validateContractId, validateContractDependencies } from '../utils/errorUtils';
import { Stock, BuyOffer, SellOffer, calculateTotalHbar, calculateUsdValue } from '../types/stock';
import * as hederaService from '../services/hederaService';
import { formatError, logError, isRetryableError } from '../utils/errorUtils';

type StockContextType = {
  stocks: Stock[];
  userBalances: Record<string, string>;
  buyOffers: BuyOffer[];
  sellOffers: SellOffer[];
  isLoading: boolean;
  error: string | null;
  fetchStocks: () => Promise<void>;
  fetchUserBalances: () => Promise<void>;
  mintStock: (stockId: string, hbarAmount: number) => Promise<boolean>;
  redeemStock: (stockId: string, tokenAmount: number) => Promise<boolean>;
  createBuyOffer: (stockId: string, amount: number, pricePerToken: number) => Promise<string>;
  createSellOffer: (stockId: string, amount: number, pricePerToken: number) => Promise<string>;
  deleteBuyOffer: (offerId: string) => Promise<boolean>;
  deleteSellOffer: (offerId: string) => Promise<boolean>;
  sellToOffer: (offerId: string) => Promise<boolean>;
  buyFromOffer: (offerId: string) => Promise<boolean>;
  fetchOffers: () => Promise<void>;
  exchangeRate: number;
};

const defaultContext: StockContextType = {
  stocks: [],
  userBalances: {},
  buyOffers: [],
  sellOffers: [],
  isLoading: false,
  error: null,
  fetchStocks: async () => { },
  fetchUserBalances: async () => { },
  mintStock: async () => false,
  redeemStock: async () => false,
  createBuyOffer: async () => "",
  createSellOffer: async () => "",
  deleteBuyOffer: async () => false,
  deleteSellOffer: async () => false,
  sellToOffer: async () => false,
  buyFromOffer: async () => false,
  fetchOffers: async () => { },
  exchangeRate: 0,
};

const StockContext = createContext<StockContextType>(defaultContext);

export const useStock = () => useContext(StockContext);

interface StockProviderProps {
  children: ReactNode;
}

export const StockProvider: React.FC<StockProviderProps> = ({ children }) => {
  const { client, isConnected, accountId, smartWalletId, executeTransaction, balance } = useWallet();

  const [stocks, setStocks] = useState<Stock[]>([]);
  const [userBalances, setUserBalances] = useState<Record<string, string>>({});
  const [buyOffers, setBuyOffers] = useState<BuyOffer[]>([]);
  const [sellOffers, setSellOffers] = useState<SellOffer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number>(0);

  // Contract IDs from environment variables
  const manageStockContractId = process.env.NEXT_PUBLIC_MANAGE_STOCK_CONTRACT_ID || '';
  const mintStockContractId = process.env.NEXT_PUBLIC_MINT_STOCK_CONTRACT_ID || '';
  const redeemStockContractId = process.env.NEXT_PUBLIC_REDEEM_STOCK_CONTRACT_ID || '';
  const p2pOffersContractId = process.env.NEXT_PUBLIC_P2P_OFFERS_CONTRACT_ID || '';
  const p2pTradeContractId = process.env.NEXT_PUBLIC_P2P_TRADE_CONTRACT_ID || '';

  // Validate contract dependencies on component mount
  useEffect(() => {
    const contractDependencies = {
      [manageStockContractId]: 'Stock Management',
      [mintStockContractId]: 'Stock Minting',
      [redeemStockContractId]: 'Stock Redemption',
      [p2pOffersContractId]: 'P2P Offers',
      [p2pTradeContractId]: 'P2P Trading'
    };

    validateContractDependencies(contractDependencies, setError);
  }, [manageStockContractId, mintStockContractId, redeemStockContractId, p2pOffersContractId, p2pTradeContractId]);

  // Initialize and fetch stocks when context loads
  useEffect(() => {
    // Only fetch if we have a client
    if (!client) return;

    console.log('StockContext: Initializing with client');

    // Stagger the initialization to prevent overwhelming the client
    const initializeStockContext = async () => {
      try {
        // First, wait a moment for client to fully initialize
        await new Promise(resolve => setTimeout(resolve, 500));

        // Fetch exchange rate first
        console.log('Fetching exchange rate...');
        await fetchExchangeRate();

        // Wait a bit before fetching stocks
        await new Promise(resolve => setTimeout(resolve, 300));

        // Fetch all stocks
        console.log('Fetching stocks...');
        await fetchStocks();
      } catch (err) {
        console.error('Error initializing stock context:', err);
      }
    };

    initializeStockContext();
  }, [client]);

  // Fetch user balances when account changes or after stocks are loaded
  useEffect(() => {
    if (!client || !accountId || stocks.length === 0) return;

    // Add a small delay to ensure client is ready
    const loadUserData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('Fetching user balances...');
        await fetchUserBalances();

        // Wait a moment before fetching offers
        await new Promise(resolve => setTimeout(resolve, 300));
        console.log('Fetching offers...');
        await fetchOffers();
      } catch (err) {
        console.error('Error loading user stock data:', err);
      }
    };

    loadUserData();
  }, [client, accountId, stocks]);

  // Fetch exchange rate from Hedera
  const fetchExchangeRate = async () => {
    if (!client) return;

    try {
      // Check if manageStockContractId is valid before proceeding
      if (!manageStockContractId) {
        console.error('MANAGE_STOCK_CONTRACT_ID is not configured in environment variables');
        return;
      }

      console.log('Fetching HBAR exchange rate...');

      // Use the improved queryContract function with retry logic
      const result = await hederaService.queryContract(
        manageStockContractId,
        "getHbarExchangeRate"
      );

      // The exchange rate is returned as tiny cents per tiny bar (8 decimal places)
      // We convert to a more usable number (USD per HBAR)
      const rateValue = Number(result.getInt64(0));
      const adjustedRate = rateValue / 100000000;

      setExchangeRate(adjustedRate);
      console.log(`HBAR exchange rate: $${adjustedRate}`);
    } catch (err: any) {
      logError('fetchExchangeRate', err);
      // Non-blocking error, continue with default exchange rate
    }
  };

  // Fetch all stocks from ManageStock contract
  const fetchStocks = async () => {
    if (!client) return;

    setIsLoading(true);
    setError(null);

    try {
      // Check if manageStockContractId is valid before proceeding
      if (!manageStockContractId) {
        throw new Error('MANAGE_STOCK_CONTRACT_ID is not configured in environment variables');
      }

      // Validate contract ID format before attempting to use it
      if (!validateContractId(manageStockContractId)) {
        throw new Error('Invalid MANAGE_STOCK_CONTRACT_ID format. It should be in the format 0.0.number');
      }

      console.log('Fetching all stocks...');

      // Use the improved queryContract function with retry logic
      const result = await hederaService.queryContract(
        manageStockContractId,
        "getAllStocks"
      );

      try {
        // Parse the response (implementation depends on your contract's return format)
        // This is just an example of how you might process the result
        const stockCount = result.getUint32(0);
        const newStocks: Stock[] = [];

        // Example parsing logic (adjust based on your actual contract return format)
        for (let i = 0; i < stockCount; i++) {
          const tokenId = result.getString(i * 4 + 1);
          const name = result.getString(i * 4 + 2);
          const symbol = result.getString(i * 4 + 3);
          const price = Number(result.getUint256(i * 4 + 4));

          newStocks.push({
            id: tokenId,
            name,
            symbol,
            price,
            hbarPrice: price / 100000000,
            usdPrice: (price / 100000000) * exchangeRate
          });
        }

        setStocks(newStocks);
        console.log(`Fetched ${newStocks.length} stocks`);
      } catch (parseErr: any) {
        console.error('Failed to parse stocks response:', parseErr);
        throw new Error(`Could not parse stock data: ${parseErr.message}`);
      }
    } catch (err: any) {
      const errorMessage = formatError(err);
      console.error('Failed to fetch stocks:', errorMessage);
      setError(`Failed to fetch stocks: ${errorMessage}`);
      // If error is temporary, let user know they can retry
      if (isRetryableError(err)) {
        setError('Network is busy. Please try refreshing the page in a moment.');
      } else {
        setError(`Failed to fetch stocks: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user balances for all stocks
  const fetchUserBalances = async () => {
    if (!client || !accountId) return;

    try {
      // Make sure client has operator set
      if (!client.operatorAccountId) {
        console.error('Client does not have an operator account set for fetching balances.');
        return;
      }

      // Check if manageStockContractId is valid before proceeding
      if (!manageStockContractId) {
        console.error('MANAGE_STOCK_CONTRACT_ID is not configured in environment variables');
        return;
      }

      const newBalances: Record<string, number> = {};

      for (const stock of stocks) {
        const query = new ContractCallQuery()
          .setContractId(ContractId.fromString(manageStockContractId))
          .setGas(100000)
          .setFunction("getBalance", new ContractFunctionParameters()
            .addAddress(stock.id)
            .addString(accountId))
          .setMaxQueryPayment(new Hbar(0.1)); // Set explicit payment

        // Execute with retry logic
        let attempts = 0;
        let response;

        while (attempts < 3) {
          try {
            // Add a small delay before executing
            await new Promise(resolve => setTimeout(resolve, 100));
            response = await query.execute(client);
            break; // Success, exit loop
          } catch (execErr: any) {
            attempts++;
            console.log(`Balance query attempt ${attempts} for ${stock.name} failed:`, execErr.message);

            if (attempts >= 3) {
              console.error(`Failed to fetch balance for ${stock.name} after 3 attempts`);
              break; // Skip this stock and continue with others
            }

            if (execErr.message && execErr.message.includes('CostQuery has not been loaded yet')) {
              console.log(`Retrying balance query after CostQuery error (attempt ${attempts})...`);
              await new Promise(resolve => setTimeout(resolve, 500 * attempts)); // Increasing delay
            } else {
              break; // Other error, skip this stock
            }
          }
        }

        if (!response) {
          console.error(`Failed to get balance for ${stock.name}`);
          continue; // Skip to next stock
        }

        const balance = Number(response.getUint256(0)) / 1e18; // Convert from wei to full token
        newBalances[stock.id] = balance;
      }

      setUserBalances(newBalances);
      console.log('User balances fetched:', newBalances);
    } catch (err) {
      console.error('Failed to fetch user balances:', err);
      // Continue with other operations - non-blocking error
    }
  };

  // Mint new stock tokens with HBAR
  const mintStock = async (stockId: string, hbarAmount: number) => {
    if (!validateWallet(client, smartWalletId, isConnected, setError)) {
      return false;
    }

    // Validate mintStockContractId
    if (!mintStockContractId) {
      setError('MINT_STOCK_CONTRACT_ID is not configured in environment variables');
      return false;
    }

    // Validate stockId
    if (!stockId) {
      setError('Invalid stock ID');
      return false;
    }

    return withErrorHandling(
      async () => {
        // Execute mintNewStock function through smart wallet
        await executeTransaction(
          mintStockContractId,
          "mintNewStock",
          [stockId],
          hbarAmount // Value in HBAR to be converted to tokens
        );

        // Refresh balances after minting
        await fetchUserBalances();
        return true;
      },
      setIsLoading,
      setError,
      'Failed to mint stock',
      false
    );
  };

  // Redeem stock tokens for HBAR
  const redeemStock = async (stockId: string, tokenAmount: number) => {
    if (!validateWallet(client, smartWalletId, isConnected, setError)) {
      return false;
    }

    // Validate redeemStockContractId
    if (!redeemStockContractId) {
      setError('REDEEM_STOCK_CONTRACT_ID is not configured in environment variables');
      return false;
    }

    // Validate stockId
    if (!stockId) {
      setError('Invalid stock ID');
      return false;
    }

    return withErrorHandling(
      async () => {
        // First approve tokens for redemption
        const stock = stocks.find(s => s.id === stockId);
        if (!stock) throw new Error('Stock not found');

        // For HTS tokens, approve spending
        if (stock.isHederaToken) {
          await executeTransaction(
            stockId,
            "approve",
            [redeemStockContractId, tokenAmount],
            0
          );
        }

        // Execute redeem function
        await executeTransaction(
          redeemStockContractId,
          "redeemStock",
          [stockId, tokenAmount],
          0
        );

        // Refresh balances after redemption
        await fetchUserBalances();
        return true;
      },
      setIsLoading,
      setError,
      'Failed to redeem stock',
      false
    );
  };

  // Create a buy offer
  const createBuyOffer = async (stockId: string, amount: number, pricePerToken: number) => {
    if (!validateWallet(client, smartWalletId, isConnected, setError)) {
      return "";
    }

    // Validate p2pOffersContractId
    if (!p2pOffersContractId) {
      setError('P2P_OFFERS_CONTRACT_ID is not configured in environment variables');
      return "";
    }

    // Validate stockId
    if (!stockId) {
      setError('Invalid stock ID');
      return "";
    }

    return withErrorHandling(
      async () => {
        // Calculate total value required
        const totalHbarValue = amount * pricePerToken;

        // Execute createBuyOffer function
        const result = await executeTransaction(
          p2pOffersContractId,
          "createBuyOffer",
          [stockId, amount, pricePerToken],
          totalHbarValue // Send HBAR with the transaction
        );

        // Parse offerId from transaction results
        const offerId = result.contractFunctionResult?.getString(0) || "1";

        // Refresh offers
        await fetchOffers();
        return offerId;
      },
      setIsLoading,
      setError,
      'Failed to create buy offer',
      ""
    );
  };

  // Create a sell offer
  const createSellOffer = async (stockId: string, amount: number, pricePerToken: number) => {
    if (!client || !smartWalletId || !isConnected) {
      setError('Wallet not connected or initialized');
      return "";
    }

    setIsLoading(true);
    setError(null);

    try {
      const stock = stocks.find(s => s.id === stockId);
      if (!stock) throw new Error('Stock not found');

      // For HTS or ERC20 tokens, approve spending by the P2P contract
      await executeTransaction(
        stockId,
        "approve",
        [p2pOffersContractId, amount],
        0
      );

      // Execute createSellOffer function
      const result = await executeTransaction(
        p2pOffersContractId,
        "createSellOffer",
        [stockId, amount, pricePerToken],
        0
      );

      // Parse offerId from result (implementation depends on contract response)
      const offerId = "1"; // Placeholder

      // Refresh offers
      await fetchOffers();
      return offerId;
    } catch (err: any) {
      console.error('Failed to create sell offer:', err);
      setError(`Failed to create sell offer: ${err.message}`);
      return "";
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a buy offer
  const deleteBuyOffer = async (offerId: string) => {
    if (!client || !smartWalletId || !isConnected) {
      setError('Wallet not connected or initialized');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Execute deleteBuyOffer function
      await executeTransaction(
        p2pOffersContractId,
        "deleteBuyOffer",
        [offerId],
        0
      );

      // Refresh offers
      await fetchOffers();
      return true;
    } catch (err: any) {
      console.error('Failed to delete buy offer:', err);
      setError(`Failed to delete buy offer: ${err.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a sell offer
  const deleteSellOffer = async (offerId: string) => {
    if (!client || !smartWalletId || !isConnected) {
      setError('Wallet not connected or initialized');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Execute deleteSellOffer function
      await executeTransaction(
        p2pOffersContractId,
        "deleteSellOffer",
        [offerId],
        0
      );

      // Refresh offers
      await fetchOffers();
      return true;
    } catch (err: any) {
      console.error('Failed to delete sell offer:', err);
      setError(`Failed to delete sell offer: ${err.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Execute a trade by selling to a buy offer
  const sellToOffer = async (offerId: string) => {
    if (!client || !smartWalletId || !isConnected) {
      setError('Wallet not connected or initialized');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Find the offer details
      const offer = buyOffers.find(o => o.offerId === offerId);
      if (!offer) throw new Error('Offer not found');

      // Approve token transfer for the trade
      await executeTransaction(
        offer.stockContract,
        "approve",
        [p2pTradeContractId, offer.stockAmount],
        0
      );

      // Execute sellToABuyer function
      await executeTransaction(
        p2pTradeContractId,
        "sellToABuyer",
        [offerId],
        0
      );

      // Refresh data
      await fetchOffers();
      await fetchUserBalances();
      return true;
    } catch (err: any) {
      console.error('Failed to execute sell to offer:', err);
      setError(`Failed to execute trade: ${err.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Execute a trade by buying from a sell offer
  const buyFromOffer = async (offerId: string) => {
    if (!client || !smartWalletId || !isConnected) {
      setError('Wallet not connected or initialized');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Find the offer details
      const offer = sellOffers.find(o => o.offerId === offerId);
      if (!offer) throw new Error('Offer not found');

      // Calculate total HBAR to send
      const totalHbarValue = offer.stockAmount * offer.offerPriceHbar;

      // Execute buyFromASeller function
      await executeTransaction(
        p2pTradeContractId,
        "buyFromASeller",
        [offerId],
        totalHbarValue // Send HBAR with the transaction
      );

      // Refresh data
      await fetchOffers();
      await fetchUserBalances();
      return true;
    } catch (err: any) {
      console.error('Failed to execute buy from offer:', err);
      setError(`Failed to execute trade: ${err.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all active buy and sell offers
  const fetchOffers = async () => {
    if (!client) return;

    try {
      // Check if offersContractId is valid before proceeding
      if (!p2pTradeContractId) {
        console.error('P2P_TRADE_CONTRACT_ID is not configured in environment variables');
        return;
      }

      // Make sure client has operator set
      if (!client.operatorAccountId) {
        console.error('Client does not have an operator account set for fetching offers.');
        return;
      }

      // Get the total number of offers first
      const countQuery = new ContractCallQuery()
        .setContractId(ContractId.fromString(p2pTradeContractId))
        .setGas(100000)
        .setFunction("getOfferCount")
        .setMaxQueryPayment(new Hbar(0.1)); // Set explicit payment

      // Execute with retry logic for count query
      let attempts = 0;
      let countResponse;

      while (attempts < 3) {
        try {
          // Add a small delay before executing
          await new Promise(resolve => setTimeout(resolve, 100));
          countResponse = await countQuery.execute(client);
          break; // Success, exit loop
        } catch (execErr: any) {
          attempts++;
          console.log(`Offer count query attempt ${attempts} failed:`, execErr.message);

          if (attempts >= 3) {
            console.error('Failed to fetch offer count after 3 attempts');
            return; // Exit function if we can't get the count
          }

          if (execErr.message && execErr.message.includes('CostQuery has not been loaded yet')) {
            console.log(`Retrying offer count query after CostQuery error (attempt ${attempts})...`);
            await new Promise(resolve => setTimeout(resolve, 500 * attempts)); // Increasing delay
          } else {
            return; // Other error, exit function
          }
        }
      }

      if (!countResponse) {
        console.error('Offer count query failed after retries');
        return;
      }

      const count = countResponse.getUint256(0).toNumber();
      console.log(`Found ${count} offers`);

      const newOffers: BuyOffer[] = [];

      for (let i = 0; i < count; i++) {
        const offerQuery = new ContractCallQuery()
          .setContractId(ContractId.fromString(p2pTradeContractId))
          .setGas(100000)
          .setFunction("getOfferById", new ContractFunctionParameters().addUint256(i))
          .setMaxQueryPayment(new Hbar(0.1)); // Set explicit payment

        // Execute with retry logic for each offer
        attempts = 0;
        let offerResponse;

        while (attempts < 3) {
          try {
            // Add a small delay before executing
            await new Promise(resolve => setTimeout(resolve, 100));
            offerResponse = await offerQuery.execute(client);
            break; // Success, exit loop
          } catch (execErr: any) {
            attempts++;
            console.log(`Offer query attempt ${attempts} for offer #${i} failed:`, execErr.message);

            if (attempts >= 3) {
              console.error(`Failed to fetch offer #${i} after 3 attempts`);
              break; // Skip this offer and continue with others
            }

            if (execErr.message && execErr.message.includes('CostQuery has not been loaded yet')) {
              console.log(`Retrying offer query after CostQuery error (attempt ${attempts})...`);
              await new Promise(resolve => setTimeout(resolve, 500 * attempts)); // Increasing delay
            } else {
              break; // Other error, skip this offer
            }
          }
        }

        if (!offerResponse) {
          console.error(`Failed to get offer #${i}`);
          continue; // Skip to next offer
        }

        const result = offerResponse as ContractFunctionResult;

        const seller = result.getString(0);
        const stockAddress = result.getAddress(64);
        const pricePerUnit = Number(result.getUint256(96)) / 1e18;
        const quantity = Number(result.getUint256(128)) / 1e18;
        const isActive = result.getBool(160);

        // Skip inactive offers
        if (!isActive) continue;

        // Find the stock details for this offer
        const stock = stocks.find(s => s.id === stockAddress);
        if (!stock) continue; // Skip if we don't know about this stock

        newOffers.push({
          id: i,
          seller,
          stockId: stockAddress,
          stockShortName: stock.name,
          stockLongName: stock.symbol,
          pricePerUnit,
          quantity,
          isActive
        });
      }

      setBuyOffers(newOffers);
      setSellOffers(newOffers);
      console.log('Offers fetched:', newOffers);
    } catch (err) {
      console.error('Failed to fetch offers:', err);
      // Continue with other operations - non-blocking error
    }
  };

  return (
    <StockContext.Provider
      value={{
        stocks,
        userBalances,
        buyOffers,
        sellOffers,
        isLoading,
        error,
        fetchStocks,
        fetchUserBalances,
        mintStock,
        redeemStock,
        createBuyOffer,
        createSellOffer,
        deleteBuyOffer,
        deleteSellOffer,
        sellToOffer,
        buyFromOffer,
        fetchOffers,
        exchangeRate
      }}
    >
      {children}
    </StockContext.Provider>
  );
};

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
import * as stablecoinService from '../services/stablecoinService';
import * as stockDataService from '../services/stockDataService';
import { formatError, logError, isRetryableError } from '../utils/errorUtils';
import { ethers } from 'ethers';

type StockContextType = {
  stocks: Stock[];
  userBalances: Record<string, string>;
  stablecoinBalances: Record<string, string>;
  buyOffers: BuyOffer[];
  sellOffers: SellOffer[];
  isLoading: boolean;
  error: string | null;
  fetchStocks: () => Promise<void>;
  fetchUserBalances: () => Promise<void>;
  fetchStablecoinBalances: () => Promise<void>;
  mintStock: (stockId: string, hbarAmount: number) => Promise<boolean>;
  mintStockWithStablecoin: (stockId: string, amount: number, tokenSymbol: 'USDC' | 'USDT') => Promise<boolean>;
  redeemStock: (stockId: string, tokenAmount: number) => Promise<boolean>;
  createBuyOffer: (stockId: string, amount: number, pricePerToken: number) => Promise<string>;
  createBuyOfferWithStablecoin: (stockId: string, amount: number, pricePerToken: number, tokenSymbol: 'USDC' | 'USDT') => Promise<string>;
  createSellOffer: (stockId: string, amount: number, pricePerToken: number) => Promise<string>;
  deleteBuyOffer: (offerId: string) => Promise<boolean>;
  deleteSellOffer: (offerId: string) => Promise<boolean>;
  sellToOffer: (offerId: string) => Promise<boolean>;
  buyFromOffer: (offerId: string) => Promise<boolean>;
  buyFromOfferWithStablecoin: (offerId: string, tokenSymbol: 'USDC' | 'USDT') => Promise<boolean>;
  fetchOffers: () => Promise<void>;
  exchangeRate: number;
};

const defaultContext: StockContextType = {
  stocks: [],
  userBalances: {},
  stablecoinBalances: {},
  buyOffers: [],
  sellOffers: [],
  isLoading: false,
  error: null,
  fetchStocks: async () => { },
  fetchUserBalances: async () => { },
  fetchStablecoinBalances: async () => { },
  mintStock: async () => false,
  mintStockWithStablecoin: async () => false,
  redeemStock: async () => false,
  createBuyOffer: async () => "",
  createBuyOfferWithStablecoin: async () => "",
  createSellOffer: async () => "",
  deleteBuyOffer: async () => false,
  deleteSellOffer: async () => false,
  sellToOffer: async () => false,
  buyFromOffer: async () => false,
  buyFromOfferWithStablecoin: async () => false,
  fetchOffers: async () => { },
  exchangeRate: 0,
};

const StockContext = createContext<StockContextType>(defaultContext);

export const useStock = () => useContext(StockContext);

interface StockProviderProps {
  children: ReactNode;
}

export const StockProvider: React.FC<StockProviderProps> = ({ children }) => {
  const { client, isConnected, accountId, smartWalletId, executeTransaction, balance, signer, provider } = useWallet();

  const [stocks, setStocks] = useState<Stock[]>([]);
  const [userBalances, setUserBalances] = useState<Record<string, string>>({});
  const [stablecoinBalances, setStablecoinBalances] = useState<Record<string, string>>({});
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

        // Fetch stablecoin balances if provider is available
        if (provider && accountId) {
          await fetchStablecoinBalances();
        }

        // Wait a moment before fetching offers
        await new Promise(resolve => setTimeout(resolve, 300));
        console.log('Fetching offers...');
        await fetchOffers();
      } catch (err) {
        console.error('Error loading user stock data:', err);
      }
    };

    loadUserData();
  }, [client, accountId, stocks, provider]);

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
      console.log('Fetching stocks from sample data...');

      // Get stocks from our sample data
      const sampleStocks = await stockDataService.fetchLatestStockPrices();

      // Transform from StockData to Stock format
      const transformedStocks: Stock[] = sampleStocks.map(stock => ({
        id: stock.stockContractAddress,
        shortName: stock.stockSymbol,
        longName: stock.stockName,
        priceHbar: stock.stockPriceHBAR,
        isHederaToken: true // Assume all stocks are Hedera tokens
      }));

      setStocks(transformedStocks);
      console.log(`Loaded ${transformedStocks.length} stocks`);
    } catch (err: any) {
      const errorMessage = formatError('Could not fetch stock data', err);
      setError(errorMessage);
      logError('fetchStocks', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user balances for all stocks
  const fetchUserBalances = async () => {
    if (!client || !accountId) return;

    try {
      // Check if we're in mock/development mode or have connection issues
      const shouldUseMockData = !client.operatorAccountId || error || !manageStockContractId;

      if (shouldUseMockData) {
        console.log('Using mock data for balances due to connection issues');
        // Create mock balances for all stocks
        const mockBalances: Record<string, string> = {};

        stocks.forEach(stock => {
          // Generate a random balance between 0 and 100
          const randomBalance = (Math.random() * 100).toFixed(2);
          mockBalances[stock.id] = randomBalance;
        });

        setUserBalances(mockBalances);
        console.log('Mock balances created:', mockBalances);
        return;
      }

      // Continue with normal balance fetching if connected
      console.log('Fetching real user balances from blockchain...');

      // Make sure we're using properly formatted addresses
      const newBalances: Record<string, string> = {};

      for (const stock of stocks) {
        try {
          const query = new ContractCallQuery()
            .setContractId(ContractId.fromString(manageStockContractId))
            .setGas(100000)
            .setFunction("getBalance", new ContractFunctionParameters()
              .addAddress(stock.id)
              .addString(accountId))
            .setMaxQueryPayment(new Hbar(0.1));

          const response = await query.execute(client);
          const balance = Number(response.getUint256(0)) / 1e18;
          newBalances[stock.id] = balance.toString();
        } catch (stockErr) {
          console.error(`Error fetching balance for ${stock.shortName}:`, stockErr);
          // Set a default zero balance
          newBalances[stock.id] = "0";
        }
      }

      setUserBalances(newBalances);
      console.log('User balances fetched:', newBalances);
    } catch (err) {
      console.error('Failed to fetch user balances:', err);

      // Create mock balances as fallback
      const mockBalances: Record<string, string> = {};
      stocks.forEach(stock => {
        mockBalances[stock.id] = "0";
      });
      setUserBalances(mockBalances);
    }
  };

  // Fetch user stablecoin balances
  const fetchStablecoinBalances = async () => {
    if (!provider || !accountId) return;

    setIsLoading(true);
    setError(null);

    try {
      const balances: Record<string, string> = {};

      // Get USDC balance
      if (stablecoinService.SUPPORTED_TOKENS.USDC.address) {
        const usdcBalance = await stablecoinService.getTokenBalance(
          stablecoinService.SUPPORTED_TOKENS.USDC.address,
          accountId,
          provider
        );
        balances['USDC'] = usdcBalance;
      }

      // Get USDT balance
      if (stablecoinService.SUPPORTED_TOKENS.USDT.address) {
        const usdtBalance = await stablecoinService.getTokenBalance(
          stablecoinService.SUPPORTED_TOKENS.USDT.address,
          accountId,
          provider
        );
        balances['USDT'] = usdtBalance;
      }

      setStablecoinBalances(balances);
    } catch (err: any) {
      logError('fetchStablecoinBalances', err);
      // Non-blocking error, continue with other operations
    } finally {
      setIsLoading(false);
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

  // Mint stock with stablecoin (USDC/USDT)
  const mintStockWithStablecoin = async (stockId: string, amount: number, tokenSymbol: 'USDC' | 'USDT') => {
    if (!validateWallet(isConnected, smartWalletId, setError)) return false;

    setIsLoading(true);
    setError(null);

    try {
      // Get token address
      const tokenAddress = stablecoinService.SUPPORTED_TOKENS[tokenSymbol].address;
      if (!tokenAddress) {
        throw new Error(`${tokenSymbol} token address is not configured`);
      }

      // Get token decimals and calculate exact amount
      const tokenDecimals = stablecoinService.SUPPORTED_TOKENS[tokenSymbol].decimals;
      const exactAmount = ethers.utils.parseUnits(amount.toString(), tokenDecimals);

      // Check if user has enough balance
      const tokenBalance = await stablecoinService.getTokenBalance(
        tokenAddress,
        accountId,
        provider
      );
      const balanceInWei = ethers.utils.parseUnits(tokenBalance, tokenDecimals);

      if (balanceInWei.lt(exactAmount)) {
        throw new Error(`Insufficient ${tokenSymbol} balance`);
      }

      // Convert stablecoin to HBAR amount
      const hbarAmount = await stablecoinService.convertToHbar(amount, tokenSymbol);

      // Approve token spending
      const spenderAddress = mintStockContractId; // The contract that will receive the stablecoins
      const approved = await stablecoinService.approveTokenSpend(
        tokenAddress,
        spenderAddress,
        exactAmount.toString(),
        signer
      );

      if (!approved) {
        throw new Error(`Failed to approve ${tokenSymbol} spending`);
      }

      // Execute mint transaction with HBAR equivalent
      const tx = await executeTransaction({
        contractId: mintStockContractId,
        functionName: "mintNewStock",
        params: new ContractFunctionParameters().addAddress(stockId),
        payableAmount: new Hbar(hbarAmount.toString())
      });

      return tx.success;
    } catch (err: any) {
      const errorMessage = formatError(err, "Failed to mint stock with stablecoin");
      setError(errorMessage);
      console.error('mintStockWithStablecoin error:', errorMessage);
      return false;
    } finally {
      setIsLoading(false);

      // Refresh balances after minting
      fetchUserBalances();
      fetchStablecoinBalances();
    }
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

  // Create a buy offer with stablecoin
  const createBuyOfferWithStablecoin = async (stockId: string, amount: number, pricePerToken: number, tokenSymbol: 'USDC' | 'USDT') => {
    if (!validateWallet(isConnected, smartWalletId, setError)) return "";

    setIsLoading(true);
    setError(null);

    try {
      // Get token address
      const tokenAddress = stablecoinService.SUPPORTED_TOKENS[tokenSymbol].address;
      if (!tokenAddress) {
        throw new Error(`${tokenSymbol} token address is not configured`);
      }

      // Calculate total stablecoin amount needed
      const totalStablecoinAmount = amount * pricePerToken;

      // Get token decimals and calculate exact amount
      const tokenDecimals = stablecoinService.SUPPORTED_TOKENS[tokenSymbol].decimals;
      const exactAmount = ethers.utils.parseUnits(totalStablecoinAmount.toString(), tokenDecimals);

      // Check if user has enough balance
      const tokenBalance = await stablecoinService.getTokenBalance(
        tokenAddress,
        accountId,
        provider
      );
      const balanceInWei = ethers.utils.parseUnits(tokenBalance, tokenDecimals);

      if (balanceInWei.lt(exactAmount)) {
        throw new Error(`Insufficient ${tokenSymbol} balance`);
      }

      // Convert stablecoin to HBAR amount for the smart contract
      const hbarEquivalent = await stablecoinService.convertToHbar(totalStablecoinAmount, tokenSymbol);

      // Approve token spending
      const spenderAddress = p2pOffersContractId; // The contract that will receive the stablecoins
      const approved = await stablecoinService.approveTokenSpend(
        tokenAddress,
        spenderAddress,
        exactAmount.toString(),
        signer
      );

      if (!approved) {
        throw new Error(`Failed to approve ${tokenSymbol} spending`);
      }

      // Execute createBuyOffer transaction with HBAR equivalent
      const tx = await executeTransaction({
        contractId: p2pOffersContractId,
        functionName: "createBuyOffer",
        params: new ContractFunctionParameters()
          .addAddress(stockId)
          .addUint256(amount)
          .addUint256(pricePerToken),
        payableAmount: new Hbar(hbarEquivalent.toString())
      });

      if (tx.success && tx.receipt) {
        // Extract offer ID from logs
        const newOfferId = tx.receipt.toString();
        await fetchOffers();
        return newOfferId;
      }

      return "";
    } catch (err: any) {
      const errorMessage = formatError(err, "Failed to create buy offer with stablecoin");
      setError(errorMessage);
      console.error('createBuyOfferWithStablecoin error:', errorMessage);
      return "";
    } finally {
      setIsLoading(false);

      // Refresh stablecoin balances after transaction
      fetchStablecoinBalances();
    }
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
    return withErrorHandling(async () => {
      validateWallet(isConnected, accountId);
      validateContractId(p2pTradeContractId);

      setIsLoading(true);

      console.log(`Executing sell to offer: ${offerId}`);

      const params = new ContractFunctionParameters()
        .addString(offerId);

      const result = await executeTransaction(
        p2pTradeContractId,
        "doP2PTrade",
        params
      );

      // Check if the transaction was successful
      if (result) {
        console.log(`Successfully sold to offer: ${offerId}`);

        // Refresh offers and balances after transaction
        await fetchOffers();
        await fetchUserBalances();
        return true;
      }

      return false;
    }, setError, setIsLoading);
  };

  const buyFromOffer = async (offerId: string) => {
    return withErrorHandling(async () => {
      validateWallet(isConnected, accountId);
      validateContractId(p2pTradeContractId);

      setIsLoading(true);

      console.log(`Executing buy from offer: ${offerId}`);

      const params = new ContractFunctionParameters()
        .addString(offerId);

      const result = await executeTransaction(
        p2pTradeContractId,
        "doP2PTrade",
        params
      );

      // Check if the transaction was successful
      if (result) {
        console.log(`Successfully bought from offer: ${offerId}`);

        // Refresh offers and balances after transaction
        await fetchOffers();
        await fetchUserBalances();
        return true;
      }

      return false;
    }, setError, setIsLoading);
  };

  // Buy from a sell offer using stablecoin
  const buyFromOfferWithStablecoin = async (offerId: string, tokenSymbol: 'USDC' | 'USDT') => {
    if (!validateWallet(isConnected, smartWalletId, setError)) return false;

    setIsLoading(true);
    setError(null);

    try {
      // Find the offer details
      const offer = sellOffers.find(offer => offer.offerId === offerId);
      if (!offer) {
        throw new Error("Sell offer not found");
      }

      // Calculate total HBAR needed for purchase
      const totalHbarNeeded = calculateTotalHbar(offer.stockAmount, offer.offerPriceHbar);

      // Convert HBAR to stablecoin amount
      const stablecoinAmount = totalHbarNeeded * exchangeRate;

      // Get token address
      const tokenAddress = stablecoinService.SUPPORTED_TOKENS[tokenSymbol].address;
      if (!tokenAddress) {
        throw new Error(`${tokenSymbol} token address is not configured`);
      }

      // Get token decimals and calculate exact amount
      const tokenDecimals = stablecoinService.SUPPORTED_TOKENS[tokenSymbol].decimals;
      const exactAmount = ethers.utils.parseUnits(stablecoinAmount.toString(), tokenDecimals);

      // Check if user has enough balance
      const tokenBalance = await stablecoinService.getTokenBalance(
        tokenAddress,
        accountId,
        provider
      );
      const balanceInWei = ethers.utils.parseUnits(tokenBalance, tokenDecimals);

      if (balanceInWei.lt(exactAmount)) {
        throw new Error(`Insufficient ${tokenSymbol} balance`);
      }

      // Approve token spending
      const spenderAddress = p2pTradeContractId; // The contract that will receive the stablecoins
      const approved = await stablecoinService.approveTokenSpend(
        tokenAddress,
        spenderAddress,
        exactAmount.toString(),
        signer
      );

      if (!approved) {
        throw new Error(`Failed to approve ${tokenSymbol} spending`);
      }

      // Execute buyFromOffer transaction with HBAR
      const tx = await executeTransaction({
        contractId: p2pTradeContractId,
        functionName: "buyFromASeller",
        params: new ContractFunctionParameters().addUint256(Number(offerId)),
        payableAmount: new Hbar(totalHbarNeeded.toString())
      });

      if (tx.success) {
        await fetchOffers();
        await fetchUserBalances();
        await fetchStablecoinBalances();
        return true;
      }

      return false;
    } catch (err: any) {
      const errorMessage = formatError(err, "Failed to buy from offer with stablecoin");
      setError(errorMessage);
      console.error('buyFromOfferWithStablecoin error:', errorMessage);
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
        stablecoinBalances,
        buyOffers,
        sellOffers,
        isLoading,
        error,
        fetchStocks,
        fetchUserBalances,
        fetchStablecoinBalances,
        mintStock,
        mintStockWithStablecoin,
        redeemStock,
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
      }}
    >
      {children}
    </StockContext.Provider>
  );
};

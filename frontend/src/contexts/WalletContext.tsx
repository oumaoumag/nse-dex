'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { signTransaction } from '../utils/signatureUtils';
import * as hederaService from '../services/hederaService';
import * as walletService from '../services/walletService';
import * as tokenService from '../services/tokenService';
import { useSession } from 'next-auth/react';
import { getDemoBalances } from "@/services/walletService";

type WalletContextType = {
  client: any | null;
  accountId: string | null;
  isConnected: boolean;
  smartWalletId: string | null;
  balance: string | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  executeTransaction: (targetContract: string, functionName: string, params: any[], value?: number) => Promise<any>;
  executeBatchedTransactions: (transactions: BatchedTransaction[]) => Promise<any>;
  executeGaslessTransaction: (targetContract: string, functionName: string, params: any[], value?: number) => Promise<any>;
  guardians: string[];
  addGuardian: (guardianAddress: string) => Promise<boolean>;
  removeGuardian: (guardianAddress: string) => Promise<boolean>;
  initiateRecovery: (newOwnerAddress: string) => Promise<boolean>;
  approveRecovery: (walletToRecover: string, newOwnerAddress: string) => Promise<boolean>;
  cancelRecovery: () => Promise<boolean>;
  recoveryInProgress: boolean;
  recoveryInitiator: string | null;
  proposedNewOwner: string | null;
  // HTS functions
  getTokenBalance: (tokenId: string) => Promise<string>;
  associateToken: (tokenId: string) => Promise<boolean>;
  transferToken: (tokenId: string, recipientId: string, amount: number) => Promise<boolean>;
  getHbarExchangeRate: () => Promise<number>;
  signMessage: (message: string) => Promise<string>;
  // Added for external control
  setSmartWalletId: (id: string | null) => void;
  setError: (errorMessage: string | null) => void;
  // Added for reloading balances
  fetchBalance: () => Promise<void>;
  tokenBalances: Record<string, string>;
  // Admin status for administrative functions
  isAdmin: boolean;
};

const defaultContext: WalletContextType = {
  client: null,
  accountId: null,
  isConnected: false,
  smartWalletId: null,
  balance: null,
  isLoading: false,
  isError: false,
  error: null,
  executeTransaction: async () => ({}),
  executeBatchedTransactions: async () => ({}),
  executeGaslessTransaction: async () => ({}),
  guardians: [],
  addGuardian: async () => false,
  removeGuardian: async () => false,
  initiateRecovery: async () => false,
  approveRecovery: async () => false,
  cancelRecovery: async () => false,
  recoveryInProgress: false,
  recoveryInitiator: null,
  proposedNewOwner: null,
  getTokenBalance: async () => "0",
  associateToken: async () => false,
  transferToken: async () => false,
  getHbarExchangeRate: async () => 0,
  signMessage: async () => "",
  setSmartWalletId: () => { },
  setError: () => { },
  fetchBalance: async () => { },
  tokenBalances: {},
  isAdmin: false,
};

const WalletContext = createContext<WalletContextType>(defaultContext);

export const useWallet = () => useContext(WalletContext);

interface BatchedTransaction {
  targetContract: string;
  functionName: string;
  params: any[];
  value: number;
}

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const { data: session, status } = useSession();
  const [client, setClient] = useState<any | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [smartWalletId, setSmartWalletId] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [tokenBalances, setTokenBalances] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);
  const [guardians, setGuardians] = useState<string[]>([]);
  const [recoveryInProgress, setRecoveryInProgress] = useState<boolean>(false);
  const [recoveryInitiator, setRecoveryInitiator] = useState<string | null>(null);
  const [proposedNewOwner, setProposedNewOwner] = useState<string | null>(null);
  const [privateKeyStr, setPrivateKeyStr] = useState<string | null>(null);

  // Initialize client when session changes
  useEffect(() => {
    const initClient = async () => {
      if (status !== 'authenticated' || !session?.user?.id) {
        // Clear wallet state if not authenticated
        setClient(null);
        setAccountId(null);
        setIsConnected(false);
        return;
      }

      try {
        // Clear any previous errors
        setError(null);
        setIsError(false);

        // Check if we're in demo mode
        const isDemoMode = localStorage.getItem('tajiri-demo-mode') === 'true';
        if (isDemoMode) {
          console.log("Using demo mode for wallet connection");
          setAccountId(session.user.id);
          setIsConnected(true);
          // We don't set client in demo mode to force fallback behavior
          return;
        }

        console.log("Initializing Hedera client for user:", session.user.id);

        // Initialize Hedera client
        const client = hederaService.createClient();
        setClient(client);

        // In demo mode, we don't need to verify the client
        setAccountId(session.user.id);
        setIsConnected(true);

        // Try to load existing smart wallet ID from localStorage
        const savedSmartWalletId = localStorage.getItem('tajiri-smart-wallet-id');
        if (savedSmartWalletId) {
          console.log("Found smart wallet ID in localStorage:", savedSmartWalletId);
          setSmartWalletId(savedSmartWalletId);
        }
      } catch (err: any) {
        console.error("Failed to initialize client:", err);

        // Set to demo mode for fallback functionality
        localStorage.setItem('tajiri-demo-mode', 'true');
        setAccountId(session.user.id);
        setIsConnected(true);

        setError(`Hedera network connection issues detected. Using limited functionality mode.`);
        setIsError(true);
      }
    };

    initClient();
  }, [session, status]);

  // Update balance when accountId or smartWalletId changes
  useEffect(() => {
    if ((client && (accountId || smartWalletId)) || localStorage.getItem('tajiri-demo-mode') === 'true') {
      fetchBalance();
    }
  }, [client, accountId, smartWalletId]);

  // Update guardians when wallet changes
  useEffect(() => {
    if (smartWalletId) {
      fetchGuardians();
      checkRecoveryStatus();
    }
  }, [smartWalletId]);

  const fetchBalance = async () => {
    try {
      setIsLoading(true);
      // Check if we're in demo mode
      const isDemoMode = localStorage.getItem('tajiri-demo-mode') === 'true';

      if (isDemoMode || !client) {
        console.log("Using demo balances for wallet");
        const demoBalances = getDemoBalances();
        setBalance(demoBalances.HBAR || "100.00");
        setTokenBalances({
          USDC: demoBalances.USDC || "500.00",
          USDT: demoBalances.USDT || "500.00"
        });
        return;
      }

      if (!smartWalletId && !accountId) {
        console.warn("Cannot fetch balance, no wallet ID or account ID available");
        return;
      }

      // Determine which ID to use for balance queries
      const queryId = smartWalletId || accountId;
      if (!queryId) return;

      // Get HBAR balance
      let hbarBalance = "0.00";
      try {
        if (smartWalletId) {
          const walletBalance = await hederaService.getContractBalance(smartWalletId);
          hbarBalance = walletBalance;
        } else if (accountId) {
          const accountBalance = await hederaService.getAccountBalance(accountId);
          hbarBalance = accountBalance;
        }
      } catch (err) {
        console.error("Error fetching HBAR balance:", err);
        // Fall back to demo balance
        hbarBalance = "100.00";
      }

      setBalance(hbarBalance);

      // Fetch token balances
      const newTokenBalances: Record<string, string> = {};

      try {
        // Get USDC balance from token service
        const usdcBalance = await tokenService.getTokenBalance(queryId, 'USDC');
        newTokenBalances.USDC = usdcBalance;

        // Get USDT balance from token service
        const usdtBalance = await tokenService.getTokenBalance(queryId, 'USDT');
        newTokenBalances.USDT = usdtBalance;
      } catch (err) {
        console.error("Error fetching token balances:", err);
        // Fall back to demo balances
        newTokenBalances.USDC = "500.00";
        newTokenBalances.USDT = "500.00";
      }

      setTokenBalances(newTokenBalances);
    } catch (error) {
      console.error("Error fetching wallet balances:", error);
      setError("Failed to fetch wallet balances");
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGuardians = async () => {
    if (!client || !smartWalletId) return;

    try {
      const guardianList = await walletService.getGuardians(smartWalletId);
      setGuardians(guardianList);
    } catch (err: any) {
      console.error(`Failed to fetch guardians:`, err);
    }
  };

  const checkRecoveryStatus = async () => {
    if (!client || !smartWalletId) return;
    
    try {
      const recoveryStatus = await walletService.getRecoveryStatus(smartWalletId);
      setRecoveryInProgress(recoveryStatus.inProgress);
      setRecoveryInitiator(recoveryStatus.initiator);
      setProposedNewOwner(recoveryStatus.proposedOwner);
    } catch (err: any) {
      console.error(`Failed to check recovery status:`, err);
    }
  };

  const executeTransaction = async (
    targetContract: string, 
    functionName: string, 
    params: any[], 
    value: number = 0
  ) => {
    if (!client || !smartWalletId) {
      throw new Error('No wallet connected or smart wallet not created');
    }
    
    setIsLoading(true);
    setError(null);
    setIsError(false);
    
    try {
      const receipt = await walletService.executeTransaction(
        smartWalletId,
        targetContract,
        functionName,
        params,
        value
      );
      
      // Update balance after transaction
      await fetchBalance();
      
      return receipt;
    } catch (err: any) {
      setError(`Transaction failed: ${err.message}`);
      setIsError(true);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const executeBatchedTransactions = async (
    transactions: BatchedTransaction[]
  ) => {
    if (!client || !smartWalletId) {
      throw new Error('No wallet connected or smart wallet not created');
    }
    
    setIsLoading(true);
    setError(null);
    setIsError(false);
    
    try {
      const receipt = await walletService.executeBatchedTransactions(
        smartWalletId,
        transactions
      );

      // Update balance after transaction
      await fetchBalance();
      
      return receipt;
    } catch (err: any) {
      console.error('Batched transaction error:', err);
      setError(`Batched transaction failed: ${err.message}`);
      setIsError(true);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const executeGaslessTransaction = async (
    targetContract: string, 
    functionName: string, 
    params: any[], 
    value: number = 0
  ) => {
    if (!client || !smartWalletId) {
      throw new Error('No wallet connected or smart wallet not created');
    }
    
    setIsLoading(true);
    setError(null);
    setIsError(false);
    
    try {
      // Mock values for demo
      const mockAccountId = accountId || '0.0.12345';
      const mockPrivateKey = "DEMO_PRIVATE_KEY"; // This is just a placeholder, not a real key

      // For gas-less transactions, we use a relayer service
      const receipt = await walletService.executeGaslessTransaction(
        mockAccountId,
        smartWalletId,
        mockPrivateKey,
        targetContract,
        functionName,
        params,
        value
      );
      
      // Update balance after transaction
      await fetchBalance();
      
      return receipt;
    } catch (err: any) {
      console.error('Gas-less transaction error:', err);
      setError(`Gas-less transaction failed: ${err.message}`);
      setIsError(true);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const addGuardian = async (guardianAddress: string): Promise<boolean> => {
    if (!client || !smartWalletId) {
      throw new Error('No wallet connected or smart wallet not created');
    }
    
    setIsLoading(true);
    setError(null);
    setIsError(false);
    
    try {
      await walletService.addGuardian(smartWalletId, guardianAddress);
      
      // Refresh guardians list
      await fetchGuardians();
      
      return true;
    } catch (err: any) {
      console.error('Add guardian error:', err);
      setError(`Failed to add guardian: ${err.message}`);
      setIsError(true);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeGuardian = async (guardianAddress: string): Promise<boolean> => {
    if (!client || !smartWalletId) {
      throw new Error('No wallet connected or smart wallet not created');
    }
    
    setIsLoading(true);
    setError(null);
    setIsError(false);
    
    try {
      await walletService.removeGuardian(smartWalletId, guardianAddress);
      
      // Refresh guardians list
      await fetchGuardians();
      
      return true;
    } catch (err: any) {
      console.error('Remove guardian error:', err);
      setError(`Failed to remove guardian: ${err.message}`);
      setIsError(true);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const initiateRecovery = async (newOwnerAddress: string): Promise<boolean> => {
    if (!client || !smartWalletId) {
      throw new Error('No wallet connected or smart wallet not created');
    }
    
    setIsLoading(true);
    setError(null);
    setIsError(false);
    
    try {
      await walletService.initiateRecovery(smartWalletId, newOwnerAddress);

      // Refresh recovery status
      await checkRecoveryStatus();
      
      return true;
    } catch (err: any) {
      console.error('Initiate recovery error:', err);
      setError(`Failed to initiate recovery: ${err.message}`);
      setIsError(true);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const approveRecovery = async (walletToRecover: string, newOwnerAddress: string): Promise<boolean> => {
    if (!client) {
      throw new Error('No wallet connected');
    }
    
    setIsLoading(true);
    setError(null);
    setIsError(false);
    
    try {
      await walletService.approveRecovery(walletToRecover, newOwnerAddress);

      // If approving our own wallet recovery, refresh status
      if (walletToRecover === smartWalletId) {
        await checkRecoveryStatus();
      }
      
      return true;
    } catch (err: any) {
      console.error('Approve recovery error:', err);
      setError(`Failed to approve recovery: ${err.message}`);
      setIsError(true);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelRecovery = async (): Promise<boolean> => {
    if (!client || !smartWalletId) {
      throw new Error('No wallet connected or smart wallet not created');
    }
    
    setIsLoading(true);
    setError(null);
    setIsError(false);
    
    try {
      await walletService.cancelRecovery(smartWalletId);
      
      // Refresh recovery status
      await checkRecoveryStatus();
      
      return true;
    } catch (err: any) {
      console.error('Cancel recovery error:', err);
      setError(`Failed to cancel recovery: ${err.message}`);
      setIsError(true);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getTokenBalance = async (tokenId: string): Promise<string> => {
    if (!client || !smartWalletId) {
      throw new Error('No wallet connected or smart wallet not created');
    }

    try {
      return await walletService.getTokenBalance(smartWalletId, tokenId);
    } catch (err: any) {
      console.error('Get token balance error:', err);
      setError(`Failed to get token balance: ${err.message}`);
      setIsError(true);
      return "0";
    }
  };

  const associateToken = async (tokenId: string): Promise<boolean> => {
    if (!client || !smartWalletId) {
      throw new Error('No wallet connected or smart wallet not created');
    }

    setIsLoading(true);
    setError(null);
    setIsError(false);

    try {
      await walletService.associateToken(smartWalletId, tokenId);
      return true;
    } catch (err: any) {
      console.error('Associate token error:', err);
      setError(`Failed to associate token: ${err.message}`);
      setIsError(true);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const transferToken = async (tokenId: string, recipientId: string, amount: number): Promise<boolean> => {
    if (!client || !smartWalletId) {
      throw new Error('No wallet connected or smart wallet not created');
    }

    setIsLoading(true);
    setError(null);
    setIsError(false);

    try {
      await walletService.transferToken(smartWalletId, tokenId, recipientId, amount);
      return true;
    } catch (err: any) {
      console.error('Transfer token error:', err);
      setError(`Failed to transfer token: ${err.message}`);
      setIsError(true);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getHbarExchangeRate = async (): Promise<number> => {
    try {
      return await walletService.getHbarExchangeRate();
    } catch (err: any) {
      console.error('Get HBAR exchange rate error:', err);
      setError(`Failed to get HBAR exchange rate: ${err.message}`);
      setIsError(true);
      return 0;
    }
  };

  const signMessage = async (message: string): Promise<string> => {
    if (!privateKeyStr) {
      throw new Error('No private key available');
    }

    try {
      return signTransaction({ message }, privateKeyStr);
    } catch (err: any) {
      console.error('Error signing message:', err);
      setError(`Failed to sign message: ${err.message}`);
      setIsError(true);
      throw err;
    }
  };

  // Expose the setError method for external components
  const handleSetError = (errorMessage: string | null) => {
    setError(errorMessage);
    setIsError(!!errorMessage);
  };

  const value = {
    client,
    accountId,
    isConnected,
    smartWalletId,
    balance,
    isLoading,
    isError,
    error,
    executeTransaction,
    executeBatchedTransactions,
    executeGaslessTransaction,
    guardians,
    addGuardian,
    removeGuardian,
    initiateRecovery,
    approveRecovery,
    cancelRecovery,
    recoveryInProgress,
    recoveryInitiator,
    proposedNewOwner,
    getTokenBalance,
    associateToken,
    transferToken,
    getHbarExchangeRate,
    signMessage,
    setSmartWalletId,
    setError: handleSetError,
    fetchBalance,
    tokenBalances,
    isAdmin: false,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}; 
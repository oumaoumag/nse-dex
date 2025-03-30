'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Client, AccountId, PrivateKey, ContractId, 
  AccountBalanceQuery, ContractCallQuery, ContractFunctionParameters, ContractFunctionResult
} from '@hashgraph/sdk';
import { signTransaction } from '../utils/signatureUtils';
import * as hederaService from '../services/hederaService';
import * as walletService from '../services/walletService';

type WalletContextType = {
  client: Client | null;
  accountId: string | null;
  isConnected: boolean;
  smartWalletId: string | null;
  balance: string | null;
  isLoading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  executeTransaction: (targetContract: string, functionName: string, params: any[], value?: number) => Promise<any>;
  createSmartWallet: () => Promise<string>;
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
};

const defaultContext: WalletContextType = {
  client: null,
  accountId: null,
  isConnected: false,
  smartWalletId: null,
  balance: null,
  isLoading: false,
  error: null,
  connect: async () => { },
  connectWallet: async () => {},
  disconnectWallet: () => {},
  executeTransaction: async () => ({}),
  createSmartWallet: async () => "",
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
};

const WalletContext = createContext<WalletContextType>(defaultContext);

export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

interface BatchedTransaction {
  targetContract: string;
  functionName: string;
  params: any[];
  value: number;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [client, setClient] = useState<Client | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [smartWalletId, setSmartWalletId] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [guardians, setGuardians] = useState<string[]>([]);
  const [recoveryInProgress, setRecoveryInProgress] = useState<boolean>(false);
  const [recoveryInitiator, setRecoveryInitiator] = useState<string | null>(null);
  const [proposedNewOwner, setProposedNewOwner] = useState<string | null>(null);
  const [privateKeyStr, setPrivateKeyStr] = useState<string | null>(null);
  const [autoConnectAttempted, setAutoConnectAttempted] = useState<boolean>(false);

  // Auto-connect on component mount without user interaction
  useEffect(() => {
    if (!autoConnectAttempted && !isConnected) {
      const autoConnect = async () => {
        try {
          await connect();
          setAutoConnectAttempted(true);
        } catch (err) {
          console.error("Auto-connect failed:", err);
          setAutoConnectAttempted(true);
        }
      };

      autoConnect();
    }
  }, [autoConnectAttempted, isConnected]);

  // Check for existing connection on component mount
  useEffect(() => {
    const savedAccountId = localStorage.getItem('tajiri-account-id');
    const savedSmartWalletId = localStorage.getItem('tajiri-smart-wallet-id');
    
    if (savedAccountId) {
      // Initialize client with saved account
      const initClient = async () => {
        try {
          await connectWallet();
          if (savedSmartWalletId) {
            setSmartWalletId(savedSmartWalletId);
          }
        } catch (err) {
          console.error("Failed to initialize client:", err);
          setError("Failed to initialize Hedera client. Please try connecting your wallet again.");
        }
      };

      initClient();
    }
  }, []);

  // Update balance when account changes
  useEffect(() => {
    if (client && accountId) {
      fetchBalance();
    }
  }, [client, accountId]);

  // Update guardians when wallet changes
  useEffect(() => {
    if (smartWalletId) {
      fetchGuardians();
      checkRecoveryStatus();
    }
  }, [smartWalletId]);

  const fetchBalance = async () => {
    if (!client || !accountId) return;
    
    try {
      const accountBalance = await hederaService.getAccountBalance(accountId);
      setBalance(accountBalance);
    } catch (err: any) {
      setError(`Failed to fetch balance: ${err.message}`);
    }
  };

  const fetchGuardians = async () => {
    if (!client || !smartWalletId) return;
    
    setIsLoading(true);

    try {
      // Query the smart wallet for guardians
      const result = await hederaService.queryContract(
        smartWalletId,
        "getGuardians"
      );

      try {
        // Parse guardian addresses from result
        const guardianCount = result.getUint32(0);
        const addresses: string[] = [];

        for (let i = 0; i < guardianCount; i++) {
          const address = result.getAddress(i + 1);
          if (address) {
            addresses.push(address);
          }
        }

        setGuardians(addresses);
      } catch (decodeErr) {
        console.error('Failed to decode guardian addresses:', decodeErr);
        setGuardians([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch guardians:', err);
      setGuardians([]);

      // Don't set global error for this non-critical feature
      // setError(`Failed to fetch guardians: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const checkRecoveryStatus = async () => {
    if (!client || !smartWalletId) return;
    
    try {
      const result = await hederaService.queryContract(
        smartWalletId,
        "getRecoveryStatus"
      );

      try {
        // Parse the response
        const inProgress = result.getBool(0);
        const initiator = inProgress ? result.getAddress(1) : null;
        const newOwner = inProgress ? result.getAddress(2) : null;

        setRecoveryInProgress(inProgress);
        setRecoveryInitiator(initiator);
        setProposedNewOwner(newOwner);
      } catch (decodeErr) {
        console.error('Failed to decode recovery status:', decodeErr);
        setRecoveryInProgress(false);
        setRecoveryInitiator(null);
        setProposedNewOwner(null);
      }
    } catch (err: any) {
      console.error('Failed to check recovery status:', err);

      // Don't set global error for this non-critical feature
      setRecoveryInProgress(false);
      setRecoveryInitiator(null);
      setProposedNewOwner(null);
    }
  };

  // New silent auto-connect method
  const connect = async () => {
    try {
      // For this implementation, we're using local environment variables
      const myAccountId = hederaService.getOperatorAccountId();
      const myPrivateKey = hederaService.getOperatorPrivateKey();

      if (!myAccountId || !myPrivateKey) {
        console.log('Account credentials not found in environment variables');
        return;
      }

      // Test network connectivity before proceeding
      const isNetworkAvailable = await hederaService.testNetworkConnectivity();
      if (!isNetworkAvailable) {
        console.log('Hedera network appears to be unavailable or congested. Will retry later.');

        // Set a timer to retry in 5 seconds
        setTimeout(() => {
          if (!isConnected) {
            connect();
          }
        }, 5000);

        return;
      }

      // Store private key in memory
      setPrivateKeyStr(myPrivateKey);

      // Initialize client
      const newClient = hederaService.getClient();
      setClient(newClient);
      setAccountId(myAccountId);
      setIsConnected(true);

      // Store account ID in local storage
      localStorage.setItem('tajiri-account-id', myAccountId);

      // Check for existing smart wallet
      await checkExistingSmartWallet(myAccountId);

    } catch (err: any) {
      console.error("Silent connect failed:", err);
      // Don't set errors for silent connection
    }
  };

  const connectWallet = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // For this implementation, we're using local environment variables
      const myAccountId = hederaService.getOperatorAccountId();
      const myPrivateKey = hederaService.getOperatorPrivateKey();
      
      if (!myAccountId || !myPrivateKey) {
        throw new Error('Account credentials not found in environment variables');
      }
      
      // Test network connectivity before proceeding
      const isNetworkAvailable = await hederaService.testNetworkConnectivity();
      if (!isNetworkAvailable) {
        throw new Error('Hedera network appears to be unavailable or congested. Please try again later.');
      }

      // Store private key in memory
      setPrivateKeyStr(myPrivateKey);

      // Initialize client
      const newClient = hederaService.getClient();
      setClient(newClient);
      setAccountId(myAccountId);
      setIsConnected(true);

      // Store account ID in local storage
      localStorage.setItem('tajiri-account-id', myAccountId);

      // Check for existing smart wallet
      await checkExistingSmartWallet(myAccountId);

    } catch (err: any) {
      setError(`Wallet connection failed: ${err.message}`);
      console.error("Wallet connection failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to check for existing smart wallet
  const checkExistingSmartWallet = async (account: string) => {
    try {
      const walletId = await walletService.findSmartWalletForOwner(account);

      if (walletId) {
        setSmartWalletId(walletId);
        localStorage.setItem('tajiri-smart-wallet-id', walletId);
      }
    } catch (err) {
      console.error("Failed to check for existing smart wallet:", err);
    // Don't set error on this non-critical operation
    }
  };

  const disconnectWallet = () => {
    setClient(null);
    setAccountId(null);
    setIsConnected(false);
    setSmartWalletId(null);
    setBalance(null);
    setPrivateKeyStr(null);
    localStorage.removeItem('tajiri-account-id');
    localStorage.removeItem('tajiri-smart-wallet-id');
    hederaService.resetClient();
  };

  const createSmartWallet = async (): Promise<string> => {
    if (!client || !accountId) {
      throw new Error('No wallet connected');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (!accountId) {
        throw new Error('Account ID is required');
      }

      // First check if wallet already exists
      const existingWallet = await walletService.findSmartWalletForOwner(accountId);

      if (existingWallet) {
        console.log("Smart wallet already exists, using existing wallet:", existingWallet);
        setSmartWalletId(existingWallet);
        localStorage.setItem('tajiri-smart-wallet-id', existingWallet);
        return existingWallet;
      }

      // If no existing wallet, try to create a new one
      try {
        const newSmartWalletId = await walletService.createSmartWallet(accountId);
        setSmartWalletId(newSmartWalletId);
        localStorage.setItem('tajiri-smart-wallet-id', newSmartWalletId);
        return newSmartWalletId;
      } catch (createErr: any) {
        // If creation fails, try one more time to find existing wallet
        // This handles race conditions where wallet was created in another tab/session
        if (createErr.message && createErr.message.includes('CONTRACT_REVERT_EXECUTED')) {
          const retryExistingWallet = await walletService.findSmartWalletForOwner(accountId);
          if (retryExistingWallet) {
            console.log("Found existing wallet after creation attempt:", retryExistingWallet);
            setSmartWalletId(retryExistingWallet);
            localStorage.setItem('tajiri-smart-wallet-id', retryExistingWallet);
            return retryExistingWallet;
          }
        }
        throw createErr;
      }
    } catch (err: any) {
      console.error('Smart wallet creation error:', err);
      setError(`Failed to create smart wallet: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
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
      throw err;
    } finally {
      setIsLoading(false);
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
      throw err;
    }
  };

  const executeGaslessTransaction = async (
    targetContract: string, 
    functionName: string, 
    params: any[], 
    value: number = 0
  ) => {
    if (!client || !accountId || !privateKeyStr) {
      throw new Error('No wallet connected or missing credentials');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await walletService.executeGaslessTransaction(
        accountId,
        smartWalletId,
        privateKeyStr,
        targetContract,
        functionName,
        params,
        value
      );
      
      // Update balance after transaction
      await fetchBalance();
      
      return result;
    } catch (err: any) {
      console.error('Gasless transaction error:', err);
      setError(`Gasless transaction failed: ${err.message}`);
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
    
    try {
      await walletService.addGuardian(smartWalletId, guardianAddress);
      
      // Update the guardians list
      await fetchGuardians();
      
      return true;
    } catch (err: any) {
      setError(`Failed to add guardian: ${err.message}`);
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
    
    try {
      await walletService.removeGuardian(smartWalletId, guardianAddress);
      
      // Update the guardians list
      await fetchGuardians();
      
      return true;
    } catch (err: any) {
      setError(`Failed to remove guardian: ${err.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // The remaining functions for recovery and token interactions would also be refactored
  // in a similar way. For brevity, I'll just include a few examples:

  const initiateRecovery = async (newOwnerAddress: string): Promise<boolean> => {
    if (!client || !accountId) {
      throw new Error('No wallet connected');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get wallet to recover
      const walletToRecover = prompt("Enter the smart wallet ID to recover:");
      if (!walletToRecover) {
        throw new Error('No wallet ID provided for recovery');
      }
      
      const params = new ContractFunctionParameters()
        .addAddress(newOwnerAddress);
      
      await hederaService.executeContract(walletToRecover, "initiateRecovery", params);

      alert(`Recovery process initiated for wallet ${walletToRecover}`);
      
      return true;
    } catch (err: any) {
      setError(`Failed to initiate recovery: ${err.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const approveRecovery = async (walletToRecover: string, newOwnerAddress: string): Promise<boolean> => {
    if (!client || !accountId) {
      throw new Error('No wallet connected');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new ContractFunctionParameters()
        .addAddress(newOwnerAddress);
      
      await hederaService.executeContract(walletToRecover, "approveRecovery", params);

      alert(`Recovery approved for wallet ${walletToRecover}`);
      
      return true;
    } catch (err: any) {
      setError(`Failed to approve recovery: ${err.message}`);
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
    
    try {
      await hederaService.executeContract(smartWalletId, "cancelRecovery");
      
      // Update recovery status
      setRecoveryInProgress(false);
      setRecoveryInitiator(null);
      setProposedNewOwner(null);
      
      return true;
    } catch (err: any) {
      setError(`Failed to cancel recovery: ${err.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Token services would similarly be refactored to use the hederaService

  const getTokenBalance = async (tokenId: string): Promise<string> => {
    if (!client || !smartWalletId) {
      throw new Error('No wallet connected or smart wallet not created');
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new ContractFunctionParameters().addAddress(tokenId);
      const result = await hederaService.queryContract(smartWalletId, "getTokenBalance", params);
      const balance = result.getUint256(0);

      return balance.toString();
    } catch (err: any) {
      setError(`Failed to get token balance: ${err.message}`);
      return '0';
    } finally {
      setIsLoading(false);
    }
  };

  const associateToken = async (tokenId: string): Promise<boolean> => {
    if (!client || !smartWalletId) {
      throw new Error('No wallet connected or smart wallet not created');
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new ContractFunctionParameters().addAddress(tokenId);
      await hederaService.executeContract(smartWalletId, "associateToken", params);

      return true;
    } catch (err: any) {
      setError(`Failed to associate token: ${err.message}`);
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

    try {
      const params = new ContractFunctionParameters()
        .addAddress(tokenId)
        .addAddress(recipientId)
        .addUint256(amount);

      await hederaService.executeContract(smartWalletId, "transferToken", params);

      return true;
    } catch (err: any) {
      setError(`Failed to transfer token: ${err.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getHbarExchangeRate = async (): Promise<number> => {
    if (!client || !smartWalletId) {
      throw new Error('No wallet connected or smart wallet not created');
    }

    try {
      const result = await hederaService.queryContract(smartWalletId, "getHbarExchangeRate");
      const rate = result.getInt64(0);

      return Number(rate) / 100000000; // Convert tiny USD cents to USD
    } catch (err: any) {
      console.error(`Failed to get HBAR exchange rate: ${err.message}`);
      return 0;
    }
  };

  const value = {
    client,
    accountId,
    isConnected,
    smartWalletId,
    balance,
    isLoading,
    error,
    connect,
    connectWallet,
    disconnectWallet,
    executeTransaction,
    createSmartWallet,
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
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}; 
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Client, AccountId, PrivateKey, ContractId, 
  ContractExecuteTransaction, ContractCallQuery, Hbar
} from '@hashgraph/sdk';
import axios from 'axios';

type WalletContextType = {
  client: Client | null;
  accountId: string | null;
  isConnected: boolean;
  smartWalletId: string | null;
  balance: string | null;
  isLoading: boolean;
  error: string | null;
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
};

const defaultContext: WalletContextType = {
  client: null,
  accountId: null,
  isConnected: false,
  smartWalletId: null,
  balance: null,
  isLoading: false,
  error: null,
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

  // Check for existing connection on component mount
  useEffect(() => {
    const savedAccountId = localStorage.getItem('tajiri-account-id');
    const savedSmartWalletId = localStorage.getItem('tajiri-smart-wallet-id');
    
    if (savedAccountId) {
      initializeClient(savedAccountId);
      setSmartWalletId(savedSmartWalletId);
    }
  }, []);

  // Update balance when account changes
  useEffect(() => {
    if (client && accountId) {
      fetchBalance();
    }
  }, [client, accountId]);

  // Add this to update the guardians list when the smart wallet changes
  useEffect(() => {
    if (smartWalletId) {
      fetchGuardians();
      
      // Also check if there's an ongoing recovery process
      checkRecoveryStatus();
    }
  }, [smartWalletId]);

  const initializeClient = (accountIdStr: string) => {
    try {
      // Initialize client based on environment
      const network = process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet';
      let newClient: Client;
      
      if (network === 'testnet') {
        newClient = Client.forTestnet();
      } else {
        newClient = Client.forMainnet();
      }
      
      setClient(newClient);
      setAccountId(accountIdStr);
      setIsConnected(true);
      
      return newClient;
    } catch (err: any) {
      setError(`Failed to initialize client: ${err.message}`);
      return null;
    }
  };

  const fetchBalance = async () => {
    if (!client || !accountId) return;
    
    try {
      const balance = await client.getAccountBalance(AccountId.fromString(accountId));
      setBalance(balance.hbars.toString());
    } catch (err: any) {
      setError(`Failed to fetch balance: ${err.message}`);
    }
  };

  const fetchGuardians = async () => {
    if (!client || !smartWalletId) return;
    
    try {
      // Call the getGuardians function on the smart wallet contract
      const query = new ContractCallQuery()
        .setContractId(ContractId.fromString(smartWalletId))
        .setGas(100000)
        .setFunction("getGuardians");
      
      const response = await query.execute(client);
      // Parse the response to get the guardian addresses
      // This would depend on your specific contract implementation
      // For demo purposes, we'll use a placeholder format
      const result = response.getBytes();
      console.log('Raw guardians response:', result);
      
      // In a real implementation, you would decode the bytes properly
      // This is just a placeholder:
      const mockGuardians = ["0.0.123456", "0.0.789012"];
      setGuardians(mockGuardians);
    } catch (err: any) {
      console.error('Failed to fetch guardians:', err);
    }
  };

  const checkRecoveryStatus = async () => {
    if (!client || !smartWalletId) return;
    
    try {
      // Query the recovery status from the smart wallet
      const query = new ContractCallQuery()
        .setContractId(ContractId.fromString(smartWalletId))
        .setGas(100000)
        .setFunction("getRecoveryStatus");
      
      const response = await query.execute(client);
      // Again, the actual implementation would depend on your contract
      // For demo, we'll use placeholder values
      
      // Simulate recovery in progress for demo purposes
      const inProgress = false;
      const initiator = inProgress ? "0.0.123456" : null;
      const newOwner = inProgress ? "0.0.555555" : null;
      
      setRecoveryInProgress(inProgress);
      setRecoveryInitiator(initiator);
      setProposedNewOwner(newOwner);
    } catch (err: any) {
      console.error('Failed to check recovery status:', err);
    }
  };

  const connectWallet = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // For this implementation, we're using local environment variables
      // In a real app, you'd integrate with a wallet extension or HashPack/Blade wallet
      const myAccountId = process.env.NEXT_PUBLIC_MY_ACCOUNT_ID;
      const myPrivateKey = process.env.NEXT_PUBLIC_MY_PRIVATE_KEY;
      
      if (!myAccountId || !myPrivateKey) {
        throw new Error('Account credentials not found in environment variables');
      }
      
      const newClient = initializeClient(myAccountId);
      
      if (newClient) {
        // Set the operator (account that pays for transactions)
        newClient.setOperator(AccountId.fromString(myAccountId), PrivateKey.fromString(myPrivateKey));
        
        // Store account ID in local storage
        localStorage.setItem('tajiri-account-id', myAccountId);
        
        // Check if user already has a smart wallet
        const savedSmartWalletId = localStorage.getItem('tajiri-smart-wallet-id');
        if (savedSmartWalletId) {
          setSmartWalletId(savedSmartWalletId);
        }
      }
    } catch (err: any) {
      setError(`Failed to connect wallet: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setClient(null);
    setAccountId(null);
    setIsConnected(false);
    setSmartWalletId(null);
    setBalance(null);
    localStorage.removeItem('tajiri-account-id');
    localStorage.removeItem('tajiri-smart-wallet-id');
  };

  const createSmartWallet = async (): Promise<string> => {
    if (!client || !accountId) {
      throw new Error('No wallet connected');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get the TajiriWallet.bin bytecode - in a real app this would be loaded differently
      const deployTx = new ContractExecuteTransaction()
        .setGas(1000000)
        .setFunction(
          "deployWallet", 
          // Example function to deploy a new wallet - adjust based on your actual factory contract
          [accountId]
        )
        .setContractId(ContractId.fromString(process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ID || ''));
      
      const txResponse = await deployTx.execute(client);
      const receipt = await txResponse.getReceipt(client);
      
      if (!receipt.contractId) {
        throw new Error('Failed to create smart wallet');
      }
      
      const newSmartWalletId = receipt.contractId.toString();
      setSmartWalletId(newSmartWalletId);
      localStorage.setItem('tajiri-smart-wallet-id', newSmartWalletId);
      
      return newSmartWalletId;
    } catch (err: any) {
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
      // This is where the account abstraction happens:
      // Instead of directly sending a transaction, we route it through the smart wallet contract
      // The smart wallet executes the transaction on behalf of the user
      
      // Create function call data for the target contract
      // This would need to be adjusted based on your specific contract interface
      // Here we're just using a placeholder example
      const functionCallData = `${functionName}(${params.join(',')})`;
      
      // Call the execute function on the TajiriWallet
      const tx = new ContractExecuteTransaction()
        .setContractId(ContractId.fromString(smartWalletId))
        .setGas(1000000)
        .setFunction(
          "execute", 
          [
            targetContract, // target address
            value, // value to send
            functionCallData // encoded function call
          ]
        )
        .setPayableAmount(new Hbar(value));
      
      const response = await tx.execute(client);
      const receipt = await response.getReceipt(client);
      
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
      // Prepare the batched transaction data
      const targetContracts = transactions.map(t => t.targetContract);
      const values = transactions.map(t => t.value);
      const functionCallsData = transactions.map(t => 
        `${t.functionName}(${t.params.join(',')})`
      );
      
      // Total value to send is the sum of all transaction values
      const totalValue = values.reduce((sum, val) => sum + val, 0);
      
      // Call the executeBatch function on the TajiriWallet
      // Note: This assumes your smart wallet contract has an executeBatch function
      const tx = new ContractExecuteTransaction()
        .setContractId(ContractId.fromString(smartWalletId))
        .setGas(2000000) // Higher gas limit for batched transactions
        .setFunction(
          "executeBatch", 
          [
            targetContracts, // array of target addresses
            values,          // array of values to send
            functionCallsData // array of encoded function calls
          ]
        )
        .setPayableAmount(new Hbar(totalValue));
      
      const response = await tx.execute(client);
      const receipt = await response.getReceipt(client);
      
      // Update balance after transaction
      await fetchBalance();
      
      return receipt;
    } catch (err: any) {
      setError(`Batched transaction failed: ${err.message}`);
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
    if (!client || !accountId) {
      throw new Error('No wallet connected');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Create the transaction data that would be sent to a relayer service
      const transactionData = {
        accountId,
        smartWalletId: smartWalletId || null,
        targetContract,
        functionName,
        params,
        value,
        // Optional nonce or timestamp for replay protection
        timestamp: Date.now()
      };
      
      // In a production environment, you would send this to your relayer service
      // The relayer would verify the request and execute the transaction, paying for gas
      // For this demo, we'll just simulate a relayer response
      
      // Uncomment this in production with your actual relayer endpoint
      /*
      const relayerResponse = await axios.post(
        'https://your-relayer-service.com/relay', 
        transactionData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      const { success, transactionId, error } = relayerResponse.data;
      
      if (!success) {
        throw new Error(`Relayer error: ${error}`);
      }
      */
      
      // For demo purposes, simulate a successful response
      console.log('Gasless transaction request sent to relayer:', transactionData);
      
      // Simulate waiting for the relayer to process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update UI to show transaction was successful
      // In production, you'd check the actual transaction status
      
      // Once implemented, the user wouldn't need HBAR for gas fees
      // The relayer service would pay these fees on behalf of the user
      
      // Mock response for demo
      const mockResponse = {
        transactionId: `0.0.${Math.floor(Math.random() * 1000000)}@${Math.floor(Date.now()/1000)}`,
        success: true
      };
      
      // Update balance after transaction (in production, this might happen after confirmation)
      await fetchBalance();
      
      return mockResponse;
    } catch (err: any) {
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
      // Call the addGuardian function on the smart wallet
      const tx = new ContractExecuteTransaction()
        .setContractId(ContractId.fromString(smartWalletId))
        .setGas(1000000)
        .setFunction(
          "addGuardian", 
          [guardianAddress]
        );
      
      const response = await tx.execute(client);
      await response.getReceipt(client);
      
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
      // Call the removeGuardian function on the smart wallet
      const tx = new ContractExecuteTransaction()
        .setContractId(ContractId.fromString(smartWalletId))
        .setGas(1000000)
        .setFunction(
          "removeGuardian", 
          [guardianAddress]
        );
      
      const response = await tx.execute(client);
      await response.getReceipt(client);
      
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

  const initiateRecovery = async (newOwnerAddress: string): Promise<boolean> => {
    if (!client || !accountId) {
      throw new Error('No wallet connected');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // In this scenario, we assume the connected wallet is a guardian
      // of the smart wallet that needs recovery
      
      // We need to know which wallet to recover
      const walletToRecover = prompt("Enter the smart wallet ID to recover:");
      if (!walletToRecover) {
        throw new Error('No wallet ID provided for recovery');
      }
      
      // Call the initiateRecovery function on the target wallet
      const tx = new ContractExecuteTransaction()
        .setContractId(ContractId.fromString(walletToRecover))
        .setGas(1000000)
        .setFunction(
          "initiateRecovery", 
          [accountId, newOwnerAddress]
        );
      
      const response = await tx.execute(client);
      await response.getReceipt(client);
      
      // For the demo, we'll assume this worked
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
      // Call the approveRecovery function on the target wallet
      const tx = new ContractExecuteTransaction()
        .setContractId(ContractId.fromString(walletToRecover))
        .setGas(1000000)
        .setFunction(
          "approveRecovery", 
          [newOwnerAddress]
        );
      
      const response = await tx.execute(client);
      await response.getReceipt(client);
      
      // For the demo, we'll assume this worked
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
      // Call the cancelRecovery function on the smart wallet
      const tx = new ContractExecuteTransaction()
        .setContractId(ContractId.fromString(smartWalletId))
        .setGas(1000000)
        .setFunction("cancelRecovery");
      
      const response = await tx.execute(client);
      await response.getReceipt(client);
      
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

  const value = {
    client,
    accountId,
    isConnected,
    smartWalletId,
    balance,
    isLoading,
    error,
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
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}; 
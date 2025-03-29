'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  Client, AccountId, PrivateKey, ContractId, 
  ContractExecuteTransaction, ContractCallQuery, Hbar,
  AccountBalanceQuery, ContractFunctionParameters, ContractFunctionResult
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
  // New HTS functions
  getTokenBalance: (tokenId: string) => Promise<string>;
  associateToken: (tokenId: string) => Promise<boolean>;
  transferToken: (tokenId: string, recipientId: string, amount: number) => Promise<boolean>;
  getHbarExchangeRate: () => Promise<number>;
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
  // Add new HTS functions to default context
  getTokenBalance: async () => "0",
  associateToken: async () => false,
  transferToken: async () => false,
  getHbarExchangeRate: async () => 0,
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
  // Add private key state for internal use only (never exposed to UI)
  const [privateKeyStr, setPrivateKeyStr] = useState<string | null>(null);

  // Utility function to verify client has a properly configured operator
  const verifyClientOperator = (): boolean => {
    if (!client) {
      console.error('No client available');
      return false;
    }

    if (!client.operatorAccountId) {
      console.error('Client does not have an operator account set');
      return false;
    }

    if (!client.operatorPublicKey) {
      console.error('Client does not have an operator public key set');
      return false;
    }

    return true;
  };

  // Check for existing connection on component mount
  useEffect(() => {
    const savedAccountId = localStorage.getItem('tajiri-account-id');
    const savedSmartWalletId = localStorage.getItem('tajiri-smart-wallet-id');
    
    if (savedAccountId) {
      // Use async initialization with a delay to ensure client is ready
      const initClient = async () => {
        try {
          await initializeClient(savedAccountId);
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

  // Add this to verify the client has a proper operator after initialization
  useEffect(() => {
    if (client && isConnected) {
      const operatorConfigured = verifyClientOperator();
      if (!operatorConfigured) {
        console.warn('Client operator not properly configured. Reconnecting wallet...');
        // Try to reconnect if operator is not properly configured
        connectWallet().catch(err => {
          console.error('Failed to reconnect wallet:', err);
        });
      } else {
        console.log('Client operator verified successfully');
      }
    }
  }, [client, isConnected]);

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

  const initializeClient = async (accountIdStr: string) => {
    try {
      // Initialize client based on environment
      const network = process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet';
      let newClient: Client;
      
      if (network === 'testnet') {
        newClient = Client.forTestnet();
      } else {
        newClient = Client.forMainnet();
      }
      
      // Set default max query payment to prevent CostQuery errors
      newClient.setDefaultMaxQueryPayment(new Hbar(0.5));

      // Get account credentials from environment variables
      const myAccountId = process.env.NEXT_PUBLIC_MY_ACCOUNT_ID;
      const myPrivateKey = process.env.NEXT_PUBLIC_MY_PRIVATE_KEY;

      if (!myAccountId || !myPrivateKey) {
        throw new Error('Account credentials not found in environment variables');
      }

      // Parse the account ID and private key properly
      try {
        const accountId = AccountId.fromString(myAccountId);
        const privateKey = PrivateKey.fromString(myPrivateKey);

        // Set the operator with explicit objects
        console.log('Setting client operator...');
        newClient.setOperator(accountId, privateKey);

        // Store private key in memory (for future reference if needed)
        setPrivateKeyStr(myPrivateKey);

        // Verify client initialization
        if (!newClient.operatorAccountId) {
          throw new Error('Failed to set operator account ID');
        }

        console.log('Client initialized with operator:', newClient.operatorAccountId.toString());

        // Force a small delay to ensure the client is fully ready before returning
        await new Promise(resolve => setTimeout(resolve, 500));

        // Test a basic query to ensure the client is ready
        try {
          await new AccountBalanceQuery()
            .setAccountId(accountId)
            .setMaxQueryPayment(new Hbar(0.1))
            .execute(newClient);
          console.log('Client initialization verified with a test query');
        } catch (testErr) {
          console.warn('Test query failed, but continuing with client init:', testErr);
          // Continue anyway as this might be due to other issues
        }
      } catch (keyErr: any) {
        console.error('Error parsing account ID or private key:', keyErr);
        throw new Error(`Invalid account credentials: ${keyErr.message}`);
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
      // Fixed: Using AccountBalanceQuery instead of calling getAccountBalance directly
      const accountBalance = await new AccountBalanceQuery()
        .setAccountId(AccountId.fromString(accountId))
        .execute(client);

      setBalance(accountBalance.hbars.toString());
    } catch (err: any) {
      setError(`Failed to fetch balance: ${err.message}`);
    }
  };

  const fetchGuardians = async () => {
    if (!client || !smartWalletId) return;
    
    try {
      // Make sure client has operator set
      if (!client.operatorAccountId) {
        console.error('Client does not have an operator account set. Please connect your wallet first.');
        return;
      }

      // Call the getGuardians function on the smart wallet contract
      const query = new ContractCallQuery()
        .setContractId(ContractId.fromString(smartWalletId))
        .setGas(100000) // Gas for execution
        .setMaxQueryPayment(new Hbar(0.1)) // Set max payment for the query
        .setFunction("getGuardians");
      
      // Explicitly wait before executing the query
      try {
        console.log('Preparing to execute getGuardians query...');

        // Try with a delay to ensure the client is ready
        await new Promise(resolve => setTimeout(resolve, 100));

        // Execute with retry logic
        let attempts = 0;
        let response;

        while (attempts < 3) {
          try {
            response = await query.execute(client);
            break; // Success, exit loop
          } catch (execErr: any) {
            attempts++;
            if (attempts >= 3) throw execErr; // Give up after 3 attempts

            if (execErr.message && execErr.message.includes('CostQuery has not been loaded yet')) {
              console.log(`Retrying guardians query after CostQuery error (attempt ${attempts})...`);
              await new Promise(resolve => setTimeout(resolve, 500 * attempts)); // Increasing delay
            } else {
              throw execErr; // Other error, don't retry
            }
          }
        }

        if (!response) throw new Error('Query execution failed after retries');

        // Parse the response properly to get the guardian addresses
        const result = response as ContractFunctionResult;

        // Correctly extract addresses from the result
        try {
          // This is a placeholder approach - actual implementation depends on the contract's return format
          const addressArray = result.getAddress(0); // If contract returns an array of addresses
          console.log('Guardians response:', addressArray);

          // For demo purposes, we'll still use placeholder data
          // In a real implementation, you would properly decode the response
          const mockGuardians = ["0.0.123456", "0.0.789012"];
          setGuardians(mockGuardians);
        } catch (decodeErr) {
          console.error('Failed to decode guardian addresses:', decodeErr);
          setGuardians([]);
        }
      } catch (queryErr: any) {
        console.error('Error executing guardian query:', queryErr);

        // Handle CostQuery error specifically
        if (queryErr.message && queryErr.message.includes('CostQuery has not been loaded yet')) {
          console.warn('CostQuery not loaded. Client may need more time to initialize.');
        }

        throw queryErr;
      }
    } catch (err: any) {
      console.error('Failed to fetch guardians:', err);
      // Don't stop the app completely for this non-critical error
      setGuardians([]);
    }
  };

  const checkRecoveryStatus = async () => {
    if (!client || !smartWalletId) return;
    
    try {
      // Make sure client has operator set
      if (!client.operatorAccountId) {
        console.error('Client does not have an operator account set. Please connect your wallet first.');
        return;
      }

      // Query the recovery status from the smart wallet
      const query = new ContractCallQuery()
        .setContractId(ContractId.fromString(smartWalletId))
        .setGas(100000) // Gas for execution
        .setMaxQueryPayment(new Hbar(0.1)) // Set max payment for the query
        .setFunction("getRecoveryStatus");
      
      // Explicitly wait before executing the query
      try {
        console.log('Preparing to execute getRecoveryStatus query...');

        // Try with a delay to ensure the client is ready
        await new Promise(resolve => setTimeout(resolve, 100));

        // Execute with retry logic
        let attempts = 0;
        let response;

        while (attempts < 3) {
          try {
            response = await query.execute(client);
            break; // Success, exit loop
          } catch (execErr: any) {
            attempts++;
            if (attempts >= 3) throw execErr; // Give up after 3 attempts

            if (execErr.message && execErr.message.includes('CostQuery has not been loaded yet')) {
              console.log(`Retrying recovery status query after CostQuery error (attempt ${attempts})...`);
              await new Promise(resolve => setTimeout(resolve, 500 * attempts)); // Increasing delay
            } else {
              throw execErr; // Other error, don't retry
            }
          }
        }

        if (!response) throw new Error('Query execution failed after retries');

        // Properly parse the response
        const result = response as ContractFunctionResult;

        try {
          // Parse the response based on the contract's return format
          // This is a placeholder - actual implementation depends on your contract
          const inProgress = result.getBool(0);
          const initiator = inProgress ? result.getAddress(1) : null;
          const newOwner = inProgress ? result.getAddress(2) : null;

          setRecoveryInProgress(inProgress);
          setRecoveryInitiator(initiator);
          setProposedNewOwner(newOwner);
        } catch (decodeErr) {
          console.error('Failed to decode recovery status:', decodeErr);

          // Fallback to defaults
          setRecoveryInProgress(false);
          setRecoveryInitiator(null);
          setProposedNewOwner(null);
        }
      } catch (queryErr: any) {
        console.error('Error executing recovery status query:', queryErr);

        // Handle CostQuery error specifically
        if (queryErr.message && queryErr.message.includes('CostQuery has not been loaded yet')) {
          console.warn('CostQuery not loaded. Client may need more time to initialize.');
        }

        throw queryErr;
      }
    } catch (err: any) {
      console.error('Failed to check recovery status:', err);
      // Don't stop the app completely for this non-critical error
      setRecoveryInProgress(false);
      setRecoveryInitiator(null);
      setProposedNewOwner(null);
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
      
      console.log('Connecting wallet for account:', myAccountId);

      // Store private key in memory (for future reference if needed)
      setPrivateKeyStr(myPrivateKey);

      // Initialize a new client
      const network = process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet';
      console.log(`Using network: ${network}`);
      const newClient = network === 'testnet' ? Client.forTestnet() : Client.forMainnet();

      // Set default max query payment to prevent CostQuery errors
      newClient.setDefaultMaxQueryPayment(new Hbar(0.5));

      // Parse the account ID and private key properly
      try {
        const accountId = AccountId.fromString(myAccountId);
        const privateKey = PrivateKey.fromString(myPrivateKey);

        // Set the operator with explicit objects
        console.log('Setting client operator...');
        newClient.setOperator(accountId, privateKey);

        // Verify client initialization
        if (!newClient.operatorAccountId) {
          throw new Error('Failed to set operator account ID');
        }

        console.log('Client initialized with operator:', newClient.operatorAccountId.toString());

        // Set client in state
        setClient(newClient);
        setAccountId(myAccountId);
        setIsConnected(true);
        
        // Store account ID in local storage
        localStorage.setItem('tajiri-account-id', myAccountId);
        
        // Check if user already has a smart wallet
        const savedSmartWalletId = localStorage.getItem('tajiri-smart-wallet-id');
        if (savedSmartWalletId) {
          setSmartWalletId(savedSmartWalletId);
          console.log('Restored existing smart wallet ID:', savedSmartWalletId);
        }

        // Fetch balance to confirm connection
        try {
          const accountBalance = await new AccountBalanceQuery()
            .setAccountId(accountId)
            .execute(newClient);

          setBalance(accountBalance.hbars.toString());
          console.log('Account balance:', accountBalance.hbars.toString());
        } catch (balanceErr: any) {
          console.error('Failed to fetch initial balance:', balanceErr);
          // Non-blocking error - we'll still consider the wallet connected
        }
      } catch (keyErr: any) {
        console.error('Error parsing account ID or private key:', keyErr);
        throw new Error(`Invalid account credentials: ${keyErr.message}`);
      }
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      setError(`Failed to connect wallet: ${err.message}`);
      setIsConnected(false);
      setClient(null);
      setAccountId(null);
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
    setPrivateKeyStr(null); // Clear private key from memory
    localStorage.removeItem('tajiri-account-id');
    localStorage.removeItem('tajiri-smart-wallet-id');
  };

  const createSmartWallet = async (): Promise<string> => {
    if (!client || !accountId || !privateKeyStr) {
      throw new Error('No wallet connected or private key missing');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // First, verify that the client is properly initialized with operator info
      if (!client.operatorAccountId || !client.operatorPublicKey) {
        console.error('Client not properly initialized with operator details');
        throw new Error('Wallet client not properly initialized');
      }

      // Get factory contract ID
      const factoryContractId = process.env.NEXT_PUBLIC_FACTORY_CONTRACT_ID || '';
      if (!factoryContractId) {
        throw new Error('Factory contract ID not set in environment variables');
      }

      console.log(`Using factory contract ID: ${factoryContractId}`);
      console.log(`Creating smart wallet for account: ${accountId}`);

      // Create a new transaction using a different approach
      // The transaction will be automatically signed by the client's operator key
      console.log('Creating and executing transaction directly with client...');

      // No need to manually sign - let the client handle it with its operator key
      const txResponse = await new ContractExecuteTransaction()
        .setContractId(ContractId.fromString(factoryContractId))
        .setGas(1000000)
        .setFunction(
          "deployWallet", 
          new ContractFunctionParameters().addString(accountId)
        )
        .execute(client);

      console.log(`Transaction executed, ID: ${txResponse.transactionId.toString()}`);

      // Wait for receipt with a longer timeout
      console.log('Waiting for receipt...');
      const receipt = await txResponse.getReceipt(client);
      
      if (!receipt.contractId) {
        throw new Error('Failed to create smart wallet: Contract ID not returned');
      }
      
      const newSmartWalletId = receipt.contractId.toString();
      console.log(`Smart wallet created with ID: ${newSmartWalletId}`);

      setSmartWalletId(newSmartWalletId);
      localStorage.setItem('tajiri-smart-wallet-id', newSmartWalletId);
      
      return newSmartWalletId;
    } catch (err: any) {
      console.error('Smart wallet creation error:', err);

      // Enhanced error reporting
      if (err.message && err.message.includes('transactionId')) {
        console.error('Transaction ID error. Client state:', {
          isInitialized: !!client,
          hasOperatorId: !!client?.operatorAccountId,
          hasOperatorKey: !!client?.operatorPublicKey
        });
      }

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
      // Create function call data for the target contract
      // In a real implementation, you'd encode the function call properly
      const functionCallData = encodeFunctionCall(functionName, params);
      
      // Let the client handle signing with its operator key
      const tx = new ContractExecuteTransaction()
        .setContractId(ContractId.fromString(smartWalletId))
        .setGas(1000000)
        .setFunction(
          "execute", 
          new ContractFunctionParameters()
            .addAddress(targetContract)
            .addUint256(value)
            .addBytes(functionCallData)
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

  // Helper function to encode function calls for Hedera
  const encodeFunctionCall = (functionName: string, params: any[]): Uint8Array => {
    try {
      // Convert function name to selector
      const functionSelector = functionName.includes('(') ? functionName : `${functionName}(${generateParamTypeSignature(params)})`;

      // Create the bytes array for the function selector (first 4 bytes of keccak256 hash)
      const selectorHash = hashFunctionSelector(functionSelector);
      const selectorBytes = selectorHash.slice(0, 10); // '0x' + 8 chars (4 bytes)

      // Encode parameters - in a real implementation you would use proper ABI encoding
      // This is a simplified version
      let encodedParams = '';
      params.forEach(param => {
        if (typeof param === 'string' && param.startsWith('0x')) {
          // Hex string (address or bytes)
          encodedParams += param.slice(2).padStart(64, '0');
        } else if (typeof param === 'number') {
          // Number
          encodedParams += param.toString(16).padStart(64, '0');
        } else if (typeof param === 'string') {
          // Regular string - simplified encoding
          const strBytes = new TextEncoder().encode(param);
          let hexStr = '';
          for (let i = 0; i < strBytes.length; i++) {
            hexStr += strBytes[i].toString(16).padStart(2, '0');
          }
          encodedParams += hexStr.padEnd(64, '0');
        } else if (Array.isArray(param)) {
          // Array - simplified encoding for demo
          encodedParams += param.map(p => p.toString(16).padStart(64, '0')).join('');
        }
      });

      // Combine selector and parameters
      const fullCalldata = selectorBytes + encodedParams;

      // Convert hex string to Uint8Array
      return hexStringToUint8Array(fullCalldata);
    } catch (err) {
      console.error('Error encoding function call:', err);
      // Fallback to simple encoding
      const encoder = new TextEncoder();
      return encoder.encode(`${functionName}(${params.join(',')})`);
    }
  };

  // Helper function to generate parameter type signature
  const generateParamTypeSignature = (params: any[]): string => {
    return params.map(param => {
      if (typeof param === 'string' && param.startsWith('0x')) {
        return 'address';
      } else if (typeof param === 'number') {
        return param % 1 === 0 ? 'uint256' : 'uint256';
      } else if (typeof param === 'string') {
        return 'string';
      } else if (Array.isArray(param)) {
        return 'uint256[]';
      }
      return 'bytes';
    }).join(',');
  };

  // Helper function to hash a function selector
  const hashFunctionSelector = (selector: string): string => {
    // In a real implementation, use keccak256 from a proper library
    // This is a placeholder
    return '0x' + Array.from(selector).reduce((hash, char) => {
      return (((hash << 5) - hash) + char.charCodeAt(0)) & 0xFFFFFFFF;
    }, 0).toString(16).padStart(8, '0');
  };

  // Helper function to convert hex string to Uint8Array
  const hexStringToUint8Array = (hexString: string): Uint8Array => {
    if (hexString.startsWith('0x')) {
      hexString = hexString.slice(2);
    }

    const bytes = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < hexString.length; i += 2) {
      bytes[i / 2] = parseInt(hexString.substring(i, i + 2), 16);
    }

    return bytes;
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
      const targetContracts: string[] = transactions.map(t => t.targetContract);
      const values: number[] = transactions.map(t => t.value);
      const functionCallsData: Uint8Array[] = transactions.map(t =>
        encodeFunctionCall(t.functionName, t.params)
      );
      
      // Total value to send is the sum of all transaction values
      const totalValue = values.reduce((sum, val) => sum + val, 0);
      
      // Convert arrays to format expected by contract
      const targetsArray = new ContractFunctionParameters();
      targetContracts.forEach((target, i) => {
        targetsArray.addAddress(target);
      });

      const valuesArray = new ContractFunctionParameters();
      values.forEach((value, i) => {
        valuesArray.addUint256(value);
      });

      const dataArray = new ContractFunctionParameters();
      functionCallsData.forEach((data, i) => {
        dataArray.addBytes(data);
      });

      // Set up the contract execution with proper parameters
      const tx = new ContractExecuteTransaction()
        .setContractId(ContractId.fromString(smartWalletId))
        .setGas(2000000) // Higher gas limit for batched transactions
        .setFunction(
          "executeBatch", 
          new ContractFunctionParameters()
            .addAddressArray(targetContracts) // Add array of target addresses
            .addUint256Array(values.map(v => v)) // Add array of values
            .addBytesArray(functionCallsData) // Add array of function call data
        )
        .setPayableAmount(new Hbar(totalValue));
      
      const response = await tx.execute(client);
      const receipt = await response.getReceipt(client);
      
      // Update balance after transaction
      await fetchBalance();
      
      return receipt;
    } catch (err: any) {
      console.error('Batched transaction error details:', err);
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
      // Let the client handle signing with its operator key
      const tx = new ContractExecuteTransaction()
        .setContractId(ContractId.fromString(smartWalletId))
        .setGas(1000000)
        .setFunction(
          "addGuardian", 
          new ContractFunctionParameters().addAddress(guardianAddress)
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
      // Let the client handle signing with its operator key
      const tx = new ContractExecuteTransaction()
        .setContractId(ContractId.fromString(smartWalletId))
        .setGas(1000000)
        .setFunction(
          "removeGuardian", 
          new ContractFunctionParameters().addAddress(guardianAddress)
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
      
      // Let the client handle signing with its operator key
      const tx = new ContractExecuteTransaction()
        .setContractId(ContractId.fromString(walletToRecover))
        .setGas(1000000)
        .setFunction(
          "initiateRecovery", 
          new ContractFunctionParameters().addAddress(newOwnerAddress)
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
      // Let the client handle signing with its operator key
      const tx = new ContractExecuteTransaction()
        .setContractId(ContractId.fromString(walletToRecover))
        .setGas(1000000)
        .setFunction(
          "approveRecovery", 
          new ContractFunctionParameters().addAddress(newOwnerAddress)
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
      // Let the client handle signing with its operator key
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

  // Implement new Hedera Token Service (HTS) functions
  const getTokenBalance = async (tokenId: string): Promise<string> => {
    if (!client || !smartWalletId) {
      throw new Error('No wallet connected or smart wallet not created');
    }

    setIsLoading(true);
    setError(null);

    try {
      const tx = new ContractCallQuery()
        .setContractId(ContractId.fromString(smartWalletId))
        .setGas(100000)
        .setFunction("getTokenBalance", new ContractFunctionParameters().addAddress(tokenId));

      const response = await tx.execute(client);
      const result = response as ContractFunctionResult;
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
      const tx = new ContractExecuteTransaction()
        .setContractId(ContractId.fromString(smartWalletId))
        .setGas(1000000)
        .setFunction("associateToken", new ContractFunctionParameters().addAddress(tokenId));

      const response = await tx.execute(client);
      await response.getReceipt(client);

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
      const tx = new ContractExecuteTransaction()
        .setContractId(ContractId.fromString(smartWalletId))
        .setGas(1000000)
        .setFunction(
          "transferToken",
          new ContractFunctionParameters()
            .addAddress(tokenId)
            .addAddress(recipientId)
            .addUint256(amount)
        );

      const response = await tx.execute(client);
      await response.getReceipt(client);

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
      const tx = new ContractCallQuery()
        .setContractId(ContractId.fromString(smartWalletId))
        .setGas(100000)
        .setFunction("getHbarExchangeRate");

      const response = await tx.execute(client);
      const result = response as ContractFunctionResult;
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
    // New HTS functions
    getTokenBalance,
    associateToken,
    transferToken,
    getHbarExchangeRate,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}; 
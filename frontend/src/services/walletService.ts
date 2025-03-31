import {
    ContractId,
    ContractExecuteTransaction,
    ContractFunctionParameters,
    PrivateKey,
    ContractCallQuery,
    Client,
    AccountId,
    TransactionReceiptQuery,
    TransferTransaction,
    Hbar,
    TokenId
} from '@hashgraph/sdk';
import * as hederaService from './hederaService';
import { signTransaction } from '../utils/signatureUtils';
import { encodeFunctionCall } from '../utils/contractUtils';
import axios from 'axios';

// Smart Wallet Factory contract address
const SMART_WALLET_FACTORY = process.env.NEXT_PUBLIC_SMART_WALLET_FACTORY_ADDRESS || '0.0.1234567';

// Get exchange rate from oracle contract
const EXCHANGE_RATE_ORACLE = process.env.NEXT_PUBLIC_EXCHANGE_RATE_ORACLE_ADDRESS || '0.0.1234568';

/**
 * Finds a smart wallet for the specified account owner
 * @param accountId Account ID to find wallet for
 * @returns Contract ID of the wallet or null if not found
 */
export async function findSmartWalletForOwner(accountId: string): Promise<string | null> {
    try {
        // Query the factory contract to find the wallet address
        const result = await hederaService.queryContract(
            SMART_WALLET_FACTORY,
            "getWalletForOwner",
            new ContractFunctionParameters().addString(accountId)
        );

        // Extract address from result
        const address = result.getAddress(0);

        if (address && address !== '0x0000000000000000000000000000000000000000') {
            return address;
        }

        return null;
    } catch (err) {
        console.error('Error finding wallet:', err);
        return null;
    }
}

/**
 * Creates a smart wallet for the specified account
 * @param accountId Account ID to create wallet for
 * @returns Contract ID of the new wallet
 */
export async function createSmartWallet(accountId: string): Promise<string> {
    try {
        // First check if wallet already exists
        const existingWallet = await findSmartWalletForOwner(accountId);

        if (existingWallet) {
            console.log("Smart wallet already exists for owner:", existingWallet);
            return existingWallet;
        }

        // Create parameters for wallet creation
        const params = new ContractFunctionParameters()
            .addAddress(accountId); // Owner address

        // Call the factory to create a new wallet
        const receipt = await hederaService.executeContract(
            SMART_WALLET_FACTORY,
            "createWallet",
            params
        );

        // Parse the creation event to get the new wallet address
        const newWalletAddress = receipt.contractFunctionResult?.getAddress(0) || '';

        if (!newWalletAddress || newWalletAddress === '0000000000000000000000000000000000000000') {
            throw new Error("Failed to create smart wallet: Invalid wallet address returned");
        }

        console.log("Created new smart wallet:", newWalletAddress);

        // Fund the wallet with a small amount of HBAR to cover initial fees
        await fundNewWallet(newWalletAddress);

        return newWalletAddress;
    } catch (err: any) {
        // If creation fails with "CONTRACT_REVERT_EXECUTED", it might be due to
        // a race condition where the wallet was just created in another session
        if (err.message && err.message.includes('CONTRACT_REVERT_EXECUTED')) {
            // Try once more to find the wallet
            const retryExistingWallet = await findSmartWalletForOwner(accountId);
            if (retryExistingWallet) {
                console.log("Found existing wallet after creation attempt:", retryExistingWallet);
                return retryExistingWallet;
            }
        }

        console.error("Error creating smart wallet:", err);
        throw new Error(`Failed to create smart wallet: ${err.message}`);
    }
}

/**
 * Funds a newly created wallet with a small amount of HBAR
 * @param walletAddress The address of the wallet to fund
 */
const fundNewWallet = async (walletAddress: string): Promise<void> => {
    try {
        const initialFunding = Hbar.fromTinybars(50000000); // 0.5 HBAR

        // Execute a transfer to the new wallet
        const operatorId = hederaService.getOperatorAccountId();
        const client = hederaService.getClient();

        const transaction = new TransferTransaction()
            .addHbarTransfer(operatorId, initialFunding.negated())
            .addHbarTransfer(walletAddress, initialFunding)
            .freezeWith(client);

        const signedTx = await transaction.sign(PrivateKey.fromString(hederaService.getOperatorPrivateKey()));
        const txResponse = await signedTx.execute(client);
        await txResponse.getReceipt(client);

        console.log(`Funded new wallet ${walletAddress} with ${initialFunding.toString()}`);
    } catch (err) {
        console.error("Error funding new wallet:", err);
        // Failure to fund shouldn't prevent wallet creation
    }
};

/**
 * Executes a transaction through the smart wallet
 * @param walletId The ID of the smart wallet
 * @param targetContract The contract to interact with
 * @param functionName The function to call
 * @param params The parameters to pass
 * @param value The amount of HBAR to send (in tiny bars)
 * @returns The transaction receipt
 */
export const executeTransaction = async (
    walletId: string,
    targetContract: string,
    functionName: string,
    params: any[] = [],
    value: number = 0
): Promise<any> => {
    try {
        // Convert parameters to ContractFunctionParameters format
        const functionParams = new ContractFunctionParameters();

        // Build parameters dynamically based on their types
        for (const param of params) {
            if (typeof param === 'string' && param.startsWith('0x')) {
                functionParams.addAddress(param);
            } else if (typeof param === 'string' && param.includes('.')) {
                functionParams.addAddress(param);
            } else if (typeof param === 'string') {
                functionParams.addString(param);
            } else if (typeof param === 'number') {
                if (Number.isInteger(param)) {
                    functionParams.addUint256(param);
                } else {
                    functionParams.addUint256(Math.floor(param * 100000000));
                }
            } else if (typeof param === 'boolean') {
                functionParams.addBool(param);
            } else if (Array.isArray(param)) {
                functionParams.addAddressArray(param);
            }
        }

        // Call the execute function on the smart wallet
        const executionParams = new ContractFunctionParameters()
            .addAddress(targetContract)
            .addBytes32(hederaService.stringToBytes32(functionName))
            .addBytes(functionParams._build());

        const receipt = await hederaService.executeContract(
            walletId,
            "execute",
            executionParams,
            value
        );

        return receipt;
    } catch (err: any) {
        console.error("Error executing transaction through smart wallet:", err);
        throw new Error(`Smart wallet transaction failed: ${err.message}`);
    }
};

/**
 * Executes multiple transactions in a batch through the smart wallet
 * @param smartWalletId Smart wallet contract ID
 * @param transactions Array of transactions to execute
 * @returns Transaction receipt
 */
export async function executeBatchedTransactions(
    smartWalletId: string,
    transactions: Array<{
        targetContract: string;
        functionName: string;
        params: any[];
        value: number;
    }>
): Promise<any> {
    if (!smartWalletId) {
        throw new Error('No smart wallet ID provided');
    }

    const targetContracts: string[] = transactions.map(t => t.targetContract);
    const values: number[] = transactions.map(t => t.value);
    const functionCallsData: Uint8Array[] = transactions.map(t =>
        encodeFunctionCall(t.functionName, t.params)
    );

    const totalValue = values.reduce((sum, val) => sum + val, 0);

    const batchParams = new ContractFunctionParameters()
        .addAddressArray(targetContracts)
        .addUint256Array(values.map(v => v))
        .addBytesArray(functionCallsData);

    return hederaService.executeContract(smartWalletId, "executeBatch", batchParams, totalValue);
}

/**
 * Executes a transaction through the relayer service
 * @param accountId User's account ID
 * @param smartWalletId Smart wallet contract ID
 * @param privateKey User's private key for signing
 * @param targetContract Target contract for execution
 * @param functionName Function to call
 * @param params Parameters for the function
 * @param value HBAR amount to send
 * @returns Transaction response
 */
export async function executeGaslessTransaction(
    accountId: string,
    smartWalletId: string | null,
    privateKey: string,
    targetContract: string,
    functionName: string,
    params: any[],
    value: number = 0
): Promise<any> {
    if (!smartWalletId) {
        throw new Error('No smart wallet ID provided');
    }

    const transactionData = {
        accountId,
        smartWalletId,
        targetContract,
        functionName,
        params,
        value,
        timestamp: Date.now()
    };

    // Sign the transaction data
    const signature = signTransaction(transactionData, privateKey);

    // Add signature to the request payload
    const signedTransactionData = {
        ...transactionData,
        signature
    };

    // Send the transaction to the relayer service
    const relayerResponse = await axios.post(
        '/api/relayer',
        signedTransactionData,
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );

    const { success, error } = relayerResponse.data;

    if (!success) {
        throw new Error(`Relayer error: ${error}`);
    }

    return relayerResponse.data;
}

/**
 * Adds a guardian to the smart wallet
 * @param walletId The ID of the smart wallet
 * @param guardianAddress The address to add as a guardian
 */
export async function addGuardian(smartWalletId: string, guardianAddress: string) {
    const params = new ContractFunctionParameters()
        .addAddress(guardianAddress);

    return hederaService.executeContract(smartWalletId, "addGuardian", params);
}

/**
 * Removes a guardian from the smart wallet
 * @param walletId The ID of the smart wallet
 * @param guardianAddress The address to remove as a guardian
 */
export async function removeGuardian(smartWalletId: string, guardianAddress: string) {
    const params = new ContractFunctionParameters()
        .addAddress(guardianAddress);

    return hederaService.executeContract(smartWalletId, "removeGuardian", params);
}

/**
 * Get guardians for a smart wallet
 * @param walletId The ID of the smart wallet
 * @returns An array of guardian addresses
 */
export const getGuardians = async (walletId: string): Promise<string[]> => {
    try {
        // Query the smart wallet for guardians
        const result = await hederaService.queryContract(walletId, "getGuardians");

        // Parse guardian addresses from result
        const guardianCount = result.getUint32(0);
        const addresses: string[] = [];

        for (let i = 0; i < guardianCount; i++) {
            const address = result.getAddress(i + 1);
            if (address) {
                addresses.push(address);
            }
        }

        return addresses;
    } catch (err) {
        console.error('Failed to fetch guardians:', err);
        return [];
    }
};

/**
 * Get recovery status for a smart wallet
 * @param walletId The ID of the smart wallet
 * @returns The recovery status
 */
export const getRecoveryStatus = async (walletId: string): Promise<{
    inProgress: boolean;
    initiator: string | null;
    proposedOwner: string | null;
}> => {
    try {
        const result = await hederaService.queryContract(walletId, "getRecoveryStatus");

        // Parse the response
        const inProgress = result.getBool(0);
        const initiator = inProgress ? result.getAddress(1) : null;
        const proposedOwner = inProgress ? result.getAddress(2) : null;

        return {
            inProgress,
            initiator,
            proposedOwner
        };
    } catch (err) {
        console.error('Failed to check recovery status:', err);
        return {
            inProgress: false,
            initiator: null,
            proposedOwner: null
        };
    }
};

/**
 * Initiate recovery for a smart wallet
 * @param walletId The ID of the smart wallet
 * @param newOwnerAddress The address of the new owner
 */
export const initiateRecovery = async (walletId: string, newOwnerAddress: string): Promise<void> => {
    const params = new ContractFunctionParameters().addAddress(newOwnerAddress);
    await hederaService.executeContract(walletId, "initiateRecovery", params);
};

/**
 * Approve recovery for a smart wallet
 * @param walletId The ID of the smart wallet
 * @param newOwnerAddress The address of the new owner
 */
export const approveRecovery = async (walletId: string, newOwnerAddress: string): Promise<void> => {
    const params = new ContractFunctionParameters().addAddress(newOwnerAddress);
    await hederaService.executeContract(walletId, "approveRecovery", params);
};

/**
 * Cancel recovery for a smart wallet
 * @param walletId The ID of the smart wallet
 */
export const cancelRecovery = async (walletId: string): Promise<void> => {
    await hederaService.executeContract(walletId, "cancelRecovery");
};

/**
 * Get token balance for a smart wallet
 * @param walletId The ID of the smart wallet
 * @param tokenId The ID of the token
 * @returns The token balance
 */
export const getTokenBalance = async (walletId: string, tokenId: string): Promise<string> => {
    try {
        const params = new ContractFunctionParameters().addAddress(tokenId);
        const result = await hederaService.queryContract(walletId, "getTokenBalance", params);
        const balance = result.getUint256(0);

        return balance.toString();
    } catch (err) {
        console.error('Failed to get token balance:', err);
        return "0";
    }
};

/**
 * Associate a token with a smart wallet
 * @param walletId The ID of the smart wallet
 * @param tokenId The ID of the token
 */
export const associateToken = async (walletId: string, tokenId: string): Promise<void> => {
    const params = new ContractFunctionParameters().addAddress(tokenId);
    await hederaService.executeContract(walletId, "associateToken", params);
};

/**
 * Transfer tokens from a smart wallet
 * @param walletId The ID of the smart wallet
 * @param tokenId The ID of the token
 * @param recipientId The ID of the recipient
 * @param amount The amount to transfer
 */
export const transferToken = async (
    walletId: string,
    tokenId: string,
    recipientId: string,
    amount: number
): Promise<void> => {
    const params = new ContractFunctionParameters()
        .addAddress(tokenId)
        .addAddress(recipientId)
        .addUint256(amount);

    await hederaService.executeContract(walletId, "transferToken", params);
};

/**
 * Get HBAR exchange rate from oracle
 * @returns The exchange rate in USD
 */
export const getHbarExchangeRate = async (): Promise<number> => {
    try {
        const result = await hederaService.queryContract(EXCHANGE_RATE_ORACLE, "getHbarExchangeRate");
        const rate = result.getInt64(0);

        return Number(rate) / 100000000; // Convert tiny USD cents to USD
    } catch (err) {
        console.error('Failed to get HBAR exchange rate:', err);
        return 0;
    }
}; 
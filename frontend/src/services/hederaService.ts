import {
    Client,
    AccountId,
    PrivateKey,
    Hbar,
    AccountBalanceQuery,
    ContractCallQuery,
    ContractExecuteTransaction,
    ContractFunctionParameters,
    ContractFunctionResult,
    ContractId,
    LedgerId,
    TransactionReceipt
} from '@hashgraph/sdk';
import { createClientFromEnv } from '../utils/hederaConfig';
import { formatAddressForContract } from '../utils/addressUtils';

// Singleton client instance
let hederaClient: Client | null = null;

/**
 * Initializes the Hedera client with operator credentials
 * @returns The initialized client
 */
export function initializeClient(): Client {
    if (hederaClient) return hederaClient;

    const operatorId = getOperatorAccountId();
    const operatorKey = getOperatorPrivateKey();

    if (!operatorId || !operatorKey) {
        throw new Error('Environment variables for operator ID and private key must be set');
    }

    // Initialize a client with mainnet or testnet
    hederaClient = Client.forTestnet();

    // Set the operator account ID and private key
    hederaClient.setOperator(operatorId, PrivateKey.fromString(operatorKey));

    return hederaClient;
}

/**
 * Gets the current Hedera client or initializes a new one
 * @returns The Hedera client
 */
export function getClient(): Client {
    if (!hederaClient) {
        return initializeClient();
    }
    return hederaClient;
}

/**
 * Resets the client instance
 */
export function resetClient(): void {
    hederaClient = null;
}

/**
 * Gets the operator account ID from environment
 * @returns Account ID string
 */
export function getOperatorAccountId(): string {
    return process.env.NEXT_PUBLIC_MY_ACCOUNT_ID || '';
}

/**
 * Gets the operator private key from environment
 * @returns Private key string
 */
export function getOperatorPrivateKey(): string {
    return process.env.NEXT_PUBLIC_MY_PRIVATE_KEY || '';
}

/**
 * Gets the account balance in HBAR
 * @param accountId Account ID string
 * @returns Balance as a string
 */
export async function getAccountBalance(accountId: string): Promise<string> {
    const client = getClient();

    const accountBalance = await new AccountBalanceQuery()
        .setAccountId(AccountId.fromString(accountId))
        .execute(client);

    return accountBalance.hbars.toString();
}

/**
 * Executes a contract query with retry logic
 * @param contractId Contract to query
 * @param functionName Function to call
 * @param params Optional parameters
 * @returns Contract function result
 */
export async function queryContract(
    contractId: string,
    functionName: string,
    params?: ContractFunctionParameters,
    maxAttempts: number = 8
): Promise<ContractFunctionResult> {
    // Check for demo mode
    if (typeof window !== 'undefined' && localStorage.getItem('tajiri-demo-mode') === 'true') {
        console.log(`Using demo mode for queryContract: ${functionName}`);
        // Return mock contract call result
        const mockResult = new ContractFunctionResult(new Uint8Array(32));
        return mockResult;
    }

    const client = getClient();
    if (!client) {
        throw new Error('Hedera client is not initialized');
    }

    // Handle different contract ID formats
    let formattedContractId;
    try {
        if (contractId.startsWith('0x')) {
            // This is an Ethereum address format
            formattedContractId = contractId; // Keep as is for the contract call
        } else if (contractId.includes('.')) {
            // This is a Hedera ID format (0.0.xxxxx)
            formattedContractId = ContractId.fromString(contractId).toString();
        } else {
            // Try to parse as a number
            formattedContractId = new ContractId(parseInt(contractId)).toString();
        }
    } catch (err) {
        console.error(`Failed to parse contract ID ${contractId}:`, err);
        throw new Error(`Invalid contract ID format: ${contractId}`);
    }

    let lastError: any = null;
    let currentAttempt = 1;
    const maxDelayMs = 15000; // Cap at 15 seconds

    while (currentAttempt <= maxAttempts) {
        try {
            // Create and execute the query
            const query = new ContractCallQuery()
                .setContractId(formattedContractId)
                .setGas(100000);

            if (params) {
                query.setFunction(functionName, params);
            } else {
                query.setFunction(functionName);
            }

            query.setMaxQueryPayment(new Hbar(1)); // Increase max payment

            // For first attempt, try with smaller timeout
            if (currentAttempt === 1) {
                query.setQueryPayment(new Hbar(0.1));
            } else {
                query.setQueryPayment(new Hbar(0.2)); // Increase payment for retries
            }

            const result = await query.execute(client);
            return result;
        } catch (err: any) {
            lastError = err;
            const isRetriable =
                (err.message && (
                    err.message.includes('CostQuery has not been loaded yet') ||
                    err.message.includes('BUSY') ||
                    err.message.includes('PLATFORM_TRANSACTION_NOT_CREATED') ||
                    err.message.includes('REQUEST_TIMEOUT')
                ));

            console.log(`Query attempt ${currentAttempt} failed with error: ${err.message}`);

            if (!isRetriable || currentAttempt >= maxAttempts) {
                break;
            }

            // Exponential backoff with jitter
            const baseDelayMs = Math.min(2000 * Math.pow(1.5, currentAttempt - 1), maxDelayMs);
            const jitter = baseDelayMs * 0.2 * (Math.random() - 0.5); // ±10% jitter
            const delayMs = Math.floor(baseDelayMs + jitter);

            console.log(`Query attempt ${currentAttempt} failed. Retrying after ${delayMs}ms delay...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
            currentAttempt++;
        }
    }

    // After all retries failed, if we're in a browser environment, set demo mode
    if (typeof window !== 'undefined' && currentAttempt >= maxAttempts) {
        console.warn("All query attempts failed. Enabling demo mode for future requests.");
        localStorage.setItem('tajiri-demo-mode', 'true');

        // Return mock result
        const mockResult = new ContractFunctionResult(new Uint8Array(32));
        return mockResult;
    }

    throw new Error(`Query failed after ${maxAttempts} attempts: ${lastError?.message || 'Unknown error'}`);
}

/**
 * Executes a contract transaction with retry logic
 * @param contractId Contract to interact with
 * @param functionName Function to call
 * @param params Optional parameters
 * @param gas Optional gas limit
 * @returns Transaction receipt or null in demo mode
 */
export async function executeContractTransaction(
    contractId: string,
    functionName: string,
    params?: ContractFunctionParameters,
    gas?: number,
    maxAttempts: number = 5
): Promise<TransactionReceipt | null> {
    // Check for demo mode
    if (typeof window !== 'undefined' && localStorage.getItem('tajiri-demo-mode') === 'true') {
        console.log(`Using demo mode for executeContractTransaction: ${functionName}`);
        // Return mock success for transactions in demo mode
        return null;
    }

    const client = getClient();
    if (!client) {
        throw new Error('Hedera client is not initialized');
    }

    // Handle different contract ID formats
    let formattedContractId;
    try {
        if (contractId.startsWith('0x')) {
            // This is an Ethereum address format - try to convert
            try {
                formattedContractId = ContractId.fromSolidityAddress(contractId);
            } catch (err) {
                console.warn(`Could not convert Ethereum address to ContractId: ${contractId}`, err);
                formattedContractId = contractId; // Try using as is
            }
        } else if (contractId.includes('.')) {
            // This is a Hedera ID format (0.0.xxxxx)
            formattedContractId = ContractId.fromString(contractId);
        } else {
            // Try to parse as a number
            formattedContractId = new ContractId(parseInt(contractId));
        }
    } catch (err) {
        console.error(`Failed to parse contract ID ${contractId}:`, err);
        throw new Error(`Invalid contract ID format: ${contractId}`);
    }

    let lastError: any = null;
    let currentAttempt = 1;
    const maxDelayMs = 15000; // Cap at 15 seconds

    while (currentAttempt <= maxAttempts) {
        try {
            // Create the transaction
            const transaction = new ContractExecuteTransaction()
                .setContractId(formattedContractId)
                .setGas(gas || 300000);

            if (params) {
                transaction.setFunction(functionName, params);
            } else {
                transaction.setFunction(functionName);
            }

            // Sign with operator key and submit
            console.log(`Executing contract transaction (attempt ${currentAttempt}/${maxAttempts})...`);
            const txResponse = await transaction.execute(client);

            // Get the receipt
            const receipt = await txResponse.getReceipt(client);
            console.log(`Contract transaction ${functionName} succeeded.`);
            return receipt;
        } catch (err: any) {
            lastError = err;
            const isRetriable =
                (err.message && (
                    err.message.includes('BUSY') ||
                    err.message.includes('PLATFORM_TRANSACTION_NOT_CREATED') ||
                    err.message.includes('REQUEST_TIMEOUT') ||
                    err.message.includes('receipt not available yet')
                ));

            console.log(`Transaction attempt ${currentAttempt} failed with error: ${err.message}`);

            // Check for contract revert specifically
            if (err.message && err.message.includes('CONTRACT_REVERT_EXECUTED')) {
                console.error('Smart contract execution reverted:', err);
                throw new Error(`Contract execution reverted: ${err.message}`);
            }

            if (!isRetriable || currentAttempt >= maxAttempts) {
                break;
            }

            // Exponential backoff with jitter
            const baseDelayMs = Math.min(3000 * Math.pow(1.5, currentAttempt - 1), maxDelayMs);
            const jitter = baseDelayMs * 0.2 * (Math.random() - 0.5); // ±10% jitter
            const delayMs = Math.floor(baseDelayMs + jitter);

            console.log(`Transaction attempt ${currentAttempt} failed. Retrying after ${delayMs}ms delay...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
            currentAttempt++;
        }
    }

    // After all retries failed, if we're in a browser environment, set demo mode
    if (typeof window !== 'undefined' && currentAttempt >= maxAttempts) {
        console.warn("All transaction attempts failed. Enabling demo mode for future requests.");
        localStorage.setItem('tajiri-demo-mode', 'true');
        return null;
    }

    throw new Error(`Transaction failed after ${maxAttempts} attempts: ${lastError?.message || 'Unknown error'}`);
}

/**
 * Helper to verify a client has a properly configured operator
 * @param client Hedera client to verify
 * @returns Boolean indicating if operator is properly configured
 */
export function verifyClientOperator(client: Client): boolean {
    if (!client) {
        return false;
    }

    if (!client.operatorAccountId) {
        return false;
    }

    if (!client.operatorPublicKey) {
        return false;
    }

    return true;
}

/**
 * Tests connectivity to the Hedera network
 * @param client Hedera client instance
 * @param maxAttempts Maximum number of retry attempts
 * @returns True if the network is accessible
 */
export async function testNetworkConnectivity(client?: Client, maxAttempts: number = 1): Promise<boolean> {
    try {
        const testClient = client || getClient();
        if (!testClient || !testClient.operatorAccountId) return false;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                // Use a simple query to test connectivity
                const balance = await new AccountBalanceQuery()
                    .setAccountId(testClient.operatorAccountId)
                    .setMaxQueryPayment(new Hbar(0.01))
                    .execute(testClient);

                console.log("Network connectivity test successful");
                return true;
            } catch (err) {
                console.error(`Network connectivity test attempt ${attempt}/${maxAttempts} failed:`, err);

                // Check if we need to retry
                if (attempt < maxAttempts) {
                    // Increase backoff time with each attempt
                    const backoffTime = 1000 * Math.min(attempt, 5);
                    console.log(`Retrying network connection in ${backoffTime}ms...`);
                    await new Promise(resolve => setTimeout(resolve, backoffTime));
                } else {
                    // Final attempt failed
                    console.warn("All network connectivity test attempts failed");
                    return false;
                }
            }
        }

        return false;
    } catch (error) {
        // If anything goes wrong with the overall process
        console.error("Critical error during network connectivity test:", error);
        return false;
    }
}

/**
 * Ensures the client is properly initialized and ready for use
 * @returns Verified client
 */
export async function getVerifiedClient(): Promise<Client> {
    const client = getClient();

    // Verify client operator is set
    if (!verifyClientOperator(client)) {
        resetClient();
        throw new Error('Client operator not configured properly');
    }

    // Test client with a basic query to ensure it's ready
    try {
        const operatorId = client.operatorAccountId as AccountId;
        await new AccountBalanceQuery()
            .setAccountId(operatorId)
            .setMaxQueryPayment(new Hbar(0.1))
            .execute(client);
    } catch (err) {
        console.warn('Client verification query failed:', err);
        // We'll continue anyway as this might be due to network issues
        // The retry logic in our other functions will handle this
    }

    return client;
}

/**
 * Converts a string to a bytes32 representation
 * @param functionName The string to convert
 * @returns The bytes32 representation
 */
export function stringToBytes32(functionName: string): string {
    // Convert the function name to hex and pad to 32 bytes
    let hex = '';
    for (let i = 0; i < functionName.length; i++) {
        const code = functionName.charCodeAt(i);
        const n = code.toString(16);
        hex += n.length < 2 ? '0' + n : n;
    }

    // Pad to 64 characters (32 bytes)
    hex = hex.padEnd(64, '0');

    return '0x' + hex;
}

/**
 * Gets the contract balance in HBAR
 * @param contractId The contract ID to query
 * @returns The contract balance in HBAR as a string
 */
export async function getContractBalance(contractId: string): Promise<string> {
    const client = getClient();

    try {
        // Handle Ethereum format addresses
        if (contractId.startsWith('0x')) {
            // For demo mode, return a mock balance
            if (localStorage.getItem('tajiri-demo-mode') === 'true') {
                return "100.00";
            }

            // Try to convert from Ethereum to Hedera format
            try {
                // If this is actually a valid Hedera contract ID in Solidity format
                const convertedId = ContractId.fromSolidityAddress(contractId);
                const balance = await convertedId.getBalance(client);
                return balance.hbars.toString();
            } catch (err) {
                console.warn(`Cannot convert Ethereum address to ContractId: ${contractId}`, err);
                return "0.00"; // Return zero balance as fallback
            }
        }

        // Regular Hedera format
        const balance = await new ContractId(contractId).getBalance(client);
        return balance.hbars.toString();
    } catch (err) {
        console.error(`Failed to get balance for contract ${contractId}:`, err);
        // Return zero balance as fallback instead of throwing
        return "0.00";
    }
}

/**
 * Converts a string to a ContractId object with better error handling
 * @param id The ID string
 * @returns The ContractId object or null if conversion fails
 */
export function getContractId(id: string): ContractId | null {
    try {
        if (id.startsWith('0x')) {
            // Check for demo mode
            if (typeof window !== 'undefined' && localStorage.getItem('tajiri-demo-mode') === 'true') {
                console.log(`Using demo mode for contract ID: ${id}`);
                // For demo mode, use a dummy contract ID
                return ContractId.fromString("0.0.1234567");
            }

            try {
                return ContractId.fromSolidityAddress(id);
            } catch {
                console.warn(`Failed to convert Solidity address to ContractId: ${id}`);
                return null;
            }
        } else if (id.includes('.')) {
            // Standard Hedera format (0.0.12345)
            return ContractId.fromString(id);
        } else {
            try {
                // Try to interpret as a number
                return new ContractId(parseInt(id));
            } catch {
            // Last resort, try standard format
                return ContractId.fromString(id);
            }
        }
    } catch (err) {
        console.error(`Invalid contract ID format: ${id}`, err);
        return null;
    }
}

/**
 * Alias for executeContractTransaction for backward compatibility
 * @param contractId Contract to interact with
 * @param functionName Function to call
 * @param params Optional parameters
 * @param gas Optional gas limit
 * @returns Transaction receipt or null in demo mode
 */
export const executeContract = executeContractTransaction; 
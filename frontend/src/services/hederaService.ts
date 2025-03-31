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
    params?: ContractFunctionParameters
): Promise<ContractFunctionResult> {
    const client = getClient();

    let query = new ContractCallQuery()
        .setContractId(ContractId.fromString(contractId))
        .setGas(100000)
        .setMaxQueryPayment(new Hbar(0.5));

    if (params) {
        query = query.setFunction(functionName, params);
    } else {
        query = query.setFunction(functionName);
    }

    // Add retry logic for CostQuery issues
    let attempts = 0;
    const maxAttempts = 8;
    let lastError: any;

    while (attempts < maxAttempts) {
        try {
            // Exponential backoff delay between attempts
            if (attempts > 0) {
                const delay = Math.min(2000 * Math.pow(1.5, attempts - 1), 15000);
                console.log(`Query attempt ${attempts} failed. Retrying after ${delay}ms delay...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }

            const response = await query.execute(client);
            return response;
        } catch (err: any) {
            attempts++;
            lastError = err;

            // Retry for all network-related errors
            if (err.message && (
                err.message.includes('CostQuery has not been loaded yet') ||
                err.message.includes('BUSY') ||
                err.message.includes('PLATFORM_TRANSACTION_NOT_CREATED') ||
                err.message.includes('network error') ||
                err.message.includes('timeout')
            )) {
                console.log(`Query attempt ${attempts} failed with error: ${err.message}. Retrying...`);
                continue;
            } else {
                // Don't retry for other errors
                throw err;
            }
        }
    }

    throw new Error(`Query failed after ${maxAttempts} attempts: ${lastError?.message}`);
}

/**
 * Executes a contract transaction with retry logic
 * @param contractId Contract to execute against
 * @param functionName Function to call
 * @param params Optional parameters
 * @param payableAmount Optional HBAR amount to send
 * @returns Transaction receipt
 */
export async function executeContract(
    contractId: string,
    functionName: string,
    params?: ContractFunctionParameters,
    payableAmount?: number
): Promise<TransactionReceipt> {
    const client = getClient();

    let tx = new ContractExecuteTransaction()
        .setContractId(ContractId.fromString(contractId))
        .setGas(1000000);

    if (params) {
        tx = tx.setFunction(functionName, params);
    } else {
        tx = tx.setFunction(functionName);
    }

    if (payableAmount && payableAmount > 0) {
        tx = tx.setPayableAmount(new Hbar(payableAmount));
    }

    // Add retry logic for execution problems
    let attempts = 0;
    const maxAttempts = 8;
    let lastError: any;

    while (attempts < maxAttempts) {
        try {
            // Exponential backoff delay between attempts
            if (attempts > 0) {
                const delay = Math.min(2000 * Math.pow(1.5, attempts - 1), 15000);
                console.log(`Transaction execution attempt ${attempts} failed. Retrying after ${delay}ms delay...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }

            const response = await tx.execute(client);

            // Add some delay before getting receipt to ensure transaction has time to be processed
            await new Promise(resolve => setTimeout(resolve, 1000));

            const receipt = await response.getReceipt(client);
            return receipt;
        } catch (err: any) {
            attempts++;
            lastError = err;

            // Retry for common execution errors and network issues
            if (err.message && (
                err.message.includes('BUSY') ||
                err.message.includes('PLATFORM_TRANSACTION_NOT_CREATED') ||
                err.message.includes('CostQuery has not been loaded') ||
                err.message.includes('network error') ||
                err.message.includes('timeout') ||
                err.message.includes('CONNECTION_ERROR') ||
                err.message.includes('RECEIPT_NOT_FOUND')
            )) {
                console.log(`Transaction attempt ${attempts} failed with error: ${err.message}. Retrying...`);
                continue;
            } else {
                // Don't retry for other errors
                throw err;
            }
        }
    }

    throw new Error(`Transaction failed after ${maxAttempts} attempts: ${lastError?.message}`);
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
 * @returns Boolean indicating if the connection is working
 */
export async function testNetworkConnectivity(): Promise<boolean> {
    try {
        const client = getClient();

        // Try a simple balance query as a test
        const myAccountId = getOperatorAccountId();

        if (!myAccountId) {
            return false;
        }

        // Simple account balance query with retry
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                if (attempt > 0) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                }

                const balance = await new AccountBalanceQuery()
                    .setAccountId(myAccountId)
                    .setMaxQueryPayment(new Hbar(0.1))
                    .execute(client);

                // If we get here, the connection is working
                console.log('Network connectivity test successful');
                return true;
            } catch (err) {
                console.log(`Network test attempt ${attempt + 1} failed:`, err);
                if (attempt >= 2) return false;
            }
        }

        return false;
    } catch (err) {
        console.error('Network connectivity test failed:', err);
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
        const balance = await new ContractId(contractId).getBalance(client);
        return balance.hbars.toString();
    } catch (err) {
        console.error(`Failed to get balance for contract ${contractId}:`, err);
        throw err;
    }
}

/**
 * Converts a string to a ContractId object
 * @param id The ID string
 * @returns The ContractId object
 */
function getContractId(id: string): ContractId {
    try {
        if (id.startsWith('0x')) {
            return ContractId.fromSolidityAddress(id);
        } else if (id.includes('.')) {
            return ContractId.fromString(id);
        } else {
            return ContractId.fromString(id);
        }
    } catch (err) {
        console.error(`Invalid contract ID format: ${id}`, err);
        throw new Error(`Invalid contract ID format: ${id}`);
    }
} 
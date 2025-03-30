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
    ContractId
} from '@hashgraph/sdk';

// Singleton client instance
let hederaClient: Client | null = null;

/**
 * Initializes and returns a Hedera client
 * @returns Initialized Hedera client
 */
export function getClient(): Client {
    if (hederaClient) return hederaClient;

    const network = process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet';
    const myAccountId = process.env.NEXT_PUBLIC_MY_ACCOUNT_ID;
    const myPrivateKey = process.env.NEXT_PUBLIC_MY_PRIVATE_KEY;

    if (!myAccountId || !myPrivateKey) {
        throw new Error('Environment variables for Hedera client not set');
    }

    try {
        // Create new client based on network
        if (network === 'testnet') {
            hederaClient = Client.forTestnet();
        } else {
            hederaClient = Client.forMainnet();
        }

        // Parse account ID and private key
        const accountId = AccountId.fromString(myAccountId);
        const privateKey = PrivateKey.fromString(myPrivateKey);

        // Set operator
        hederaClient.setOperator(accountId, privateKey);

        // Set default max query payment to prevent CostQuery errors
        hederaClient.setDefaultMaxQueryPayment(new Hbar(0.5));

        console.log('Hedera client initialized for', network, 'with account', myAccountId);

        return hederaClient;
    } catch (err) {
        console.error('Failed to initialize Hedera client:', err);
        throw new Error(`Failed to initialize Hedera client: ${err instanceof Error ? err.message : String(err)}`);
    }
}

/**
 * Resets the client, useful for tests or when changing network
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
        .setMaxQueryPayment(new Hbar(0.1));

    if (params) {
        query = query.setFunction(functionName, params);
    } else {
        query = query.setFunction(functionName);
    }

    // Add retry logic for CostQuery issues
    let attempts = 0;
    const maxAttempts = 5;
    let lastError: any;

    while (attempts < maxAttempts) {
        try {
            // Small delay between attempts that increases with each retry
            if (attempts > 0) {
                await new Promise(resolve => setTimeout(resolve, 500 * attempts));
            }

            const response = await query.execute(client);
            return response;
        } catch (err: any) {
            attempts++;
            lastError = err;

            // Only retry for CostQuery errors
            if (err.message && err.message.includes('CostQuery has not been loaded yet')) {
                console.log(`Query attempt ${attempts} failed with CostQuery error. Retrying...`);
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
): Promise<any> {
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
    const maxAttempts = 5;
    let lastError: any;

    while (attempts < maxAttempts) {
        try {
            // Small delay between attempts that increases with each retry
            if (attempts > 0) {
                await new Promise(resolve => setTimeout(resolve, 500 * attempts));
                console.log(`Retrying transaction execution (attempt ${attempts})...`);
            }

            const response = await tx.execute(client);

            // Add some delay before getting receipt to ensure transaction has time to be processed
            await new Promise(resolve => setTimeout(resolve, 200));

            const receipt = await response.getReceipt(client);
            return receipt;
        } catch (err: any) {
            attempts++;
            lastError = err;

            // Retry for common execution errors
            if (err.message && (
                err.message.includes('BUSY') ||
                err.message.includes('PLATFORM_TRANSACTION_NOT_CREATED') ||
                err.message.includes('CostQuery has not been loaded')
            )) {
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
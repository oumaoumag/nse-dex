import {
    Client,
    TokenId,
    AccountId,
    TokenCreateTransaction,
    TokenMintTransaction,
    TokenBurnTransaction,
    TokenAssociateTransaction,
    TokenDissociateTransaction,
    TransferTransaction,
    Hbar,
    PrivateKey,
    ContractFunctionParameters,
    ContractExecuteTransaction,
    ContractId,
} from '@hashgraph/sdk';
import * as hederaService from './hederaService';
import { formatError, logError } from '../utils/errorUtils';

interface TokenInfo {
    tokenId: string;
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: number;
    treasuryAccountId: string;
}

interface StockTokenInfo extends TokenInfo {
    priceHbar: number;
    lastUpdated: number;
}

// Mock exchange rates (in a real app, these would be fetched from an oracle)
const TOKEN_EXCHANGE_RATES = {
    "USDC": 0.13, // 1 USDC = 0.13 HBAR
    "USDT": 0.13, // 1 USDT = 0.13 HBAR
    "HBAR": 1.0   // 1 HBAR = 1 HBAR
};

// Token IDs - replace with actual token IDs from your Hedera deployment
const TOKEN_IDS = {
    "USDC": process.env.NEXT_PUBLIC_USDC_TOKEN_ID || "0.0.1234567",
    "USDT": process.env.NEXT_PUBLIC_USDT_TOKEN_ID || "0.0.1234568"
};

export class TokenService {
    private client: Client;
    private operatorId: AccountId;
    private operatorKey: PrivateKey;
    private stablecoins: Map<string, TokenInfo> = new Map();
    private stockTokens: Map<string, StockTokenInfo> = new Map();

    constructor() {
        this.client = hederaService.getClient();
        this.operatorId = hederaService.getOperatorAccountId();
        this.operatorKey = hederaService.getOperatorPrivateKey();
    }

    /**
     * Create a new stock token
     */
    async createStockToken(
        name: string,
        symbol: string,
        decimals: number,
        initialSupply: number,
        priceHbar: number
    ): Promise<StockTokenInfo> {
        try {
            // Create token transaction
            const transaction = new TokenCreateTransaction()
                .setTokenName(name)
                .setTokenSymbol(symbol)
                .setDecimals(decimals)
                .setInitialSupply(initialSupply)
                .setTreasuryAccountId(this.operatorId)
                .setAdminKey(this.operatorKey)
                .setSupplyKey(this.operatorKey)
                .setFreezeKey(this.operatorKey)
                .setWipeKey(this.operatorKey)
                .setKycKey(this.operatorKey)
                .setPauseKey(this.operatorKey);

            // Sign and execute the transaction
            const txResponse = await transaction
                .freezeWith(this.client)
                .sign(this.operatorKey)
                .execute(this.client);

            // Get the receipt
            const receipt = await txResponse.getReceipt(this.client);
            const tokenId = receipt.tokenId;

            if (!tokenId) {
                throw new Error('Token creation failed: No token ID returned');
            }

            const tokenInfo: StockTokenInfo = {
                tokenId: tokenId.toString(),
                name,
                symbol,
                decimals,
                totalSupply: initialSupply,
                treasuryAccountId: this.operatorId.toString(),
                priceHbar,
                lastUpdated: Date.now()
            };

            this.stockTokens.set(symbol, tokenInfo);
            return tokenInfo;
        } catch (error) {
            logError('Error creating stock token:', error);
            throw new Error(`Failed to create stock token: ${formatError(error)}`);
        }
    }

    /**
     * Mint new stock tokens
     */
    async mintStockTokens(
        tokenId: string,
        amount: number
    ): Promise<void> {
        try {
            const transaction = new TokenMintTransaction()
                .setTokenId(tokenId)
                .setAmount(amount);

            const txResponse = await transaction
                .freezeWith(this.client)
                .sign(this.operatorKey)
                .execute(this.client);

            await txResponse.getReceipt(this.client);
        } catch (error) {
            logError('Error minting stock tokens:', error);
            throw new Error(`Failed to mint stock tokens: ${formatError(error)}`);
        }
    }

    /**
     * Burn stock tokens
     */
    async burnStockTokens(
        tokenId: string,
        amount: number
    ): Promise<void> {
        try {
            const transaction = new TokenBurnTransaction()
                .setTokenId(tokenId)
                .setAmount(amount);

            const txResponse = await transaction
                .freezeWith(this.client)
                .sign(this.operatorKey)
                .execute(this.client);

            await txResponse.getReceipt(this.client);
        } catch (error) {
            logError('Error burning stock tokens:', error);
            throw new Error(`Failed to burn stock tokens: ${formatError(error)}`);
        }
    }

    /**
     * Associate tokens with an account
     */
    async associateTokens(
        accountId: string,
        tokenIds: string[]
    ): Promise<void> {
        try {
            for (const tokenId of tokenIds) {
                const transaction = new TokenAssociateTransaction()
                    .setAccountId(accountId)
                    .setTokenIds([tokenId]);

                const txResponse = await transaction
                    .freezeWith(this.client)
                    .sign(this.operatorKey)
                    .execute(this.client);

                await txResponse.getReceipt(this.client);
            }
        } catch (error) {
            logError('Error associating tokens:', error);
            throw new Error(`Failed to associate tokens: ${formatError(error)}`);
        }
    }

    /**
     * Transfer tokens between accounts
     */
    async transferTokens(
        tokenId: string,
        fromAccountId: string,
        toAccountId: string,
        amount: number
    ): Promise<void> {
        try {
            const transaction = new TransferTransaction()
                .addTokenTransfer(tokenId, fromAccountId, -amount)
                .addTokenTransfer(tokenId, toAccountId, amount);

            const txResponse = await transaction
                .freezeWith(this.client)
                .sign(this.operatorKey)
                .execute(this.client);

            await txResponse.getReceipt(this.client);
        } catch (error) {
            logError('Error transferring tokens:', error);
            throw new Error(`Failed to transfer tokens: ${formatError(error)}`);
        }
    }

    /**
     * Get token information
     */
    async getTokenInfo(tokenId: string): Promise<TokenInfo> {
        try {
            const token = await TokenId.fromString(tokenId);
            const tokenInfo = await token.getInfo(this.client);

            return {
                tokenId: tokenId,
                name: tokenInfo.name,
                symbol: tokenInfo.symbol,
                decimals: tokenInfo.decimals,
                totalSupply: tokenInfo.totalSupply,
                treasuryAccountId: tokenInfo.treasuryAccountId.toString()
            };
        } catch (error) {
            logError('Error getting token info:', error);
            throw new Error(`Failed to get token info: ${formatError(error)}`);
        }
    }

    /**
     * Get stock token information
     */
    async getStockTokenInfo(symbol: string): Promise<StockTokenInfo | null> {
        return this.stockTokens.get(symbol) || null;
    }

    /**
     * Update stock token price
     */
    async updateStockTokenPrice(
        symbol: string,
        newPriceHbar: number
    ): Promise<void> {
        const tokenInfo = this.stockTokens.get(symbol);
        if (tokenInfo) {
            tokenInfo.priceHbar = newPriceHbar;
            tokenInfo.lastUpdated = Date.now();
            this.stockTokens.set(symbol, tokenInfo);
        }
    }

    /**
     * Get all stock tokens
     */
    async getAllStockTokens(): Promise<StockTokenInfo[]> {
        return Array.from(this.stockTokens.values());
    }

    /**
     * Get token balance for an account
     */
    async getTokenBalance(
        tokenId: string,
        accountId: string
    ): Promise<number> {
        try {
            const token = await TokenId.fromString(tokenId);
            const balance = await token.getBalance(this.client, accountId);
            return balance;
        } catch (error) {
            logError('Error getting token balance:', error);
            throw new Error(`Failed to get token balance: ${formatError(error)}`);
        }
    }

    /**
     * Associates a token with an account so it can receive transfers
     * @param accountId The account to associate the token with
     * @param tokenType The type of token to associate (USDC, USDT)
     * @returns Object with success flag, txId if successful, and error message if failed
     */
    async associateToken(
        accountId: string,
        tokenType: 'USDC' | 'USDT'
    ): Promise<{ success: boolean; txId?: string; error?: string }> {
        // Check if we're in demo mode
        const isDemoMode = typeof window !== 'undefined' && localStorage.getItem('tajiri-demo-mode') === 'true';
        if (isDemoMode) {
            console.log(`Associating ${tokenType} token with account ${accountId} in demo mode`);
            return {
                success: true,
                txId: `demo-associate-${Date.now().toString(36)}`,
            };
        }

        try {
            const client = hederaService.getClient();
            if (!client) {
                throw new Error("Hedera client not initialized");
            }

            // Get the token ID for the token type
            const tokenId = TOKEN_IDS[tokenType];
            if (!tokenId) {
                throw new Error(`No token ID found for token type ${tokenType}`);
            }

            // Convert to proper objects
            const token = TokenId.fromString(tokenId);
            const account = AccountId.fromString(accountId);

            // Create the transaction to associate token with the account
            const transaction = new TokenAssociateTransaction()
                .setAccountId(account)
                .setTokenIds([token])
                .freezeWith(client);

            // Sign and execute the transaction
            const txResponse = await transaction.execute(client);
            const receipt = await txResponse.getReceipt(client);

            return {
                success: receipt.status.toString() === 'SUCCESS',
                txId: txResponse.transactionId.toString(),
            };
        } catch (error) {
            console.error(`Error associating ${tokenType} token:`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error occurred",
            };
        }
    }

    /**
     * Checks if an account has a token associated
     * @param accountId The account to check
     * @param tokenType The type of token to check (USDC, USDT)
     * @returns True if the token is associated, false otherwise
     */
    async isTokenAssociated(
        accountId: string,
        tokenType: 'USDC' | 'USDT'
    ): Promise<boolean> {
        // In demo mode, always return true
        const isDemoMode = typeof window !== 'undefined' && localStorage.getItem('tajiri-demo-mode') === 'true';
        if (isDemoMode) {
            return true;
        }

        try {
            // Try to get the token balance - if it works, the token is associated
            await this.getTokenBalance(TOKEN_IDS[tokenType], accountId);
            return true;
        } catch (error) {
            // If we get a TOKEN_NOT_ASSOCIATED_TO_ACCOUNT error, the token is not associated
            const errorMessage = error instanceof Error ? error.message : '';
            if (errorMessage.includes('TOKEN_NOT_ASSOCIATED_TO_ACCOUNT')) {
                return false;
            }

            // For other errors, log and assume not associated for safety
            console.error(`Error checking if ${tokenType} is associated:`, error);
            return false;
        }
    }
}

// Export singleton instance
export const tokenService = new TokenService();

/**
 * Shares HBAR from the deployment account to user wallet for transaction fees
 * @param destinationAddress The user's wallet address
 * @param hbarAmount Amount of HBAR to share (default: 0.5 HBAR)
 * @returns Object with success flag, transaction ID if successful, and error message if failed
 */
export async function shareGasFromDeploymentAccount(
    destinationAddress: string,
    hbarAmount: number = 0.5
): Promise<{ success: boolean; txId?: string; error?: string }> {
    try {
        // If in demo mode, pretend it was successful
        if (typeof window !== 'undefined' && localStorage.getItem('tajiri-demo-mode') === 'true') {
            return {
                success: true,
                txId: `demo-gas-tx-${Date.now().toString(36)}`
            };
        }

        const client = hederaService.getClient();
        if (!client) {
            throw new Error('Hedera client is not initialized');
        }

        // Get the deployment account ID
        const deploymentAccountId = hederaService.getOperatorAccountId();
        if (!deploymentAccountId) {
            throw new Error('Deployment account ID not configured');
        }

        // Get the deployment account private key
        const deploymentAccountKey = hederaService.getOperatorPrivateKey();
        if (!deploymentAccountKey) {
            throw new Error('Deployment account key not configured');
        }

        // Parse destination address
        let targetId: string;
        if (destinationAddress.startsWith('0x')) {
            // This is a contract address
            try {
                targetId = ContractId.fromSolidityAddress(destinationAddress).toString();
            } catch (err) {
                console.warn(`Could not convert Ethereum address: ${destinationAddress}`, err);
                targetId = destinationAddress;
            }
        } else {
            targetId = destinationAddress;
        }

        // Create the transfer transaction
        const amount = new Hbar(hbarAmount);
        const transaction = new TransferTransaction()
            .addHbarTransfer(deploymentAccountId, amount.negated())
            .addHbarTransfer(targetId, amount)
            .freezeWith(client);

        // Sign and execute the transaction
        const signedTx = await transaction.sign(PrivateKey.fromString(deploymentAccountKey));
        const response = await signedTx.execute(client);
        const receipt = await response.getReceipt(client);

        console.log(`Successfully shared ${amount} HBAR from deployment account to ${targetId}`);
        return {
            success: true,
            txId: response.transactionId.toString()
        };
    } catch (error) {
        console.error('Error sharing gas from deployment account:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error occurred"
        };
    }
}

/**
 * Converts token amount to equivalent HBAR amount
 * @param tokenType Token type (USDC, USDT, HBAR)
 * @param amount Amount of token
 * @returns Equivalent HBAR amount
 */
export function convertTokenAmountToHbar(
    tokenType: 'USDC' | 'USDT' | 'HBAR',
    amount: number
): number {
    const exchangeRate = TOKEN_EXCHANGE_RATES[tokenType] || 1.0;
    return amount * exchangeRate;
}

/**
 * Executes a contract transaction with token conversion
 * @param contractId Target contract ID
 * @param functionName Function to call
 * @param params Function parameters
 * @param tokenType Type of token to use (USDC, USDT, HBAR)
 * @param tokenAmount Amount of token
 * @returns Transaction receipt or null in demo mode
 */
export async function executeContractWithToken(
    contractId: string,
    functionName: string,
    params: ContractFunctionParameters,
    tokenType: 'USDC' | 'USDT' | 'HBAR',
    tokenAmount: number
) {
    try {
        // If in demo mode, pretend it was successful
        if (typeof window !== 'undefined' && localStorage.getItem('tajiri-demo-mode') === 'true') {
            console.log(`Using demo mode for contract execution with ${tokenType}`);
            return null;
        }

        const client = hederaService.getClient();
        if (!client) {
            throw new Error('Hedera client is not initialized');
        }

        // If using HBAR, just execute the contract directly
        if (tokenType === 'HBAR') {
            return hederaService.executeContractTransaction(
                contractId,
                functionName,
                params,
                300000, // gas
                5 // maxAttempts
            );
        }

        // For USDC/USDT, we need to:
        // 1. Share HBAR from deployment account for gas fees
        // 2. Call the contract with token params

        // Step 1: Share HBAR for gas fees
        const hbarAmount = 0.5; // Standard amount of HBAR to share for gas
        const gasShared = await shareGasFromDeploymentAccount(contractId, hbarAmount);

        if (!gasShared) {
            throw new Error(`Failed to share gas for contract execution with ${tokenType}`);
        }

        // Step 2: Convert token amount to HBAR equivalent
        const hbarEquivalent = convertTokenAmountToHbar(tokenType, tokenAmount);

        // Step 3: Add token information to the parameters
        // This is a mock implementation - in production, you would adjust parameters based on
        // your specific contract implementation for handling different token types
        const tokenParams = params;

        // Add token type and original amount as additional info
        // Your contract should handle this information to process the payment properly
        if (tokenType === 'USDC') {
            tokenParams.addString("USDC").addUint256(tokenAmount * 100); // Convert to smallest unit
        } else if (tokenType === 'USDT') {
            tokenParams.addString("USDT").addUint256(tokenAmount * 100); // Convert to smallest unit
        }

        // Step 4: Execute the contract with converted parameters
        return hederaService.executeContractTransaction(
            contractId,
            functionName,
            tokenParams,
            400000, // Higher gas limit for token transactions
            5 // maxAttempts
        );
    } catch (error) {
        console.error(`Error executing contract with ${tokenType}:`, error);
        throw error;
    }
}

/**
 * Mint tokens using the specified token type
 * @param contractId Contract to mint from
 * @param tokenType Token type (USDC, USDT, HBAR)
 * @param amount Amount to mint
 * @param recipientId Recipient address
 * @returns Transaction status
 */
export async function mintWithToken(
    contractId: string,
    tokenType: 'USDC' | 'USDT' | 'HBAR',
    amount: number,
    recipientId: string
) {
    try {
        // If in demo mode, pretend it was successful
        if (typeof window !== 'undefined' && localStorage.getItem('tajiri-demo-mode') === 'true') {
            console.log(`Using demo mode for minting with ${tokenType}`);
            return { success: true, txId: `demo-tx-${Date.now()}` };
        }

        // Create parameters for the mint function
        const params = new ContractFunctionParameters()
            .addAddress(recipientId)
            .addUint256(amount * 100); // Converting to smallest unit

        // Execute the transaction with token conversion
        const result = await executeContractWithToken(
            contractId,
            "mint", // Adjust function name based on your contract
            params,
            tokenType,
            amount
        );

        // Handle result
        if (result) {
            console.log(`Successfully minted with ${tokenType}:`, result);
            return {
                success: true,
                txId: result.transactionId?.toString() || `tx-${Date.now()}`
            };
        }

        // If demo mode was activated during execution
        if (typeof window !== 'undefined' && localStorage.getItem('tajiri-demo-mode') === 'true') {
            return { success: true, txId: `demo-tx-${Date.now()}` };
        }

        return { success: false, error: "Transaction failed" };
    } catch (error) {
        console.error(`Error minting with ${tokenType}:`, error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

/**
 * Gets the token balance for a given account or contract
 * @param accountOrContractId The account or contract ID to check
 * @param tokenType The type of token (USDC, USDT)
 * @returns The token balance as a string with 2 decimal places
 */
export async function getTokenBalance(
    accountOrContractId: string,
    tokenType: 'USDC' | 'USDT'
): Promise<string> {
    // Check if we're in demo mode
    const isDemoMode = typeof window !== 'undefined' && localStorage.getItem('tajiri-demo-mode') === 'true';
    if (isDemoMode) {
        // Return demo balances
        const demoBalances = {
            'USDC': '500.00',
            'USDT': '500.00'
        };
        return demoBalances[tokenType] || '0.00';
    }

    try {
        const client = hederaService.getClient();
        if (!client) {
            console.warn("Hedera client not initialized, returning zero balance");
            return '0.00';
        }

        // Get the token ID for the token type
        const tokenId = TOKEN_IDS[tokenType];
        if (!tokenId) {
            console.warn(`No token ID found for token type ${tokenType}, returning zero balance`);
            return '0.00';
        }

        // Handle different address formats
        let accountId: AccountId;
        try {
            if (accountOrContractId.startsWith('0x')) {
                // Try to convert from Ethereum format
                const contractId = ContractId.fromSolidityAddress(accountOrContractId);
                accountId = AccountId.fromString(contractId.toString());
            } else {
                accountId = AccountId.fromString(accountOrContractId);
            }
        } catch (error) {
            console.error(`Error converting address format: ${accountOrContractId}`, error);
            return '0.00';
        }

        // Convert the token ID to a TokenId object
        const token = TokenId.fromString(tokenId);

        // Query the account's token balance directly using the appropriate method
        const accountBalance = await new AccountId(accountId).getTokenBalance(client, token);

        // Convert to a human-readable format (assuming 2 decimal places)
        const balanceStr = accountBalance
            ? (Number(accountBalance) / 100).toFixed(2)
            : '0.00';

        return balanceStr;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        // Check if the error is due to token not being associated
        if (errorMessage.includes('TOKEN_NOT_ASSOCIATED_TO_ACCOUNT')) {
            console.warn(`Token ${tokenType} not associated with account ${accountOrContractId}`);
        } else {
            console.error(`Error getting ${tokenType} balance for ${accountOrContractId}:`, error);
        }

        // Return zero balance on error
        return '0.00';
    }
}

/**
 * Associates a token with an account so it can receive transfers - standalone function version
 * @param accountId The account to associate the token with
 * @param tokenType The type of token to associate (USDC, USDT)
 * @returns Object with success flag, txId if successful, and error message if failed
 */
export async function associateToken(
    accountId: string,
    tokenType: 'USDC' | 'USDT'
): Promise<{ success: boolean; txId?: string; error?: string }> {
    try {
        return await tokenService.associateToken(accountId, tokenType);
    } catch (error) {
        console.error(`Error in standalone associateToken:`, error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error occurred in token association",
        };
    }
}

/**
 * Checks if an account has a token associated - standalone function version
 * @param accountId The account to check
 * @param tokenType The type of token to check (USDC, USDT)
 * @returns True if the token is associated, false otherwise
 */
export async function isTokenAssociated(
    accountId: string,
    tokenType: 'USDC' | 'USDT'
): Promise<boolean> {
    try {
        return await tokenService.isTokenAssociated(accountId, tokenType);
    } catch (error) {
        console.error(`Error in standalone isTokenAssociated:`, error);
        // Default to false on error to trigger association if needed
        return false;
    }
} 
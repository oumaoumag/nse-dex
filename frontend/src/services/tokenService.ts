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
    ContractCallQuery,
    TransactionReceiptQuery
} from '@hashgraph/sdk';
import * as hederaService from './hederaService';
import { formatError, logError } from '../utils/errorUtils';
import { StockTokenInfo } from '../models/StockTokenInfo';

interface TokenInfo {
    tokenId: string;
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: number;
    treasuryAccountId: string;
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
    private client: any;
    private operatorId: any;
    private operatorKey: any;
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
            // Check if we're in demo mode
            if (typeof window !== 'undefined') {
                console.log('Demo mode: Creating stock token', name, symbol);

                // Generate a mock token ID
                const tokenId = `0.0.${Math.floor(Math.random() * 1000000) + 1000000}`;

                const tokenInfo: StockTokenInfo = {
                    tokenId,
                    name,
                    symbol,
                    priceHbar,
                    totalSupply: initialSupply,
                    lastUpdated: Date.now()
                };

                this.stockTokens.set(symbol, tokenInfo);
                return tokenInfo;
            }

            // In a real implementation, this would use the actual Hedera SDK
            console.log("Creating token transaction not supported in this environment");

            // Return mock data
            const tokenId = `0.0.${Math.floor(Math.random() * 1000000) + 1000000}`;
            const tokenInfo: StockTokenInfo = {
                tokenId,
                name,
                symbol,
                priceHbar,
                totalSupply: initialSupply,
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
            // Check if we're in demo mode
            if (typeof window !== 'undefined') {
                console.log('Demo mode: Minting stock tokens', tokenId, amount);
                return;
            }

            // In a real implementation, this would use the actual Hedera SDK
            console.log("Minting stock tokens not supported in this environment");
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
            console.log('Demo mode: Burning stock tokens', tokenId, amount);
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
            console.log('Demo mode: Associating tokens', accountId, tokenIds);
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
            console.log('Demo mode: Transferring tokens', tokenId, fromAccountId, toAccountId, amount);
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
            // Return mock data for demo
            return {
                tokenId: tokenId,
                name: tokenId.includes("USDC") ? "USD Coin" :
                    tokenId.includes("USDT") ? "Tether USD" :
                        "Unknown Token",
                symbol: tokenId.includes("USDC") ? "USDC" :
                    tokenId.includes("USDT") ? "USDT" :
                        "UNKNOWN",
                decimals: 6,
                totalSupply: 1000000000,
                treasuryAccountId: "0.0.12345"
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
        accountId: string,
        tokenType: string
    ): Promise<string> {
        try {
            // Return mock balances
            if (tokenType === 'USDC') {
                return "500.00";
            } else if (tokenType === 'USDT') {
                return "500.00";
            } else {
                return "0.00";
            }
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
        console.log(`Associating ${tokenType} token with account ${accountId} in demo mode`);
        return {
            success: true,
            txId: `demo-associate-${Date.now().toString(36)}`,
        };
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
            await this.getTokenBalance(accountId, tokenType);
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
    console.log(`Mock sharing ${hbarAmount} HBAR gas to ${destinationAddress}`);
    return {
        success: true,
        txId: `demo-gas-tx-${Date.now().toString(36)}`
    };
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
 * Execute a contract with a specified token type for payment
 */
export async function executeContractWithToken(
    contractId: string,
    functionName: string,
    params: any, // Can be array or any other parameter object
    tokenType: 'USDC' | 'USDT' | 'HBAR',
    tokenAmount: number
): Promise<any> {
    try {
        // For demo mode or HBAR, use standard execution
        if (typeof window !== 'undefined' || tokenType === 'HBAR') {
            console.log(`Demo: Executing contract ${contractId}.${functionName} with ${tokenType}`);

            // Convert params to array if it's not already
            const paramsArray = Array.isArray(params) ? params : [];

            return hederaService.executeContractTransaction(
                contractId,
                functionName,
                paramsArray,
                300000, // gas
                5 // maxAttempts
            );
        }

        // Mock successful response
        return {
            status: "SUCCESS",
            transactionId: `mock-tx-${Date.now()}`
        };
    } catch (error) {
        console.error(`Error executing contract with ${tokenType}:`, error);
        throw error;
    }
}

/**
 * Mint tokens using the specified token type
 */
export async function mintWithToken(
    contractId: string,
    tokenType: 'USDC' | 'USDT' | 'HBAR',
    amount: number,
    recipientId: string
) {
    try {
        console.log(`Mock minting with ${tokenType}`);

        // Create parameters as an array
        const params = [recipientId, amount * 100]; // Converting to smallest unit

        // Execute the transaction with token conversion
        const result = await executeContractWithToken(
            contractId,
            "mint", // Adjust function name based on your contract
            params,
            tokenType,
            amount
        );

        // Return success response
        return {
            success: true,
            txId: result?.transactionId || `mock-tx-${Date.now()}`
        };
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
    // Return demo balances
    const demoBalances = {
        'USDC': '500.00',
        'USDT': '500.00'
    };

    console.log(`Getting ${tokenType} balance for ${accountOrContractId}`);
    return demoBalances[tokenType] || '0.00';
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
    console.log(`Associating ${tokenType} token with account ${accountId} in demo mode`);
    return {
        success: true,
        txId: `demo-associate-${Date.now().toString(36)}`,
    };
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
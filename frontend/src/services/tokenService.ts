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
    PrivateKey
} from '@hashgraph/sdk';
import { getClient, getOperatorAccountId, getOperatorPrivateKey } from './hederaService';
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

export class TokenService {
    private client: Client;
    private operatorId: AccountId;
    private operatorKey: PrivateKey;
    private stablecoins: Map<string, TokenInfo> = new Map();
    private stockTokens: Map<string, StockTokenInfo> = new Map();

    constructor() {
        this.client = getClient();
        this.operatorId = getOperatorAccountId();
        this.operatorKey = getOperatorPrivateKey();
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
}

// Export singleton instance
export const tokenService = new TokenService(); 
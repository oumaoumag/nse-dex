import React, { createContext, useContext, useState, useEffect } from 'react';
import { tokenService } from '../services/tokenService';
import { useWallet } from './WalletContext';
import { StockTokenInfo } from '../services/tokenService';

interface TokenContextType {
    stockTokens: StockTokenInfo[];
    isLoading: boolean;
    error: string | null;
    refreshTokens: () => Promise<void>;
    getTokenBalance: (tokenId: string) => Promise<number>;
    updateTokenPrice: (symbol: string, newPrice: number) => Promise<void>;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export function TokenProvider({ children }: { children: React.ReactNode }) {
    const [stockTokens, setStockTokens] = useState<StockTokenInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { accountId } = useWallet();

    const refreshTokens = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const tokens = await tokenService.getAllStockTokens();
            setStockTokens(tokens);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch tokens');
        } finally {
            setIsLoading(false);
        }
    };

    const getTokenBalance = async (tokenId: string): Promise<number> => {
        if (!accountId) {
            throw new Error('Wallet not connected');
        }
        return tokenService.getTokenBalance(tokenId, accountId);
    };

    const updateTokenPrice = async (symbol: string, newPrice: number) => {
        try {
            await tokenService.updateStockTokenPrice(symbol, newPrice);
            await refreshTokens();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update token price');
            throw err;
        }
    };

    useEffect(() => {
        refreshTokens();
    }, []);

    return (
        <TokenContext.Provider
            value={{
                stockTokens,
                isLoading,
                error,
                refreshTokens,
                getTokenBalance,
                updateTokenPrice
            }}
        >
            {children}
        </TokenContext.Provider>
    );
}

export function useToken() {
    const context = useContext(TokenContext);
    if (context === undefined) {
        throw new Error('useToken must be used within a TokenProvider');
    }
    return context;
} 
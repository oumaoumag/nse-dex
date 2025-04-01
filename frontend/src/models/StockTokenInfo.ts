/**
 * Represents information about a stock token
 */
export interface StockTokenInfo {
    tokenId: string;
    name: string;
    symbol: string;
    priceHbar: number;
    totalSupply: number;
    lastUpdated: string | number; // timestamp or date string
    description?: string;
} 
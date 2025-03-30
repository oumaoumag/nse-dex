/**
 * Shared types for the stock trading system
 */

/**
 * Stock information
 */
export interface Stock {
  id: string;           // Contract address
  shortName: string;    // Ticker symbol
  longName: string;     // Full name
  priceHbar: number;    // Price in HBAR
  isHederaToken: boolean; // Whether it's an HTS token
  balance?: string;     // Optional user balance
}

/**
 * Buy offer structure
 */
export interface BuyOffer {
  offerId: string;
  stockContract: string;
  stockAmount: number;
  offerPriceHbar: number;
  createdByUser: string;
  isHederaToken: boolean;
}

/**
 * Sell offer structure
 */
export interface SellOffer {
  offerId: string;
  stockContract: string;
  stockAmount: number;
  offerPriceHbar: number;
  createdByUser: string;
  isHederaToken: boolean;
}

/**
 * Transaction result
 */
export interface TransactionResult {
  success: boolean;
  message: string;
  transactionId?: string;
}

/**
 * Converts HBAR to USD based on exchange rate
 * 
 * @param hbarAmount - Amount in HBAR
 * @param exchangeRate - Current exchange rate
 * @returns USD value
 */
export function calculateUsdValue(hbarAmount: number, exchangeRate: number): number {
  return hbarAmount * exchangeRate;
}

/**
 * Calculates the total HBAR value for an offer
 * 
 * @param amount - Token amount
 * @param pricePerToken - Price per token in HBAR
 * @returns Total HBAR value
 */
export function calculateTotalHbar(amount: number, pricePerToken: number): number {
  return amount * pricePerToken;
}

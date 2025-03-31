import sampleStocks from '../data/sample-stocks.json';

export interface StockData {
    stockSymbol: string;
    stockName: string;
    stockPriceUSD: number;
    stockPriceHBAR: number;
    stockContractAddress: string;
}

/**
 * Fetches all stock data from the sample-stocks.json file
 * @returns Array of stock data objects
 */
export const getAllStocks = (): StockData[] => {
    return sampleStocks;
};

/**
 * Finds a stock by its symbol
 * @param symbol Stock symbol to find
 * @returns Stock data object or undefined if not found
 */
export const getStockBySymbol = (symbol: string): StockData | undefined => {
    return sampleStocks.find(stock => stock.stockSymbol === symbol);
};

/**
 * Finds a stock by its contract address
 * @param address Contract address to find
 * @returns Stock data object or undefined if not found
 */
export const getStockByContractAddress = (address: string): StockData | undefined => {
    return sampleStocks.find(stock => stock.stockContractAddress === address);
};

/**
 * Simulates fetching updated stock prices (would connect to real API in production)
 * @returns Promise with updated stock data
 */
export const fetchLatestStockPrices = async (): Promise<StockData[]> => {
    // In a real application, this would fetch from an API
    // For simulation, we'll return the sample data with slight price variations

    return sampleStocks.map(stock => {
        // Create a variation between -2% and +2%
        const variationFactor = 1 + (Math.random() * 0.04 - 0.02);

        return {
            ...stock,
            stockPriceUSD: parseFloat((stock.stockPriceUSD * variationFactor).toFixed(2)),
            stockPriceHBAR: parseFloat((stock.stockPriceHBAR * variationFactor).toFixed(2))
        };
    });
}; 
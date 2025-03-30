import React, { useState } from 'react';
import { useToken } from '../../contexts/TokenContext';
import { useWallet } from '../../contexts/WalletContext';
import { StockTokenInfo } from '../../services/tokenService';
import { formatHbar } from '../../utils/formatters';

interface StockTokenTradeProps {
    token: StockTokenInfo;
    onClose: () => void;
}

export function StockTokenTrade({ token, onClose }: StockTokenTradeProps) {
    const [amount, setAmount] = useState('');
    const [isBuying, setIsBuying] = useState(true);
    const { accountId } = useWallet();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!accountId) {
            setError('Please connect your wallet first');
            return;
        }

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            if (isBuying) {
                // TODO: Implement buy transaction
                console.log('Buying', numAmount, 'tokens of', token.symbol);
            } else {
                // TODO: Implement sell transaction
                console.log('Selling', numAmount, 'tokens of', token.symbol);
            }
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Transaction failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {isBuying ? 'Buy' : 'Sell'} {token.symbol}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                <div className="mb-4">
                    <p className="text-sm text-gray-500">Current Price</p>
                    <p className="text-lg font-semibold text-gray-900">
                        {formatHbar(token.priceHbar)} ℏ
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label
                            htmlFor="amount"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Amount
                        </label>
                        <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Enter amount"
                            min="0"
                            step="0.00000001"
                        />
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <div className="flex justify-between items-center">
                        <button
                            type="button"
                            onClick={() => setIsBuying(!isBuying)}
                            className="text-sm text-primary hover:text-primary-dark"
                        >
                            Switch to {isBuying ? 'Sell' : 'Buy'}
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center">
                                    <svg
                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Processing...
                                </span>
                            ) : (
                                `${isBuying ? 'Buy' : 'Sell'} ${token.symbol}`
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 
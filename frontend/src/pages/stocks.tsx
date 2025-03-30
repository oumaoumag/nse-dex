import React from 'react';
import { StockTokenList } from '../components/StockTokens/StockTokenList';

export default function StocksPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Stock Tokens</h1>
                <p className="mt-2 text-gray-600">
                    Trade tokenized stocks on the Hedera network
                </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <StockTokenList />
            </div>
        </div>
    );
} 
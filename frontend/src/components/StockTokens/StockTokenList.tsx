import React, { useState } from 'react';
import { useToken } from '../../contexts/TokenContext';
import { StockTokenInfo } from '../../services/tokenService';
import { formatHbar } from '../../utils/formatters';
import { StockTokenTrade } from './StockTokenTrade';

export function StockTokenList() {
    const { stockTokens, isLoading, error, getTokenBalance } = useToken();
    const [balances, setBalances] = React.useState<Record<string, number>>({});
    const [selectedToken, setSelectedToken] = useState<StockTokenInfo | null>(null);

    React.useEffect(() => {
        const fetchBalances = async () => {
            const newBalances: Record<string, number> = {};
            for (const token of stockTokens) {
                try {
                    const balance = await getTokenBalance(token.tokenId);
                    newBalances[token.tokenId] = balance;
                } catch (err) {
                    console.error(`Failed to fetch balance for ${token.symbol}:`, err);
                }
            }
            setBalances(newBalances);
        };

        if (stockTokens.length > 0) {
            fetchBalances();
        }
    }, [stockTokens, getTokenBalance]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    if (stockTokens.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">No stock tokens available</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                {stockTokens.map((token) => (
                    <StockTokenCard
                        key={token.tokenId}
                        token={token}
                        balance={balances[token.tokenId] || 0}
                        onTrade={() => setSelectedToken(token)}
                    />
                ))}
            </div>

            {selectedToken && (
                <StockTokenTrade
                    token={selectedToken}
                    onClose={() => setSelectedToken(null)}
                />
            )}
        </>
    );
}

interface StockTokenCardProps {
    token: StockTokenInfo;
    balance: number;
    onTrade: () => void;
}

function StockTokenCard({ token, balance, onTrade }: StockTokenCardProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{token.name}</h3>
                    <p className="text-sm text-gray-500">{token.symbol}</p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                        {formatHbar(token.priceHbar)} ℏ
                    </p>
                    <p className="text-sm text-gray-500">
                        Last updated: {new Date(token.lastUpdated).toLocaleString()}
                    </p>
                </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                    <p className="text-sm text-gray-500">Your Balance</p>
                    <p className="text-lg font-semibold text-gray-900">{balance}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Total Supply</p>
                    <p className="text-lg font-semibold text-gray-900">{token.totalSupply}</p>
                </div>
            </div>
            <div className="mt-4 flex space-x-4">
                <button
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                    onClick={onTrade}
                >
                    Trade
                </button>
            </div>
        </div>
    );
} 
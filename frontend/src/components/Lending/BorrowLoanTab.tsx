'use client';

import React, { useState } from 'react';
import { useStock } from '@/contexts/StockContext';
import { useWallet } from '@/contexts/WalletContext';
import { SUPPORTED_TOKENS } from '@/services/stablecoinService';

// Mock data for lending offers
const MOCK_LENDING_OFFERS = [
    {
        id: 1,
        lender: '0x1234...5678',
        stablecoin: 'USDC',
        amount: 1000,
        interestRate: 5.5,
        duration: 30,
        collateralToken: 'SAFCOM',
        collateralAmount: 250,
        createdAt: new Date().getTime() - 86400000 * 2, // 2 days ago
    },
    {
        id: 2,
        lender: '0x8765...4321',
        stablecoin: 'USDT',
        amount: 500,
        interestRate: 4.8,
        duration: 14,
        collateralToken: 'SAFCOM',
        collateralAmount: 120,
        createdAt: new Date().getTime() - 86400000 * 1, // 1 day ago
    },
    {
        id: 3,
        lender: '0xabcd...efgh',
        stablecoin: 'USDC',
        amount: 2500,
        interestRate: 6.2,
        duration: 60,
        collateralToken: 'EQTY',
        collateralAmount: 800,
        createdAt: new Date().getTime() - 86400000 * 3, // 3 days ago
    },
    {
        id: 4,
        lender: '0x7890...1234',
        stablecoin: 'USDT',
        amount: 750,
        interestRate: 5.0,
        duration: 14,
        collateralToken: 'SAFCOM',
        collateralAmount: 180,
        createdAt: new Date().getTime() - 86400000 * 1, // 1 day ago
    },
];

// Duration options in days
const DURATION_OPTIONS = [7, 14, 30, 60, 90];

const BorrowLoanTab: React.FC = () => {
    const { stocks, userBalances } = useStock();
    const { accountId } = useWallet();

    const [viewMode, setViewMode] = useState<'browse' | 'create'>('browse');
    const [filterToken, setFilterToken] = useState<string>('');
    const [sortBy, setSortBy] = useState<'newest' | 'interest'>('newest');

    // Create loan request form state
    const [loanAmount, setLoanAmount] = useState<string>('');
    const [selectedStablecoin, setSelectedStablecoin] = useState<string>('USDC');
    const [collateralToken, setCollateralToken] = useState<string>('');
    const [collateralAmount, setCollateralAmount] = useState<string>('');
    const [interestRate, setInterestRate] = useState<string>('5.0');
    const [duration, setDuration] = useState<number>(30);

    // Filter and sort lending offers
    const filteredOffers = MOCK_LENDING_OFFERS
        .filter(offer => !filterToken || offer.collateralToken === filterToken)
        .sort((a, b) => {
            if (sortBy === 'newest') {
                return b.createdAt - a.createdAt;
            } else {
                return a.interestRate - b.interestRate;
            }
        });

    // Handle loan request submission
    const handleSubmitLoanRequest = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real implementation, this would call the smart contract
        alert(`Loan request submitted:
      Amount: ${loanAmount} ${selectedStablecoin}
      Collateral: ${collateralAmount} ${collateralToken}
      Interest rate: ${interestRate}%
      Duration: ${duration} days`);

        // Reset form
        setLoanAmount('');
        setCollateralAmount('');
        setInterestRate('5.0');
        setDuration(30);
    };

    // Handle accepting a loan offer
    const handleAcceptOffer = (offerId: number) => {
        // In a real implementation, this would call the smart contract
        alert(`Accepting loan offer #${offerId}`);
    };

    // Calculate max collateral available
    const getMaxCollateral = (tokenSymbol: string) => {
        const stock = stocks.find(s => s.shortName === tokenSymbol);
        if (stock) {
            return userBalances[stock.id] || '0';
        }
        return '0';
    };

    return (
        <div>
            {/* Toggle between browse and create */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex space-x-4">
                    <button
                        onClick={() => setViewMode('browse')}
                        className={`px-4 py-2 rounded-md ${viewMode === 'browse'
                                ? 'bg-decode-green text-black font-medium'
                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                            }`}
                    >
                        Browse Loan Offers
                    </button>
                    <button
                        onClick={() => setViewMode('create')}
                        className={`px-4 py-2 rounded-md ${viewMode === 'create'
                                ? 'bg-decode-green text-black font-medium'
                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                            }`}
                    >
                        Create Loan Request
                    </button>
                </div>

                {viewMode === 'browse' && (
                    <div className="flex space-x-2">
                        <select
                            value={filterToken}
                            onChange={(e) => setFilterToken(e.target.value)}
                            className="px-3 py-2 rounded-md bg-white/10 text-white border border-white/20 text-sm"
                        >
                            <option value="">All Tokens</option>
                            {stocks.map((stock) => (
                                <option key={stock.id} value={stock.shortName}>
                                    {stock.shortName}
                                </option>
                            ))}
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'newest' | 'interest')}
                            className="px-3 py-2 rounded-md bg-white/10 text-white border border-white/20 text-sm"
                        >
                            <option value="newest">Newest First</option>
                            <option value="interest">Lowest Interest</option>
                        </select>
                    </div>
                )}
            </div>

            {viewMode === 'browse' ? (
                <div>
                    {/* Browse Loan Offers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredOffers.map((offer) => (
                            <div
                                key={offer.id}
                                className="bg-white/5 border border-white/10 rounded-lg p-4"
                            >
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-decode-green font-semibold">
                                        {offer.amount} {offer.stablecoin}
                                    </span>
                                    <span className="text-white/60 text-sm">
                                        {new Date(offer.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Interest Rate:</span>
                                        <span className="text-white">{offer.interestRate}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Duration:</span>
                                        <span className="text-white">{offer.duration} days</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Collateral Required:</span>
                                        <span className="text-white">{offer.collateralAmount} {offer.collateralToken}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Lender:</span>
                                        <span className="text-white">{offer.lender}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleAcceptOffer(offer.id)}
                                    className="w-full py-2 bg-decode-green hover:bg-decode-green/80 text-black font-medium rounded-md"
                                >
                                    Accept Offer
                                </button>
                            </div>
                        ))}

                        {filteredOffers.length === 0 && (
                            <div className="col-span-full text-center py-12">
                                <p className="text-gray-400">No loan offers match your filter criteria.</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div>
                    {/* Create Loan Request Form */}
                    <div className="bg-white/5 border border-white/10 rounded-lg p-6 max-w-2xl mx-auto">
                        <h3 className="text-xl font-bold text-white mb-4">Request a Loan</h3>

                        <form onSubmit={handleSubmitLoanRequest}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-white mb-2 text-sm">Loan Amount</label>
                                    <div className="flex">
                                        <input
                                            type="number"
                                            min="10"
                                            max="10000"
                                            step="10"
                                            value={loanAmount}
                                            onChange={(e) => setLoanAmount(e.target.value)}
                                            placeholder="Enter amount"
                                            className="flex-grow px-3 py-2 bg-white/10 border border-white/20 rounded-l-md text-white"
                                            required
                                        />
                                        <select
                                            value={selectedStablecoin}
                                            onChange={(e) => setSelectedStablecoin(e.target.value)}
                                            className="px-3 py-2 bg-white/10 border-l-0 border border-white/20 rounded-r-md text-white"
                                        >
                                            {SUPPORTED_TOKENS.map((token) => (
                                                <option key={token.symbol} value={token.symbol}>
                                                    {token.symbol}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <p className="text-gray-400 text-xs mt-1">Min: 10, Max: 10,000</p>
                                </div>

                                <div>
                                    <label className="block text-white mb-2 text-sm">Loan Duration</label>
                                    <select
                                        value={duration}
                                        onChange={(e) => setDuration(Number(e.target.value))}
                                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"
                                        required
                                    >
                                        {DURATION_OPTIONS.map((days) => (
                                            <option key={days} value={days}>
                                                {days} days
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-white mb-2 text-sm">Collateral Token</label>
                                    <select
                                        value={collateralToken}
                                        onChange={(e) => setCollateralToken(e.target.value)}
                                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"
                                        required
                                    >
                                        <option value="" disabled>Select token</option>
                                        {stocks.map((stock) => (
                                            <option key={stock.id} value={stock.shortName}>
                                                {stock.shortName} - Balance: {userBalances[stock.id] || '0'}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-white mb-2 text-sm">Collateral Amount</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={collateralAmount}
                                        onChange={(e) => setCollateralAmount(e.target.value)}
                                        placeholder="Enter amount"
                                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"
                                        required
                                    />
                                    {collateralToken && (
                                        <p className="text-gray-400 text-xs mt-1">
                                            Max available: {getMaxCollateral(collateralToken)} {collateralToken}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-white mb-2 text-sm">Maximum Interest Rate (%)</label>
                                    <input
                                        type="number"
                                        min="0.1"
                                        max="50"
                                        step="0.1"
                                        value={interestRate}
                                        onChange={(e) => setInterestRate(e.target.value)}
                                        placeholder="Enter interest rate"
                                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"
                                        required
                                    />
                                    <p className="text-gray-400 text-xs mt-1">Annual interest rate</p>
                                </div>

                                <div className="flex items-end">
                                    <div className="bg-white/10 p-3 rounded-md">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-white/60 text-sm">Total to repay:</span>
                                            <span className="text-white font-medium">
                                                {loanAmount && interestRate ? (
                                                    <>
                                                        {(
                                                            parseFloat(loanAmount) *
                                                            (1 + parseFloat(interestRate) / 100 * (duration / 365))
                                                        ).toFixed(2)} {selectedStablecoin}
                                                    </>
                                                ) : '0.00'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-white/60 text-sm">Platform fee:</span>
                                            <span className="text-white font-medium">
                                                {loanAmount ? (parseFloat(loanAmount) * 0.005).toFixed(2) : '0.00'} {selectedStablecoin}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-white/10 pt-6">
                                <button
                                    type="submit"
                                    className="w-full py-3 bg-decode-green hover:bg-decode-green/80 text-black font-medium rounded-md"
                                >
                                    Create Loan Request
                                </button>
                                <p className="text-center text-gray-400 text-sm mt-4">
                                    By submitting this request, you agree to lock your collateral in the smart contract.
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BorrowLoanTab; 
'use client';

import React, { useState } from 'react';
import { useStock } from '@/contexts/StockContext';
import { useWallet } from '@/contexts/WalletContext';
import { SUPPORTED_TOKENS } from '@/services/stablecoinService';

// Mock data for loan requests
const MOCK_LOAN_REQUESTS = [
    {
        id: 1,
        borrower: '0x1234...5678',
        stablecoin: 'USDC',
        amount: 800,
        interestRate: 6.0,
        duration: 30,
        collateralToken: 'SAFCOM',
        collateralAmount: 220,
        createdAt: new Date().getTime() - 86400000 * 1, // 1 day ago
    },
    {
        id: 2,
        borrower: '0x8765...4321',
        stablecoin: 'USDT',
        amount: 1200,
        interestRate: 5.5,
        duration: 60,
        collateralToken: 'EQTY',
        collateralAmount: 450,
        createdAt: new Date().getTime() - 86400000 * 2, // 2 days ago
    },
    {
        id: 3,
        borrower: '0xabcd...efgh',
        stablecoin: 'USDC',
        amount: 400,
        interestRate: 4.8,
        duration: 14,
        collateralToken: 'SAFCOM',
        collateralAmount: 100,
        createdAt: new Date().getTime() - 86400000 * 0.5, // 12 hours ago
    },
    {
        id: 4,
        borrower: '0x7890...1234',
        stablecoin: 'USDC',
        amount: 2000,
        interestRate: 7.0,
        duration: 90,
        collateralToken: 'EQTY',
        collateralAmount: 800,
        createdAt: new Date().getTime() - 86400000 * 3, // 3 days ago
    },
];

// Duration options in days
const DURATION_OPTIONS = [7, 14, 30, 60, 90];

const LendFundsTab: React.FC = () => {
    const { stocks, stablecoinBalances } = useStock();
    const { accountId } = useWallet();

    const [viewMode, setViewMode] = useState<'browse' | 'create'>('browse');
    const [filterStablecoin, setFilterStablecoin] = useState<string>('');
    const [sortBy, setSortBy] = useState<'newest' | 'interest'>('newest');

    // Create lending offer form state
    const [loanAmount, setLoanAmount] = useState<string>('');
    const [selectedStablecoin, setSelectedStablecoin] = useState<string>('USDC');
    const [collateralToken, setCollateralToken] = useState<string>('');
    const [minCollateralAmount, setMinCollateralAmount] = useState<string>('');
    const [interestRate, setInterestRate] = useState<string>('5.0');
    const [duration, setDuration] = useState<number>(30);

    // Filter and sort loan requests
    const filteredRequests = MOCK_LOAN_REQUESTS
        .filter(request => !filterStablecoin || request.stablecoin === filterStablecoin)
        .sort((a, b) => {
            if (sortBy === 'newest') {
                return b.createdAt - a.createdAt;
            } else {
                return b.interestRate - a.interestRate;
            }
        });

    // Handle lending offer submission
    const handleSubmitLendingOffer = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real implementation, this would call the smart contract
        alert(`Lending offer submitted:
      Amount: ${loanAmount} ${selectedStablecoin}
      Required Collateral: ${minCollateralAmount} ${collateralToken}
      Interest rate: ${interestRate}%
      Duration: ${duration} days`);

        // Reset form
        setLoanAmount('');
        setMinCollateralAmount('');
        setInterestRate('5.0');
        setDuration(30);
    };

    // Handle accepting a loan request
    const handleFundRequest = (requestId: number) => {
        // In a real implementation, this would call the smart contract
        alert(`Funding loan request #${requestId}`);
    };

    // Get stablecoin balance
    const getStablecoinBalance = (symbol: string) => {
        return stablecoinBalances[symbol] || '0';
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
                        Browse Loan Requests
                    </button>
                    <button
                        onClick={() => setViewMode('create')}
                        className={`px-4 py-2 rounded-md ${viewMode === 'create'
                                ? 'bg-decode-green text-black font-medium'
                                : 'bg-white/10 text-gray-300 hover:bg-white/20'
                            }`}
                    >
                        Create Lending Offer
                    </button>
                </div>

                {viewMode === 'browse' && (
                    <div className="flex space-x-2">
                        <select
                            value={filterStablecoin}
                            onChange={(e) => setFilterStablecoin(e.target.value)}
                            className="px-3 py-2 rounded-md bg-white/10 text-white border border-white/20 text-sm"
                        >
                            <option value="">All Stablecoins</option>
                            {SUPPORTED_TOKENS.map((token) => (
                                <option key={token.symbol} value={token.symbol}>
                                    {token.symbol}
                                </option>
                            ))}
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as 'newest' | 'interest')}
                            className="px-3 py-2 rounded-md bg-white/10 text-white border border-white/20 text-sm"
                        >
                            <option value="newest">Newest First</option>
                            <option value="interest">Highest Interest</option>
                        </select>
                    </div>
                )}
            </div>

            {viewMode === 'browse' ? (
                <div>
                    {/* Browse Loan Requests */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredRequests.map((request) => (
                            <div
                                key={request.id}
                                className="bg-white/5 border border-white/10 rounded-lg p-4"
                            >
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-decode-green font-semibold">
                                        {request.amount} {request.stablecoin}
                                    </span>
                                    <span className="text-white/60 text-sm">
                                        {new Date(request.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Interest Rate:</span>
                                        <span className="text-white font-medium">{request.interestRate}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Duration:</span>
                                        <span className="text-white">{request.duration} days</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Collateral Offered:</span>
                                        <span className="text-white">{request.collateralAmount} {request.collateralToken}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Borrower:</span>
                                        <span className="text-white">{request.borrower}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleFundRequest(request.id)}
                                    className="w-full py-2 bg-decode-green hover:bg-decode-green/80 text-black font-medium rounded-md"
                                >
                                    Fund This Request
                                </button>
                            </div>
                        ))}

                        {filteredRequests.length === 0 && (
                            <div className="col-span-full text-center py-12">
                                <p className="text-gray-400">No loan requests match your filter criteria.</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div>
                    {/* Create Lending Offer Form */}
                    <div className="bg-white/5 border border-white/10 rounded-lg p-6 max-w-2xl mx-auto">
                        <h3 className="text-xl font-bold text-white mb-4">Create a Lending Offer</h3>

                        <form onSubmit={handleSubmitLendingOffer}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-white mb-2 text-sm">Amount to Lend</label>
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
                                    <p className="text-gray-400 text-xs mt-1">
                                        Balance: {getStablecoinBalance(selectedStablecoin)} {selectedStablecoin}
                                    </p>
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
                                    <label className="block text-white mb-2 text-sm">Required Collateral Token</label>
                                    <select
                                        value={collateralToken}
                                        onChange={(e) => setCollateralToken(e.target.value)}
                                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"
                                        required
                                    >
                                        <option value="" disabled>Select token</option>
                                        {stocks.map((stock) => (
                                            <option key={stock.id} value={stock.shortName}>
                                                {stock.shortName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-white mb-2 text-sm">Minimum Collateral Amount</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={minCollateralAmount}
                                        onChange={(e) => setMinCollateralAmount(e.target.value)}
                                        placeholder="Enter minimum amount"
                                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"
                                        required
                                    />
                                    <p className="text-gray-400 text-xs mt-1">
                                        Minimum collateral required from borrowers
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-white mb-2 text-sm">Interest Rate (%)</label>
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
                                    <div className="bg-white/10 p-3 rounded-md w-full">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-white/60 text-sm">Total to receive:</span>
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
                                            <span className="text-white/60 text-sm">Profit:</span>
                                            <span className="text-green-400 font-medium">
                                                {loanAmount && interestRate ? (
                                                    <>
                                                        {(
                                                            parseFloat(loanAmount) *
                                                            (parseFloat(interestRate) / 100) *
                                                            (duration / 365)
                                                        ).toFixed(2)} {selectedStablecoin}
                                                    </>
                                                ) : '0.00'}
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
                                    Create Lending Offer
                                </button>
                                <p className="text-center text-gray-400 text-sm mt-4">
                                    Funds will be transferred to the borrower only when they deposit the required collateral.
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LendFundsTab; 
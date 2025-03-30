'use client';

import React, { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';

// Mock data for user's loans
const MOCK_MY_LOANS = [
    {
        id: 101,
        type: 'borrower',
        status: 'active',
        lender: '0x1234...5678',
        stablecoin: 'USDC',
        amount: 1000,
        interestRate: 5.5,
        duration: 30,
        remainingDays: 18,
        collateralToken: 'SAFCOM',
        collateralAmount: 250,
        startDate: new Date().getTime() - 86400000 * 12, // 12 days ago
        endDate: new Date().getTime() + 86400000 * 18, // 18 days from now
        repaidAmount: 300,
    },
    {
        id: 102,
        type: 'lender',
        status: 'active',
        borrower: '0x8765...4321',
        stablecoin: 'USDT',
        amount: 500,
        interestRate: 4.8,
        duration: 14,
        remainingDays: 5,
        collateralToken: 'SAFCOM',
        collateralAmount: 120,
        startDate: new Date().getTime() - 86400000 * 9, // 9 days ago
        endDate: new Date().getTime() + 86400000 * 5, // 5 days from now
        repaidAmount: 200,
    },
    {
        id: 103,
        type: 'borrower',
        status: 'pending',
        stablecoin: 'USDC',
        amount: 2500,
        interestRate: 6.2,
        duration: 60,
        collateralToken: 'EQTY',
        collateralAmount: 800,
        createdAt: new Date().getTime() - 86400000 * 1, // 1 day ago
        collateralLocked: true,
    },
    {
        id: 104,
        type: 'lender',
        status: 'pending',
        stablecoin: 'USDT',
        amount: 750,
        interestRate: 5.0,
        duration: 14,
        collateralToken: 'SAFCOM',
        collateralAmount: 180,
        createdAt: new Date().getTime() - 86400000 * 2, // 2 days ago
    },
    {
        id: 105,
        type: 'borrower',
        status: 'repaid',
        lender: '0xabcd...efgh',
        stablecoin: 'USDC',
        amount: 400,
        interestRate: 4.5,
        duration: 30,
        collateralToken: 'SAFCOM',
        collateralAmount: 100,
        startDate: new Date().getTime() - 86400000 * 35, // 35 days ago
        endDate: new Date().getTime() - 86400000 * 5, // 5 days ago
        repaidAmount: 400,
        interestPaid: 18,
    },
    {
        id: 106,
        type: 'lender',
        status: 'defaulted',
        borrower: '0x7890...1234',
        stablecoin: 'USDC',
        amount: 1200,
        interestRate: 7.0,
        duration: 90,
        collateralToken: 'EQTY',
        collateralAmount: 500,
        startDate: new Date().getTime() - 86400000 * 100, // 100 days ago
        endDate: new Date().getTime() - 86400000 * 10, // 10 days ago
        repaidAmount: 400,
        collateralSeized: true,
    },
];

const MyLoansTab: React.FC = () => {
    const { accountId } = useWallet();
    const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'repaid' | 'defaulted'>('all');
    const [roleFilter, setRoleFilter] = useState<'all' | 'borrower' | 'lender'>('all');

    // Filter loans based on status and role
    const filteredLoans = MOCK_MY_LOANS.filter(loan => {
        const statusMatch = filter === 'all' || loan.status === filter;
        const roleMatch = roleFilter === 'all' || loan.type === roleFilter;
        return statusMatch && roleMatch;
    });

    // Handle repay loan
    const handleRepayLoan = (loanId: number) => {
        // In a real implementation, this would call the smart contract
        alert(`Repaying loan #${loanId}`);
    };

    // Handle cancelling a pending loan
    const handleCancelLoan = (loanId: number) => {
        // In a real implementation, this would call the smart contract
        alert(`Cancelling loan #${loanId}`);
    };

    // Handle liquidating collateral
    const handleLiquidateCollateral = (loanId: number) => {
        // In a real implementation, this would call the smart contract
        alert(`Liquidating collateral for loan #${loanId}`);
    };

    // Get status badge styling
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-500/20 text-green-400';
            case 'pending':
                return 'bg-yellow-500/20 text-yellow-300';
            case 'repaid':
                return 'bg-blue-500/20 text-blue-400';
            case 'defaulted':
                return 'bg-red-500/20 text-red-400';
            default:
                return 'bg-gray-500/20 text-gray-400';
        }
    };

    // Calculate total due for a loan
    const calculateTotalDue = (loan: any) => {
        if (loan.status === 'repaid') return 0;

        const principalRemaining = loan.amount - (loan.repaidAmount || 0);
        const totalInterest = (loan.amount * loan.interestRate / 100) * (loan.duration / 365);
        const platformFee = loan.amount * 0.005; // 0.5% platform fee

        return principalRemaining + totalInterest + platformFee;
    };

    return (
        <div>
            {/* Filters */}
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div className="flex space-x-2">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                        className="px-3 py-2 rounded-md bg-white/10 text-white border border-white/20 text-sm"
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active Loans</option>
                        <option value="pending">Pending Offers</option>
                        <option value="repaid">Repaid Loans</option>
                        <option value="defaulted">Defaulted Loans</option>
                    </select>

                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value as any)}
                        className="px-3 py-2 rounded-md bg-white/10 text-white border border-white/20 text-sm"
                    >
                        <option value="all">All Roles</option>
                        <option value="borrower">As Borrower</option>
                        <option value="lender">As Lender</option>
                    </select>
                </div>

                <div className="text-sm text-gray-400">
                    Showing {filteredLoans.length} of {MOCK_MY_LOANS.length} loans
                </div>
            </div>

            {/* Loans List */}
            <div className="space-y-4">
                {filteredLoans.length === 0 ? (
                    <div className="text-center py-12 bg-white/5 rounded-lg">
                        <p className="text-gray-400">No loans match your filter criteria.</p>
                    </div>
                ) : (
                    filteredLoans.map((loan) => (
                        <div
                            key={loan.id}
                            className="bg-white/5 border border-white/10 rounded-lg p-4"
                        >
                            <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(loan.status)}`}>
                                        {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                                    </span>
                                    <span className="text-white/60 text-sm">
                                        As {loan.type.charAt(0).toUpperCase() + loan.type.slice(1)}
                                    </span>
                                </div>

                                <div className="text-right">
                                    <span className="text-decode-green font-semibold">
                                        {loan.amount} {loan.stablecoin}
                                    </span>
                                    {loan.status === 'active' && (
                                        <div className="text-xs text-white/60">
                                            {loan.remainingDays} days remaining
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Interest Rate:</span>
                                        <span className="text-white">{loan.interestRate}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Duration:</span>
                                        <span className="text-white">{loan.duration} days</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-white/60">Collateral:</span>
                                        <span className="text-white">{loan.collateralAmount} {loan.collateralToken}</span>
                                    </div>
                                    {loan.type === 'borrower' && loan.lender && (
                                        <div className="flex justify-between">
                                            <span className="text-white/60">Lender:</span>
                                            <span className="text-white">{loan.lender}</span>
                                        </div>
                                    )}
                                    {loan.type === 'lender' && loan.borrower && (
                                        <div className="flex justify-between">
                                            <span className="text-white/60">Borrower:</span>
                                            <span className="text-white">{loan.borrower}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    {loan.status === 'active' && (
                                        <>
                                            <div className="flex justify-between">
                                                <span className="text-white/60">Start Date:</span>
                                                <span className="text-white">{new Date(loan.startDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-white/60">End Date:</span>
                                                <span className="text-white">{new Date(loan.endDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-white/60">Repaid So Far:</span>
                                                <span className="text-white">{loan.repaidAmount} {loan.stablecoin}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-white/60">Remaining Due:</span>
                                                <span className="text-white">{calculateTotalDue(loan).toFixed(2)} {loan.stablecoin}</span>
                                            </div>
                                        </>
                                    )}

                                    {loan.status === 'pending' && (
                                        <>
                                            <div className="flex justify-between">
                                                <span className="text-white/60">Created:</span>
                                                <span className="text-white">{new Date(loan.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            {loan.collateralLocked && (
                                                <div className="flex justify-between">
                                                    <span className="text-white/60">Collateral Status:</span>
                                                    <span className="text-green-400">Locked in Contract</span>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {loan.status === 'repaid' && (
                                        <>
                                            <div className="flex justify-between">
                                                <span className="text-white/60">Completed On:</span>
                                                <span className="text-white">{new Date(loan.endDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-white/60">Interest Paid:</span>
                                                <span className="text-white">{loan.interestPaid} {loan.stablecoin}</span>
                                            </div>
                                        </>
                                    )}

                                    {loan.status === 'defaulted' && (
                                        <>
                                            <div className="flex justify-between">
                                                <span className="text-white/60">Defaulted On:</span>
                                                <span className="text-white">{new Date(loan.endDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-white/60">Collateral Status:</span>
                                                <span className="text-red-400">{loan.collateralSeized ? 'Seized' : 'Pending Liquidation'}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Action buttons based on loan status and role */}
                            <div className="border-t border-white/10 pt-4 flex flex-wrap gap-2">
                                {loan.status === 'active' && loan.type === 'borrower' && (
                                    <button
                                        onClick={() => handleRepayLoan(loan.id)}
                                        className="px-4 py-2 bg-decode-green hover:bg-decode-green/80 text-black font-medium rounded-md text-sm"
                                    >
                                        Repay Loan
                                    </button>
                                )}

                                {loan.status === 'active' && loan.type === 'lender' && loan.remainingDays < 0 && (
                                    <button
                                        onClick={() => handleLiquidateCollateral(loan.id)}
                                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md text-sm"
                                    >
                                        Liquidate Collateral
                                    </button>
                                )}

                                {loan.status === 'pending' && (
                                    <button
                                        onClick={() => handleCancelLoan(loan.id)}
                                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-md text-sm"
                                    >
                                        Cancel {loan.type === 'borrower' ? 'Request' : 'Offer'}
                                    </button>
                                )}

                                {loan.status === 'defaulted' && loan.type === 'lender' && !loan.collateralSeized && (
                                    <button
                                        onClick={() => handleLiquidateCollateral(loan.id)}
                                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md text-sm"
                                    >
                                        Liquidate Collateral
                                    </button>
                                )}

                                <a
                                    href={`/loan/${loan.id}`}
                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-md text-sm"
                                >
                                    View Details
                                </a>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyLoansTab; 
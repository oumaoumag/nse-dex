'use client';

import React, { useState, useEffect } from 'react';
import { useLending } from '@/contexts/LendingContext';
import { useWallet } from '@/contexts/WalletContext';
import { useStock } from '@/contexts/StockContext';
import { toast } from 'react-hot-toast';

export default function Lending() {
    const { deposit, borrow, repay, getLendingStats, isLoading, error } = useLending();
    const { isConnected } = useWallet();
    const { stocks, exchangeRate } = useStock();
    const [poolStats, setPoolStats] = useState({
        totalDeposits: 0,
        totalBorrows: 0,
        interestRate: 0,
    });
    const [depositAmount, setDepositAmount] = useState('');
    const [borrowAmount, setBorrowAmount] = useState('');
    const [collateralAmount, setCollateralAmount] = useState('');
    const [repayAmount, setRepayAmount] = useState('');

    useEffect(() => {
        if (isConnected) {
            loadData();
        }
    }, [isConnected]);

    const loadData = async () => {
        try {
            const stats = await getLendingStats();
            setPoolStats(stats);
        } catch (error) {
            console.error('Error loading lending data:', error);
            toast.error('Failed to load lending data');
        }
    };

    const handleDeposit = async () => {
        if (!depositAmount || isNaN(Number(depositAmount))) {
            toast.error('Please enter a valid amount');
            return;
        }
        await deposit(Number(depositAmount));
        loadData();
    };

    const handleBorrow = async () => {
        if (!borrowAmount || isNaN(Number(borrowAmount))) {
            toast.error('Please enter valid amounts');
            return;
        }
        await borrow(Number(borrowAmount));
        loadData();
    };

    const handleRepay = async () => {
        if (!repayAmount || isNaN(Number(repayAmount))) {
            toast.error('Please enter a valid amount');
            return;
        }
        await repay(Number(repayAmount));
        loadData();
    };

    if (!isConnected) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
                <p className="text-gray-600">Please connect your wallet to access lending features.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">Lending Protocol</h1>

            {/* Pool Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Total Deposits</h3>
                    <p className="text-2xl font-bold">${poolStats.totalDeposits.toLocaleString()}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Total Borrows</h3>
                    <p className="text-2xl font-bold">${poolStats.totalBorrows.toLocaleString()}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Interest Rate</h3>
                    <p className="text-2xl font-bold">{poolStats.interestRate}%</p>
                </div>
            </div>

            {/* Lending Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Deposit */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-4">Deposit</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Amount (USDC)
                            </label>
                            <input
                                type="number"
                                value={depositAmount}
                                onChange={(e) => setDepositAmount(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md"
                                placeholder="0.00"
                            />
                        </div>
                        <button
                            onClick={handleDeposit}
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isLoading ? 'Processing...' : 'Deposit'}
                        </button>
                    </div>
                </div>

                {/* Borrow */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-4">Borrow</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Amount (USDC)
                            </label>
                            <input
                                type="number"
                                value={borrowAmount}
                                onChange={(e) => setBorrowAmount(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md"
                                placeholder="0.00"
                            />
                        </div>
                        <button
                            onClick={handleBorrow}
                            disabled={isLoading}
                            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                            {isLoading ? 'Processing...' : 'Borrow'}
                        </button>
                    </div>
                </div>

                {/* Repay */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-4">Repay</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Amount (USDC)
                            </label>
                            <input
                                type="number"
                                value={repayAmount}
                                onChange={(e) => setRepayAmount(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md"
                                placeholder="0.00"
                            />
                        </div>
                        <button
                            onClick={handleRepay}
                            disabled={isLoading}
                            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
                        >
                            {isLoading ? 'Processing...' : 'Repay'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 
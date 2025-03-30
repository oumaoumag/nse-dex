'use client';

import React from 'react';
import { useWallet } from '@/contexts/WalletContext';
import GuardianManager from '@/components/GuardianManager';
import GaslessTransactions from '@/components/GaslessTransactions';
import BatchedTransactions from '@/components/BatchedTransactions';

export default function SecurityPage() {
    const { isConnected, smartWalletId } = useWallet();

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 decode-gradient bg-clip-text text-transparent">Security & Recovery</h1>

            {!isConnected ? (
                <div className="bg-decode-card p-6 rounded-xl mb-6">
                    <h2 className="text-xl font-semibold mb-4 text-decode-white">Connect Your Wallet</h2>
                    <p className="text-gray-400">
                        Connect your wallet to manage security features and social recovery for your account.
                    </p>
                </div>
            ) : !smartWalletId ? (
                <div className="bg-decode-card p-6 rounded-xl mb-6">
                    <h2 className="text-xl font-semibold mb-4 text-decode-white">Create a Smart Wallet</h2>
                    <p className="text-gray-400">
                        You need to create a smart wallet first to access account abstraction features.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-decode-card p-6 rounded-xl">
                        <h2 className="text-xl font-semibold mb-4 text-decode-white">Account Abstraction Features</h2>
                        <p className="text-gray-400 mb-6">
                            Your smart wallet provides enhanced security and usability features through account abstraction.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-decode-black p-4 rounded-lg">
                                <h3 className="text-lg font-medium text-decode-green mb-2">Social Recovery</h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    Assign trusted guardians to help recover your wallet if access is lost.
                                </p>
                            </div>

                            <div className="bg-decode-black p-4 rounded-lg">
                                <h3 className="text-lg font-medium text-decode-green mb-2">Gasless Transactions</h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    Execute transactions without paying gas fees. Our application covers transaction costs.
                                </p>
                            </div>

                            <div className="bg-decode-black p-4 rounded-lg">
                                <h3 className="text-lg font-medium text-decode-green mb-2">Batched Transactions</h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    Combine multiple operations into a single transaction for efficiency and cost savings.
                                </p>
                            </div>

                            <div className="bg-decode-black p-4 rounded-lg">
                                <h3 className="text-lg font-medium text-decode-green mb-2">Enhanced Security</h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    Smart contract protection with programmable security rules and guardian verification.
                                </p>
                            </div>
                        </div>
                    </div>

                    <GuardianManager />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <GaslessTransactions />
                        <BatchedTransactions />
                    </div>
                </div>
            )}
        </div>
    );
} 
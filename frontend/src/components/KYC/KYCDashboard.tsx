'use client';

import React from 'react';
import { useKYC, KYCLevel } from '@/contexts/KYCContext';
import { useWallet } from '@/contexts/WalletContext';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const KYCDashboard: React.FC = () => {
    const { kycLevel, formData } = useKYC();
    const { accountId, balance, smartWalletId } = useWallet();
    const { data: session } = useSession();

    const VERIFICATION_LEVELS = {
        [KYCLevel.BASIC]: {
            title: 'Basic',
            limits: 'Trading up to 500 HBAR per day',
            color: 'bg-blue-500',
            completed: true
        },
        [KYCLevel.INTERMEDIATE]: {
            title: 'Intermediate',
            limits: 'Trading up to 5,000 HBAR per day',
            color: 'bg-green-500',
            completed: kycLevel === KYCLevel.INTERMEDIATE || kycLevel === KYCLevel.ADVANCED
        },
        [KYCLevel.ADVANCED]: {
            title: 'Advanced',
            limits: 'Unlimited trading',
            color: 'bg-purple-500',
            completed: kycLevel === KYCLevel.ADVANCED
        }
    };

    return (
        <div className="space-y-8">
            {/* Verification Status Card */}
            <div className="decode-card border border-decode-green/30 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                    <svg className="w-6 h-6 text-decode-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                    <h2 className="text-xl font-bold text-decode-white">Verification Status</h2>
                </div>
                <div className="flex flex-col space-y-4">
                    {Object.entries(VERIFICATION_LEVELS).map(([level, info]) => (
                        <div
                            key={level}
                            className="flex items-center justify-between p-3 bg-decode-black/20 rounded-md border border-decode-green/10"
                        >
                            <div className="flex items-center">
                                <div className={`w-3 h-3 rounded-full ${info.completed ? info.color : 'bg-gray-500'} mr-3`}></div>
                                <div>
                                    <p className="text-sm font-medium text-decode-white">{info.title}</p>
                                    <p className="text-xs text-gray-400">{info.limits}</p>
                                </div>
                            </div>
                            {info.completed ? (
                                <svg className="w-5 h-5 text-decode-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            ) : (
                                <button className="text-xs text-decode-green hover:underline">
                                    Upgrade
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* User Info Card */}
            <div className="decode-card border border-decode-green/30 p-6 rounded-lg">
                <div className="flex items-center mb-6">
                    <svg className="w-6 h-6 text-decode-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    <h2 className="text-xl font-bold text-decode-white">Your Account</h2>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-400 mb-1">Full Name</p>
                            <p className="text-decode-white font-medium">{formData.fullName || session?.user?.name || 'Not provided'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 mb-1">Email</p>
                            <p className="text-decode-white font-medium">{formData.email || session?.user?.email || 'Not provided'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-400 mb-1">Hedera Account ID</p>
                            <p className="text-decode-white font-medium">{accountId || 'Not connected'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 mb-1">Smart Wallet ID</p>
                            <p className="text-decode-white font-medium">{smartWalletId || 'Not created'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-400 mb-1">Account Balance</p>
                            <p className="text-decode-white font-medium">{balance ? `${balance} HBAR` : 'Not available'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 mb-1">Verification Level</p>
                            <p className="text-decode-white font-medium">{VERIFICATION_LEVELS[kycLevel].title}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/marketplace" className="decode-card border border-decode-green/30 p-6 rounded-lg text-center hover:border-decode-green/60 transition-all">
                    <svg className="w-8 h-8 text-decode-green mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                    </svg>
                    <h3 className="text-lg font-medium text-decode-white mb-1">Marketplace</h3>
                    <p className="text-xs text-gray-400">Browse and buy tokenized stocks</p>
                </Link>

                <Link href="/trading" className="decode-card border border-decode-green/30 p-6 rounded-lg text-center hover:border-decode-green/60 transition-all">
                    <svg className="w-8 h-8 text-decode-green mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
                    </svg>
                    <h3 className="text-lg font-medium text-decode-white mb-1">P2P Trading</h3>
                    <p className="text-xs text-gray-400">Trade directly with other users</p>
                </Link>

                <Link href="/wallet" className="decode-card border border-decode-green/30 p-6 rounded-lg text-center hover:border-decode-green/60 transition-all">
                    <svg className="w-8 h-8 text-decode-green mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                    </svg>
                    <h3 className="text-lg font-medium text-decode-white mb-1">My Portfolio</h3>
                    <p className="text-xs text-gray-400">Manage your assets and wallet</p>
                </Link>
            </div>
        </div>
    );
};

export default KYCDashboard; 
'use client';

import React, { useEffect } from 'react';
import { useKYC, KYCStatus } from '@/contexts/KYCContext';
import { useWallet } from '@/contexts/WalletContext';
import KYCForm from './KYCForm';
import KYCStatusComponent from './KYCStatus';
import KYCDashboard from './KYCDashboard';
import { useSession } from 'next-auth/react';

/**
 * Main KYC component that conditionally renders appropriate verification UI
 * based on user's current KYC status
 */
const KYC: React.FC = () => {
    const { isConnected, accountId } = useWallet();
    const { kycStatus, fetchKYCStatus } = useKYC();
    const { data: session } = useSession();

    // Fetch KYC status when component mounts
    useEffect(() => {
        if (isConnected && accountId) {
            fetchKYCStatus();
        }
    }, [isConnected, accountId, fetchKYCStatus]);

    // Display appropriate component based on KYC status
    const renderContent = () => {
        if (!isConnected) {
            return (
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-4">Welcome to Tajiri</h2>
                    <p className="text-gray-400 mb-6">Your wallet is being connected automatically using your Google account.</p>
                    <div className="animate-pulse flex justify-center">
                        <div className="h-4 w-32 bg-decode-green/30 rounded"></div>
                    </div>
                </div>
            );
        }

        switch (kycStatus) {
            case KYCStatus.NONE:
                return <KYCForm />;
            case KYCStatus.PENDING:
                return <KYCStatusComponent status={kycStatus} />;
            case KYCStatus.APPROVED:
                return <KYCDashboard />;
            case KYCStatus.REJECTED:
                return <KYCStatusComponent status={kycStatus} />;
            default:
                return <KYCForm />;
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-decode-white mb-2">Identity Verification</h1>
                <p className="text-gray-400">
                    Complete your KYC verification to start trading tokenized stocks on Tajiri.
                    {session?.user?.name && (
                        <span> Welcome, {session.user.name}!</span>
                    )}
                </p>
            </div>

            {renderContent()}
        </div>
    );
};

export default KYC; 
'use client';

import React from 'react';
import { useWallet } from '@/contexts/WalletContext';

type WalletStatusIndicatorProps = {
    showFull?: boolean;
    className?: string;
};

export const WalletStatusIndicator: React.FC<WalletStatusIndicatorProps> = ({
    showFull = false,
    className = ''
}) => {
    const { isConnected, smartWalletId, error, balance, accountId } = useWallet();
    const isDemoMode = typeof window !== 'undefined' && localStorage.getItem('tajiri-demo-mode') === 'true';

    const getStatusColor = () => {
        if (error) return 'bg-red-500';
        if (isDemoMode) return 'bg-amber-500';
        if (isConnected && smartWalletId) return 'bg-green-500';
        if (isConnected) return 'bg-blue-500';
        return 'bg-gray-500';
    };

    const getStatusText = () => {
        if (error) return 'Error';
        if (isDemoMode) return 'Demo Mode';
        if (isConnected && smartWalletId) return 'Connected';
        if (isConnected) return 'Initializing';
        return 'Not Connected';
    };

    const getTooltipText = () => {
        if (error) return error;
        if (isDemoMode) return 'Running in demo mode with simulated wallet functionality';
        if (isConnected && smartWalletId) return `Connected with wallet: ${smartWalletId.substring(0, 10)}...`;
        if (isConnected) return 'Wallet is initializing...';
        return 'Please connect your wallet to access full functionality';
    };

    // Simple indicator only
    if (!showFull) {
        return (
            <div className={`relative flex items-center ${className}`} title={getTooltipText()}>
                <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
                {isDemoMode && (
                    <span className="ml-2 text-xs text-amber-500 font-medium">DEMO</span>
                )}
            </div>
        );
    }

    // Full status display
    return (
        <div className={`rounded-md border ${error ? 'border-red-300 bg-red-50' : isDemoMode ? 'border-amber-300 bg-amber-50' : 'border-green-300 bg-green-50'} p-3 ${className}`}>
            <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${getStatusColor()} mr-2`}></div>
                <div>
                    <h3 className="text-sm font-medium">
                        {getStatusText()}
                        {isDemoMode && <span className="ml-2 text-amber-600">(Demo Mode)</span>}
                    </h3>
                    {accountId && (
                        <p className="text-xs text-gray-600 mt-0.5">
                            {accountId.substring(0, 15)}...
                        </p>
                    )}
                    {smartWalletId && (
                        <p className="text-xs text-gray-600 mt-0.5">
                            Wallet: {smartWalletId.substring(0, 10)}...
                        </p>
                    )}
                    {balance && (
                        <p className="text-xs font-medium mt-1">
                            Balance: {parseFloat(balance).toFixed(2)} ℏ
                        </p>
                    )}
                    {error && (
                        <p className="text-xs text-red-600 mt-1">{error}</p>
                    )}
                    {isDemoMode && (
                        <p className="text-xs text-amber-600 mt-1">
                            Using simulated wallet for demonstration
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WalletStatusIndicator; 
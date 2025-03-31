'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useWallet } from '@/contexts/WalletContext';
import * as walletService from '@/services/walletService';

/**
 * SmartWalletManager component responsible for automatically creating and managing
 * smart wallets for authenticated users.
 */
export const SmartWalletManager: React.FC = () => {
    const { data: session, status } = useSession();
    const {
        smartWalletId,
        setSmartWalletId,
        isConnected,
        setError
    } = useWallet();
    const [isLoading, setIsLoading] = useState(false);
    const [hasChecked, setHasChecked] = useState(false);

    useEffect(() => {
        // Only proceed for authenticated users
        if (status !== 'authenticated' || !session?.user?.id) {
            return;
        }

        // If we already have a smart wallet ID or we've already checked, no need to proceed
        if (smartWalletId || hasChecked) {
            return;
        }

        const setupSmartWallet = async () => {
            setIsLoading(true);
            try {
                // Check if the user already has a smart wallet
                const existingWalletId = localStorage.getItem('tajiri-smart-wallet-id');

                if (existingWalletId) {
                    console.log("Found existing smart wallet ID in local storage:", existingWalletId);
                    setSmartWalletId(existingWalletId);
                    setHasChecked(true);
                    return;
                }

                console.log("Looking for existing smart wallet for user:", session.user.id);
                const foundWalletId = await walletService.findSmartWalletForOwner(session.user.id);

                if (foundWalletId) {
                    // If found, store it and update the context
                    console.log("Found existing smart wallet:", foundWalletId);
                    localStorage.setItem('tajiri-smart-wallet-id', foundWalletId);
                    setSmartWalletId(foundWalletId);
                } else {
                    // If not found, create a new smart wallet
                    console.log("Creating new smart wallet for user:", session.user.id);
                    const newWalletId = await walletService.createSmartWallet(session.user.id);

                    console.log("Created new smart wallet:", newWalletId);
                    localStorage.setItem('tajiri-smart-wallet-id', newWalletId);
                    setSmartWalletId(newWalletId);
                }
            } catch (err: any) {
                console.error("Error setting up smart wallet:", err);
                setError(`Failed to set up smart wallet: ${err.message}`);
            } finally {
                setIsLoading(false);
                setHasChecked(true);
            }
        };

        // Only run if we're connected to wallet context
        if (isConnected) {
            setupSmartWallet();
        }
    }, [session, status, smartWalletId, setSmartWalletId, isConnected, hasChecked, setError]);

    // This component doesn't render anything, it just manages the smart wallet
    return null;
};

export default SmartWalletManager; 
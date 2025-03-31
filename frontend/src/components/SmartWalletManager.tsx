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
    const [attempts, setAttempts] = useState(0);

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
                    // Verify that the smart wallet exists and is valid before using it
                    try {
                        const isValid = await walletService.findSmartWalletForOwner(session.user.id);
                        if (isValid && isValid === existingWalletId) {
                            console.log("Verified existing smart wallet is valid:", existingWalletId);
                            setSmartWalletId(existingWalletId);
                            setHasChecked(true);
                            return;
                        } else {
                            console.warn("Stored wallet ID doesn't match or is invalid, will create new one");
                            localStorage.removeItem('tajiri-smart-wallet-id');
                        }
                    } catch (verifyErr) {
                        console.error("Error verifying existing wallet:", verifyErr);
                        // Continue to try creating a new one
                    }
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
                    setAttempts(prev => prev + 1);

                    // Add exponential backoff for retries
                    if (attempts > 0) {
                        const backoffTime = Math.min(2000 * Math.pow(2, attempts - 1), 10000);
                        console.log(`Attempt #${attempts + 1} for wallet creation with backoff of ${backoffTime}ms`);
                        await new Promise(resolve => setTimeout(resolve, backoffTime));
                    }

                    const newWalletId = await walletService.createSmartWallet(session.user.id);

                    console.log("Created new smart wallet:", newWalletId);
                    localStorage.setItem('tajiri-smart-wallet-id', newWalletId);
                    setSmartWalletId(newWalletId);
                }
            } catch (err: any) {
                console.error("Error setting up smart wallet:", err);

                // If we've tried multiple times and still failing, show a more user-friendly error
                if (attempts >= 2) {
                    setError(
                        `Wallet creation is taking longer than expected. The Hedera network might be congested. ` +
                        `Please visit /debug for more information or try again later.`
                    );
                    setHasChecked(true); // Stop retrying
                } else {
                    setError(`Setting up your wallet... This may take a minute.`);

                    // Schedule a retry with a delay
                    setTimeout(() => {
                        setHasChecked(false); // Reset to trigger another attempt
                    }, 5000); // 5 second delay
                }
            } finally {
                setIsLoading(false);
                setHasChecked(true);
            }
        };

        // Only run if we're connected to wallet context
        if (isConnected) {
            setupSmartWallet();
        }
    }, [session, status, smartWalletId, setSmartWalletId, isConnected, hasChecked, setError, attempts]);

    // This component doesn't render anything, it just manages the smart wallet
    return null;
};

export default SmartWalletManager; 
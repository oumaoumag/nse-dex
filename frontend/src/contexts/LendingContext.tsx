'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from './WalletContext';
import { useStock } from './StockContext';
import { ContractId, Hbar } from '@hashgraph/sdk';
import { toast } from 'react-hot-toast';

interface LendingContextType {
    deposit: (amount: number) => Promise<void>;
    borrow: (amount: number) => Promise<void>;
    repay: (amount: number) => Promise<void>;
    getLendingStats: () => Promise<{
        totalDeposits: number;
        totalBorrows: number;
        interestRate: number;
    }>;
    isLoading: boolean;
    error: string | null;
}

const LendingContext = createContext<LendingContextType | undefined>(undefined);

export function LendingProvider({ children }: { children: React.ReactNode }) {
    const { client, accountId } = useWallet();
    const { stocks } = useStock();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Simple mapping of stock symbols to contract IDs
    const getStockContractId = (symbol: string): string => {
        const stockContractIds: Record<string, string> = {
            'USDC': process.env.NEXT_PUBLIC_USDC_CONTRACT_ID || '',
            'SCOM': process.env.NEXT_PUBLIC_SAFARICOM_CONTRACT_ID || '',
            'LENDING_POOL': process.env.NEXT_PUBLIC_LENDING_POOL_CONTRACT_ID || '',
        };

        return stockContractIds[symbol] || '';
    };

    const deposit = async (amount: number) => {
        if (!client || !accountId) {
            toast.error('Please connect your wallet first');
            return;
        }

        setIsLoading(true);
        try {
            const stablecoinContractId = getStockContractId('USDC');
            if (!stablecoinContractId) {
                throw new Error('USDC contract ID not configured');
            }
            // Implement deposit logic using Hedera ContractExecuteTransaction
            toast.success('Successfully deposited stablecoins');
        } catch (err) {
            console.error('Error depositing stablecoins:', err);
            toast.error('Failed to deposit stablecoins');
        } finally {
            setIsLoading(false);
        }
    };

    const borrow = async (amount: number) => {
        if (!client || !accountId) {
            toast.error('Please connect your wallet first');
            return;
        }

        setIsLoading(true);
        try {
            const stockContractId = getStockContractId('SCOM');
            const stablecoinContractId = getStockContractId('USDC');
            if (!stockContractId || !stablecoinContractId) {
                throw new Error('Contract IDs not properly configured');
            }
            // Implement borrow logic using Hedera ContractExecuteTransaction
            toast.success('Successfully borrowed stablecoins');
        } catch (err) {
            console.error('Error borrowing stablecoins:', err);
            toast.error('Failed to borrow stablecoins');
        } finally {
            setIsLoading(false);
        }
    };

    const repay = async (amount: number) => {
        if (!client || !accountId) {
            toast.error('Please connect your wallet first');
            return;
        }

        setIsLoading(true);
        try {
            const stablecoinContractId = getStockContractId('USDC');
            if (!stablecoinContractId) {
                throw new Error('USDC contract ID not configured');
            }
            // Implement repay logic using Hedera ContractExecuteTransaction
            toast.success('Successfully repaid loan');
        } catch (err) {
            console.error('Error repaying loan:', err);
            toast.error('Failed to repay loan');
        } finally {
            setIsLoading(false);
        }
    };

    const getLendingStats = async () => {
        if (!client) {
            throw new Error('Client not initialized');
        }

        try {
            const lendingPoolContractId = getStockContractId('LENDING_POOL');
            if (!lendingPoolContractId) {
                throw new Error('Lending pool contract ID not configured');
            }
            // Implement get pool stats logic using Hedera ContractCallQuery
            return {
                totalDeposits: 0,
                totalBorrows: 0,
                interestRate: 0,
            };
        } catch (err) {
            console.error('Error getting lending pool stats:', err);
            throw err;
        }
    };

    return (
        <LendingContext.Provider
            value={{
                deposit,
                borrow,
                repay,
                getLendingStats,
                isLoading,
                error,
            }}
        >
            {children}
        </LendingContext.Provider>
    );
}

export function useLending() {
    const context = useContext(LendingContext);
    if (context === undefined) {
        throw new Error('useLending must be used within a LendingProvider');
    }
    return context;
} 
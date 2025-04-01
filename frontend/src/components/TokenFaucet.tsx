import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard } from 'lucide-react';
import { mintWithToken, shareGasFromDeploymentAccount } from '../services/tokenService';
import { loadDemoFunds, getDemoBalances } from '../services/walletService';

interface TokenFaucetProps {
    className?: string;
}

// Demo contract ID - would be replaced with the actual one in production
const WALLET_CONTRACT_ID = process.env.NEXT_PUBLIC_WALLET_CONTRACT_ID || "0.0.1234567";

export default function TokenFaucet({ className }: TokenFaucetProps) {
    const { smartWalletId, accountId, isConnected } = useWallet();
    const [tokenAmount, setTokenAmount] = useState<number>(100);
    const [tokenType, setTokenType] = useState<'HBAR' | 'USDC' | 'USDT'>('USDC');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingGas, setIsLoadingGas] = useState(false);
    const [result, setResult] = useState<{
        success?: boolean;
        message?: string;
        txId?: string;
    }>({});

    // Check if we're in demo mode
    const isDemoMode = typeof window !== 'undefined' && localStorage.getItem('tajiri-demo-mode') === 'true';

    const handleLoadTokens = async () => {
        if (!accountId && !smartWalletId) return;

        setIsLoading(true);
        setResult({});

        try {
            if (isDemoMode) {
                // Handle demo mode loading
                await loadDemoFunds(tokenType, tokenAmount);
                setResult({
                    success: true,
                    message: `Successfully added ${tokenAmount} ${tokenType} to your demo wallet`,
                    txId: `demo-tx-${Date.now().toString(36)}`
                });
            } else {
                // Handle real token loading
                const targetId = smartWalletId || accountId;
                if (!targetId) throw new Error("No valid wallet ID found");

                const response = await mintWithToken(
                    WALLET_CONTRACT_ID,
                    tokenType,
                    tokenAmount,
                    targetId
                );

                setResult({
                    success: response.success,
                    message: response.success
                        ? `Successfully requested ${tokenAmount} ${tokenType}`
                        : `Failed: ${response.error || 'Unknown error'}`,
                    txId: response.txId
                });
            }
        } catch (error) {
            console.error('Error loading tokens:', error);
            setResult({
                success: false,
                message: error instanceof Error ? error.message : 'An unexpected error occurred'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddGas = async () => {
        if (!accountId && !smartWalletId) return;

        setIsLoadingGas(true);
        setResult({});

        try {
            const targetId = smartWalletId || accountId;
            if (!targetId) throw new Error("No valid wallet ID found");

            if (isDemoMode) {
                // Simulate gas loading in demo mode
                await loadDemoFunds('HBAR', 0.5);
                setResult({
                    success: true,
                    message: 'Successfully added 0.5 HBAR for gas to your demo wallet',
                    txId: `demo-gas-${Date.now().toString(36)}`
                });
            } else {
                // Add real gas
                const response = await shareGasFromDeploymentAccount(targetId);

                setResult({
                    success: response.success,
                    message: response.success
                        ? 'Successfully added 0.5 HBAR for gas fees'
                        : `Failed to add HBAR for gas: ${response.error || 'Unknown error'}`,
                    txId: response.txId
                });
            }
        } catch (error) {
            console.error('Error adding gas:', error);
            setResult({
                success: false,
                message: error instanceof Error ? error.message : 'An unexpected error occurred'
            });
        } finally {
            setIsLoadingGas(false);
        }
    };

    if (!isConnected) {
        return (
            <Card className={className}>
                <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">
                        Connect your wallet to access the token faucet
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>{isDemoMode ? 'Demo Token Faucet' : 'Testnet Token Faucet'}</CardTitle>
                <CardDescription>
                    {isDemoMode
                        ? 'Add virtual funds to test the application'
                        : 'Get test tokens for the Hedera testnet'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="token-type">Token Type</Label>
                            <Select
                                value={tokenType}
                                onValueChange={(value) => setTokenType(value as any)}
                            >
                                <SelectTrigger id="token-type">
                                    <SelectValue placeholder="Select token" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="HBAR">HBAR</SelectItem>
                                    <SelectItem value="USDC">USDC</SelectItem>
                                    <SelectItem value="USDT">USDT</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="amount">Amount</Label>
                            <Input
                                id="amount"
                                type="number"
                                value={tokenAmount}
                                onChange={(e) => setTokenAmount(Number(e.target.value))}
                                min={1}
                                max={1000}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={handleLoadTokens}
                            disabled={isLoading || tokenAmount <= 0}
                            className="flex-1"
                        >
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {isLoading ? 'Processing...' : `Get ${tokenType}`}
                        </Button>

                        <Button
                            onClick={handleAddGas}
                            disabled={isLoadingGas}
                            variant="outline"
                        >
                            {isLoadingGas ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                            Get Gas
                        </Button>
                    </div>

                    {result.message && (
                        <Alert variant={result.success ? "success" : "destructive"}>
                            <AlertDescription>{result.message}</AlertDescription>
                            {result.txId && (
                                <div className="mt-1 text-xs opacity-70">
                                    Transaction ID: {result.txId}
                                </div>
                            )}
                        </Alert>
                    )}

                    <div className="mt-2 text-xs text-muted-foreground">
                        <p>Note: {isDemoMode
                            ? 'Demo tokens are for testing only and have no real value.'
                            : 'Token requests may take a few minutes to process on the Hedera testnet.'}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 
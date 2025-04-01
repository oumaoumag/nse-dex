import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { getTokenBalance, associateToken, isTokenAssociated, shareGasFromDeploymentAccount } from '../services/tokenService';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/Spinner';
import { useToast } from '@/components/ui/use-toast';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';

type TokenType = 'USDC' | 'USDT';

interface TokenManagerProps {
    className?: string;
}

export default function TokenManager({ className }: TokenManagerProps) {
    const { accountId, isConnected, smartWalletId } = useWallet();
    const [tokenBalances, setTokenBalances] = useState<Record<TokenType, string>>({
        USDC: '0.00',
        USDT: '0.00'
    });
    const [associationStatus, setAssociationStatus] = useState<Record<TokenType, boolean>>({
        USDC: false,
        USDT: false
    });
    const [loading, setLoading] = useState<Record<string, boolean>>({
        balances: false,
        association: false,
        usdcAssociate: false,
        usdtAssociate: false,
        sendGas: false
    });
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    // Check token associations and balances when wallet is connected
    useEffect(() => {
        if (isConnected && smartWalletId) {
            checkTokenAssociations();
            refreshBalances();
        }
    }, [isConnected, smartWalletId]);

    // Function to check if tokens are associated
    const checkTokenAssociations = async () => {
        if (!smartWalletId) return;

        setLoading(prev => ({ ...prev, association: true }));
        try {
            const usdcAssociated = await isTokenAssociated(smartWalletId, 'USDC');
            const usdtAssociated = await isTokenAssociated(smartWalletId, 'USDT');

            setAssociationStatus({
                USDC: usdcAssociated,
                USDT: usdtAssociated
            });
        } catch (err) {
            console.error('Error checking token associations:', err);
            setError('Failed to check token associations');
        } finally {
            setLoading(prev => ({ ...prev, association: false }));
        }
    };

    // Function to refresh token balances
    const refreshBalances = async () => {
        if (!smartWalletId) return;

        setLoading(prev => ({ ...prev, balances: true }));
        try {
            const usdcBalance = await getTokenBalance(smartWalletId, 'USDC');
            const usdtBalance = await getTokenBalance(smartWalletId, 'USDT');

            setTokenBalances({
                USDC: usdcBalance,
                USDT: usdtBalance
            });
        } catch (err) {
            console.error('Error fetching token balances:', err);
            setError('Failed to fetch token balances');
        } finally {
            setLoading(prev => ({ ...prev, balances: false }));
        }
    };

    // Associate token with wallet
    const handleAssociateToken = async (tokenType: TokenType) => {
        if (!smartWalletId) {
            toast({
                title: "Wallet not connected",
                description: "Please connect your wallet first",
                variant: "destructive"
            });
            return;
        }

        const loadingKey = tokenType === 'USDC' ? 'usdcAssociate' : 'usdtAssociate';
        setLoading(prev => ({ ...prev, [loadingKey]: true }));
        setError(null);

        try {
            const result = await associateToken(smartWalletId, tokenType);

            if (result.success) {
                toast({
                    title: "Token associated",
                    description: `Successfully associated ${tokenType} with your wallet`,
                    variant: "default"
                });
                setAssociationStatus(prev => ({ ...prev, [tokenType]: true }));
                // Refresh balances after association
                refreshBalances();
            } else {
                toast({
                    title: "Association failed",
                    description: result.error || "Unknown error occurred",
                    variant: "destructive"
                });
            }
        } catch (err) {
            console.error(`Error associating ${tokenType}:`, err);
            toast({
                title: "Association failed",
                description: err instanceof Error ? err.message : "Unknown error occurred",
                variant: "destructive"
            });
        } finally {
            setLoading(prev => ({ ...prev, [loadingKey]: false }));
        }
    };

    // Share gas to wallet for transactions
    const handleShareGas = async () => {
        if (!smartWalletId) {
            toast({
                title: "Wallet not connected",
                description: "Please connect your wallet first",
                variant: "destructive"
            });
            return;
        }

        setLoading(prev => ({ ...prev, sendGas: true }));
        setError(null);

        try {
            const result = await shareGasFromDeploymentAccount(smartWalletId);

            if (result.success) {
                toast({
                    title: "Gas added",
                    description: "Successfully added HBAR to your wallet for gas",
                    variant: "default"
                });
                // Refresh balances after gas transfer
                refreshBalances();
            } else {
                toast({
                    title: "Failed to add gas",
                    description: result.error || "Could not add HBAR to your wallet",
                    variant: "destructive"
                });
            }
        } catch (err) {
            console.error('Error sharing gas:', err);
            toast({
                title: "Failed to add gas",
                description: err instanceof Error ? err.message : "Unknown error occurred",
                variant: "destructive"
            });
        } finally {
            setLoading(prev => ({ ...prev, sendGas: false }));
        }
    };

    if (!isConnected) {
        return (
            <Card className={className}>
                <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">
                        Connect your wallet to manage tokens
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>Token Management</CardTitle>
                <CardDescription>Manage your tokens and associations</CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-4">
                    {/* HBAR Section */}
                    <div className="p-4 border rounded-md">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-medium">HBAR</h3>
                                <p className="text-sm text-muted-foreground">For gas fees</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleShareGas}
                                disabled={loading.sendGas}
                            >
                                {loading.sendGas ? <Spinner size="xs" className="mr-2" /> : null}
                                Add HBAR for Gas
                            </Button>
                        </div>
                    </div>

                    {/* USDC Section */}
                    <div className="p-4 border rounded-md">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-medium">USDC</h3>
                                <div className="flex items-center mt-1">
                                    <span className="mr-2">Balance: {loading.balances ? <Spinner size="xs" /> : tokenBalances.USDC}</span>
                                    <div className="flex items-center text-xs">
                                        {associationStatus.USDC ? (
                                            <span className="text-green-500 flex items-center">
                                                <CheckCircle className="h-3 w-3 mr-1" /> Associated
                                            </span>
                                        ) : (
                                            <span className="text-red-500 flex items-center">
                                                <XCircle className="h-3 w-3 mr-1" /> Not Associated
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {!associationStatus.USDC && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAssociateToken('USDC')}
                                    disabled={loading.usdcAssociate}
                                >
                                    {loading.usdcAssociate ? <Spinner size="xs" className="mr-2" /> : null}
                                    Associate
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* USDT Section */}
                    <div className="p-4 border rounded-md">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-medium">USDT</h3>
                                <div className="flex items-center mt-1">
                                    <span className="mr-2">Balance: {loading.balances ? <Spinner size="xs" /> : tokenBalances.USDT}</span>
                                    <div className="flex items-center text-xs">
                                        {associationStatus.USDT ? (
                                            <span className="text-green-500 flex items-center">
                                                <CheckCircle className="h-3 w-3 mr-1" /> Associated
                                            </span>
                                        ) : (
                                            <span className="text-red-500 flex items-center">
                                                <XCircle className="h-3 w-3 mr-1" /> Not Associated
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {!associationStatus.USDT && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAssociateToken('USDT')}
                                    disabled={loading.usdtAssociate}
                                >
                                    {loading.usdtAssociate ? <Spinner size="xs" className="mr-2" /> : null}
                                    Associate
                                </Button>
                            )}
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={refreshBalances}
                        disabled={loading.balances}
                        className="w-full"
                    >
                        {loading.balances ? <Spinner size="xs" className="mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                        Refresh Balances
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
} 
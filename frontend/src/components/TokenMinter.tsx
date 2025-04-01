'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, CreditCard, AlertCircle, Loader2 } from 'lucide-react';
import { mintWithToken } from '@/services/tokenService';
import { useToast } from '@/components/ui/use-toast';

interface TokenMinterProps {
    contractId: string;
    onSuccess?: (txId: string) => void;
}

export function TokenMinter({ contractId, onSuccess }: TokenMinterProps) {
    const [amount, setAmount] = useState<number>(100);
    const [tokenType, setTokenType] = useState<'HBAR' | 'USDC' | 'USDT'>('HBAR');
    const [isLoading, setIsLoading] = useState(false);
    const [recipientId, setRecipientId] = useState('');
    const { toast } = useToast();
    const isDemoMode = typeof window !== 'undefined' && localStorage.getItem('tajiri-demo-mode') === 'true';

    const handleMint = async () => {
        if (!contractId) {
            toast({
                title: "Missing contract ID",
                description: "Please provide a valid contract ID to mint from",
                variant: "destructive"
            });
            return;
        }

        if (!recipientId) {
            // If no recipient is specified, use the current user's address
            setRecipientId('0.0.1234567'); // Replace with actual user ID
        }

        setIsLoading(true);
        try {
            const result = await mintWithToken(
                contractId,
                tokenType,
                amount,
                recipientId
            );

            if (result.success) {
                toast({
                    title: "Minting successful",
                    description: `Successfully minted ${amount} tokens using ${tokenType}`,
                    variant: "success"
                });

                if (onSuccess && result.txId) {
                    onSuccess(result.txId);
                }
            } else {
                toast({
                    title: "Minting failed",
                    description: result.error || "Unknown error occurred",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error("Error minting tokens:", error);
            toast({
                title: "Minting error",
                description: error instanceof Error ? error.message : "Unknown error occurred",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="bg-decode-card border border-decode-green/20">
            <CardHeader className="bg-decode-black/40 border-b border-decode-green/10 pb-4">
                <CardTitle>Mint with Tokens</CardTitle>
                <CardDescription>
                    Use HBAR, USDC, or USDT to mint tokens
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                {isDemoMode && (
                    <div className="mb-4 p-3 rounded bg-amber-900/20 border border-amber-500/30 flex items-start">
                        <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm text-amber-500 font-medium">Demo Mode Active</p>
                            <p className="text-xs text-decode-gray-400 mt-1">
                                In demo mode, no real transactions will be executed. Transactions will be simulated.
                            </p>
                        </div>
                    </div>
                )}

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
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="recipient">Recipient ID (optional)</Label>
                        <Input
                            id="recipient"
                            placeholder="0.0.1234567 or 0x..."
                            value={recipientId}
                            onChange={(e) => setRecipientId(e.target.value)}
                            className="font-mono text-sm"
                        />
                        <p className="text-xs text-decode-gray-400 mt-1">
                            If left empty, your wallet will be used
                        </p>
                    </div>

                    <Button
                        onClick={handleMint}
                        disabled={isLoading || amount <= 0}
                        className="w-full"
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : tokenType === 'HBAR' ? (
                            <CreditCard className="mr-2 h-4 w-4" />
                        ) : (
                            <DollarSign className="mr-2 h-4 w-4" />
                        )}
                        Mint with {tokenType}
                    </Button>

                    <div className="mt-2 text-xs text-decode-gray-400">
                        <p>Note: For USDC and USDT transactions, the system will automatically convert to HBAR for on-chain transactions.</p>
                        <p className="mt-1">Gas fees are covered by the deployment account.</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 
'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWallet } from '@/contexts/WalletContext';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import { WalletStatusIndicator } from '@/components/WalletStatusIndicator';
import TokenManager from '@/components/TokenManager';
import TokenFaucet from '@/components/TokenFaucet';
import { loadDemoFunds, getDemoBalances } from "@/services/walletService";
import { mintWithToken, shareGasFromDeploymentAccount } from "@/services/tokenService";
import { useToast } from "@/components/ui/use-toast";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, CreditCard, ArrowDownToLine, ArrowUpToLine, DollarSign, Hash, AlertCircle } from "lucide-react";
import { TokenMinter } from '@/components/TokenMinter';

// Contract ID for the wallet - would normally be fetched from the backend
const WALLET_CONTRACT_ID = "0.0.1234567"; // Replace with actual contract ID

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const { smartWalletId, balance, accountId, isLoading, error, fetchBalance } = useWallet();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [tokenAmount, setTokenAmount] = useState<number>(100);
  const [tokenType, setTokenType] = useState<'HBAR' | 'USDC' | 'USDT'>('USDC');
  const [demoBalances, setDemoBalances] = useState<Record<string, string>>({});
  const [isLoadingDemoFunds, setIsLoadingDemoFunds] = useState(false);
  const [isLoadingRealTokens, setIsLoadingRealTokens] = useState(false);
  const [loadTokenResult, setLoadTokenResult] = useState<{
    success?: boolean;
    message?: string;
    txId?: string;
  }>({});
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [isLoadingGas, setIsLoadingGas] = useState(false);
  const { toast } = useToast();

  // Transaction history state
  const [transactionHistory, setTransactionHistory] = useState<Array<{
    id: string;
    type: string;
    amount: string;
    token: string;
    timestamp: Date;
    status: 'completed' | 'pending' | 'failed';
  }>>([]);

  useEffect(() => {
    // Check if demo mode is enabled
    const demoMode = localStorage.getItem('tajiri-demo-mode') === 'true';
    setIsDemoMode(demoMode);
  }, []);

  useEffect(() => {
    if (isDemoMode) {
      const balances = getDemoBalances();
      setDemoBalances(balances);

      // In demo mode, add some mock transaction history
      if (transactionHistory.length === 0) {
        const mockHistory = [
          {
            id: '0001',
            type: 'Deposit',
            amount: '100.00',
            token: 'USDC',
            timestamp: new Date(Date.now() - 86400000), // 1 day ago
            status: 'completed' as const
          },
          {
            id: '0002',
            type: 'Withdraw',
            amount: '25.00',
            token: 'USDC',
            timestamp: new Date(Date.now() - 43200000), // 12 hours ago
            status: 'completed' as const
          },
          {
            id: '0003',
            type: 'Transfer',
            amount: '15.50',
            token: 'HBAR',
            timestamp: new Date(Date.now() - 3600000), // 1 hour ago
            status: 'completed' as const
          }
        ];
        setTransactionHistory(mockHistory);
      }
    }
  }, [isDemoMode, transactionHistory.length]);

  const handleLoadDemoFunds = async () => {
    if (!isDemoMode) return;

    setIsLoadingDemoFunds(true);
    try {
      await loadDemoFunds(tokenType, tokenAmount);
      // Update balances
      const balances = getDemoBalances();
      setDemoBalances(balances);

      // Add a transaction to history
      const newTransaction = {
        id: Math.random().toString(36).substring(2, 10),
        type: 'Deposit',
        amount: tokenAmount.toString(),
        token: tokenType,
        timestamp: new Date(),
        status: 'completed' as const
      };

      setTransactionHistory(prev => [newTransaction, ...prev]);

      toast({
        title: "Funds added successfully",
        description: `Added ${tokenAmount} ${tokenType} to your wallet`,
        variant: "success"
      });
    } catch (error) {
      console.error("Error loading funds:", error);
      toast({
        title: "Error loading funds",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoadingDemoFunds(false);
    }
  };

  const handleLoadRealTokens = async () => {
    if (!accountId || isDemoMode) return;

    setIsLoadingRealTokens(true);
    try {
      // Use the mintWithToken function from tokenService
      const result = await mintWithToken(
        WALLET_CONTRACT_ID,  // Contract ID to mint from
        tokenType,
        tokenAmount,
        accountId
      );

      setLoadTokenResult(result);

      if (result.success) {
        // Add transaction to history if successful
        const newTransaction = {
          id: result.txId || Math.random().toString(36).substring(2, 10),
          type: 'Deposit',
          amount: tokenAmount.toString(),
          token: tokenType,
          timestamp: new Date(),
          status: 'pending' as const
        };

        setTransactionHistory(prev => [newTransaction, ...prev]);

        // Refresh balance
        if (fetchBalance) {
          setTimeout(() => {
            fetchBalance();
          }, 2000);
        }

        toast({
          title: "Tokens loaded successfully",
          description: `Added ${tokenAmount} ${tokenType} to your wallet`,
          variant: "success"
        });
      } else {
        toast({
          title: "Could not load tokens",
          description: result.error || "Unknown error occurred",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error loading tokens:", error);
      toast({
        title: "Error loading tokens",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoadingRealTokens(false);
    }
  };

  const handleShareGas = async () => {
    if (!accountId || isDemoMode) return;

    setIsLoadingGas(true);
    try {
      const result = await shareGasFromDeploymentAccount(accountId);

      if (result.success) {
        // Add transaction to history
        const newTransaction = {
          id: result.txId || Math.random().toString(36).substring(2, 10),
          type: 'Gas',
          amount: "0.5",
          token: "HBAR",
          timestamp: new Date(),
          status: 'completed' as const
        };

        setTransactionHistory(prev => [newTransaction, ...prev]);

        toast({
          title: "Gas funds shared",
          description: "0.5 HBAR has been transferred to your wallet for gas fees",
          variant: "success"
        });

        // Refresh balance
        if (fetchBalance) {
          setTimeout(() => {
            fetchBalance();
          }, 2000);
        }
      } else {
        toast({
          title: "Could not share gas",
          description: result.error || "Unknown error occurred",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error sharing gas:", error);
      toast({
        title: "Error sharing gas",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoadingGas(false);
    }
  };

  const refreshWallet = async () => {
    setIsLoadingWallet(true);

    try {
      // If fetchBalance is available in the wallet context, use it
      if (fetchBalance) {
        await fetchBalance();
      }

      // For demo, we'll just refresh the demo balances
      if (isDemoMode) {
        const balances = getDemoBalances();
        setDemoBalances(balances);
      }

      toast({
        title: "Wallet refreshed",
        description: "Latest balances have been loaded",
        variant: "success"
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Could not update wallet information",
        variant: "destructive"
      });
    } finally {
      setIsLoadingWallet(false);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Display login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-decode-black pt-28 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 decode-gradient bg-clip-text text-transparent">Wallet</h1>

          <div className="bg-decode-card border border-decode-green/20 rounded-xl p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
            <p className="mb-6 text-decode-gray-400">
              Please sign in with your Google account to access your smart wallet.
            </p>
            <div className="flex justify-center">
              <GoogleLoginButton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-decode-black pt-28 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-bold decode-gradient bg-clip-text text-transparent">Wallet</h1>
          <div className="flex items-center gap-2">
            <WalletStatusIndicator />
            <Button
              variant="outline"
              size="sm"
              onClick={refreshWallet}
              disabled={isLoadingWallet}
              className="flex items-center gap-1"
            >
              {isLoadingWallet ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
        </div>

        {/* Demo Mode Banner */}
        {isDemoMode && (
          <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-4 mb-8">
            <div className="flex items-start">
              <div className="mr-3 mt-1">
                <AlertCircle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-amber-500">Demo Mode Active</h3>
                <p className="text-decode-gray-400 mt-1">
                  You are currently using a simulated wallet for demonstration purposes. Some functionality may be limited.
                  The wallet will use mock data and simulated transactions.
                </p>
                <button
                  className="mt-3 text-amber-500 hover:text-amber-400 underline text-sm"
                  onClick={() => {
                    localStorage.removeItem('tajiri-demo-mode');
                    window.location.reload();
                  }}
                >
                  Try reconnecting to the network
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Balance Card */}
          <Card className="md:col-span-2 bg-decode-card border border-decode-green/20">
            <CardHeader className="bg-decode-black/40 border-b border-decode-green/10 pb-4">
              <CardTitle>Total Balance</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-end gap-2 mb-1">
                <span className="text-4xl font-bold text-decode-white">{balance || '0.00'}</span>
                <span className="text-xl text-decode-gray-400 mb-1">ℏ</span>
                {isDemoMode && <span className="text-amber-500 text-sm mb-1">(Simulated)</span>}
              </div>
              <p className="text-decode-gray-400 text-sm">≈ $100.00 USD</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                {Object.entries(demoBalances).map(([token, amount]) => (
                  token !== 'HBAR' && (
                    <div key={token} className="bg-decode-black/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-8 w-8 rounded-full flex items-center justify-center bg-blue-900/30 text-blue-400">
                          {token === 'USDC' ? '$' : token === 'USDT' ? 'T' : token.charAt(0)}
                        </div>
                        <span className="font-medium">{token}</span>
                      </div>
                      <div className="text-lg font-semibold">{amount}</div>
                    </div>
                  )
                ))}
              </div>

              <div className="flex flex-wrap gap-2 mt-6">
                <Button className="flex items-center gap-1">
                  <ArrowDownToLine className="h-4 w-4" />
                  Deposit
                </Button>
                <Button variant="outline" className="flex items-center gap-1">
                  <ArrowUpToLine className="h-4 w-4" />
                  Withdraw
                </Button>
                <Button variant="ghost" className="flex items-center gap-1">
                  <CreditCard className="h-4 w-4" />
                  Buy Crypto
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Info Card */}
          <Card className="bg-decode-card border border-decode-green/20">
            <CardHeader className="bg-decode-black/40 border-b border-decode-green/10 pb-4">
              <CardTitle>Wallet Info</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label className="text-decode-gray-400 text-xs">Smart Wallet ID</Label>
                <div className="font-mono text-sm truncate mt-1">
                  {smartWalletId ?
                    `${smartWalletId.substring(0, 10)}...${smartWalletId.substring(smartWalletId.length - 8)}` :
                    'Processing...'}
                  {isDemoMode && <span className="text-amber-500 ml-2">(Demo)</span>}
                </div>
              </div>

              <div>
                <Label className="text-decode-gray-400 text-xs">Account ID</Label>
                <div className="font-mono text-sm truncate mt-1">{accountId || 'Unknown'}</div>
              </div>

              <div>
                <Label className="text-decode-gray-400 text-xs">Network</Label>
                <div className="font-medium mt-1">Hedera {isDemoMode ? 'Testnet (Simulated)' : 'Testnet'}</div>
              </div>

              <div>
                <Label className="text-decode-gray-400 text-xs">Status</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span>Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Replace the existing token loading cards with a grid containing TokenManager and TokenFaucet */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <TokenManager />
          <TokenFaucet />
        </div>

        {/* Transaction History Card */}
        <Card className="bg-decode-card border border-decode-green/20 mb-8">
          <CardHeader className="bg-decode-black/40 border-b border-decode-green/10 pb-4">
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {transactionHistory.length > 0 ? (
              <div className="space-y-4">
                {transactionHistory.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 border-b border-decode-green/10">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${tx.type === 'Deposit' ? 'bg-green-900/30 text-green-400' :
                        tx.type === 'Withdraw' ? 'bg-red-900/30 text-red-400' :
                          'bg-blue-900/30 text-blue-400'
                        }`}>
                        {tx.type === 'Deposit' ? '+' : tx.type === 'Withdraw' ? '-' : '↔'}
                      </div>
                      <div>
                        <div className="font-medium">{tx.type}</div>
                        <div className="text-xs text-decode-gray-400">{formatDate(tx.timestamp)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${tx.type === 'Deposit' ? 'text-green-400' :
                        tx.type === 'Withdraw' ? 'text-red-400' : ''
                        }`}>
                        {tx.type === 'Deposit' ? '+' : tx.type === 'Withdraw' ? '-' : ''}{tx.amount} {tx.token}
                      </div>
                      <div className={`text-xs ${tx.status === 'completed' ? 'text-green-400' :
                        tx.status === 'pending' ? 'text-amber-400' :
                          'text-red-400'
                        }`}>
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-decode-gray-400">
                No transactions found
              </div>
            )}
          </CardContent>
        </Card>

        {/* Wallet Management Tabs */}
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="bg-decode-card border border-decode-green/20 rounded-xl overflow-hidden">
          <TabsList className="w-full grid grid-cols-3 bg-decode-black/40 border-b border-decode-green/10 rounded-none p-0">
            <TabsTrigger
              value="overview"
              className={`p-4 font-medium ${activeTab === 'overview' ? 'text-decode-green' : 'text-decode-white'}`}
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className={`p-4 font-medium ${activeTab === 'transactions' ? 'text-decode-green' : 'text-decode-white'}`}
            >
              Transactions
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className={`p-4 font-medium ${activeTab === 'security' ? 'text-decode-green' : 'text-decode-white'}`}
            >
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="p-6">
            <h3 className="text-lg font-semibold mb-4">Wallet Overview</h3>
            <p className="text-decode-gray-400 mb-6">
              Your smart wallet gives you access to all Tajiri financial services. You can use it to trade stocks,
              participate in P2P trading, and manage your portfolio.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-decode-black/30 border border-decode-green/10">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Wallet Type</h4>
                  <p className="text-decode-gray-400">Smart Contract Wallet</p>
                </CardContent>
              </Card>
              <Card className="bg-decode-black/30 border border-decode-green/10">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Network</h4>
                  <p className="text-decode-gray-400">Hedera Testnet</p>
                </CardContent>
              </Card>
              <Card className="bg-decode-black/30 border border-decode-green/10">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Status</h4>
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                    <p className="text-decode-gray-400">Active</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-decode-black/30 border border-decode-green/10">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Created</h4>
                  <p className="text-decode-gray-400">
                    {smartWalletId ? new Date().toLocaleDateString() : 'Processing...'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="p-6">
            <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
            <p className="text-decode-gray-400 mb-6">
              View your transaction history. All operations performed with your smart wallet will be displayed here.
            </p>

            {transactionHistory.length > 0 ? (
              <div className="border border-decode-green/10 rounded-lg overflow-hidden">
                <div className="grid grid-cols-4 gap-4 p-4 bg-decode-black/30 font-medium text-sm">
                  <div>Type</div>
                  <div>Amount</div>
                  <div>Date</div>
                  <div className="text-right">Status</div>
                </div>

                <div className="divide-y divide-decode-green/10">
                  {transactionHistory.map((tx) => (
                    <div key={tx.id} className="grid grid-cols-4 gap-4 p-4 text-sm">
                      <div>{tx.type}</div>
                      <div className={
                        tx.type === 'Deposit' ? 'text-green-400' :
                          tx.type === 'Withdraw' ? 'text-red-400' : ''
                      }>
                        {tx.type === 'Deposit' ? '+' : tx.type === 'Withdraw' ? '-' : ''}{tx.amount} {tx.token}
                      </div>
                      <div>{formatDate(tx.timestamp)}</div>
                      <div className={`text-right ${tx.status === 'completed' ? 'text-green-400' :
                        tx.status === 'pending' ? 'text-amber-400' :
                          'text-red-400'
                        }`}>
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-decode-black/30 rounded-lg p-4 text-center">
                <p className="text-decode-gray-400">No transactions found</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="security" className="p-6">
            <h3 className="text-lg font-semibold mb-4">Wallet Security</h3>
            <p className="text-decode-gray-400 mb-6">
              Manage the security settings for your smart wallet, including guardians and recovery options.
            </p>

            <div className="space-y-4">
              <Card className="bg-decode-black/30 border border-decode-green/10">
                <CardHeader className="py-3 px-4">
                  <h4 className="font-medium">Guardians</h4>
                </CardHeader>
                <CardContent className="py-3 px-4 border-t border-decode-green/10">
                  <p className="text-decode-gray-400 mb-4">
                    Add guardian addresses to help secure and recover your wallet.
                  </p>
                  <div className="text-center p-4 bg-decode-black/20 rounded-lg">
                    <p className="text-decode-gray-400">No guardians added yet</p>
                  </div>
                </CardContent>
                <CardFooter className="py-3 px-4 border-t border-decode-green/10">
                  <button disabled className="bg-decode-green/20 text-decode-green/60 px-4 py-2 rounded-lg w-full">
                    Add Guardian
                  </button>
                </CardFooter>
              </Card>

              <Card className="bg-decode-black/30 border border-decode-green/10">
                <CardHeader className="py-3 px-4">
                  <h4 className="font-medium">Recovery Options</h4>
                </CardHeader>
                <CardContent className="py-3 px-4 border-t border-decode-green/10">
                  <p className="text-decode-gray-400 mb-4">
                    Set up recovery options to regain access if needed.
                  </p>
                  <div className="text-center p-4 bg-decode-black/20 rounded-lg">
                    <p className="text-decode-gray-400">No recovery options configured</p>
                  </div>
                </CardContent>
                <CardFooter className="py-3 px-4 border-t border-decode-green/10">
                  <button disabled className="bg-decode-green/20 text-decode-green/60 px-4 py-2 rounded-lg w-full">
                    Configure Recovery
                  </button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 
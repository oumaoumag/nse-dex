'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWallet } from '@/contexts/WalletContext';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import GoogleLoginButton from '@/components/GoogleLoginButton';

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const { smartWalletId, balance, accountId, isLoading } = useWallet();

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
        <h1 className="text-3xl md:text-4xl font-bold mb-8 decode-gradient bg-clip-text text-transparent">Wallet</h1>

        <div className="grid grid-cols-1 gap-8">
          {/* Wallet Status Card */}
          <Card className="bg-decode-card border border-decode-green/20 overflow-hidden">
            <CardHeader className="bg-decode-black/40 border-b border-decode-green/10 pb-6">
              <h2 className="text-xl font-semibold">Wallet Status</h2>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-decode-green"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-decode-black/30 rounded-lg p-4">
                      <div className="text-sm text-decode-gray-400 mb-2">Account ID</div>
                      <div className="font-mono text-decode-white break-all">{accountId || 'Unknown'}</div>
                    </div>
                    <div className="bg-decode-black/30 rounded-lg p-4">
                      <div className="text-sm text-decode-gray-400 mb-2">Smart Wallet ID</div>
                      <div className="font-mono text-decode-white break-all">{smartWalletId || 'Processing...'}</div>
                    </div>
                  </div>
                  <div className="bg-decode-black/30 rounded-lg p-4">
                    <div className="text-sm text-decode-gray-400 mb-2">HBAR Balance</div>
                    <div className="text-2xl font-bold text-decode-white">{balance || '0'} ℏ</div>
                  </div>
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
              <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
              <p className="text-decode-gray-400 mb-6">
                View your recent wallet transactions. All operations performed with your smart wallet will be displayed here.
              </p>

              <div className="bg-decode-black/30 rounded-lg p-4 text-center">
                <p className="text-decode-gray-400">No transactions found</p>
              </div>
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
    </div>
  );
} 
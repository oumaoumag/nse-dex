'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useWallet } from '@/contexts/WalletContext';
import * as walletService from '@/services/walletService';
import * as hederaService from '@/services/hederaService';

export default function WalletDebugger() {
    const { data: session, status: authStatus } = useSession();
    const {
        isConnected,
        smartWalletId,
        balance,
        error: walletError
    } = useWallet();

    const [networkStatus, setNetworkStatus] = useState<string>('Checking...');
    const [factoryStatus, setFactoryStatus] = useState<string>('Checking...');
    const [clientStatus, setClientStatus] = useState<string>('Checking...');
    const [logs, setLogs] = useState<string[]>([]);

    // Add a log entry with timestamp
    const addLog = (message: string) => {
        const timestamp = new Date().toISOString().split('T')[1].substring(0, 8);
        setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
    };

    // Test network connectivity
    useEffect(() => {
        const checkNetwork = async () => {
            try {
                addLog('Testing Hedera network connectivity...');
                const isConnected = await hederaService.testNetworkConnectivity();
                setNetworkStatus(isConnected ? 'Connected' : 'Disconnected');
                addLog(`Network connectivity test: ${isConnected ? 'Success' : 'Failed'}`);
            } catch (err: any) {
                setNetworkStatus('Error');
                addLog(`Network connectivity error: ${err.message}`);
            }
        };

        checkNetwork();
    }, []);

    // Check wallet factory contract
    useEffect(() => {
        const checkWalletFactory = async () => {
            try {
                const factoryAddress = process.env.NEXT_PUBLIC_SMART_WALLET_FACTORY_ADDRESS;
                addLog(`Checking wallet factory at ${factoryAddress}...`);

                if (!factoryAddress) {
                    setFactoryStatus('Not configured');
                    addLog('Wallet factory address not configured in environment variables');
                    return;
                }

                // Try a simple query to the factory
                await hederaService.queryContract(
                    factoryAddress,
                    "getWalletCount"
                );

                setFactoryStatus('Available');
                addLog('Wallet factory contract is available');
            } catch (err: any) {
                setFactoryStatus('Error');
                addLog(`Wallet factory check error: ${err.message}`);
            }
        };

        checkWalletFactory();
    }, []);

    // Check Hedera client configuration
    useEffect(() => {
        const checkClient = async () => {
            try {
                addLog('Checking Hedera client configuration...');
                const client = hederaService.getClient();
                const hasOperator = hederaService.verifyClientOperator(client);

                if (hasOperator) {
                    setClientStatus('Configured');
                    addLog('Hedera client is properly configured with operator');
                } else {
                    setClientStatus('Missing operator');
                    addLog('Hedera client is missing operator credentials');
                }
            } catch (err: any) {
                setClientStatus('Error');
                addLog(`Hedera client check error: ${err.message}`);
            }
        };

        checkClient();
    }, []);

    // Retry wallet creation
    const handleRetryWalletCreation = async () => {
        if (!session?.user?.id) {
            addLog('Cannot retry - no user authenticated');
            return;
        }

        addLog('Retrying wallet creation...');

        try {
            // Clear existing wallet ID from localStorage
            localStorage.removeItem('tajiri-smart-wallet-id');

            // Attempt to create wallet
            const newWalletId = await walletService.createSmartWallet(session.user.id);
            addLog(`Wallet creation successful: ${newWalletId}`);

            // Force page reload to refresh context
            window.location.reload();
        } catch (err: any) {
            addLog(`Wallet creation failed: ${err.message}`);
        }
    };

    return (
        <div className="bg-decode-black/50 border border-decode-green/20 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Wallet Creation Debugger</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-decode-green/5 border border-decode-green/20 rounded-lg p-4">
                    <h3 className="font-medium mb-2">Authentication</h3>
                    <div className={`text-sm ${authStatus === 'authenticated' ? 'text-green-400' : 'text-yellow-400'}`}>
                        {authStatus === 'loading' ? 'Loading...' :
                            authStatus === 'authenticated' ? 'Authenticated' : 'Not authenticated'}
                    </div>
                    {session?.user && (
                        <div className="text-xs text-gray-400 mt-2">
                            User ID: {session.user.id}
                        </div>
                    )}
                </div>

                <div className="bg-decode-green/5 border border-decode-green/20 rounded-lg p-4">
                    <h3 className="font-medium mb-2">Network</h3>
                    <div className={`text-sm ${networkStatus === 'Connected' ? 'text-green-400' :
                            networkStatus === 'Checking...' ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                        {networkStatus}
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                        Client: {clientStatus}
                    </div>
                </div>

                <div className="bg-decode-green/5 border border-decode-green/20 rounded-lg p-4">
                    <h3 className="font-medium mb-2">Smart Wallet</h3>
                    <div className={`text-sm ${isConnected && smartWalletId ? 'text-green-400' :
                            isConnected && !smartWalletId ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                        {isConnected ? (smartWalletId ? 'Created' : 'Pending creation') : 'Not connected'}
                    </div>
                    {smartWalletId && (
                        <div className="text-xs text-gray-400 mt-2">
                            ID: {smartWalletId.substring(0, 10)}...
                        </div>
                    )}
                    {balance && (
                        <div className="text-xs text-gray-400 mt-1">
                            Balance: {balance} HBAR
                        </div>
                    )}
                </div>
            </div>

            {walletError && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6 text-sm text-red-400">
                    <strong>Error:</strong> {walletError}
                </div>
            )}

            <div className="bg-decode-blue/5 border border-decode-blue/20 rounded-lg p-4 mb-6">
                <h3 className="font-medium mb-2">Wallet Factory</h3>
                <div className={`text-sm ${factoryStatus === 'Available' ? 'text-green-400' :
                        factoryStatus === 'Checking...' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                    Status: {factoryStatus}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                    Address: {process.env.NEXT_PUBLIC_SMART_WALLET_FACTORY_ADDRESS || 'Not configured'}
                </div>
            </div>

            <div className="mb-6">
                <button
                    onClick={handleRetryWalletCreation}
                    disabled={!session?.user?.id}
                    className="w-full bg-decode-green hover:bg-decode-green/80 text-white py-3 px-6 rounded-lg font-medium transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Retry Wallet Creation
                </button>
            </div>

            <div className="bg-black/50 border border-gray-800 rounded-lg p-4 max-h-48 overflow-y-auto font-mono text-xs text-gray-400">
                <h3 className="font-medium mb-2 text-gray-300">Debug Logs</h3>
                {logs.map((log, i) => (
                    <div key={i} className="pb-1 border-b border-gray-800 mb-1 last:border-0 last:mb-0">
                        {log}
                    </div>
                ))}
                {logs.length === 0 && <div className="italic">No logs recorded yet</div>}
            </div>
        </div>
    );
} 
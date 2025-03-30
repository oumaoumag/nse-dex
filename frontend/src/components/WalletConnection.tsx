'use client';

import React from 'react';
import { useWallet } from '../contexts/WalletContext';
import { StatusMessage } from './ui/StatusMessage';
import { useForm } from '../utils/formUtils';

const WalletConnection: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { 
    isConnected, 
    accountId, 
    balance, 
    connectWallet, 
    disconnectWallet,
    smartWalletId,
    createSmartWallet,
    isLoading
  } = useWallet();

  const {
    formState,
    setFormLoading,
    setFormError,
    setFormSuccess,
    clearFormStatus
  } = useForm({});

  const handleConnectWallet = async () => {
    clearFormStatus();
    setFormLoading('Connecting wallet...');

    try {
      await connectWallet();
      setFormSuccess('Wallet connected successfully!');
    } catch (err: any) {
      setFormError(`Failed to connect wallet: ${err.message}`);
    }
  };

  const handleDisconnectWallet = () => {
    disconnectWallet();
    clearFormStatus();
  };

  const handleCreateSmartWallet = async () => {
    if (!isConnected) {
      setFormError('Please connect your wallet first');
      return;
    }

    clearFormStatus();
    setFormLoading('Creating smart wallet...');

    try {
      const walletId = await createSmartWallet();
      setFormSuccess(`Smart wallet created successfully! ID: ${walletId}`);
    } catch (err: any) {
      setFormError(`Failed to create smart wallet: ${err.message}`);
    }
  };

  // If in compact mode (for header), display minimal version
  if (compact) {
    return (
      <div>
        {!isConnected ? (
          <button
            onClick={handleConnectWallet}
            disabled={isLoading}
            className="decode-card flex items-center gap-3 py-2 px-4 border border-decode-green/30 rounded-lg hover:border-decode-green/60 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8" />
              <path d="M3 6h18" />
              <path d="M15 2H9a2 2 0 0 0-2 2v2h10V4a2 2 0 0 0-2-2z" />
            </svg>
            <span className="text-sm font-medium text-decode-white">
              {isLoading ? 'Connecting...' : 'Connect Wallet'}
            </span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="decode-card border border-decode-green/30 py-1 px-3 rounded-lg text-xs">
              <span className="font-mono text-decode-green">{accountId?.substring(0, 10)}...</span>
              <span className="ml-1 text-gray-400">{balance?.substring(0, 6) || '0'} ℏ</span>
            </div>
            <button
              onClick={handleDisconnectWallet}
              className="text-decode-red hover:text-decode-red-600 p-1"
              title="Disconnect Wallet"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M1.5 15a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5zm5 0a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5zm5 0a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5zM0 4a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  }

  // Full version for wallet pages
  return (
    <div className="p-6 bg-blue rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Wallet Connection</h2>

      <StatusMessage
        status={formState.status}
        message={formState.message}
        onDismiss={clearFormStatus}
      />

      {!isConnected ? (
        <div>
          <p className="mb-4 text-gray-600">
            Connect your Hedera wallet to use the application.
          </p>

          <button
            onClick={handleConnectWallet}
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-md font-medium ${isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
          >
            {isLoading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>
      ) : (
        <div>
            <div className="mb-4 p-4 bg-gray-800 text-white rounded-md">
              <div className="mb-2">
                <span className="font-medium">Account ID:</span> {accountId}
              </div>
              <div className="mb-2">
                <span className="font-medium">Balance:</span> {balance} ℏ HBAR
              </div>
              {smartWalletId && (
                <div>
                  <span className="font-medium">Smart Wallet ID:</span> {smartWalletId}
                </div>
              )}
            </div>

            {!smartWalletId && (
              <button
                onClick={handleCreateSmartWallet}
                disabled={isLoading}
                className={`w-full py-2 px-4 rounded-md font-medium mb-4 ${isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
              >
                {isLoading ? 'Creating...' : 'Create Smart Wallet'}
              </button>
            )}

            <button
              onClick={handleDisconnectWallet}
              className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium"
            >
              Disconnect Wallet
            </button>
        </div>
      )}
    </div>
  );
};

export default WalletConnection; 
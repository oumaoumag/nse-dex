'use client';

import React from 'react';
import { useWallet } from '../contexts/WalletContext';
import { StatusMessage } from './ui/StatusMessage';
import { useForm } from '../utils/formUtils';

const WalletConnection: React.FC = () => {
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
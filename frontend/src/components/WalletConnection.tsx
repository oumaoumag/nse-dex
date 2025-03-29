'use client';

import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';

const WalletConnection: React.FC = () => {
  const { 
    isConnected, 
    accountId, 
    smartWalletId,
    balance, 
    error, 
    isLoading,
    connectWallet, 
    disconnectWallet,
    createSmartWallet
  } = useWallet();
  
  const [showDetails, setShowDetails] = useState(false);
  
  const handleCreateSmartWallet = async () => {
    try {
      await createSmartWallet();
    } catch (err) {
      console.error('Failed to create smart wallet', err);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-primary-900 rounded-xl shadow-md">
      <h3 className="text-lg font-semibold text-primary-900 dark:text-white mb-4">
        Wallet
      </h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {isConnected ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-primary-600 dark:text-primary-400">Account ID:</p>
              <p className="font-medium text-primary-900 dark:text-white">
                {accountId?.substring(0, 6)}...{accountId?.substring(accountId.length - 4)}
              </p>
            </div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-secondary-600 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-300"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
          
          {showDetails && (
            <div className="mb-4 p-3 bg-primary-50 dark:bg-primary-800 rounded-md text-sm">
              <p className="mb-1">
                <span className="text-primary-600 dark:text-primary-400">Full Account ID: </span>
                <span className="font-medium text-primary-900 dark:text-white break-all">{accountId}</span>
              </p>
              {smartWalletId && (
                <p className="mb-1">
                  <span className="text-primary-600 dark:text-primary-400">Smart Wallet ID: </span>
                  <span className="font-medium text-primary-900 dark:text-white break-all">{smartWalletId}</span>
                </p>
              )}
              <p>
                <span className="text-primary-600 dark:text-primary-400">Balance: </span>
                <span className="font-medium text-primary-900 dark:text-white">{balance || '0'} HBAR</span>
              </p>
            </div>
          )}

          {!smartWalletId && (
            <button
              onClick={handleCreateSmartWallet}
              disabled={isLoading}
              className="w-full py-2 px-4 rounded-md bg-secondary-600 hover:bg-secondary-700 text-white font-medium text-sm mb-3 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create Smart Wallet'}
            </button>
          )}
          
          <button
            onClick={disconnectWallet}
            className="w-full py-2 px-4 rounded-md bg-primary-100 hover:bg-primary-200 dark:bg-primary-800 dark:hover:bg-primary-700 text-primary-900 dark:text-primary-200 font-medium text-sm transition-colors"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          disabled={isLoading}
          className="w-full py-2 px-4 rounded-md bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          {isLoading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
      
      {isConnected && smartWalletId && (
        <div className="mt-4 text-xs text-primary-600 dark:text-primary-400">
          <p className="mb-1">✓ Account Abstraction Enabled</p>
          <p>Transactions will be executed through your smart contract wallet for enhanced security and usability.</p>
        </div>
      )}
    </div>
  );
};

export default WalletConnection; 
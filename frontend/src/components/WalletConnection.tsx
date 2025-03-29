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
    <div className="relative">
      {isConnected ? (
        <div className="flex flex-col">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-decode-white hover:text-decode-green transition-colors px-3 py-2 rounded-md text-sm font-medium"
          >
            <div className="h-2 w-2 rounded-full bg-decode-green animate-pulse"></div>
            <span>
              {accountId?.substring(0, 6)}...{accountId?.substring(accountId.length - 4)}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 transition-transform ${showDetails ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showDetails && (
            <div className="absolute right-0 top-full mt-2 w-72 decode-card p-4 z-50">
              {error && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-500/30 text-red-300 rounded text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Account ID</p>
                  <p className="font-medium text-decode-white text-sm break-all">{accountId}</p>
                </div>
                
                {smartWalletId && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Smart Wallet ID</p>
                    <p className="font-medium text-decode-white text-sm break-all">{smartWalletId}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-xs text-gray-400 mb-1">Balance</p>
                  <p className="font-medium text-decode-white text-sm">{balance || '0'} HBAR</p>
                </div>
                
                {!smartWalletId && (
                  <button
                    onClick={handleCreateSmartWallet}
                    disabled={isLoading}
                    className="decode-button w-full text-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Creating...' : 'Create Smart Wallet'}
                  </button>
                )}
                
                <button
                  onClick={disconnectWallet}
                  className="decode-button-secondary w-full text-sm"
                >
                  Disconnect
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={connectWallet}
          disabled={isLoading}
          className="decode-button text-sm whitespace-nowrap"
        >
          {isLoading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
      
      {isConnected && smartWalletId && (
        <div className="absolute right-0 top-full mt-2 p-3 decode-card border border-decode-green/30 text-xs rounded-md z-40">
          <div className="flex items-center gap-2 mb-1 text-decode-green">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="font-medium">Account Abstraction Enabled</p>
          </div>
          <p className="text-gray-400">Transactions will be executed through your smart contract wallet for enhanced security and usability.</p>
        </div>
      )}
    </div>
  );
};

export default WalletConnection; 
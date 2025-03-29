'use client';

import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';

const GuardianManager: React.FC = () => {
  const { 
    isConnected,
    smartWalletId,
    guardians,
    addGuardian,
    removeGuardian,
    initiateRecovery,
    approveRecovery,
    cancelRecovery,
    recoveryInProgress,
    recoveryInitiator,
    proposedNewOwner,
    isLoading,
    error
  } = useWallet();
  
  const [newGuardianAddress, setNewGuardianAddress] = useState('');
  const [walletToRecover, setWalletToRecover] = useState('');
  const [newOwnerAddress, setNewOwnerAddress] = useState('');
  const [showRecoveryForm, setShowRecoveryForm] = useState(false);
  const [showApproveForm, setShowApproveForm] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  
  const handleAddGuardian = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuardianAddress) return;
    
    try {
      const success = await addGuardian(newGuardianAddress);
      if (success) {
        setStatusMessage('Guardian added successfully');
        setNewGuardianAddress('');
      }
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    }
  };
  
  const handleRemoveGuardian = async (guardianAddress: string) => {
    try {
      const success = await removeGuardian(guardianAddress);
      if (success) {
        setStatusMessage('Guardian removed successfully');
      }
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    }
  };
  
  const handleInitiateRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOwnerAddress) return;
    
    try {
      const success = await initiateRecovery(newOwnerAddress);
      if (success) {
        setStatusMessage('Recovery initiated successfully');
        setShowRecoveryForm(false);
        setNewOwnerAddress('');
      }
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    }
  };
  
  const handleApproveRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletToRecover || !newOwnerAddress) return;
    
    try {
      const success = await approveRecovery(walletToRecover, newOwnerAddress);
      if (success) {
        setStatusMessage('Recovery approved');
        setShowApproveForm(false);
        setWalletToRecover('');
        setNewOwnerAddress('');
      }
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    }
  };
  
  const handleCancelRecovery = async () => {
    try {
      const success = await cancelRecovery();
      if (success) {
        setStatusMessage('Recovery canceled');
      }
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    }
  };
  
  if (!isConnected) {
    return (
      <div className="p-4 bg-white dark:bg-primary-900 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold text-primary-900 dark:text-white mb-4">
          Guardian Management
        </h3>
        <p className="text-primary-600 dark:text-primary-400">
          Connect your wallet to manage guardians.
        </p>
      </div>
    );
  }
  
  if (!smartWalletId) {
    return (
      <div className="p-4 bg-white dark:bg-primary-900 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold text-primary-900 dark:text-white mb-4">
          Guardian Management
        </h3>
        <p className="text-primary-600 dark:text-primary-400">
          Create a smart wallet first to manage guardians.
        </p>
      </div>
    );
  }
  
  return (
    <div className="p-4 bg-white dark:bg-primary-900 rounded-xl shadow-md">
      <h3 className="text-lg font-semibold text-primary-900 dark:text-white mb-4">
        Guardian Management
      </h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {statusMessage && (
        <div className={`mb-4 p-3 rounded-md text-sm ${
          statusMessage.startsWith('Error')
            ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
            : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
        }`}>
          {statusMessage}
          <button 
            className="ml-2 text-xs hover:underline"
            onClick={() => setStatusMessage(null)}
          >
            Dismiss
          </button>
        </div>
      )}
      
      {recoveryInProgress && (
        <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-md text-sm">
          <p className="font-medium">Recovery In Progress</p>
          <p>Initiated by: {recoveryInitiator}</p>
          <p>New owner: {proposedNewOwner}</p>
          <button
            onClick={handleCancelRecovery}
            disabled={isLoading}
            className="mt-2 py-1 px-3 rounded-md bg-red-500 hover:bg-red-600 text-white text-xs font-medium disabled:opacity-50"
          >
            Cancel Recovery
          </button>
        </div>
      )}
      
      <div className="mb-6">
        <h4 className="text-md font-medium text-primary-900 dark:text-white mb-2">
          Current Guardians
        </h4>
        {guardians.length === 0 ? (
          <p className="text-primary-600 dark:text-primary-400 text-sm">
            No guardians added yet. Add guardians to enable social recovery.
          </p>
        ) : (
          <ul className="space-y-2">
            {guardians.map((guardian, index) => (
              <li key={index} className="flex justify-between items-center p-2 bg-primary-50 dark:bg-primary-800 rounded-md">
                <span className="text-primary-900 dark:text-primary-200 text-sm">
                  {guardian}
                </span>
                <button
                  onClick={() => handleRemoveGuardian(guardian)}
                  disabled={isLoading}
                  className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <form onSubmit={handleAddGuardian} className="mb-6">
        <h4 className="text-md font-medium text-primary-900 dark:text-white mb-2">
          Add Guardian
        </h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={newGuardianAddress}
            onChange={(e) => setNewGuardianAddress(e.target.value)}
            placeholder="Guardian account ID"
            className="flex-grow px-3 py-2 border border-primary-200 dark:border-primary-700 rounded-md bg-white dark:bg-primary-800 text-primary-900 dark:text-primary-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            disabled={isLoading || !newGuardianAddress}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium disabled:opacity-50"
          >
            Add
          </button>
        </div>
        <p className="mt-1 text-xs text-primary-500 dark:text-primary-400">
          Add trusted friends or family members who can help recover your wallet.
        </p>
      </form>
      
      <div className="border-t border-primary-100 dark:border-primary-800 pt-4 mb-4">
        <h4 className="text-md font-medium text-primary-900 dark:text-white mb-2">
          Wallet Recovery
        </h4>
        
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => setShowRecoveryForm(!showRecoveryForm)}
            className="text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 text-left"
          >
            {showRecoveryForm ? '▼ Hide recovery form' : '▶ Initiate recovery for another wallet'}
          </button>
          
          {showRecoveryForm && (
            <form onSubmit={handleInitiateRecovery} className="p-3 bg-primary-50 dark:bg-primary-800 rounded-md">
              <div className="mb-3">
                <label className="block text-xs text-primary-700 dark:text-primary-300 mb-1">
                  New Owner Address
                </label>
                <input
                  type="text"
                  value={newOwnerAddress}
                  onChange={(e) => setNewOwnerAddress(e.target.value)}
                  placeholder="New owner account ID"
                  className="w-full px-3 py-2 border border-primary-200 dark:border-primary-700 rounded-md bg-white dark:bg-primary-700 text-primary-900 dark:text-primary-200 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !newOwnerAddress}
                className="w-full py-2 bg-secondary-600 hover:bg-secondary-700 text-white rounded-md text-sm font-medium disabled:opacity-50"
              >
                Initiate Recovery
              </button>
            </form>
          )}
          
          <button
            onClick={() => setShowApproveForm(!showApproveForm)}
            className="text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 text-left"
          >
            {showApproveForm ? '▼ Hide approval form' : '▶ Approve recovery as guardian'}
          </button>
          
          {showApproveForm && (
            <form onSubmit={handleApproveRecovery} className="p-3 bg-primary-50 dark:bg-primary-800 rounded-md">
              <div className="mb-3">
                <label className="block text-xs text-primary-700 dark:text-primary-300 mb-1">
                  Wallet to Recover
                </label>
                <input
                  type="text"
                  value={walletToRecover}
                  onChange={(e) => setWalletToRecover(e.target.value)}
                  placeholder="Smart wallet ID"
                  className="w-full px-3 py-2 border border-primary-200 dark:border-primary-700 rounded-md bg-white dark:bg-primary-700 text-primary-900 dark:text-primary-200 text-sm"
                />
              </div>
              <div className="mb-3">
                <label className="block text-xs text-primary-700 dark:text-primary-300 mb-1">
                  New Owner Address
                </label>
                <input
                  type="text"
                  value={newOwnerAddress}
                  onChange={(e) => setNewOwnerAddress(e.target.value)}
                  placeholder="New owner account ID"
                  className="w-full px-3 py-2 border border-primary-200 dark:border-primary-700 rounded-md bg-white dark:bg-primary-700 text-primary-900 dark:text-primary-200 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !walletToRecover || !newOwnerAddress}
                className="w-full py-2 bg-secondary-600 hover:bg-secondary-700 text-white rounded-md text-sm font-medium disabled:opacity-50"
              >
                Approve Recovery
              </button>
            </form>
          )}
        </div>
      </div>
      
      <div className="text-xs text-primary-500 dark:text-primary-400 pt-2 border-t border-primary-100 dark:border-primary-800">
        <p className="mb-1">About social recovery:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Add multiple guardians to secure your wallet</li>
          <li>If you lose access, guardians can help recover it</li>
          <li>Multiple guardians must approve recovery (threshold-based)</li>
          <li>Recovery process has a time-lock for security</li>
        </ul>
      </div>
    </div>
  );
};

export default GuardianManager; 
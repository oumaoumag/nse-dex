'use client';

import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';

interface MarketplaceItemProps {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
  image: string;
}

const MarketplaceItem: React.FC<MarketplaceItemProps> = ({
  id,
  name,
  symbol,
  price,
  change,
  image,
}) => {
  const { isConnected, smartWalletId, executeTransaction, isLoading } = useWallet();
  const [quantity, setQuantity] = useState<number>(1);
  const [transactionStatus, setTransactionStatus] = useState<string | null>(null);

  const handleBuy = async () => {
    if (!isConnected || !smartWalletId) {
      setTransactionStatus('Please connect your wallet and create a smart wallet first');
      return;
    }

    try {
      setTransactionStatus('Processing transaction...');

      // This is where account abstraction kicks in - the transaction goes through the smart wallet
      // The gas fees can be paid by the platform or the user's wallet contract
      const result = await executeTransaction(
        process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ID || '',
        'purchaseToken',
        [id, quantity.toString()],
        price * quantity // value to send with transaction
      );

      setTransactionStatus('Transaction completed successfully!');
      console.log('Transaction result:', result);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setTransactionStatus(null);
      }, 3000);
    } catch (error: any) {
      setTransactionStatus(`Transaction failed: ${error.message}`);
      console.error('Purchase failed:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-primary-900 rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
      <div className="relative h-48 bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
        <img
          src={image}
          alt={name}
          className="object-contain h-32 w-32"
        />
        {change > 0 ? (
          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            +{change}%
          </div>
        ) : (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {change}%
          </div>
        )}
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold text-primary-900 dark:text-white">{name}</h3>
          <span className="text-sm font-medium bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-primary-300 px-2 py-1 rounded">
            {symbol}
          </span>
        </div>
        
        <p className="text-2xl font-bold text-primary-900 dark:text-white mb-4">
          ${price.toFixed(2)}
        </p>
        
        <div className="flex items-center mb-4">
          <button 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-primary-300 p-1 rounded-l-md"
          >
            -
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-16 text-center border-y border-primary-100 dark:border-primary-800 py-1 bg-white dark:bg-primary-900 text-primary-900 dark:text-white"
          />
          <button 
            onClick={() => setQuantity(quantity + 1)}
            className="bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-primary-300 p-1 rounded-r-md"
          >
            +
          </button>
          <span className="ml-2 text-primary-600 dark:text-primary-400">
            Total: ${(price * quantity).toFixed(2)}
          </span>
        </div>
        
        {transactionStatus && (
          <div className={`mb-4 p-2 rounded text-sm ${
            transactionStatus.includes('failed') || transactionStatus.includes('Please connect')
              ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
              : transactionStatus.includes('completed')
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
          }`}>
            {transactionStatus}
          </div>
        )}
        
        <button
          onClick={handleBuy}
          disabled={isLoading}
          className="w-full py-2 rounded-md bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium hover:from-primary-700 hover:to-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? 'Processing...' : 'Buy Now'}
        </button>
        
        {smartWalletId && (
          <p className="mt-2 text-xs text-primary-600 dark:text-primary-400">
            ✓ Gas fees optimized with account abstraction
          </p>
        )}
      </div>
    </div>
  );
};

export default MarketplaceItem; 
'use client';

import React from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function WalletConnection() {
  const { 
    isConnected, 
    address, 
    balance, 
    smartWalletId,
    isSmartWallet
  } = useWallet();

  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  const handleSignIn = () => {
    signIn('google');
  };

  const handleSignOut = () => {
    signOut();
  };

  // Format balance with commas and truncate to max 6 decimal places
  const formatBalance = (bal: number) => {
    return bal.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6
    });
  };

  // Truncate wallet address for display
  const truncateAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-3 items-center">
      {!isAuthenticated ? (
        <Button
          onClick={handleSignIn}
          variant="primary"
          className="w-full lg:w-auto"
        >
          Sign in with Google
        </Button>
      ) : !isConnected ? (
        <div className="bg-yellow-500/10 text-yellow-400 px-4 py-2 rounded-md text-sm">
          Setting up your wallet...
        </div>
      ) : (
            <TooltipProvider>
              <Card className="bg-decode-black border border-decode-green/20 p-2 rounded-lg flex items-center gap-3 w-full lg:w-auto">
                <Badge variant="secondary" className="bg-decode-green/20 text-decode-green text-xs px-2 py-0.5">
                  {isSmartWallet ? 'Smart Wallet' : 'Wallet'}
                </Badge>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-pointer text-sm text-gray-300">
                      {truncateAddress(address)}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{address}</p>
                  </TooltipContent>
                </Tooltip>

                <div className="border-l border-decode-green/20 pl-3 text-sm">
                  <span className="text-gray-400">Balance:</span> <span className="text-decode-white font-medium">{formatBalance(balance)} HBAR</span>
            </div>

                <div className="ml-auto">
                  <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-md text-gray-400 hover:text-white hover:bg-decode-red/20"
              >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                  </Button>
                </div>
              </Card>
            </TooltipProvider>
      )}
    </div>
  );
} 
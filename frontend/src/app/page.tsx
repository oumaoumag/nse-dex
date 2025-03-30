'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useWallet } from '@/contexts/WalletContext';

export default function HomePage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const { isConnected, connect } = useWallet();

    useEffect(() => {
        // Check authentication status
        if (status === 'loading') {
            return; // Wait for session to load
        }
        
        if (!session) {
            // Redirect to login if not authenticated
            router.push('/auth/login');
            return;
        }
        
        // If authenticated but wallet not connected, auto-connect wallet
        if (!isConnected) {
            connect();
        }

        // Redirect to marketplace when authenticated and wallet is connected
        if (session && isConnected) {
            router.push('/marketplace');
        }
    }, [isConnected, router, connect, session, status]);

  return (
      <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center max-w-3xl mx-auto p-6">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  <span className="decode-gradient bg-clip-text text-transparent">Tajiri</span>
              </h1>
              <p className="text-xl mb-8">
                  Tokenized stock trading platform
              </p>
              <div className="w-10 h-10 border-4 border-decode-green border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-6 text-decode-white/70">
                  {status === 'loading' ? 'Loading...' : 
                   session ? 'Setting up your wallet...' : 
                   'Redirecting to login...'}
              </p>
      </div>
    </div>
  );
} 
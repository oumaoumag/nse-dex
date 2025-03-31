'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useWallet } from '@/contexts/WalletContext';

export default function HomePage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const { isConnected, smartWalletId } = useWallet();

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
        
        // Redirect to marketplace when authenticated
        // The wallet will be automatically created by the SmartWalletManager
        if (session) {
            router.push('/marketplace');
        }
    }, [router, session, status]);

  return (
      <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center max-w-3xl mx-auto p-6">
              <h1 className="text-3xl md:text-4xl font-bold text-primary-900 dark:text-white mb-4">
                  <span className="bg-gradient-to-r from-primary-600 to-secondary-500 inline-block text-transparent bg-clip-text">Tajiri</span>
              </h1>
              <p className="text-xl mb-8">
                  Tokenized stock trading platform
              </p>
              <div className="w-10 h-10 border-4 border-decode-green border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-6 text-decode-white/70">
                  {status === 'loading' ? 'Loading...' : 
                      session ? 'Setting up your session...' : 
                   'Redirecting to login...'}
              </p>
      </div>
    </div>
  );
} 
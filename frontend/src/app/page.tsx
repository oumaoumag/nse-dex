'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';

export default function HomePage() {
    const router = useRouter();
    const { isConnected, connect } = useWallet();

    useEffect(() => {
        // Auto-connect wallet without user prompt
        if (!isConnected) {
            connect();
        }

        // Redirect when connected
        if (isConnected) {
            router.push('/marketplace');
        }
    }, [isConnected, router, connect]);

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
              <p className="mt-6 text-decode-white/70">Setting up your account...</p>
      </div>
    </div>
  );
} 
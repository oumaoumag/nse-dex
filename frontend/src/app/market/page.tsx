'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MarketDataDisplay from '@/components/MarketDataDisplay';
import Link from 'next/link';

export default function MarketPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to the unified marketplace with the market tab
        router.replace('/marketplace?tab=market');
    }, [router]);

    // Show loading state while redirecting
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-decode-green mx-auto mb-4"></div>
                <p className="text-primary-900 dark:text-white">Redirecting to Finance Hub...</p>
            </div>
        </div>
    );
} 
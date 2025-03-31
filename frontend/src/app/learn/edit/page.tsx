'use client';

import ArticleEditor from '@/components/ArticleEditor';
import { useWallet } from '@/contexts/WalletContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function EditArticlePage() {
    const { isConnected, isAdmin } = useWallet();
    const router = useRouter();

    // Check if user is authenticated and has admin privileges
    useEffect(() => {
        // In a real app, you would check if the user has admin privileges
        // For now, we'll just check if they're connected
        if (!isConnected) {
            router.push('/auth/login?callbackUrl=/learn/edit');
        }
    }, [isConnected, router]);

    // If not connected, show loading state
    if (!isConnected) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-16 text-center">
                <div className="animate-pulse">
                    <div className="h-8 bg-white/10 rounded w-1/3 mx-auto mb-8"></div>
                    <div className="h-4 bg-white/10 rounded w-2/3 mx-auto mb-4"></div>
                    <div className="h-4 bg-white/10 rounded w-1/2 mx-auto"></div>
                </div>
            </div>
        );
    }

    return <ArticleEditor />;
} 
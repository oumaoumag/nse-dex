'use client';

import Lending from '@/components/Lending';
import { LendingProvider } from '@/contexts/LendingContext';

export default function LendPage() {
    return (
        <LendingProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Lending />
            </div>
        </LendingProvider>
    );
} 
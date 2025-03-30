'use client';

import Educational from '@/components/Educational';

export default function LearnPage() {
    return (
        
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-primary-900 dark:text-white mb-4">
            Educational <span className="bg-gradient-to-r from-primary-600 to-secondary-500 inline-block text-transparent bg-clip-text"> Resources</span>
        </h1>     
            <div className="bg-decode-card p-6 rounded-xl">
                <Educational />
            </div>
        </div>
    );
} 

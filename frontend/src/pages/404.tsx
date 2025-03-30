import React from 'react';
import Link from 'next/link';

export default function Custom404() {
    return (
        <div className="min-h-screen bg-decode-black flex flex-col items-center justify-center px-4">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-decode-green mb-4">404 - Page Not Found</h1>
                <p className="text-decode-white text-lg mb-8">
                    Sorry, the page you are looking for does not exist.
                </p>
                <Link
                    href="/"
                    className="bg-decode-green text-decode-black px-6 py-3 rounded-md font-medium hover:bg-decode-green/90 transition-colors"
                >
                    Return Home
                </Link>
            </div>
        </div>
    );
} 
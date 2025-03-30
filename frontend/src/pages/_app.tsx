import React from 'react';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { WalletProvider } from '../contexts/WalletContext';
import { TokenProvider } from '../contexts/TokenContext';
import { AuthProvider } from '../contexts/AuthContext';
import '../styles/globals.css';

// This custom App component ensures proper provider structure
export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
    return (
        <SessionProvider session={session}>
            <AuthProvider>
                <WalletProvider>
                    <TokenProvider>
                        <Component {...pageProps} />
                    </TokenProvider>
                </WalletProvider>
            </AuthProvider>
        </SessionProvider>
    );
} 
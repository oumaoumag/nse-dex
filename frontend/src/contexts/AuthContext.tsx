import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from './WalletContext';

interface User {
    accountId: string;
    email?: string;
    name?: string;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { accountId, isConnected } = useWallet();

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                setIsLoading(true);
                setError(null);

                if (isConnected && accountId) {
                    // TODO: Fetch additional user data from your backend
                    setUser({
                        accountId,
                        // Add other user data as needed
                    });
                } else {
                    setUser(null);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to initialize authentication');
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, [isConnected, accountId]);

    const value = {
        user,
        isLoading,
        error,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
} 
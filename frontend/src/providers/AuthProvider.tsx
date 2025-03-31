'use client';

import { SessionProvider } from 'next-auth/react';
import { SmartWalletManager } from '@/components/SmartWalletManager';

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <SmartWalletManager />
      {children}
    </SessionProvider>
  );
}

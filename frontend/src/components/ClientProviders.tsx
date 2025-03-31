'use client';

import { SessionProvider } from "next-auth/react";
import AuthProvider from "@/providers/AuthProvider";
import NotificationProvider from "@/components/NotificationProvider";
import { WalletProvider } from '@/contexts/WalletContext';
import { StockProvider } from '@/contexts/StockContext';
import { LendingProvider } from '@/contexts/LendingContext';
import WalletLayout from "@/components/WalletLayout";
import { Toaster as HotToaster } from 'react-hot-toast';
import { Toaster } from '@/components/ui/toaster';
import Header from "@/components/Header";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <NotificationProvider>
        <WalletProvider>
          <AuthProvider>
            <StockProvider>
              <LendingProvider>
                <WalletLayout>
                  <Header />
                  {children}
                  <HotToaster position="top-right" />
                  <Toaster />
                </WalletLayout>
              </LendingProvider>
            </StockProvider>
          </AuthProvider>
        </WalletProvider>
      </NotificationProvider>
    </SessionProvider>
  );
}

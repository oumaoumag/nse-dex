'use client';

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

type AuthProviderProps = {
  children: ReactNode;
};

/**
 * AuthProvider component that wraps the application with NextAuth SessionProvider
 * This makes authentication state available throughout the app
 */
export function AuthProvider({ children }: AuthProviderProps) {
  return <SessionProvider>{children}</SessionProvider>;
}

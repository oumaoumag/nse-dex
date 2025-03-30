'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If authenticated, redirect to the marketplace
    if (status === 'authenticated') {
      router.push('/marketplace');
    }
  }, [status, router]);

  // Don't wrap with SessionProvider since it's already in the root layout
  return (
    <div className="min-h-screen bg-decode-black">
      {children}
    </div>
  );
}

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useWallet } from '@/contexts/WalletContext';
import { useSession } from 'next-auth/react';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import HeroSection from '@/components/ui/HeroSection';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardTitle } from '@/components/ui/Card';
import StatusIndicator from '@/components/ui/StatusIndicator';

export default function Home() {
  const { connectWallet, isLoading, isConnected } = useWallet();
  const { data: session } = useSession();

  const handleConnectWallet = (e: React.MouseEvent) => {
    e.preventDefault();
    connectWallet();
  };

  // Feature icons and data
  const features = [
    {
      icon: (
        <svg className="h-6 w-6 text-decode-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Smart Contract Security',
      description: 'Our smart wallets are built with security-first approach, ensuring your assets are protected with multi-layer security measures.',
    },
    {
      icon: (
        <svg className="h-6 w-6 text-decode-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Gas Fee Abstraction',
      description: 'No more worrying about gas fees. Our account abstraction system handles transaction costs, making trading seamless.',
    },
    {
      icon: (
        <svg className="h-6 w-6 text-decode-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Social Recovery',
      description: 'Never lose access to your funds. Our guardian-based recovery system ensures you can always regain access to your wallet.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with consistent styling using the HeroSection component */}
      <HeroSection
        title="TRADE KENYAN STOCKS ON HEDERA"
        highlightedWord="STOCKS"
        description="Connect your wallet and trade tokenized stocks from Nairobi Securities Exchange (NSE), making investing accessible to everyone through blockchain technology."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              {!isConnected && (
                <Button
                  onClick={handleConnectWallet}
                  disabled={isLoading}
                  loading={isLoading}
                  variant="primary"
                >
                  Connect Wallet
                </Button>
              )}
              <div className="relative z-10">
                <GoogleLoginButton />
              </div>
              <Button href="/marketplace" variant="secondary">
                Explore Marketplace
              </Button>
            </div>
            {session && !isConnected && (
              <StatusIndicator
                type="info"
                title="Google Account Connected"
                message="You're signed in with Google. Connect your wallet to start trading tokenized stocks."
                className="max-w-md"
              />
            )}
          </div>
          <div className="relative">
            <Card variant="default" padding="large" className="rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-decode-green/20 rounded-full flex items-center justify-center">
                      <svg className="h-5 w-5 text-decode-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <CardTitle>NSE Tokenized</CardTitle>
                  </div>
                  <div className="text-sm text-decode-green">Live</div>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <Card variant="default" padding="small" hover="default" className="rounded-lg transform hover:scale-105 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-gray-400">SCOM</div>
                      <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                        <svg className="h-3 w-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-decode-white">+3.2%</div>
                    <div className="text-xs text-gray-400 mt-1">24h change</div>
                  </Card>
                  <Card variant="default" padding="small" hover="default" className="rounded-lg transform hover:scale-105 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-gray-400">EQTY</div>
                      <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                        <svg className="h-3 w-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-decode-white">+1.7%</div>
                    <div className="text-xs text-gray-400 mt-1">24h change</div>
                  </Card>
                  <Card variant="default" padding="small" hover="default" className="rounded-lg transform hover:scale-105 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-gray-400">KCB</div>
                      <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                        <svg className="h-3 w-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-decode-white">+2.5%</div>
                    <div className="text-xs text-gray-400 mt-1">24h change</div>
                  </Card>
                  <Card variant="default" padding="small" hover="default" className="rounded-lg transform hover:scale-105 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-gray-400">EABL</div>
                      <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                        <svg className="h-3 w-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-decode-white">+1.5%</div>
                    <div className="text-xs text-gray-400 mt-1">24h change</div>
                  </Card>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </HeroSection>

      {/* Features Section */}
      <div className="py-20 bg-decode-black">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="h-1 w-16 bg-decode-green mb-6 mx-auto"></div>
            <h2 className="decode-heading text-3xl md:text-4xl text-decode-white mb-6">ACCOUNT ABSTRACTION AND <span className="text-decode-green">SMART WALLETS</span></h2>
            <p className="text-lg text-gray-400">Experience the full benefits of blockchain technology without the complexity. Our smart wallet system makes trading stocks simple and secure.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} variant="default" padding="large" className="rounded-lg hover:border-decode-green/60 transition-all">
                <div className="h-12 w-12 bg-decode-green/20 rounded-full flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <CardTitle className="mb-4">{feature.title}</CardTitle>
                <p className="text-gray-400">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-br from-decode-black via-decode-black to-black">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="decode-heading text-3xl md:text-5xl text-decode-white mb-8">READY TO START <span className="text-decode-green">TRADING?</span></h2>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">Join thousands of traders already using Tajiri to access the Nairobi Securities Exchange.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isConnected && (
                <Button
                  onClick={handleConnectWallet}
                  disabled={isLoading}
                  loading={isLoading}
                  variant="primary"
                >
                  Connect Wallet
                </Button>
              )}
              <Button href="/learn" variant="secondary">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

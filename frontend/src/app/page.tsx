'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useWallet } from '@/contexts/WalletContext';
import { useSession } from 'next-auth/react';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import HeroSection from '@/components/ui/HeroSection';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import StatusIndicator from '@/components/ui/StatusIndicator';

export default function Home() {
  const { connectWallet, isLoading, isConnected } = useWallet();
  const { data: session } = useSession();

  const handleConnectWallet = (e: React.MouseEvent) => {
    e.preventDefault();
    connectWallet();
  };

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
              <Button asChild variant="secondary">
                <Link href="/marketplace">
                  Explore Marketplace
                </Link>
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
              <div className="decode-card border border-decode-green/30 p-6 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-decode-green/20 rounded-full flex items-center justify-center">
                        <svg className="h-5 w-5 text-decode-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-decode-white">NSE Tokenized</h3>
                    </div>
                    <div className="text-sm text-decode-green">Live</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="decode-card p-4 rounded-lg transform hover:scale-105 transition-all hover:border-decode-green/40">
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
                    </div>
                    <div className="decode-card p-4 rounded-lg transform hover:scale-105 transition-all hover:border-decode-green/40">
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
                    </div>
                    <div className="decode-card p-4 rounded-lg transform hover:scale-105 transition-all hover:border-decode-green/40">
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
                    </div>
                    <div className="decode-card p-4 rounded-lg transform hover:scale-105 transition-all hover:border-decode-green/40">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-gray-400">EABL</div>
                        <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                          <svg className="h-3 w-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                        </div>
                      </div>
                      <div className="text-lg font-semibold text-decode-white">+0.8%</div>
                      <div className="text-xs text-gray-400 mt-1">24h change</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="py-20 bg-white dark:bg-primary-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-primary-900 dark:text-white sm:text-4xl">
              Key <span className="text-secondary-600">Benefits</span>
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-primary-600 dark:text-primary-400">
              Making investing accessible and convenient for everyone
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-primary-50 dark:bg-primary-900 p-8 rounded-xl">
              <h3 className="text-2xl font-bold text-primary-900 dark:text-white mb-4">Buy the best performing shares and stocks</h3>
              <p className="text-primary-600 dark:text-primary-400 mb-4">
                Safaricom, Britam, EABL, KCB, Kakuzi, KPLC, Total Energy, KenGen shares and stocks are all available for trading.
              </p>
            </div>
            <div className="bg-primary-50 dark:bg-primary-900 p-8 rounded-xl">
              <h3 className="text-2xl font-bold text-primary-900 dark:text-white mb-4">Sell at your own convenience</h3>
              <p className="text-primary-600 dark:text-primary-400 mb-4">
                Tajiri boasts a peer to peer online marketplace that is available 24/7 for investors and traders. You can quickly sell your stocks to another person and receive payments in USDC.
              </p>
            </div>
          </div>
          <div className="mt-16 text-center">
            <div className="bg-primary-50 dark:bg-primary-900 p-8 rounded-xl max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-primary-900 dark:text-white mb-4">Make investing available for everyone</h3>
              <p className="text-primary-600 dark:text-primary-400 mb-4">
                In a bid to increase the standards of living in Africa and around the world. We want to make it easier for all individuals to be able to invest their income in financial instruments that give high returns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with rounded cards */}
      <section className="py-20 bg-white dark:bg-primary-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-primary-900 dark:text-white sm:text-4xl">
              Why Choose <span className="text-secondary-600">Tajiri</span>?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-primary-600 dark:text-primary-400">
              Built on Hedera's high-performance blockchain with advanced features for modern investors
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex flex-col rounded-xl border border-primary-100 dark:border-primary-800 p-8 transition-all hover:shadow-xl bg-gradient-to-b from-white to-primary-50 dark:from-primary-900 dark:to-primary-950"
              >
                <div className="rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 p-3 w-12 h-12 flex items-center justify-center text-white mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-primary-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-primary-600 dark:text-primary-400 flex-grow">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section with cards */}
      <section className="py-20 bg-primary-50 dark:bg-primary-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-primary-900 dark:text-white sm:text-4xl">
              Join Thousands of Investors
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-primary-600 dark:text-primary-400">
              Experience the future of stock trading in Africa
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-primary-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-12 w-12 rounded-full flex items-center justify-center text-white font-bold">JM</div>
                <div className="ml-4">
                  <h4 className="font-semibold text-primary-900 dark:text-white">James Mwangi</h4>
                  <p className="text-sm text-primary-500 dark:text-primary-400">Retail Investor</p>
                </div>
              </div>
              <p className="text-primary-600 dark:text-primary-300">"Tajiri has made investing in the NSE so much easier. I love how I can trade fractions of expensive stocks like Safaricom!"</p>
            </div>
            <div className="bg-white dark:bg-primary-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-secondary-500 to-secondary-600 h-12 w-12 rounded-full flex items-center justify-center text-white font-bold">WK</div>
                <div className="ml-4">
                  <h4 className="font-semibold text-primary-900 dark:text-white">Wanjiku Kamau</h4>
                  <p className="text-sm text-primary-500 dark:text-primary-400">Financial Advisor</p>
                </div>
              </div>
              <p className="text-primary-600 dark:text-primary-300">"The lending feature has been a game-changer for my clients. They can now leverage their existing stock portfolios without selling."</p>
            </div>
            <div className="bg-white dark:bg-primary-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-accent-500 to-accent-600 h-12 w-12 rounded-full flex items-center justify-center text-white font-bold">DO</div>
                <div className="ml-4">
                  <h4 className="font-semibold text-primary-900 dark:text-white">David Ochieng</h4>
                  <p className="text-sm text-primary-500 dark:text-primary-400">Tech Entrepreneur</p>
                </div>
              </div>
              <p className="text-primary-600 dark:text-primary-300">"I've tried several trading platforms but Tajiri's user experience is unmatched. The account abstraction makes blockchain transactions seamless."</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with gradient background */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Trading?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join Tajiri today and experience the future of stock trading on the Nairobi Securities Exchange.
          </p>
          <button
            onClick={handleConnectWallet}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-md bg-white px-8 py-3 text-lg font-medium text-primary-600 shadow-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>
      </section>
    </div>
  );
}

// Feature icons and data
const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Powered by Hedera',
    description: 'Built on Hedera Hashgraph for high throughput (10,000 TPS), low fees, and carbon-negative sustainability.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Stablecoin Trading',
    description: 'Purchase and trade tokenized NSE stocks using stablecoins (USDC, USDT) for price stability and convenience.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Account Abstraction',
    description: 'No need to understand blockchain complexities. Our smart contract wallets make transactions easy and intuitive.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Advanced Trading Tools',
    description: 'Access interactive charts, technical analysis, and comprehensive market data to make informed investment decisions.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Lending Protocol',
    description: 'Borrow against your tokenized stocks or lend stablecoins to earn interest, unlocking additional ways to generate returns.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    title: 'Educational Resources',
    description: 'Learn to invest with confidence through our comprehensive educational tools and resources tailored for all experience levels.',
  },
];
'use client';

import React, { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useWallet } from '@/contexts/WalletContext';
import Image from 'next/image';
import Link from 'next/link';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import HeroSection from '@/components/ui/HeroSection';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardTitle } from '@/components/ui/Card';
import StatusIndicator from '@/components/ui/StatusIndicator';

export default function BackupPage() {
  const { data: session, status } = useSession();
  const { isConnected, smartWalletId } = useWallet();
  const [activeTab, setActiveTab] = useState('what');
  const isAuthenticated = status === 'authenticated';

  const handleSignIn = (e: React.MouseEvent) => {
    e.preventDefault();
    signIn('google');
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
    <div className="min-h-screen bg-decode-black text-decode-white">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">
          <span className="decode-gradient bg-clip-text text-transparent">Smart Wallet</span> Backup
        </h1>

        <div className="bg-decode-black/50 border border-decode-green/20 rounded-xl p-6 mb-8">
          <div className="flex border-b border-decode-green/20 mb-6">
            <button
              className={`py-2 px-4 font-medium ${activeTab === 'what' ? 'text-decode-green border-b-2 border-decode-green' : 'text-gray-400'}`}
              onClick={() => setActiveTab('what')}
            >
              What is Backup?
            </button>
            <button
              className={`py-2 px-4 font-medium ${activeTab === 'how' ? 'text-decode-green border-b-2 border-decode-green' : 'text-gray-400'}`}
              onClick={() => setActiveTab('how')}
            >
              How it Works
            </button>
            <button
              className={`py-2 px-4 font-medium ${activeTab === 'setup' ? 'text-decode-green border-b-2 border-decode-green' : 'text-gray-400'}`}
              onClick={() => setActiveTab('setup')}
            >
              Setup Backup
            </button>
          </div>

          {activeTab === 'what' && (
            <div>
              <h2 className="text-xl font-bold mb-4">What is Smart Wallet Backup?</h2>
              <p className="text-gray-300 mb-4">
                Smart wallet backup is a security feature that ensures you never lose access to your assets, even if you lose your primary access method.
              </p>
              <p className="text-gray-300 mb-4">
                Unlike traditional wallets where losing your private key means losing your assets forever, smart wallets allow for social recovery through trusted guardians.
              </p>
              <div className="bg-decode-green/10 border border-decode-green/30 rounded-lg p-4 text-sm my-6">
                <h3 className="text-decode-green font-medium mb-2">Why Backup Matters</h3>
                <p className="text-gray-300">
                  Over 20% of all cryptocurrency (worth billions of dollars) has been permanently lost due to users losing access to their wallets. Smart wallet backup solves this problem.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'how' && (
            <div>
              <h2 className="text-xl font-bold mb-4">How Smart Wallet Backup Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-decode-green/5 border border-decode-green/20 rounded-lg p-4">
                  <div className="w-10 h-10 bg-decode-green/10 rounded-full flex items-center justify-center mb-3">
                    <span className="text-decode-green font-bold">1</span>
                  </div>
                  <h3 className="font-medium mb-2">Add Guardians</h3>
                  <p className="text-sm text-gray-400">
                    You select trusted contacts (friends, family) or devices to serve as your guardians.
                  </p>
                </div>
                <div className="bg-decode-green/5 border border-decode-green/20 rounded-lg p-4">
                  <div className="w-10 h-10 bg-decode-green/10 rounded-full flex items-center justify-center mb-3">
                    <span className="text-decode-green font-bold">2</span>
                  </div>
                  <h3 className="font-medium mb-2">Guardian Approval</h3>
                  <p className="text-sm text-gray-400">
                    If you lose access, a threshold of your guardians must approve your recovery request.
                  </p>
                </div>
                <div className="bg-decode-green/5 border border-decode-green/20 rounded-lg p-4">
                  <div className="w-10 h-10 bg-decode-green/10 rounded-full flex items-center justify-center mb-3">
                    <span className="text-decode-green font-bold">3</span>
                  </div>
                  <h3 className="font-medium mb-2">Regain Access</h3>
                  <p className="text-sm text-gray-400">
                    Once approved, you can restore access to your wallet and all your assets remain safe.
                  </p>
                </div>
              </div>
              <p className="text-gray-300 mb-4">
                All of this happens without any central authority ever holding custody of your assets. You always remain in control, with the guardians only able to help you recover access, not control your funds.
              </p>
            </div>
          )}

          {activeTab === 'setup' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Set Up Your Backup</h2>

              {!isAuthenticated ? (
                <div className="text-center py-8">
                  <p className="text-gray-300 mb-4">
                    You need to sign in first to set up your smart wallet backup.
                  </p>
                  <button
                    className="bg-decode-green hover:bg-decode-green/80 text-white py-3 px-6 rounded-lg font-medium transition duration-300"
                    onClick={handleSignIn}
                  >
                    Sign In to Continue
                  </button>
                </div>
              ) : !smartWalletId ? (
                <div className="text-center py-8">
                  <p className="text-gray-300 mb-4">
                    Your smart wallet is being set up. Please wait a moment before setting up backup.
                  </p>
                  <div className="animate-spin w-8 h-8 border-4 border-decode-green/30 border-t-decode-green rounded-full mx-auto"></div>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-300 mb-6">
                      Follow these steps to set up guardian backup for your smart wallet.
                    </p>

                    <div className="space-y-6">
                      <div className="bg-decode-green/5 border border-decode-green/20 rounded-lg p-4">
                        <h3 className="font-medium mb-2">1. Add Guardian Email</h3>
                        <p className="text-sm text-gray-400 mb-3">
                          Enter the email address of a trusted person who can help you recover your wallet.
                        </p>
                        <div className="flex">
                          <input
                            type="email"
                            placeholder="guardian@example.com"
                            className="bg-decode-black border border-decode-green/30 rounded-l-lg px-4 py-2 flex-grow focus:outline-none focus:border-decode-green"
                          />
                          <button className="bg-decode-green hover:bg-decode-green/80 text-white py-2 px-4 rounded-r-lg font-medium transition duration-300">
                            Add
                          </button>
                      </div>
                    </div>

                        <div className="bg-decode-green/5 border border-decode-green/20 rounded-lg p-4">
                          <h3 className="font-medium mb-2">2. Set Threshold</h3>
                          <p className="text-sm text-gray-400 mb-3">
                            Choose how many guardians need to approve for recovery (recommended: at least 2)
                          </p>
                          <select className="bg-decode-black border border-decode-green/30 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-decode-green">
                            <option value="1">1 guardian (less secure)</option>
                            <option value="2" selected>2 guardians (recommended)</option>
                            <option value="3">3 guardians (high security)</option>
                          </select>
                        </div>

                        <div className="bg-decode-green/5 border border-decode-green/20 rounded-lg p-4">
                          <h3 className="font-medium mb-2">3. Set Recovery Delay</h3>
                          <p className="text-sm text-gray-400 mb-3">
                            Choose a waiting period before recovery completes, giving you time to cancel if unauthorized.
                          </p>
                          <select className="bg-decode-black border border-decode-green/30 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-decode-green">
                            <option value="1">24 hours</option>
                            <option value="2" selected>48 hours (recommended)</option>
                            <option value="3">72 hours</option>
                          </select>
                        </div>

                        <button className="w-full bg-decode-green hover:bg-decode-green/80 text-white py-3 px-6 rounded-lg font-medium transition duration-300">
                          Set Up Guardian Recovery
                        </button>
                      </div>
                    </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-decode-blue/5 border border-decode-blue/20 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Need Help?</h2>
          <p className="text-gray-300 mb-4">
            If you have any questions about setting up your backup or how recovery works, our support team is here to help.
          </p>
          <a href="/support" className="text-decode-blue hover:text-decode-blue/80 font-medium transition duration-300">
            Contact Support →
          </a>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signIn('google', { callbackUrl });
    } catch (error) {
      console.error('Google sign in error:', error);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Auth form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-12 lg:px-8 bg-decode-black">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Image
              src="/assets/logo/tajiri-logo.svg"
              alt="Tajiri Logo"
              width={80}
              height={80}
              className="mb-6"
            />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-primary-900 dark:text-white mb-4 text-center">
            Sign in to <span className="bg-gradient-to-r from-primary-600 to-secondary-500 inline-block text-transparent bg-clip-text">Tajiri</span>
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Tokenized stock trading platform on Hedera
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Google Sign-in button */}
          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex justify-center items-center gap-3 px-4 py-3 bg-white text-gray-800 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-decode-green focus:ring-offset-2 transition-colors border border-gray-300"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                  <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                  <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                  <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                </g>
              </svg>
              <span className="font-medium">Continue with Google</span>
            </button>

            <div className="flex items-center justify-center space-x-2">
              <div className="h-px bg-gray-700 w-full"></div>
              <div className="text-gray-500 whitespace-nowrap px-2">or continue with email</div>
              <div className="h-px bg-gray-700 w-full"></div>
            </div>

            {/* Email Sign-in form */}
            <form className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-decode-black border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-decode-green focus:border-decode-green transition-colors text-white"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-400">
                    Password
                  </label>
                  <div className="text-sm">
                    <Link href="/auth/forgot-password" className="text-decode-green hover:text-decode-green/80">
                      Forgot password?
                    </Link>
                  </div>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-decode-black border border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-decode-green focus:border-decode-green transition-colors text-white"
                  placeholder="Enter your password"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  disabled={loading || !email || !password}
                  className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-decode-green hover:bg-decode-green/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-decode-green transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="text-decode-green hover:text-decode-green/80 font-medium">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Image and info */}
      <div className="hidden lg:flex lg:w-1/2 bg-decode-blue/10 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-decode-black/80 to-decode-blue/40 flex flex-col justify-center items-center p-12">
          <div className="max-w-md text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              Trade tokenized stocks from the Nairobi Securities Exchange
            </h3>
            <p className="text-gray-300">
              Tajiri leverages Hedera's blockchain technology to provide a secure, efficient, and accessible platform for trading tokenized stocks.
            </p>
            
            <div className="mt-8 space-y-4">
              <div className="flex items-start text-left">
                <div className="flex-shrink-0 p-1">
                  <svg className="h-6 w-6 text-decode-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-lg font-semibold text-white">Gas-Free Transactions</h4>
                  <p className="text-gray-400">Smart contract wallets handle transaction fees, eliminating the need for you to hold HBAR for gas.</p>
                </div>
              </div>
              
              <div className="flex items-start text-left">
                <div className="flex-shrink-0 p-1">
                  <svg className="h-6 w-6 text-decode-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-lg font-semibold text-white">Enhanced Security</h4>
                  <p className="text-gray-400">Account abstraction with social recovery protects your assets if you lose access to your account.</p>
                </div>
              </div>
              
              <div className="flex items-start text-left">
                <div className="flex-shrink-0 p-1">
                  <svg className="h-6 w-6 text-decode-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-lg font-semibold text-white">Simple Trading Experience</h4>
                  <p className="text-gray-400">Trade stocks just like on traditional platforms, without needing to understand blockchain complexities.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

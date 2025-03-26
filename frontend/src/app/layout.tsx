import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Tajiri - Tokenized Stock Trading on Hedera",
  description: "A blockchain-based financial platform for tokenizing and trading stocks from the Nairobi Securities Exchange (NSE).",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        <header className="sticky top-0 z-50 w-full border-b border-primary-100 bg-white/90 backdrop-blur-sm dark:border-primary-900 dark:bg-primary-950/90">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                <img src="/assets/logo/tajiri-logo.svg" alt="Tajiri Logo" className="h-8" />
                <span className="text-xl font-bold text-primary-800 dark:text-primary-100 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Tajiri</span>
              </Link>
            </div>
            <nav className="flex items-center gap-4 md:gap-6">
              <Link href="/marketplace" className="text-sm font-medium text-primary-800 dark:text-primary-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                How it works
              </Link>
              <Link href="/marketplace" className="text-sm font-medium text-primary-800 dark:text-primary-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                P2P market
              </Link>
              <Link href="/marketplace" className="text-sm font-medium text-primary-800 dark:text-primary-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Mint
              </Link>
              <Link href="/marketplace" className="text-sm font-medium text-primary-800 dark:text-primary-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Redeem
              </Link>
              <Link 
                href="/marketplace" 
                className="rounded-md bg-gradient-to-r from-primary-600 to-secondary-600 px-5 py-2 text-sm font-medium text-white hover:from-primary-700 hover:to-secondary-700 transition-all shadow-sm"
              >
                Connect Wallet
              </Link>
            </nav>
          </div>
        </header>
        <main>
          {children}
        </main>
        <footer className="border-t border-primary-100 py-8 dark:border-primary-900 bg-primary-50 dark:bg-primary-950">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-primary-800 dark:text-primary-200">About Tajiri</h3>
                <p className="text-sm text-primary-600 dark:text-primary-400">
                  A blockchain-based financial platform that tokenizes and trades stocks from the Nairobi Securities Exchange (NSE).
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 text-primary-800 dark:text-primary-200">Quick Links</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/" className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200">Home</Link></li>
                  <li><Link href="/about" className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200">About</Link></li>
                  <li><Link href="/marketplace" className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200">Marketplace</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 text-primary-800 dark:text-primary-200">Contact</h3>
                <p className="text-sm text-primary-600 dark:text-primary-400">
                  For inquiries, please contact us at <a href="mailto:info@tajiri.co.ke" className="text-secondary-600 hover:text-secondary-700">info@tajiri.co.ke</a>
                </p>
              </div>
            </div>
            <div className="pt-8 border-t border-primary-100 dark:border-primary-900 text-center text-sm text-primary-500 dark:text-primary-500">
              <p>© {new Date().getFullYear()} Tajiri. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

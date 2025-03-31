'use client';

import WalletDebugger from '@/components/WalletDebugger';

export default function DebugPage() {
    return (
        <div className="min-h-screen bg-decode-black text-decode-white">
            <div className="container mx-auto px-4 py-12">
                <h1 className="text-3xl md:text-4xl font-bold mb-8">
                    <span className="decode-gradient bg-clip-text text-transparent">Wallet</span> Debugger
                </h1>

                <WalletDebugger />

                <div className="bg-decode-blue/5 border border-decode-blue/20 rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-4">Common Issues</h2>

                    <div className="space-y-4">
                        <div className="bg-decode-blue/10 border border-decode-blue/20 rounded-lg p-4">
                            <h3 className="font-medium mb-2">Network Connectivity</h3>
                            <p className="text-gray-300 text-sm">
                                If network connectivity is failing, the application may not be able to reach the Hedera network.
                                This could be due to internet connectivity issues or Hedera network outages.
                            </p>
                        </div>

                        <div className="bg-decode-blue/10 border border-decode-blue/20 rounded-lg p-4">
                            <h3 className="font-medium mb-2">Smart Contract Timeouts</h3>
                            <p className="text-gray-300 text-sm">
                                Wallet creation might be timing out if the Hedera network is congested or if the gas fees
                                are insufficient. The retry button will attempt creation with increased timeout.
                            </p>
                        </div>

                        <div className="bg-decode-blue/10 border border-decode-blue/20 rounded-lg p-4">
                            <h3 className="font-medium mb-2">Environment Variables</h3>
                            <p className="text-gray-300 text-sm">
                                Check that all required environment variables are correctly set in your .env.local file,
                                especially NEXT_PUBLIC_SMART_WALLET_FACTORY_ADDRESS and NEXT_PUBLIC_MY_ACCOUNT_ID.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 
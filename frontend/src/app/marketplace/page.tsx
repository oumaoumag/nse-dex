import Link from 'next/link';

export default function MarketplacePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-primary-900 dark:text-white">
          <span className="bg-gradient-to-r from-primary-600 to-secondary-500 inline-block text-transparent bg-clip-text">Trading Marketplace</span>
        </h1>
        <p className="mb-8 text-primary-600 dark:text-primary-300 max-w-2xl mx-auto">
          The trading marketplace is coming soon. Here you will be able to buy, sell, and trade tokenized NSE stocks.
        </p>
      </div>
      
      <div className="max-w-3xl mx-auto bg-gradient-to-b from-primary-50 to-white dark:from-primary-900 dark:to-primary-950 p-8 rounded-2xl border border-primary-100 dark:border-primary-800 shadow-xl">
        <div className="flex items-center mb-6">
          <div className="rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 p-3 w-12 h-12 flex items-center justify-center text-white mr-5">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-primary-900 dark:text-white">Coming Soon</h2>
        </div>
        
        <p className="text-primary-700 dark:text-primary-300 mb-6">
          We're currently developing the trading marketplace. Check back soon for access to:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {features.map((feature, index) => (
            <div key={index} className="flex p-4 rounded-xl bg-white dark:bg-primary-800 shadow-sm">
              <div className="rounded-full bg-primary-100 dark:bg-primary-700 p-2 mr-4 text-primary-600 dark:text-primary-300 self-start">
                {feature.icon}
              </div>
              <div>
                <h3 className="font-medium text-primary-900 dark:text-white mb-1">{feature.name}</h3>
                <p className="text-sm text-primary-600 dark:text-primary-400">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-primary-600 dark:text-primary-400 mb-6">Want to know when we launch? Join our waitlist for early access.</p>
          <Link 
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-primary-600 to-secondary-600 px-6 py-3 text-base font-medium text-white shadow-lg hover:from-primary-700 hover:to-secondary-700 transition-all"
          >
            Return Home
          </Link>
        </div>
      </div>
      
      <div className="mt-16 p-6 rounded-xl bg-primary-50 dark:bg-primary-900/30 max-w-4xl mx-auto">
        <h3 className="text-xl font-semibold text-primary-900 dark:text-white mb-4">Why tokenized trading?</h3>
        <ul className="space-y-3">
          <li className="flex items-start">
            <svg className="w-5 h-5 text-secondary-500 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-primary-700 dark:text-primary-300">Fractional ownership allows you to invest in expensive stocks with any amount</span>
          </li>
          <li className="flex items-start">
            <svg className="w-5 h-5 text-secondary-500 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-primary-700 dark:text-primary-300">24/7 trading with no market hours limitations</span>
          </li>
          <li className="flex items-start">
            <svg className="w-5 h-5 text-secondary-500 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-primary-700 dark:text-primary-300">Lower fees and faster settlement than traditional stock brokers</span>
          </li>
          <li className="flex items-start">
            <svg className="w-5 h-5 text-secondary-500 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-primary-700 dark:text-primary-300">Use your tokenized stocks as collateral for loans in our lending protocol</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

const features = [
  {
    name: 'Tokenized NSE Stocks',
    description: 'Trade digital representations of popular NSE stocks like Safaricom, Equity Bank, and more.',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    name: 'Stablecoin Trading Pairs',
    description: 'Buy and sell stocks using USDC and USDT stablecoins for price stability.',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    name: 'Interactive Price Charts',
    description: 'Advanced charting tools with technical indicators for informed decision making.',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
    ),
  },
  {
    name: 'Lending & Borrowing',
    description: 'Earn interest by lending or use your stocks as collateral for loans.',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
]; 
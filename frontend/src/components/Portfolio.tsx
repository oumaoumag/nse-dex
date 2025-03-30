'use client';

import React, { useState, useEffect } from 'react';
import { useStock } from '../contexts/StockContext';
import { useWallet } from '../contexts/WalletContext';
import { Stock, calculateUsdValue } from '@/types/stock';
import { SUPPORTED_TOKENS } from '@/services/stablecoinService';

// Performance data structure for historical performance tracking
interface PerformanceData {
  timestamp: number;
  totalValue: number;
  portfolioChange: number; // Percentage change
}

const Portfolio: React.FC = () => {
  const { stocks, userBalances, stablecoinBalances, exchangeRate, isLoading } = useStock();
  const { isConnected, accountId, balance } = useWallet();

  // Mock historical performance data (in a real app, this would come from an API or database)
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceData[]>([]);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d');
  const [portfolioValue, setPortfolioValue] = useState<number>(0);
  const [portfolioGrowth, setPortfolioGrowth] = useState<number>(0);

  // Generate mock performance data
  useEffect(() => {
    if (!isConnected) return;

    // This is mock data - in a real app, this would be replaced with actual historical data
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const data: PerformanceData[] = [];

    // Generate data points
    let points = 0;
    let startValue = 0;

    switch (timeRange) {
      case '24h':
        points = 24; // Hourly data points
        startValue = calculatePortfolioValue() * 0.99; // 1% lower than current
        break;
      case '7d':
        points = 7; // Daily data points
        startValue = calculatePortfolioValue() * 0.92; // 8% lower than current
        break;
      case '30d':
        points = 30; // Daily data points
        startValue = calculatePortfolioValue() * 0.85; // 15% lower than current
        break;
      case 'all':
        points = 90; // Every 3 days for a quarter
        startValue = calculatePortfolioValue() * 0.7; // 30% lower than current
        break;
    }

    // Create a smooth growth curve with some random fluctuations
    for (let i = 0; i < points; i++) {
      const progress = i / (points - 1);
      const baseValue = startValue + (calculatePortfolioValue() - startValue) * progress;

      // Add some random fluctuation (-3% to +3%)
      const fluctuation = baseValue * (Math.random() * 0.06 - 0.03);
      const totalValue = baseValue + fluctuation;

      // Calculate change from previous point
      const prevValue = i > 0 ? data[i - 1].totalValue : startValue;
      const change = ((totalValue - prevValue) / prevValue) * 100;

      data.push({
        timestamp: now - (points - i) * (oneDayMs / (timeRange === '24h' ? 24 : 1)),
        totalValue,
        portfolioChange: change
      });
    }

    setPerformanceHistory(data);

    // Set current portfolio value and growth
    const currentValue = calculatePortfolioValue();
    setPortfolioValue(currentValue);

    // Calculate growth over the selected period
    if (data.length > 0) {
      const startValue = data[0].totalValue;
      const growth = ((currentValue - startValue) / startValue) * 100;
      setPortfolioGrowth(growth);
    }
  }, [timeRange, userBalances, stablecoinBalances, stocks, isConnected, exchangeRate]);

  // Calculate total portfolio value
  const calculatePortfolioValue = (): number => {
    if (!isConnected || stocks.length === 0) return 0;

    let totalValue = 0;

    // Add stock token values
    for (const stock of stocks) {
      const balance = parseFloat(userBalances[stock.id] || '0');
      if (balance > 0) {
        const stockValue = balance * stock.priceHbar;
        totalValue += stockValue;
      }
    }

    // Add HBAR value in USD
    totalValue += parseFloat(balance || '0') * exchangeRate;

    // Add stablecoin values (these are already in USD)
    Object.entries(stablecoinBalances).forEach(([symbol, balance]) => {
      totalValue += parseFloat(balance);
    });

    return totalValue;
  };

  // Calculate the portfolio allocation percentages
  const calculateAllocation = () => {
    if (!isConnected || portfolioValue === 0) return [];

    const allocation = [];

    // Add stock token allocations
    for (const stock of stocks) {
      const balance = parseFloat(userBalances[stock.id] || '0');
      if (balance > 0) {
        const stockValue = balance * stock.priceHbar * exchangeRate;
        const percentage = (stockValue / portfolioValue) * 100;
        allocation.push({
          name: stock.shortName,
          value: stockValue,
          percentage,
          color: getRandomColor(stock.shortName)
        });
      }
    }

    // Add HBAR allocation
    const hbarValue = parseFloat(balance || '0') * exchangeRate;
    if (hbarValue > 0) {
      const percentage = (hbarValue / portfolioValue) * 100;
      allocation.push({
        name: 'HBAR',
        value: hbarValue,
        percentage,
        color: '#00AEDE' // HBAR brand color
      });
    }

    // Add stablecoin allocations
    Object.entries(stablecoinBalances).forEach(([symbol, balance]) => {
      const value = parseFloat(balance);
      if (value > 0) {
        const percentage = (value / portfolioValue) * 100;
        allocation.push({
          name: symbol,
          value,
          percentage,
          color: symbol === 'USDC' ? '#2775CA' : '#26A17B' // USDC and USDT brand colors
        });
      }
    });

    return allocation.sort((a, b) => b.value - a.value);
  };

  // Get a deterministic color based on token name
  const getRandomColor = (name: string): string => {
    // Simple hash function to generate a color from a string
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 50%)`;
  };

  // Format date for chart labels
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);

    switch (timeRange) {
      case '24h':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      default:
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-white dark:bg-primary-900 rounded-xl shadow-md overflow-hidden p-6">
        <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-6">Portfolio</h2>
        <p className="text-center py-8 text-primary-500 dark:text-primary-400">
          Please connect your wallet to view your portfolio.
        </p>
      </div>
    );
  }

  const portfolioAllocation = calculateAllocation();

  return (
    <div className="bg-white dark:bg-primary-900 rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-6">Portfolio</h2>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Portfolio Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-primary-50 dark:bg-primary-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-primary-500 dark:text-primary-400 mb-1">
                    Total Portfolio Value
                  </h3>
                  <p className="text-2xl font-bold text-primary-900 dark:text-white">
                    ${portfolioValue.toFixed(2)}
                  </p>
                </div>

                <div className="bg-primary-50 dark:bg-primary-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-primary-500 dark:text-primary-400 mb-1">
                    Performance ({timeRange})
                  </h3>
                  <p className={`text-2xl font-bold ${portfolioGrowth >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                    }`}>
                    {portfolioGrowth >= 0 ? '+' : ''}{portfolioGrowth.toFixed(2)}%
                  </p>
                </div>

                <div className="bg-primary-50 dark:bg-primary-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-primary-500 dark:text-primary-400 mb-1">
                    Assets
                  </h3>
                  <p className="text-2xl font-bold text-primary-900 dark:text-white">
                    {portfolioAllocation.length}
                  </p>
                </div>
              </div>

              {/* Performance Chart */}
              <div className="bg-primary-50 dark:bg-primary-800 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-primary-900 dark:text-white">
                    Performance History
                  </h3>
                  <div className="flex space-x-2">
                    {(['24h', '7d', '30d', 'all'] as const).map((range) => (
                      <button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        className={`px-2 py-1 text-xs font-medium rounded ${timeRange === range
                          ? 'bg-secondary-600 text-white'
                          : 'bg-primary-200 dark:bg-primary-700 text-primary-800 dark:text-primary-300'
                          }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Simple line chart */}
                <div className="h-64 relative">
                  {performanceHistory.length > 0 && (
                    <>
                      {/* Y-axis labels */}
                      <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-primary-500 dark:text-primary-400">
                        <span>${Math.max(...performanceHistory.map(p => p.totalValue)).toFixed(2)}</span>
                        <span>${((Math.max(...performanceHistory.map(p => p.totalValue)) + Math.min(...performanceHistory.map(p => p.totalValue))) / 2).toFixed(2)}</span>
                        <span>${Math.min(...performanceHistory.map(p => p.totalValue)).toFixed(2)}</span>
                      </div>

                      {/* Chart area */}
                      <div className="absolute left-16 right-0 top-0 bottom-0">
                        <svg className="w-full h-full">
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="rgba(99, 102, 241, 0.5)" />
                              <stop offset="100%" stopColor="rgba(99, 102, 241, 0)" />
                            </linearGradient>
                          </defs>

                          {/* Draw the area under the curve */}
                          <path
                            d={`
                            M 0 ${64 - (performanceHistory[0].totalValue - Math.min(...performanceHistory.map(p => p.totalValue))) / (Math.max(...performanceHistory.map(p => p.totalValue)) - Math.min(...performanceHistory.map(p => p.totalValue))) * 64} 
                            ${performanceHistory.map((point, i) => {
                              const x = (i / (performanceHistory.length - 1)) * 100 + '%';
                              const y = 64 - ((point.totalValue - Math.min(...performanceHistory.map(p => p.totalValue))) / (Math.max(...performanceHistory.map(p => p.totalValue)) - Math.min(...performanceHistory.map(p => p.totalValue)))) * 64;
                              return `L ${x} ${y}`;
                            }).join(' ')}
                            L 100% 64
                            L 0 64
                            Z
                          `}
                            fill="url(#gradient)"
                          />

                          {/* Draw the line */}
                          <path
                            d={`
                            M 0 ${64 - (performanceHistory[0].totalValue - Math.min(...performanceHistory.map(p => p.totalValue))) / (Math.max(...performanceHistory.map(p => p.totalValue)) - Math.min(...performanceHistory.map(p => p.totalValue))) * 64} 
                            ${performanceHistory.map((point, i) => {
                              const x = (i / (performanceHistory.length - 1)) * 100 + '%';
                              const y = 64 - ((point.totalValue - Math.min(...performanceHistory.map(p => p.totalValue))) / (Math.max(...performanceHistory.map(p => p.totalValue)) - Math.min(...performanceHistory.map(p => p.totalValue)))) * 64;
                              return `L ${x} ${y}`;
                            }).join(' ')}
                          `}
                            strokeWidth="2"
                            stroke="#6366F1"
                            fill="none"
                          />

                          {/* Show data points */}
                          {performanceHistory.map((point, i) => {
                            const x = (i / (performanceHistory.length - 1)) * 100 + '%';
                            const y = 64 - ((point.totalValue - Math.min(...performanceHistory.map(p => p.totalValue))) / (Math.max(...performanceHistory.map(p => p.totalValue)) - Math.min(...performanceHistory.map(p => p.totalValue)))) * 64;

                            return (
                              <circle
                                key={i}
                                cx={x}
                                cy={y}
                                r="3"
                                fill="#6366F1"
                              />
                            );
                          })}
                        </svg>
                      </div>

                      {/* X-axis labels */}
                      <div className="absolute left-16 right-0 bottom-0 transform translate-y-6 flex justify-between text-xs text-primary-500 dark:text-primary-400">
                        {performanceHistory.filter((_, i) => i % Math.ceil(performanceHistory.length / 6) === 0 || i === performanceHistory.length - 1).map((point, i) => (
                          <span key={i}>{formatDate(point.timestamp)}</span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Portfolio Allocation */}
              <div className="bg-primary-50 dark:bg-primary-800 rounded-lg p-4">
                <h3 className="text-lg font-medium text-primary-900 dark:text-white mb-4">
                  Portfolio Allocation
                </h3>

                {portfolioAllocation.length === 0 ? (
                  <p className="text-center py-4 text-primary-500 dark:text-primary-400">
                    No assets in portfolio
                </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Donut chart */}
                    <div className="aspect-square relative flex items-center justify-center">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        {portfolioAllocation.map((asset, index) => {
                          // Calculate the slice
                          const startAngle = index === 0 ? 0 : portfolioAllocation.slice(0, index).reduce((sum, a) => sum + a.percentage, 0) * 3.6;
                          const endAngle = startAngle + asset.percentage * 3.6;

                          // Convert angles to radians and calculate coordinates
                          const startRadians = (startAngle - 90) * Math.PI / 180;
                          const endRadians = (endAngle - 90) * Math.PI / 180;

                          const startX = 50 + 40 * Math.cos(startRadians);
                          const startY = 50 + 40 * Math.sin(startRadians);
                          const endX = 50 + 40 * Math.cos(endRadians);
                          const endY = 50 + 40 * Math.sin(endRadians);

                          // Determine if the slice is large (> 180 degrees)
                          const largeArcFlag = asset.percentage > 50 ? 1 : 0;

                          return (
                            <path
                              key={asset.name}
                              d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                              fill={asset.color}
                            />
                          );
                        })}
                        {/* Inner circle for donut effect */}
                        <circle cx="50" cy="50" r="25" fill="white" className="dark:fill-primary-800" />
                      </svg>
                    </div>

                    {/* Asset breakdown */}
                    <div className="md:col-span-2">
                      <div className="space-y-3">
                        {portfolioAllocation.map((asset) => (
                          <div key={asset.name} className="flex items-center">
                            <div
                              className="w-4 h-4 rounded-full mr-2"
                              style={{ backgroundColor: asset.color }}
                            ></div>
                            <div className="flex-1 text-sm text-primary-900 dark:text-white">
                              {asset.name}
                            </div>
                            <div className="text-sm font-medium text-primary-900 dark:text-white mr-2">
                              ${asset.value.toFixed(2)}
                            </div>
                            <div className="text-xs font-medium text-primary-500 dark:text-primary-400 w-14 text-right">
                              {asset.percentage.toFixed(1)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Assets List */}
              <div>
                <h3 className="text-lg font-medium text-primary-900 dark:text-white mb-4">
                  Your Assets
                </h3>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-primary-200 dark:divide-primary-700">
                  <thead className="bg-primary-50 dark:bg-primary-800">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 dark:text-primary-400 uppercase tracking-wider">Asset</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 dark:text-primary-400 uppercase tracking-wider">Balance</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 dark:text-primary-400 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-primary-500 dark:text-primary-400 uppercase tracking-wider">Value</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-primary-900 divide-y divide-primary-200 dark:divide-primary-800">
                      {/* Stock tokens */}
                      {stocks.map(stock => {
                        const balance = parseFloat(userBalances[stock.id] || '0');
                        if (balance <= 0) return null;

                        const value = balance * stock.priceHbar * exchangeRate;

                      return (
                        <tr key={stock.id} className="hover:bg-primary-50 dark:hover:bg-primary-800/40">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="ml-2">
                                <div className="text-sm font-medium text-primary-900 dark:text-white">
                                  {stock.shortName}
                                </div>
                                <div className="text-xs text-primary-500 dark:text-primary-400">
                                  {stock.longName}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-900 dark:text-white">
                            {balance.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-primary-900 dark:text-white">
                              {stock.priceHbar.toFixed(6)} HBAR
                            </div>
                            <div className="text-xs text-primary-500 dark:text-primary-400">
                              ${(stock.priceHbar * exchangeRate).toFixed(2)}
                            </div>
                          </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-900 dark:text-white">
                              ${value.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}

                      {/* HBAR */}
                      {parseFloat(balance || '0') > 0 && (
                        <tr className="hover:bg-primary-50 dark:hover:bg-primary-800/40">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="ml-2">
                                <div className="text-sm font-medium text-primary-900 dark:text-white">
                                  HBAR
                                </div>
                                <div className="text-xs text-primary-500 dark:text-primary-400">
                                  Hedera
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-900 dark:text-white">
                            {parseFloat(balance || '0').toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-primary-900 dark:text-white">
                              1 HBAR
                            </div>
                            <div className="text-xs text-primary-500 dark:text-primary-400">
                              ${exchangeRate.toFixed(4)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-900 dark:text-white">
                            ${(parseFloat(balance || '0') * exchangeRate).toFixed(2)}
                          </td>
                        </tr>
                      )}

                      {/* Stablecoins */}
                      {Object.entries(stablecoinBalances).map(([symbol, balance]) => {
                        const balanceValue = parseFloat(balance);
                        if (balanceValue <= 0) return null;

                        return (
                          <tr key={symbol} className="hover:bg-primary-50 dark:hover:bg-primary-800/40">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="ml-2">
                                  <div className="text-sm font-medium text-primary-900 dark:text-white">
                                    {symbol}
                                  </div>
                                  <div className="text-xs text-primary-500 dark:text-primary-400">
                                    {symbol === 'USDC' ? 'USD Coin' : 'Tether USD'}
                                  </div>
                                </div>
                            </div>
                          </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-900 dark:text-white">
                              {balanceValue.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-primary-900 dark:text-white">
                                $1.00
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-900 dark:text-white">
                              ${balanceValue.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}

                      {/* Empty state */}
                      {portfolioAllocation.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-primary-500 dark:text-primary-400">
                            No assets in portfolio
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>
                </div>
              </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;

'use client';

import React, { useState, useEffect } from 'react';
import { useStock } from '@/contexts/StockContext';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { toast } from 'react-hot-toast';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface MarketData {
    price: number;
    volume: number;
    change24h: number;
    marketCap: number;
}

interface PriceHistory {
    timestamp: string;
    price: number;
}

export default function MarketData() {
    const { stocks, exchangeRate } = useStock();
    const [marketData, setMarketData] = useState<MarketData>({
        price: 0,
        volume: 0,
        change24h: 0,
        marketCap: 0,
    });
    const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
    const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '1Y'>('1D');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadMarketData();
    }, [timeframe, stocks, exchangeRate]);

    const loadMarketData = async () => {
        try {
            setIsLoading(true);

            // Find Safaricom stock in the stocks array
            const safarikom = stocks.find(stock => stock.shortName === 'SCOM');

            if (safarikom) {
                // Generate some mock historical data
                const generateMockHistory = () => {
                    const now = new Date();
                    const history: PriceHistory[] = [];
                    const basePrice = safarikom.priceHbar * exchangeRate;
                    const points = 20;

                    // Generate different time periods based on timeframe
                    let timeIncrement: number;
                    switch (timeframe) {
                        case '1D': timeIncrement = 60 * 60 * 1000; break; // 1 hour in ms
                        case '1W': timeIncrement = 24 * 60 * 60 * 1000; break; // 1 day in ms
                        case '1M': timeIncrement = 24 * 60 * 60 * 1000 * 2; break; // 2 days in ms
                        case '1Y': timeIncrement = 24 * 60 * 60 * 1000 * 15; break; // 15 days in ms
                        default: timeIncrement = 60 * 60 * 1000;
                    }

                    for (let i = points; i >= 0; i--) {
                        const time = new Date(now.getTime() - (i * timeIncrement));
                        // Add some random variation
                        const variation = (Math.random() - 0.5) * 0.1;
                        history.push({
                            timestamp: time.toISOString(),
                            price: basePrice * (1 + variation)
                        });
                    }

                    return history;
                };

                const history = generateMockHistory();
                setPriceHistory(history);

                // Calculate price change
                const firstPrice = history[0]?.price || 0;
                const lastPrice = history[history.length - 1]?.price || 0;
                const priceChange = firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0;

                setMarketData({
                    price: lastPrice,
                    volume: Math.round(lastPrice * 15000), // Mock volume data
                    change24h: priceChange,
                    marketCap: Math.round(lastPrice * 1000000), // Mock market cap data
                });
            } else {
                toast.error('Stock data not found');
            }
        } catch (error) {
            console.error('Error loading market data:', error);
            toast.error('Failed to load market data');
        } finally {
            setIsLoading(false);
        }
    };

    const chartData = {
        labels: priceHistory.map((point) => {
            const date = new Date(point.timestamp);
            if (timeframe === '1D') {
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else {
                return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
            }
        }),
        datasets: [
            {
                label: 'Price (USD)',
                data: priceHistory.map((point) => point.price),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Price History',
            },
        },
        scales: {
            y: {
                beginAtZero: false,
            },
        },
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl md:text-4xl font-bold text-primary-900 dark:text-white mb-4">
                Market <span className="bg-gradient-to-r from-primary-600 to-secondary-500 inline-block text-transparent bg-clip-text">Data</span>
            </h1>

            {/* Market Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Price</h3>
                    <p className="text-2xl font-bold">${marketData.price.toFixed(2)}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">24h Change</h3>
                    <p className={`text-2xl font-bold ${marketData.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {marketData.change24h >= 0 ? '+' : ''}{marketData.change24h.toFixed(2)}%
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Volume</h3>
                    <p className="text-2xl font-bold">${marketData.volume.toLocaleString()}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Market Cap</h3>
                    <p className="text-2xl font-bold">${marketData.marketCap.toLocaleString()}</p>
                </div>
            </div>

            {/* Price Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Price Chart</h2>
                    <div className="flex space-x-2">
                        {(['1D', '1W', '1M', '1Y'] as const).map((tf) => (
                            <button
                                key={tf}
                                onClick={() => setTimeframe(tf)}
                                className={`px-3 py-1 rounded-md ${timeframe === tf
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="h-[400px]">
                    <Line data={chartData} options={chartOptions} />
                </div>
            </div>

            {/* Market Movers */}
            <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">Market Movers</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">Top Gainers</h3>
                        <div className="space-y-4">
                            {stocks.slice(0, 3).map((stock, index) => (
                                <div key={index} className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">{stock.shortName}</p>
                                        <p className="text-sm text-gray-500">{stock.longName}</p>
                                    </div>
                                    <div className="text-green-500 font-medium">+{(Math.random() * 5).toFixed(2)}%</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">Top Losers</h3>
                        <div className="space-y-4">
                            {stocks.slice(0, 3).reverse().map((stock, index) => (
                                <div key={index} className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">{stock.shortName}</p>
                                        <p className="text-sm text-gray-500">{stock.longName}</p>
                                    </div>
                                    <div className="text-red-500 font-medium">-{(Math.random() * 5).toFixed(2)}%</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 
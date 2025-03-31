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
import { 
    initializeStockData, 
    nseStocks, 
    nseIndices, 
    nseSectorPerformance,
    nseAnnouncements,
    nseMarketSummary
} from '@/data/nseStockData';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

// Type definitions for the selected stock
interface SelectedStock {
    id: string;
    shortName: string;
    longName: string;
    sector: string;
    priceHbar: number;
    price: number; // USD price
    volume: number;
    change24h: number;
    marketCap: number;
    high24h: number;
    low24h: number;
    priceHistory: {
        '1D': { timestamp: string; price: number }[];
        '1W': { timestamp: string; price: number }[];
        '1M': { timestamp: string; price: number }[];
        '1Y': { timestamp: string; price: number }[];
    };
}

export default function MarketDataDisplay() {
    const { exchangeRate } = useStock();
    const [marketStocks, setMarketStocks] = useState(initializeStockData());
    const [selectedStock, setSelectedStock] = useState<SelectedStock | null>(null);
    const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '1Y'>('1D');
    const [isLoading, setIsLoading] = useState(true);
    const [marketIndices, setMarketIndices] = useState(nseIndices);
    const [selectedIndex, setSelectedIndex] = useState(nseIndices[0]);

    // Initialize with Safaricom as the default selected stock
    useEffect(() => {
        if (marketStocks.length > 0 && !selectedStock) {
            const defaultStock = marketStocks.find(stock => stock.shortName === 'SCOM');
            if (defaultStock) {
                selectStock(defaultStock.id);
            }
        }
        
        setIsLoading(false);
    }, [marketStocks]);
    
    // Function to handle stock selection
    const selectStock = (stockId: string) => {
        const stock = marketStocks.find(s => s.id === stockId);
        if (!stock) return;
        
        setSelectedStock({
            id: stock.id,
            shortName: stock.shortName,
            longName: stock.longName,
            sector: stock.sector,
            priceHbar: stock.priceHbar,
            price: stock.priceHbar * exchangeRate,
            volume: stock.volume,
            change24h: stock.change24h,
            marketCap: stock.marketCap,
            high24h: stock.high24h,
            low24h: stock.low24h,
            priceHistory: stock.priceHistory
        });
    };
    
    // Function to handle index selection
    const selectIndex = (indexId: string) => {
        const index = marketIndices.find(i => i.id === indexId);
        if (index) setSelectedIndex(index);
    };

    // Prepare chart data for the selected stock
    const stockChartData = {
        labels: selectedStock ? selectedStock.priceHistory?.[timeframe]?.map((point: { timestamp: string; price: number }) => {
            const date = new Date(point.timestamp);
            if (timeframe === '1D') {
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else {
                return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
            }
        }) : [],
        datasets: [
            {
                label: `${selectedStock?.shortName || ''} Price (USD)`,
                data: selectedStock ? selectedStock.priceHistory?.[timeframe]?.map((point: { timestamp: string; price: number }) => point.price) : [],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                fill: false,
            },
        ],
    };

    // Prepare chart data for the selected index
    const indexChartData = {
        labels: selectedIndex ? selectedIndex.priceHistory[timeframe].map(point => {
            const date = new Date(point.timestamp);
            if (timeframe === '1D') {
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else {
                return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
            }
        }) : [],
        datasets: [
            {
                label: `${selectedIndex?.name || ''} Index`,
                data: selectedIndex ? selectedIndex.priceHistory[timeframe].map(point => point.price) : [],
                borderColor: 'rgb(53, 162, 235)',
                tension: 0.1,
                fill: false,
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
                NSE <span className="bg-gradient-to-r from-primary-600 to-secondary-500 inline-block text-transparent bg-clip-text">Market</span>
            </h1>

            {/* Market Summary */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
                <h2 className="text-xl font-bold mb-4">Market Summary - {new Date(nseMarketSummary.date).toLocaleDateString()}</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Volume</h3>
                        <p className="text-xl font-bold">{nseMarketSummary.totalVolume.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Value (KES)</h3>
                        <p className="text-xl font-bold">{nseMarketSummary.totalValue.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Gainers</h3>
                        <p className="text-xl font-bold text-green-500">{nseMarketSummary.gainers}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Losers</h3>
                        <p className="text-xl font-bold text-red-500">{nseMarketSummary.losers}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Unchanged</h3>
                        <p className="text-xl font-bold text-gray-500">{nseMarketSummary.unchanged}</p>
                    </div>
                </div>
            </div>

            {/* Market Indices */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {marketIndices.map(index => (
                    <div 
                        key={index.id}
                        className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow cursor-pointer transition-all ${
                            selectedIndex.id === index.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => selectIndex(index.id)}
                    >
                        <h3 className="text-lg font-semibold mb-2">{index.name}</h3>
                        <p className="text-2xl font-bold">{index.value.toFixed(2)}</p>
                        <p className={`text-sm font-medium ${index.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {index.change24h >= 0 ? '+' : ''}{index.change24h.toFixed(2)}%
                        </p>
                    </div>
                ))}
            </div>

            {/* Index Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{selectedIndex.name}</h2>
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
                <div className="h-[300px]">
                    <Line data={indexChartData} options={chartOptions} />
                </div>
            </div>

            {/* Stock List */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
                <h2 className="text-xl font-bold mb-4">NSE Listed Companies</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Symbol</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price (KES)</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Change 24h</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Volume</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {marketStocks.map(stock => (
                                <tr 
                                    key={stock.id} 
                                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                                        selectedStock?.id === stock.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                    }`}
                                    onClick={() => selectStock(stock.id)}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{stock.shortName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{stock.longName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        {(stock.priceHbar * exchangeRate).toFixed(2)}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                        stock.change24h >= 0 ? 'text-green-500' : 'text-red-500'
                                    }`}>
                                        {stock.change24h >= 0 ? '+' : ''}{stock.change24h.toFixed(2)}%
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                        {stock.volume.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Selected Stock Details */}
            {selectedStock && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold">{selectedStock.shortName}</h2>
                            <p className="text-gray-500">{selectedStock.longName} • {selectedStock.sector}</p>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <p className="text-3xl font-bold">KES {selectedStock.price.toFixed(2)}</p>
                            <p className={`text-sm font-medium ${selectedStock.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {selectedStock.change24h >= 0 ? '+' : ''}{selectedStock.change24h.toFixed(2)}% Today
                            </p>
                        </div>
                    </div>
                    
                    {/* Stock Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Volume</h3>
                            <p className="text-lg font-bold">{selectedStock.volume.toLocaleString()}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Market Cap</h3>
                            <p className="text-lg font-bold">KES {selectedStock.marketCap.toLocaleString()}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">24h High</h3>
                            <p className="text-lg font-bold">KES {selectedStock.high24h.toFixed(2)}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">24h Low</h3>
                            <p className="text-lg font-bold">KES {selectedStock.low24h.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Stock Chart */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Price Chart</h3>
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
                            <Line data={stockChartData} options={chartOptions} />
                        </div>
                    </div>
                </div>
            )}

            {/* Sector Performance */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
                <h2 className="text-xl font-bold mb-4">Sector Performance</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {nseSectorPerformance.map((sector, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-medium">{sector.sector}</h3>
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                    sector.change24h >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {sector.change24h >= 0 ? '+' : ''}{sector.change24h.toFixed(2)}%
                                </span>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                <p>Volume: {sector.volume.toLocaleString()}</p>
                                <p>Market Cap: KES {sector.marketCap.toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Market Announcements */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Market Announcements</h2>
                <div className="space-y-4">
                    {nseAnnouncements.map(announcement => (
                        <div key={announcement.id} className="border-l-4 border-blue-500 pl-4 py-2">
                            <div className="flex items-center mb-1">
                                <span className="font-semibold mr-2">{announcement.stock}</span>
                                <span className={`px-2 py-0.5 rounded text-xs ${
                                    announcement.type === 'dividend' ? 'bg-green-100 text-green-800' : 
                                    announcement.type === 'earnings' ? 'bg-blue-100 text-blue-800' : 
                                    announcement.type === 'corporate' ? 'bg-purple-100 text-purple-800' : 
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {announcement.type.toUpperCase()}
                                </span>
                                <span className="text-sm text-gray-500 ml-auto">{new Date(announcement.date).toLocaleDateString()}</span>
                            </div>
                            <h3 className="font-medium">{announcement.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{announcement.content}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

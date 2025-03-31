/**
 * NSE (Nairobi Securities Exchange) Dummy Market Data
 * Contains realistic data structures for simulating the NSE market
 */

export interface Stock {
  id: string;
  shortName: string;
  longName: string;
  sector: string;
  priceHbar: number;  // Price in HBAR
  priceHistory: {
    '1D': PricePoint[];
    '1W': PricePoint[];
    '1M': PricePoint[];
    '1Y': PricePoint[];
  };
  volume: number;
  marketCap: number;
  change24h: number;
  high24h: number;
  low24h: number;
}

export interface PricePoint {
  timestamp: string;
  price: number;
}

// Generate realistic price history for various timeframes
const generatePriceHistory = (basePrice: number, volatility: number, timeframe: '1D' | '1W' | '1M' | '1Y'): PricePoint[] => {
  const now = new Date();
  const history: PricePoint[] = [];
  
  // Different number of data points for different timeframes
  let points: number;
  let intervalMs: number;
  
  switch (timeframe) {
    case '1D':
      points = 24;
      intervalMs = 60 * 60 * 1000; // 1 hour
      break;
    case '1W':
      points = 7;
      intervalMs = 24 * 60 * 60 * 1000; // 1 day
      break;
    case '1M':
      points = 30;
      intervalMs = 24 * 60 * 60 * 1000; // 1 day
      break;
    case '1Y':
      points = 12;
      intervalMs = 30 * 24 * 60 * 60 * 1000; // ~1 month
      break;
  }
  
  // Use a more realistic price movement algorithm (random walk with trend)
  let currentPrice = basePrice;
  let trend = (Math.random() - 0.5) * 0.01; // Small random trend
  
  for (let i = points; i >= 0; i--) {
    const time = new Date(now.getTime() - (i * intervalMs));
    
    // Random walk with trend and bounded volatility
    const randomFactor = (Math.random() - 0.5) * volatility;
    currentPrice = currentPrice * (1 + randomFactor + trend);
    
    // Ensure price doesn't go negative or too extreme
    currentPrice = Math.max(basePrice * 0.5, Math.min(basePrice * 1.5, currentPrice));
    
    history.push({
      timestamp: time.toISOString(),
      price: parseFloat(currentPrice.toFixed(2))
    });
  }
  
  return history;
};

// Calculate 24h change based on price history
const calculate24hChange = (priceHistory: PricePoint[]): number => {
  if (priceHistory.length < 2) return 0;
  
  const oldPrice = priceHistory[0].price;
  const newPrice = priceHistory[priceHistory.length - 1].price;
  
  return parseFloat(((newPrice - oldPrice) / oldPrice * 100).toFixed(2));
};

// Calculate 24h high and low
const calculate24hHighLow = (priceHistory: PricePoint[]): { high: number; low: number } => {
  if (priceHistory.length === 0) return { high: 0, low: 0 };
  
  let high = priceHistory[0].price;
  let low = priceHistory[0].price;
  
  for (const point of priceHistory) {
    high = Math.max(high, point.price);
    low = Math.min(low, point.price);
  }
  
  return { high, low };
};

// Create dummy stock data for NSE stocks
export const nseStocks: Stock[] = [
  // Blue Chip Companies
  {
    id: "saf-001",
    shortName: "SCOM",
    longName: "Safaricom PLC",
    sector: "Telecommunications",
    priceHbar: 38.25,
    priceHistory: {
      '1D': [],
      '1W': [],
      '1M': [],
      '1Y': []
    },
    volume: 5823000,
    marketCap: 1530000000000, // 1.53 trillion KES
    change24h: 0,
    high24h: 0,
    low24h: 0
  },
  {
    id: "eqty-002",
    shortName: "EQTY",
    longName: "Equity Group Holdings",
    sector: "Banking",
    priceHbar: 45.10,
    priceHistory: {
      '1D': [],
      '1W': [],
      '1M': [],
      '1Y': []
    },
    volume: 2814000,
    marketCap: 170000000000, // 170 billion KES
    change24h: 0,
    high24h: 0,
    low24h: 0
  },
  {
    id: "kcb-003",
    shortName: "KCB",
    longName: "KCB Group PLC",
    sector: "Banking",
    priceHbar: 42.85,
    priceHistory: {
      '1D': [],
      '1W': [],
      '1M': [],
      '1Y': []
    },
    volume: 1925000,
    marketCap: 138000000000, // 138 billion KES
    change24h: 0,
    high24h: 0,
    low24h: 0
  },
  {
    id: "eabl-004",
    shortName: "EABL",
    longName: "East African Breweries Limited",
    sector: "Manufacturing",
    priceHbar: 172.25,
    priceHistory: {
      '1D': [],
      '1W': [],
      '1M': [],
      '1Y': []
    },
    volume: 863000,
    marketCap: 137000000000, // 137 billion KES
    change24h: 0,
    high24h: 0,
    low24h: 0
  },
  {
    id: "bat-005",
    shortName: "BAT",
    longName: "British American Tobacco Kenya",
    sector: "Manufacturing",
    priceHbar: 475.00,
    priceHistory: {
      '1D': [],
      '1W': [],
      '1M': [],
      '1Y': []
    },
    volume: 120000,
    marketCap: 47500000000, // 47.5 billion KES
    change24h: 0,
    high24h: 0,
    low24h: 0
  },
  {
    id: "coop-006",
    shortName: "COOP",
    longName: "Cooperative Bank of Kenya",
    sector: "Banking",
    priceHbar: 12.80,
    priceHistory: {
      '1D': [],
      '1W': [],
      '1M': [],
      '1Y': []
    },
    volume: 2105000,
    marketCap: 75200000000, // 75.2 billion KES
    change24h: 0,
    high24h: 0,
    low24h: 0
  },
  {
    id: "absa-007",
    shortName: "ABSA",
    longName: "ABSA Bank Kenya",
    sector: "Banking",
    priceHbar: 13.25,
    priceHistory: {
      '1D': [],
      '1W': [],
      '1M': [],
      '1Y': []
    },
    volume: 1230000,
    marketCap: 71800000000, // 71.8 billion KES
    change24h: 0,
    high24h: 0,
    low24h: 0
  },
  {
    id: "kngen-008",
    shortName: "KEGN",
    longName: "Kenya Electricity Generating Company",
    sector: "Energy",
    priceHbar: 4.22,
    priceHistory: {
      '1D': [],
      '1W': [],
      '1M': [],
      '1Y': []
    },
    volume: 3251000,
    marketCap: 27700000000, // 27.7 billion KES
    change24h: 0,
    high24h: 0,
    low24h: 0
  },
  {
    id: "kplc-009",
    shortName: "KPLC",
    longName: "Kenya Power & Lighting Company",
    sector: "Energy",
    priceHbar: 1.75,
    priceHistory: {
      '1D': [],
      '1W': [],
      '1M': [],
      '1Y': []
    },
    volume: 4870000,
    marketCap: 3406000000, // 3.406 billion KES
    change24h: 0,
    high24h: 0,
    low24h: 0
  },
  {
    id: "jubilee-010",
    shortName: "JUB",
    longName: "Jubilee Holdings Limited",
    sector: "Insurance",
    priceHbar: 305.25,
    priceHistory: {
      '1D': [],
      '1W': [],
      '1M': [],
      '1Y': []
    },
    volume: 78500,
    marketCap: 22100000000, // 22.1 billion KES
    change24h: 0,
    high24h: 0,
    low24h: 0
  }
];

// Initialize price history and 24h stats for all stocks
export const initializeStockData = (): Stock[] => {
  return nseStocks.map(stock => {
    // Generate price histories for each timeframe with appropriate volatility
    const dayHistory = generatePriceHistory(stock.priceHbar, 0.01, '1D');
    const weekHistory = generatePriceHistory(stock.priceHbar, 0.03, '1W');
    const monthHistory = generatePriceHistory(stock.priceHbar, 0.05, '1M');
    const yearHistory = generatePriceHistory(stock.priceHbar, 0.15, '1Y');
    
    // Calculate 24h change
    const change24h = calculate24hChange(dayHistory);
    
    // Calculate 24h high and low
    const { high, low } = calculate24hHighLow(dayHistory);
    
    return {
      ...stock,
      priceHistory: {
        '1D': dayHistory,
        '1W': weekHistory,
        '1M': monthHistory,
        '1Y': yearHistory
      },
      change24h,
      high24h: high,
      low24h: low
    };
  });
};

// Market Indices
export interface MarketIndex {
  id: string;
  name: string;
  value: number;
  change24h: number;
  priceHistory: {
    '1D': PricePoint[];
    '1W': PricePoint[];
    '1M': PricePoint[];
    '1Y': PricePoint[];
  };
}

export const nseIndices: MarketIndex[] = [
  {
    id: "nse20-001",
    name: "NSE 20 Share Index",
    value: 1876.24,
    change24h: 0.72,
    priceHistory: {
      '1D': generatePriceHistory(1876.24, 0.005, '1D'),
      '1W': generatePriceHistory(1876.24, 0.015, '1W'),
      '1M': generatePriceHistory(1876.24, 0.035, '1M'),
      '1Y': generatePriceHistory(1876.24, 0.12, '1Y')
    }
  },
  {
    id: "nasi-002",
    name: "NSE All Share Index",
    value: 147.35,
    change24h: 0.56,
    priceHistory: {
      '1D': generatePriceHistory(147.35, 0.004, '1D'),
      '1W': generatePriceHistory(147.35, 0.012, '1W'),
      '1M': generatePriceHistory(147.35, 0.03, '1M'),
      '1Y': generatePriceHistory(147.35, 0.1, '1Y')
    }
  },
  {
    id: "ftse-003",
    name: "FTSE NSE Kenya 15 Index",
    value: 186.41,
    change24h: 0.81,
    priceHistory: {
      '1D': generatePriceHistory(186.41, 0.005, '1D'),
      '1W': generatePriceHistory(186.41, 0.018, '1W'),
      '1M': generatePriceHistory(186.41, 0.04, '1M'),
      '1Y': generatePriceHistory(186.41, 0.13, '1Y')
    }
  },
  {
    id: "ftse25-004",
    name: "FTSE NSE Kenya 25 Index",
    value: 193.78,
    change24h: 0.63,
    priceHistory: {
      '1D': generatePriceHistory(193.78, 0.005, '1D'),
      '1W': generatePriceHistory(193.78, 0.015, '1W'),
      '1M': generatePriceHistory(193.78, 0.038, '1M'),
      '1Y': generatePriceHistory(193.78, 0.11, '1Y')
    }
  }
];

// Market data per sector
export interface SectorPerformance {
  sector: string;
  change24h: number;
  marketCap: number;
  volume: number;
}

export const nseSectorPerformance: SectorPerformance[] = [
  {
    sector: "Banking",
    change24h: 1.37,
    marketCap: 550000000000, // 550 billion KES
    volume: 8200000
  },
  {
    sector: "Telecommunications",
    change24h: 0.92,
    marketCap: 1580000000000, // 1.58 trillion KES
    volume: 6300000
  },
  {
    sector: "Manufacturing",
    change24h: 0.25,
    marketCap: 312000000000, // 312 billion KES
    volume: 1750000
  },
  {
    sector: "Energy",
    change24h: -0.86,
    marketCap: 87500000000, // 87.5 billion KES
    volume: 9850000
  },
  {
    sector: "Insurance",
    change24h: 0.43,
    marketCap: 78000000000, // 78 billion KES
    volume: 420000
  },
  {
    sector: "Real Estate",
    change24h: -1.27,
    marketCap: 35000000000, // 35 billion KES
    volume: 980000
  }
];

// Market Announcements
export interface MarketAnnouncement {
  id: string;
  stock: string;
  title: string;
  date: string;
  content: string;
  type: 'dividend' | 'earnings' | 'corporate' | 'general';
}

export const nseAnnouncements: MarketAnnouncement[] = [
  {
    id: "ann-001",
    stock: "SCOM",
    title: "Safaricom Announces Interim Dividend",
    date: "2025-03-25",
    content: "Safaricom PLC announces an interim dividend of KES 0.58 per share for FY2024-25. The register closure date is set for April 15, 2025 with payments to be made on May 2, 2025.",
    type: "dividend"
  },
  {
    id: "ann-002",
    stock: "EQTY",
    title: "Equity Group Q1 2025 Financial Results",
    date: "2025-03-29",
    content: "Equity Group Holdings announces a 12.8% growth in Q1 2025 profit after tax to KES 15.2 billion, driven by strong performance in digital banking services.",
    type: "earnings"
  },
  {
    id: "ann-003",
    stock: "EABL",
    title: "EABL Board Changes",
    date: "2025-03-27",
    content: "East African Breweries Limited announces appointment of Jane Karuku as the new Group Managing Director effective May 1, 2025, following the retirement of John Musunga.",
    type: "corporate"
  },
  {
    id: "ann-004",
    stock: "KCB",
    title: "KCB Rights Issue Oversubscribed",
    date: "2025-03-26",
    content: "KCB Group announces its rights issue has been oversubscribed by 172%, raising KES 25.7 billion for the bank's regional expansion strategy.",
    type: "general"
  },
  {
    id: "ann-005",
    stock: "BAT",
    title: "BAT Kenya Full Year Results 2024",
    date: "2025-03-20",
    content: "British American Tobacco Kenya reports a 5.2% increase in net profit to KES 6.3 billion for FY2024. The Board has recommended a final dividend of KES 41.50 per share.",
    type: "earnings"
  }
];

// Market Summary (daily overview)
export interface MarketSummary {
  date: string;
  totalVolume: number;
  totalValue: number; // in KES
  gainers: number;
  losers: number;
  unchanged: number;
}

export const nseMarketSummary: MarketSummary = {
  date: "2025-03-30",
  totalVolume: 28700000,
  totalValue: 987500000, // 987.5 million KES
  gainers: 33,
  losers: 21,
  unchanged: 12
};

import { NextRequest, NextResponse } from 'next/server';
import { getDefaultETFProviderFactory } from '@/lib/api';

// Mock ETF data - used as fallback when no data providers are configured
const mockETFData = {
  'SPY': {
    symbol: 'SPY',
    name: 'SPDR S&P 500 ETF Trust',
    exchange: 'NYSE Arca',
    price: 445.67,
    change: 2.34,
    changePercent: 0.53,
    volume: 45234567,
    marketCap: 412000000000,
    expenseRatio: 0.0945,
    dividendYield: 1.32,
    peRatio: 24.5,
    beta: 1.0,
    description: 'The SPDR S&P 500 ETF Trust seeks to provide investment results that, before expenses, correspond generally to the price and yield performance of the S&P 500 Index.',
    inceptionDate: '1993-01-22',
    aum: 412000000000,
    totalAssets: 412000000000,
    avgVolume: 78234567,
    dayRange: { low: 443.21, high: 446.89 },
    yearRange: { low: 362.45, high: 459.44 },
    topHoldings: [
      { 
        symbol: 'AAPL', 
        name: 'Apple Inc.', 
        weight: 7.1, 
        shares: 150000,
        marketValue: 28800000,
        price: 192.00,
        change: 2.40,
        changePercent: 1.27,
        sector: 'Technology'
      },
      { 
        symbol: 'MSFT', 
        name: 'Microsoft Corporation', 
        weight: 6.8, 
        shares: 120000,
        marketValue: 27200000,
        price: 226.67,
        change: -1.33,
        changePercent: -0.58,
        sector: 'Technology'
      },
      { 
        symbol: 'AMZN', 
        name: 'Amazon.com Inc.', 
        weight: 3.4, 
        shares: 80000,
        marketValue: 13600000,
        price: 170.00,
        change: 3.20,
        changePercent: 1.92,
        sector: 'Consumer Discretionary'
      },
      { 
        symbol: 'NVDA', 
        name: 'NVIDIA Corporation', 
        weight: 3.2, 
        shares: 75000,
        marketValue: 12400000,
        price: 165.33,
        change: 8.45,
        changePercent: 5.39,
        sector: 'Technology'
      },
      { 
        symbol: 'GOOGL', 
        name: 'Alphabet Inc. Class A', 
        weight: 2.1, 
        shares: 65000,
        marketValue: 11600000,
        price: 178.46,
        change: -2.14,
        changePercent: -1.18,
        sector: 'Communication Services'
      },
      { 
        symbol: 'TSLA', 
        name: 'Tesla Inc.', 
        weight: 2.0, 
        shares: 45000,
        marketValue: 8400000,
        price: 186.67,
        change: 4.22,
        changePercent: 2.31,
        sector: 'Consumer Discretionary'
      },
      { 
        symbol: 'META', 
        name: 'Meta Platforms Inc.', 
        weight: 1.8, 
        shares: 38000,
        marketValue: 7200000,
        price: 189.47,
        change: -3.21,
        changePercent: -1.67,
        sector: 'Communication Services'
      },
      { 
        symbol: 'BRK.B', 
        name: 'Berkshire Hathaway Inc. Class B', 
        weight: 1.6, 
        shares: 35000,
        marketValue: 6400000,
        price: 182.86,
        change: 1.14,
        changePercent: 0.63,
        sector: 'Financial Services'
      },
      { 
        symbol: 'UNH', 
        name: 'UnitedHealth Group Inc.', 
        weight: 1.4, 
        shares: 28000,
        marketValue: 5600000,
        price: 200.00,
        change: -1.50,
        changePercent: -0.74,
        sector: 'Healthcare'
      },
      { 
        symbol: 'JNJ', 
        name: 'Johnson & Johnson', 
        weight: 1.2, 
        shares: 32000,
        marketValue: 4800000,
        price: 150.00,
        change: 0.75,
        changePercent: 0.50,
        sector: 'Healthcare'
      }
    ],
    sectorAllocation: [
      { sector: 'Technology', weight: 28.5 },
      { sector: 'Healthcare', weight: 13.2 },
      { sector: 'Financial Services', weight: 12.8 },
      { sector: 'Consumer Cyclical', weight: 10.9 },
      { sector: 'Communication Services', weight: 8.7 }
    ],
    performance: {
      '1D': 0.53,
      '1W': 1.2,
      '1M': 3.4,
      '3M': 8.7,
      '6M': 12.3,
      '1Y': 24.8,
      '3Y': 45.2,
      '5Y': 78.9
    }
  },
  'QQQ': {
    symbol: 'QQQ',
    name: 'Invesco QQQ Trust',
    exchange: 'NASDAQ',
    price: 378.92,
    change: -1.45,
    changePercent: -0.38,
    volume: 32145678,
    marketCap: 198000000000,
    expenseRatio: 0.20,
    dividendYield: 0.65,
    peRatio: 28.3,
    beta: 1.15,
    description: 'The Invesco QQQ Trust tracks the NASDAQ-100 Index, which includes 100 of the largest domestic and international non-financial companies listed on the NASDAQ Stock Market.',
    inceptionDate: '1999-03-10',
    aum: 198000000000,
    avgVolume: 45123456,
    dayRange: { low: 377.23, high: 380.45 },
    yearRange: { low: 287.34, high: 408.71 },
    topHoldings: [
      { symbol: 'AAPL', name: 'Apple Inc.', weight: 8.9 },
      { symbol: 'MSFT', name: 'Microsoft Corporation', weight: 8.1 },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', weight: 5.4 },
      { symbol: 'NVDA', name: 'NVIDIA Corporation', weight: 4.8 },
      { symbol: 'GOOGL', name: 'Alphabet Inc. Class A', weight: 3.7 }
    ],
    sectorAllocation: [
      { sector: 'Technology', weight: 48.2 },
      { sector: 'Communication Services', weight: 16.8 },
      { sector: 'Consumer Cyclical', weight: 15.3 },
      { sector: 'Healthcare', weight: 6.1 },
      { sector: 'Consumer Defensive', weight: 4.9 }
    ],
    performance: {
      '1D': -0.38,
      '1W': 0.8,
      '1M': 2.1,
      '3M': 6.4,
      '6M': 15.7,
      '1Y': 28.3,
      '3Y': 52.1,
      '5Y': 89.4
    }
  },
  'VTI': {
    symbol: 'VTI',
    name: 'Vanguard Total Stock Market ETF',
    exchange: 'NYSE Arca',
    price: 267.89,
    change: 1.23,
    changePercent: 0.46,
    volume: 28456789,
    marketCap: 345000000000,
    expenseRatio: 0.03,
    dividendYield: 1.28,
    peRatio: 23.8,
    beta: 1.02,
    description: 'The Vanguard Total Stock Market ETF seeks to track the performance of the CRSP US Total Market Index, which represents approximately 100% of the investable U.S. stock market.',
    inceptionDate: '2001-05-24',
    aum: 345000000000,
    avgVolume: 34567890,
    dayRange: { low: 266.45, high: 268.34 },
    yearRange: { low: 218.76, high: 275.43 },
    topHoldings: [
      { symbol: 'AAPL', name: 'Apple Inc.', weight: 6.8 },
      { symbol: 'MSFT', name: 'Microsoft Corporation', weight: 6.5 },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', weight: 3.2 },
      { symbol: 'NVDA', name: 'NVIDIA Corporation', weight: 3.0 },
      { symbol: 'GOOGL', name: 'Alphabet Inc. Class A', weight: 2.0 }
    ],
    sectorAllocation: [
      { sector: 'Technology', weight: 26.8 },
      { sector: 'Healthcare', weight: 13.5 },
      { sector: 'Financial Services', weight: 12.9 },
      { sector: 'Consumer Cyclical', weight: 11.2 },
      { sector: 'Communication Services', weight: 8.9 }
    ],
    performance: {
      '1D': 0.46,
      '1W': 1.1,
      '1M': 3.2,
      '3M': 8.4,
      '6M': 11.9,
      '1Y': 23.7,
      '3Y': 43.8,
      '5Y': 76.2
    }
  },
  'FTWG': {
    symbol: 'FTWG',
    name: 'First Trust Dow Jones Internet Index Fund',
    exchange: 'NASDAQ',
    price: 89.45,
    change: 1.23,
    changePercent: 1.39,
    volume: 125000,
    marketCap: 890000000,
    expenseRatio: 0.58,
    dividendYield: 0.85,
    peRatio: 22.4,
    beta: 1.25,
    description: 'The First Trust Dow Jones Internet Index Fund seeks investment results that correspond generally to the price and yield of the Dow Jones Internet Composite Index.',
    inceptionDate: '2006-05-12',
    aum: 890000000,
    totalAssets: 890000000,
    avgVolume: 145000,
    dayRange: { low: 88.21, high: 90.15 },
    yearRange: { low: 65.34, high: 95.67 },
    topHoldings: [
      { 
        symbol: 'AMZN', 
        name: 'Amazon.com Inc.', 
        weight: 9.2, 
        shares: 45000,
        marketValue: 7650000,
        price: 170.00,
        change: 3.20,
        changePercent: 1.92,
        sector: 'Consumer Discretionary'
      },
      { 
        symbol: 'META', 
        name: 'Meta Platforms Inc.', 
        weight: 8.7, 
        shares: 38000,
        marketValue: 7200000,
        price: 189.47,
        change: -3.21,
        changePercent: -1.67,
        sector: 'Communication Services'
      },
      { 
        symbol: 'GOOGL', 
        name: 'Alphabet Inc. Class A', 
        weight: 7.8, 
        shares: 35000,
        marketValue: 6240000,
        price: 178.46,
        change: -2.14,
        changePercent: -1.18,
        sector: 'Communication Services'
      },
      { 
        symbol: 'NFLX', 
        name: 'Netflix Inc.', 
        weight: 6.5, 
        shares: 28000,
        marketValue: 5200000,
        price: 185.71,
        change: 4.85,
        changePercent: 2.68,
        sector: 'Communication Services'
      },
      { 
        symbol: 'NVDA', 
        name: 'NVIDIA Corporation', 
        weight: 5.9, 
        shares: 25000,
        marketValue: 4130000,
        price: 165.33,
        change: 8.45,
        changePercent: 5.39,
        sector: 'Technology'
      },
      { 
        symbol: 'TSLA', 
        name: 'Tesla Inc.', 
        weight: 5.2, 
        shares: 22000,
        marketValue: 4100000,
        price: 186.67,
        change: 4.22,
        changePercent: 2.31,
        sector: 'Consumer Discretionary'
      },
      { 
        symbol: 'PYPL', 
        name: 'PayPal Holdings Inc.', 
        weight: 4.8, 
        shares: 35000,
        marketValue: 2800000,
        price: 80.00,
        change: -1.20,
        changePercent: -1.48,
        sector: 'Financial Services'
      },
      { 
        symbol: 'ADBE', 
        name: 'Adobe Inc.', 
        weight: 4.1, 
        shares: 18000,
        marketValue: 2460000,
        price: 136.67,
        change: 2.33,
        changePercent: 1.73,
        sector: 'Technology'
      },
      { 
        symbol: 'CRM', 
        name: 'Salesforce Inc.', 
        weight: 3.7, 
        shares: 15000,
        marketValue: 2220000,
        price: 148.00,
        change: -0.85,
        changePercent: -0.57,
        sector: 'Technology'
      },
      { 
        symbol: 'SHOP', 
        name: 'Shopify Inc.', 
        weight: 3.2, 
        shares: 28000,
        marketValue: 1792000,
        price: 64.00,
        change: 1.45,
        changePercent: 2.32,
        sector: 'Technology'
      }
    ],
    sectorAllocation: [
      { sector: 'Technology', weight: 35.8 },
      { sector: 'Communication Services', weight: 28.4 },
      { sector: 'Consumer Discretionary', weight: 18.7 },
      { sector: 'Financial Services', weight: 12.3 },
      { sector: 'Healthcare', weight: 4.8 }
    ],
    performance: {
      '1D': 1.39,
      '1W': 2.8,
      '1M': 5.2,
      '3M': 12.4,
      '6M': 18.9,
      '1Y': 32.1,
      '3Y': 28.7,
      '5Y': 65.3
    }
  }
};

// Generate mock price history for sparklines and charts
function generatePriceHistory(currentPrice: number, symbol: string, days: number = 30) {
  const history = [];
  let price = currentPrice * 0.95; // Start 5% lower
  const volatility = 0.02; // 2% daily volatility
  
  for (let i = 0; i < days; i++) {
    // Use deterministic random based on symbol and day index
    const seed = symbol.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) + i;
    const seededRandom = () => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    const change = (seededRandom() - 0.5) * volatility * price;
    price += change;
    history.push({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      price: Math.round(price * 100) / 100
    });
  }
  
  // Ensure the last price matches current price
  history[history.length - 1].price = currentPrice;
  
  return history;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol: rawSymbol } = await params;
    const symbol = rawSymbol.toUpperCase();
    
    try {
      // Try to use real data providers first
      const factory = getDefaultETFProviderFactory();
      console.log(`[API] Checking providers for ${symbol}...`);
      console.log(`[API] Has providers: ${factory.hasProviders()}`);
      
      if (factory.hasProviders()) {
        // Get data from real providers
        console.log(`[API] Attempting to fetch data for ${symbol} from providers...`);
        const [quoteResult, metadataResult, holdingsResult, sectorResult] = await Promise.allSettled([
          factory.getQuote(symbol),
          factory.getMetadata(symbol),
          factory.getHoldings(symbol),
          factory.getSectorAllocation(symbol)
        ]);
        
        console.log(`[API] Quote result:`, quoteResult.status, quoteResult.status === 'fulfilled' ? quoteResult.value.success : quoteResult.reason);
        if (quoteResult.status === 'fulfilled' && !quoteResult.value.success) {
          console.log(`[API] Quote error:`, quoteResult.value.error);
        }
        console.log(`[API] Metadata result:`, metadataResult.status);
        console.log(`[API] Holdings result:`, holdingsResult.status);
        console.log(`[API] Sector result:`, sectorResult.status);

        // If we got at least quote data, use real data
        if (quoteResult.status === 'fulfilled' && quoteResult.value.success) {
          const quote = quoteResult.value.data;
          const metadata = metadataResult.status === 'fulfilled' && metadataResult.value.success 
            ? metadataResult.value.data : null;
          const holdings = holdingsResult.status === 'fulfilled' && holdingsResult.value.success 
            ? holdingsResult.value.data : [];
          const sectors = sectorResult.status === 'fulfilled' && sectorResult.value.success 
            ? sectorResult.value.data : [];

          // Check if the data is incomplete (price is 0 or null, no holdings, no sectors)
          const isIncompleteData = !quote.price || quote.price === 0 || 
                                 (holdings.length === 0 && sectors.length === 0);
          
          if (isIncompleteData) {
            console.log(`[API] Incomplete data for ${symbol}, falling back to mock data`);
            // Fall back to mock data if available
            const mockData = mockETFData[symbol as keyof typeof mockETFData];
            if (mockData) {
              const priceHistory = generatePriceHistory(mockData.price, symbol);
              return NextResponse.json({
                ...mockData,
                priceHistory,
                lastUpdated: new Date().toISOString(),
                dataSource: 'mock'
              });
            }
          }

          // Generate price history (real providers would have this)
          const priceHistory = generatePriceHistory(quote.price, symbol);

          return NextResponse.json({
             symbol: quote.symbol,
             name: metadata?.name || `${symbol} ETF`,
             exchange: quote.exchange || 'Unknown',
             price: quote.price,
             change: quote.change,
             changePercent: quote.changePercent,
             volume: quote.volume,
             marketCap: quote.marketCap || 0,
             expenseRatio: metadata?.expenseRatio || 0,
             dividendYield: metadata?.dividendYield || 0,
             peRatio: metadata?.peRatio || 0,
             beta: metadata?.beta || 1.0,
             description: metadata?.description || `${symbol} Exchange Traded Fund`,
             inceptionDate: metadata?.inceptionDate || '2000-01-01',
             aum: metadata?.aum || 0,
             totalAssets: metadata?.aum || 0, // Use aum as totalAssets
             avgVolume: quote.volume || 0, // Use current volume as avgVolume
             dayRange: { low: quote.price * 0.98, high: quote.price * 1.02 }, // Estimate day range
             yearRange: { low: quote.price * 0.8, high: quote.price * 1.2 }, // Estimate year range
             topHoldings: holdings.slice(0, 10),
             sectorAllocation: sectors,
             performance: {
               '1D': quote.changePercent,
               '1W': 0, // Would need historical data
               '1M': 0,
               '3M': 0,
               '6M': 0,
               '1Y': 0,
               '3Y': 0,
               '5Y': 0
             },
             priceHistory,
             lastUpdated: new Date().toISOString(),
             dataSource: 'live'
           });
        }
      }
    } catch (error) {
      console.warn('Failed to fetch real data, falling back to mock:', error);
    }
    
    // Fall back to mock data
    console.log(`[API] Using mock data for ${symbol}`);
    const etfData = mockETFData[symbol as keyof typeof mockETFData];
    
    if (!etfData) {
      return NextResponse.json(
        { error: 'ETF not found' },
        { status: 404 }
      );
    }
    
    // Add price history for charts
    const priceHistory = generatePriceHistory(etfData.price, symbol);
    
    const response = {
      ...etfData,
      priceHistory,
      lastUpdated: new Date().toISOString(),
      dataSource: 'mock'
    };
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });
  } catch (error) {
    console.error('Error fetching ETF data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// Unified ETF data types for all providers

export interface ETFQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  timestamp: number;
  currency: string;
  exchange: string;
}

export interface ETFMetadata {
  symbol: string;
  name: string;
  description: string;
  exchange: string;
  currency: string;
  isin?: string;
  cusip?: string;
  category: string;
  family: string;
  inceptionDate: string;
  expenseRatio: number;
  aum: number; // Assets Under Management
  dividendYield?: number;
  peRatio?: number;
  beta?: number;
  website?: string;
}

export interface ETFHolding {
  symbol: string;
  name: string;
  weight: number; // percentage
  shares?: number;
  marketValue?: number;
  sector?: string;
  country?: string;
}

export interface ETFSectorAllocation {
  sector: string;
  weight: number; // percentage
}

export interface ETFCountryAllocation {
  country: string;
  weight: number; // percentage
}

export interface ETFPerformance {
  symbol: string;
  period: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '3Y' | '5Y' | 'YTD';
  return: number; // percentage
  volatility?: number;
  sharpeRatio?: number;
}

export interface PricePoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ETFHistoricalData {
  symbol: string;
  data: PricePoint[];
  interval: '1min' | '5min' | '15min' | '30min' | '1hour' | '1day' | '1week' | '1month';
}

export interface SearchResult {
  symbol: string;
  name: string;
  type: 'ETF' | 'Stock' | 'Index';
  exchange: string;
  currency: string;
}

// Provider response wrapper
export interface ProviderResponse<T> {
  data: T;
  provider: string;
  timestamp: number;
  success: boolean;
  error?: string;
}

// API rate limiting
export interface RateLimitInfo {
  remaining: number;
  reset: number;
  limit: number;
}

// Provider configuration
export interface ProviderConfig {
  name: string;
  apiKey: string;
  baseUrl: string;
  rateLimit: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
  endpoints: {
    quote: string;
    metadata: string;
    holdings: string;
    historical: string;
    search: string;
    etfProfile?: string;
    etfSector?: string;
    etfCountry?: string;
    performance?: string;
    fundamentals?: string;
  };
}
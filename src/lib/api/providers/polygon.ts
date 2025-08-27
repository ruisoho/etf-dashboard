import { BaseETFProvider } from '../base-provider';
import {
  ETFQuote,
  ETFMetadata,
  ETFHolding,
  ETFSectorAllocation,
  ETFCountryAllocation,
  ETFPerformance,
  ETFHistoricalData,
  SearchResult,
  ProviderResponse,
  ProviderConfig,
  PricePoint,
} from '../../types/etf';

// Polygon.io API response types
interface PolygonQuoteResponse {
  results: {
    T: string; // ticker
    c: number; // close
    h: number; // high
    l: number; // low
    o: number; // open
    v: number; // volume
    vw: number; // volume weighted average price
    t: number; // timestamp
  }[];
  status: string;
  request_id: string;
  count: number;
}

interface PolygonTickerDetailsResponse {
  results: {
    ticker: string;
    name: string;
    description: string;
    market: string;
    locale: string;
    primary_exchange: string;
    type: string;
    currency_name: string;
    cik?: string;
    composite_figi?: string;
    share_class_figi?: string;
    market_cap?: number;
    phone_number?: string;
    address?: {
      address1?: string;
      city?: string;
      state?: string;
      postal_code?: string;
    };
    homepage_url?: string;
    total_employees?: number;
    list_date?: string;
    branding?: {
      logo_url?: string;
      icon_url?: string;
    };
    share_class_shares_outstanding?: number;
    weighted_shares_outstanding?: number;
  };
  status: string;
  request_id: string;
}

interface PolygonAggregatesResponse {
  ticker: string;
  queryCount: number;
  resultsCount: number;
  adjusted: boolean;
  results: {
    c: number; // close
    h: number; // high
    l: number; // low
    n: number; // number of transactions
    o: number; // open
    t: number; // timestamp
    v: number; // volume
    vw: number; // volume weighted average price
  }[];
  status: string;
  request_id: string;
}

interface PolygonSearchResponse {
  results: {
    ticker: string;
    name: string;
    market: string;
    locale: string;
    primary_exchange: string;
    type: string;
    active: boolean;
    currency_name: string;
    cik?: string;
    composite_figi?: string;
    last_updated_utc: string;
  }[];
  status: string;
  request_id: string;
  count: number;
}

export class PolygonProvider extends BaseETFProvider {
  readonly name = 'Polygon.io';
  readonly config: ProviderConfig;

  constructor(apiKey: string) {
    super();
    this.config = {
      name: this.name,
      apiKey,
      baseUrl: 'https://api.polygon.io',
      rateLimit: {
        requestsPerMinute: 5, // Free tier limit
        requestsPerDay: 1000,
      },
      endpoints: {
        quote: '/v2/aggs/ticker/{symbol}/prev',
        metadata: '/v3/reference/tickers/{symbol}',
        holdings: '/v1/reference/tickers/{symbol}/holdings', // Note: May not be available for all plans
        historical: '/v2/aggs/ticker/{symbol}/range/{multiplier}/{timespan}/{from}/{to}',
        search: '/v3/reference/tickers',
      },
    };
  }

  async getQuote(symbol: string): Promise<ProviderResponse<ETFQuote>> {
    try {
      this.validateSymbol(symbol);
      const formattedSymbol = this.formatSymbol(symbol);
      
      const url = `${this.config.baseUrl}/v2/aggs/ticker/${formattedSymbol}/prev?apikey=${this.config.apiKey}`;
      const response = await this.makeRequest<PolygonQuoteResponse>(url);

      if (!response.results || response.results.length === 0) {
        return this.createErrorResponse('No quote data found');
      }

      const result = response.results[0];
      const quote: ETFQuote = {
        symbol: formattedSymbol,
        name: formattedSymbol, // Polygon doesn't return name in quote endpoint
        price: result.c,
        change: result.c - result.o,
        changePercent: ((result.c - result.o) / result.o) * 100,
        volume: result.v,
        timestamp: result.t,
        currency: 'USD',
        exchange: 'NASDAQ', // Default, should be fetched from metadata
      };

      return this.createSuccessResponse(quote);
    } catch (error) {
      return this.createErrorResponse(`Failed to fetch quote: ${error}`);
    }
  }

  async getMetadata(symbol: string): Promise<ProviderResponse<ETFMetadata>> {
    try {
      this.validateSymbol(symbol);
      const formattedSymbol = this.formatSymbol(symbol);
      
      const url = `${this.config.baseUrl}/v3/reference/tickers/${formattedSymbol}?apikey=${this.config.apiKey}`;
      const response = await this.makeRequest<PolygonTickerDetailsResponse>(url);

      const result = response.results;
      const metadata: ETFMetadata = {
        symbol: result.ticker,
        name: result.name,
        description: result.description || '',
        exchange: result.primary_exchange,
        currency: result.currency_name,
        category: 'ETF', // Default category
        family: '', // Not available in Polygon
        inceptionDate: result.list_date || '',
        expenseRatio: 0, // Not available in Polygon
        aum: result.market_cap || 0,
        website: result.homepage_url,
      };

      return this.createSuccessResponse(metadata);
    } catch (error) {
      return this.createErrorResponse(`Failed to fetch metadata: ${error}`);
    }
  }

  async getHoldings(symbol: string): Promise<ProviderResponse<ETFHolding[]>> {
    // Note: Holdings data is not readily available in Polygon.io free tier
    return this.createErrorResponse('Holdings data not available in Polygon.io');
  }

  async getSectorAllocation(symbol: string): Promise<ProviderResponse<ETFSectorAllocation[]>> {
    // Note: Sector allocation data is not readily available in Polygon.io
    return this.createErrorResponse('Sector allocation data not available in Polygon.io');
  }

  async getCountryAllocation(symbol: string): Promise<ProviderResponse<ETFCountryAllocation[]>> {
    // Note: Country allocation data is not readily available in Polygon.io
    return this.createErrorResponse('Country allocation data not available in Polygon.io');
  }

  async getPerformance(symbol: string, periods: string[]): Promise<ProviderResponse<ETFPerformance[]>> {
    // Note: Performance calculations would need to be derived from historical data
    return this.createErrorResponse('Performance data calculation not implemented for Polygon.io');
  }

  async getHistoricalData(
    symbol: string,
    interval: string,
    from: Date,
    to: Date
  ): Promise<ProviderResponse<ETFHistoricalData>> {
    try {
      this.validateSymbol(symbol);
      const formattedSymbol = this.formatSymbol(symbol);
      
      // Map interval to Polygon format
      const timespan = this.mapIntervalToTimespan(interval);
      const multiplier = 1;
      
      const fromStr = from.toISOString().split('T')[0];
      const toStr = to.toISOString().split('T')[0];
      
      const url = `${this.config.baseUrl}/v2/aggs/ticker/${formattedSymbol}/range/${multiplier}/${timespan}/${fromStr}/${toStr}?adjusted=true&sort=asc&apikey=${this.config.apiKey}`;
      const response = await this.makeRequest<PolygonAggregatesResponse>(url);

      if (!response.results || response.results.length === 0) {
        return this.createErrorResponse('No historical data found');
      }

      const data: PricePoint[] = response.results.map(point => ({
        timestamp: point.t,
        open: point.o,
        high: point.h,
        low: point.l,
        close: point.c,
        volume: point.v,
      }));

      const historicalData: ETFHistoricalData = {
        symbol: formattedSymbol,
        data,
        interval: interval as any,
      };

      return this.createSuccessResponse(historicalData);
    } catch (error) {
      return this.createErrorResponse(`Failed to fetch historical data: ${error}`);
    }
  }

  async search(query: string, limit = 10): Promise<ProviderResponse<SearchResult[]>> {
    try {
      if (!query || query.trim().length === 0) {
        return this.createErrorResponse('Search query is required');
      }

      const url = `${this.config.baseUrl}/v3/reference/tickers?search=${encodeURIComponent(query)}&active=true&limit=${limit}&apikey=${this.config.apiKey}`;
      const response = await this.makeRequest<PolygonSearchResponse>(url);

      if (!response.results || response.results.length === 0) {
        return this.createSuccessResponse([]);
      }

      const results: SearchResult[] = response.results
        .filter(ticker => ticker.type === 'ETF' || ticker.type === 'CS') // ETF or Common Stock
        .map(ticker => ({
          symbol: ticker.ticker,
          name: ticker.name,
          type: ticker.type === 'ETF' ? 'ETF' : 'Stock',
          exchange: ticker.primary_exchange,
          currency: ticker.currency_name,
        }));

      return this.createSuccessResponse(results);
    } catch (error) {
      return this.createErrorResponse(`Failed to search: ${error}`);
    }
  }

  private mapIntervalToTimespan(interval: string): string {
    const mapping: Record<string, string> = {
      '1min': 'minute',
      '5min': 'minute',
      '15min': 'minute',
      '30min': 'minute',
      '1hour': 'hour',
      '1day': 'day',
      '1week': 'week',
      '1month': 'month',
    };

    return mapping[interval] || 'day';
  }
}
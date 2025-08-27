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

// Finnhub API response types
interface FinnhubQuoteResponse {
  c: number; // current price
  d: number; // change
  dp: number; // percent change
  h: number; // high price of the day
  l: number; // low price of the day
  o: number; // open price of the day
  pc: number; // previous close price
  t: number; // timestamp
}

interface FinnhubCompanyProfileResponse {
  country: string;
  currency: string;
  exchange: string;
  ipo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
  logo: string;
  finnhubIndustry: string;
}

interface FinnhubCandleResponse {
  c: number[]; // close prices
  h: number[]; // high prices
  l: number[]; // low prices
  o: number[]; // open prices
  s: string; // status
  t: number[]; // timestamps
  v: number[]; // volumes
}

interface FinnhubSymbolSearchResponse {
  count: number;
  result: {
    description: string;
    displaySymbol: string;
    symbol: string;
    type: string;
  }[];
}

interface FinnhubETFProfileResponse {
  symbol: string;
  name: string;
  isin: string;
  cusip: string;
  fund: {
    expenseRatio: number;
    totalAssets: number;
    benchmark: string;
    inceptionDate: string;
    description: string;
    domicile: string;
    assetClass: string;
    nav: number;
    navCurrency: string;
  };
}

interface FinnhubETFHoldingsResponse {
  symbol: string;
  atDate: string;
  holdings: {
    symbol: string;
    name: string;
    isin: string;
    cusip: string;
    weight: number;
    value: number;
    share: number;
  }[];
}

interface FinnhubETFSectorResponse {
  symbol: string;
  breakdown: {
    sector: string;
    weight: number;
  }[];
}

interface FinnhubETFCountryResponse {
  symbol: string;
  breakdown: {
    country: string;
    weight: number;
  }[];
}

export class FinnhubProvider extends BaseETFProvider {
  readonly name = 'Finnhub';
  readonly config: ProviderConfig;

  constructor(apiKey: string) {
    super();
    this.config = {
      name: this.name,
      apiKey,
      baseUrl: 'https://finnhub.io/api/v1',
      rateLimit: {
        requestsPerMinute: 60, // Free tier limit
        requestsPerDay: 1000,
      },
      endpoints: {
        quote: '/quote',
        metadata: '/stock/profile2',
        holdings: '/etf/holdings',
        historical: '/stock/candle',
        search: '/search',
        etfProfile: '/etf/profile',
        etfSector: '/etf/sector',
        etfCountry: '/etf/country',
      },
    };
  }

  async getQuote(symbol: string): Promise<ProviderResponse<ETFQuote>> {
    try {
      this.validateSymbol(symbol);
      const formattedSymbol = this.formatSymbol(symbol);
      
      const url = `${this.config.baseUrl}/quote?symbol=${formattedSymbol}&token=${this.config.apiKey}`;
      const response = await this.makeRequest<FinnhubQuoteResponse>(url);

      // Get company profile for name
      const profileUrl = `${this.config.baseUrl}/stock/profile2?symbol=${formattedSymbol}&token=${this.config.apiKey}`;
      const profileResponse = await this.makeRequest<FinnhubCompanyProfileResponse>(profileUrl);

      const quote: ETFQuote = {
        symbol: formattedSymbol,
        name: profileResponse.name || formattedSymbol,
        price: response.c,
        change: response.d,
        changePercent: response.dp,
        volume: 0, // Not available in quote endpoint
        timestamp: response.t * 1000, // Convert to milliseconds
        currency: profileResponse.currency || 'USD',
        exchange: profileResponse.exchange || 'NASDAQ',
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
      
      // Try ETF profile first
      const etfProfileUrl = `${this.config.baseUrl}/etf/profile?symbol=${formattedSymbol}&token=${this.config.apiKey}`;
      try {
        const etfResponse = await this.makeRequest<FinnhubETFProfileResponse>(etfProfileUrl);
        
        const metadata: ETFMetadata = {
          symbol: etfResponse.symbol,
          name: etfResponse.name,
          description: etfResponse.fund.description || '',
          exchange: '', // Not available in ETF profile
          currency: etfResponse.fund.navCurrency,
          category: etfResponse.fund.assetClass || 'ETF',
          family: '', // Not available
          inceptionDate: etfResponse.fund.inceptionDate,
          expenseRatio: etfResponse.fund.expenseRatio,
          aum: etfResponse.fund.totalAssets,
          website: '',
        };

        return this.createSuccessResponse(metadata);
      } catch (etfError) {
        // Fallback to company profile
        const profileUrl = `${this.config.baseUrl}/stock/profile2?symbol=${formattedSymbol}&token=${this.config.apiKey}`;
        const profileResponse = await this.makeRequest<FinnhubCompanyProfileResponse>(profileUrl);

        const metadata: ETFMetadata = {
          symbol: profileResponse.ticker,
          name: profileResponse.name,
          description: '', // Not available in company profile
          exchange: profileResponse.exchange,
          currency: profileResponse.currency,
          category: profileResponse.finnhubIndustry || 'ETF',
          family: '',
          inceptionDate: profileResponse.ipo,
          expenseRatio: 0, // Not available
          aum: profileResponse.marketCapitalization,
          website: profileResponse.weburl,
        };

        return this.createSuccessResponse(metadata);
      }
    } catch (error) {
      return this.createErrorResponse(`Failed to fetch metadata: ${error}`);
    }
  }

  async getHoldings(symbol: string): Promise<ProviderResponse<ETFHolding[]>> {
    try {
      this.validateSymbol(symbol);
      const formattedSymbol = this.formatSymbol(symbol);
      
      const url = `${this.config.baseUrl}/etf/holdings?symbol=${formattedSymbol}&token=${this.config.apiKey}`;
      const response = await this.makeRequest<FinnhubETFHoldingsResponse>(url);

      if (!response.holdings || response.holdings.length === 0) {
        return this.createSuccessResponse([]);
      }

      const holdings: ETFHolding[] = response.holdings.map(holding => ({
        symbol: holding.symbol,
        name: holding.name,
        weight: holding.weight,
        shares: holding.share,
        marketValue: holding.value,
      }));

      return this.createSuccessResponse(holdings);
    } catch (error) {
      return this.createErrorResponse(`Failed to fetch holdings: ${error}`);
    }
  }

  async getSectorAllocation(symbol: string): Promise<ProviderResponse<ETFSectorAllocation[]>> {
    try {
      this.validateSymbol(symbol);
      const formattedSymbol = this.formatSymbol(symbol);
      
      const url = `${this.config.baseUrl}/etf/sector?symbol=${formattedSymbol}&token=${this.config.apiKey}`;
      const response = await this.makeRequest<FinnhubETFSectorResponse>(url);

      if (!response.breakdown || response.breakdown.length === 0) {
        return this.createSuccessResponse([]);
      }

      const sectorAllocation: ETFSectorAllocation[] = response.breakdown.map(sector => ({
        sector: sector.sector,
        weight: sector.weight,
      }));

      return this.createSuccessResponse(sectorAllocation);
    } catch (error) {
      return this.createErrorResponse(`Failed to fetch sector allocation: ${error}`);
    }
  }

  async getCountryAllocation(symbol: string): Promise<ProviderResponse<ETFCountryAllocation[]>> {
    try {
      this.validateSymbol(symbol);
      const formattedSymbol = this.formatSymbol(symbol);
      
      const url = `${this.config.baseUrl}/etf/country?symbol=${formattedSymbol}&token=${this.config.apiKey}`;
      const response = await this.makeRequest<FinnhubETFCountryResponse>(url);

      if (!response.breakdown || response.breakdown.length === 0) {
        return this.createSuccessResponse([]);
      }

      const countryAllocation: ETFCountryAllocation[] = response.breakdown.map(country => ({
        country: country.country,
        weight: country.weight,
      }));

      return this.createSuccessResponse(countryAllocation);
    } catch (error) {
      return this.createErrorResponse(`Failed to fetch country allocation: ${error}`);
    }
  }

  async getPerformance(symbol: string, periods: string[]): Promise<ProviderResponse<ETFPerformance[]>> {
    // Note: Performance calculations would need to be derived from historical data
    return this.createErrorResponse('Performance data calculation not implemented for Finnhub');
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
      
      // Map interval to Finnhub resolution
      const resolution = this.mapIntervalToResolution(interval);
      
      const fromTimestamp = Math.floor(from.getTime() / 1000);
      const toTimestamp = Math.floor(to.getTime() / 1000);
      
      const url = `${this.config.baseUrl}/stock/candle?symbol=${formattedSymbol}&resolution=${resolution}&from=${fromTimestamp}&to=${toTimestamp}&token=${this.config.apiKey}`;
      const response = await this.makeRequest<FinnhubCandleResponse>(url);

      if (response.s !== 'ok' || !response.c || response.c.length === 0) {
        return this.createErrorResponse('No historical data found');
      }

      const data: PricePoint[] = response.c.map((close, index) => ({
        timestamp: response.t[index] * 1000, // Convert to milliseconds
        open: response.o[index],
        high: response.h[index],
        low: response.l[index],
        close: close,
        volume: response.v[index],
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

      const url = `${this.config.baseUrl}/search?q=${encodeURIComponent(query)}&token=${this.config.apiKey}`;
      const response = await this.makeRequest<FinnhubSymbolSearchResponse>(url);

      if (!response.result || response.result.length === 0) {
        return this.createSuccessResponse([]);
      }

      const results: SearchResult[] = response.result
        .slice(0, limit)
        .map(item => ({
          symbol: item.symbol,
          name: item.description,
          type: item.type === 'ETF' ? 'ETF' : 'Stock',
          exchange: '', // Not available in search results
          currency: 'USD', // Default
        }));

      return this.createSuccessResponse(results);
    } catch (error) {
      return this.createErrorResponse(`Failed to search: ${error}`);
    }
  }

  private mapIntervalToResolution(interval: string): string {
    const mapping: Record<string, string> = {
      '1min': '1',
      '5min': '5',
      '15min': '15',
      '30min': '30',
      '1hour': '60',
      '1day': 'D',
      '1week': 'W',
      '1month': 'M',
    };

    return mapping[interval] || 'D';
  }
}
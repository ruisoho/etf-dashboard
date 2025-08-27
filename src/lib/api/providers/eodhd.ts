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

// EODHD API response types
interface EODHDQuoteResponse {
  code: string;
  timestamp: number;
  gmtoffset: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  previousClose: number;
  change: number;
  change_p: number;
}

interface EODHDFundamentalsResponse {
  General: {
    Code: string;
    Type: string;
    Name: string;
    Exchange: string;
    CurrencyCode: string;
    CurrencyName: string;
    CurrencySymbol: string;
    CountryName: string;
    CountryISO: string;
    ISIN: string;
    CUSIP: string;
    Description: string;
    Category: string;
    UpdatedAt: string;
  };
  ETF_Data?: {
    ISIN: string;
    Company_Name: string;
    Company_URL: string;
    ETF_URL: string;
    Domicile: string;
    Index_Name: string;
    Yield: number;
    Dividend_Paying_Frequency: string;
    Inception_Date: string;
    Max_Annual_Mgmt_Charge: number;
    Ongoing_Charge: number;
    Date_Ongoing_Charge: string;
    NetExpenseRatio: number;
    AnnualHoldingsTurnover: number;
    TotalAssets: number;
    Average_Mkt_Cap_Mil: number;
    Market_Capitalisation: {
      Mega: number;
      Big: number;
      Medium: number;
      Small: number;
      Micro: number;
    };
    World_Regions: {
      [region: string]: number;
    };
    Sector_Weights: {
      [sector: string]: number;
    };
    Fixed_Income: {
      [category: string]: number;
    };
    Holdings_Count: number;
    Top_10_Holdings: {
      [holding: string]: number;
    };
    Holdings: {
      [holding: string]: {
        Code: string;
        Exchange: string;
        Name: string;
        Sector: string;
        Industry: string;
        Country: string;
        Region: string;
        'Assets_%': number;
      };
    };
    Valuations_Growth: {
      [metric: string]: number;
    };
    MorningStar: {
      Ratio: {
        [ratio: string]: number;
      };
      Risk: {
        [risk: string]: number;
      };
    };
  };
}

interface EODHDHistoricalPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  adjusted_close: number;
  volume: number;
}

type EODHDHistoricalResponse = EODHDHistoricalPoint[];

interface EODHDSearchItem {
  Code: string;
  Exchange: string;
  Name: string;
  Type: string;
  Country: string;
  Currency: string;
  ISIN: string;
  previousClose: number;
  previousCloseDate: string;
}

type EODHDSearchResponse = EODHDSearchItem[];

export class EODHDProvider extends BaseETFProvider {
  readonly name = 'EODHD';
  readonly config: ProviderConfig;

  constructor(apiKey: string) {
    super();
    this.config = {
      name: this.name,
      apiKey,
      baseUrl: 'https://eodhd.com/api',
      rateLimit: {
        requestsPerMinute: 20, // Free tier limit
        requestsPerDay: 1000,
      },
      endpoints: {
        quote: '/real-time/{symbol}',
        metadata: '/fundamentals/{symbol}',
        holdings: '/fundamentals/{symbol}',
        historical: '/eod/{symbol}',
        search: '/search/{query}',
        fundamentals: '/fundamentals/{symbol}',
      },
    };
  }

  async getQuote(symbol: string): Promise<ProviderResponse<ETFQuote>> {
    try {
      this.validateSymbol(symbol);
      const formattedSymbol = this.formatSymbolWithExchange(symbol);
      
      const url = `${this.config.baseUrl}/real-time/${formattedSymbol}?api_token=${this.config.apiKey}&fmt=json`;
      const response = await this.makeRequest<EODHDQuoteResponse>(url);

      const quote: ETFQuote = {
        symbol: response.code,
        name: response.code, // Name not available in quote endpoint
        price: response.close,
        change: response.change,
        changePercent: response.change_p,
        volume: response.volume,
        timestamp: response.timestamp * 1000, // Convert to milliseconds
        currency: 'USD', // Default, should be fetched from fundamentals
        exchange: 'US', // Default
      };

      return this.createSuccessResponse(quote);
    } catch (error) {
      return this.createErrorResponse(`Failed to fetch quote: ${error}`);
    }
  }

  async getMetadata(symbol: string): Promise<ProviderResponse<ETFMetadata>> {
    try {
      this.validateSymbol(symbol);
      const formattedSymbol = this.formatSymbolWithExchange(symbol);
      
      const url = `${this.config.baseUrl}/fundamentals/${formattedSymbol}?api_token=${this.config.apiKey}`;
      const response = await this.makeRequest<EODHDFundamentalsResponse>(url);

      const general = response.General;
      const etfData = response.ETF_Data;

      const metadata: ETFMetadata = {
        symbol: general.Code,
        name: general.Name,
        description: general.Description || '',
        exchange: general.Exchange,
        currency: general.CurrencyCode,
        category: general.Category || 'ETF',
        family: etfData?.Company_Name || '',
        inceptionDate: etfData?.Inception_Date || '',
        expenseRatio: etfData?.NetExpenseRatio || etfData?.Ongoing_Charge || 0,
        aum: etfData?.TotalAssets || 0,
        website: etfData?.Company_URL || etfData?.ETF_URL,
      };

      return this.createSuccessResponse(metadata);
    } catch (error) {
      return this.createErrorResponse(`Failed to fetch metadata: ${error}`);
    }
  }

  async getHoldings(symbol: string): Promise<ProviderResponse<ETFHolding[]>> {
    try {
      this.validateSymbol(symbol);
      const formattedSymbol = this.formatSymbolWithExchange(symbol);
      
      const url = `${this.config.baseUrl}/fundamentals/${formattedSymbol}?api_token=${this.config.apiKey}`;
      const response = await this.makeRequest<EODHDFundamentalsResponse>(url);

      const etfData = response.ETF_Data;
      if (!etfData?.Holdings) {
        return this.createSuccessResponse([]);
      }

      const holdings: ETFHolding[] = Object.entries(etfData.Holdings).map(([key, holding]) => ({
        symbol: holding.Code,
        name: holding.Name,
        weight: holding['Assets_%'],
        shares: 0, // Not available
        marketValue: 0, // Not available
      }));

      return this.createSuccessResponse(holdings);
    } catch (error) {
      return this.createErrorResponse(`Failed to fetch holdings: ${error}`);
    }
  }

  async getSectorAllocation(symbol: string): Promise<ProviderResponse<ETFSectorAllocation[]>> {
    try {
      this.validateSymbol(symbol);
      const formattedSymbol = this.formatSymbolWithExchange(symbol);
      
      const url = `${this.config.baseUrl}/fundamentals/${formattedSymbol}?api_token=${this.config.apiKey}`;
      const response = await this.makeRequest<EODHDFundamentalsResponse>(url);

      const etfData = response.ETF_Data;
      if (!etfData?.Sector_Weights) {
        return this.createSuccessResponse([]);
      }

      const sectorAllocation: ETFSectorAllocation[] = Object.entries(etfData.Sector_Weights).map(([sector, weight]) => ({
        sector,
        weight: weight as number,
      }));

      return this.createSuccessResponse(sectorAllocation);
    } catch (error) {
      return this.createErrorResponse(`Failed to fetch sector allocation: ${error}`);
    }
  }

  async getCountryAllocation(symbol: string): Promise<ProviderResponse<ETFCountryAllocation[]>> {
    try {
      this.validateSymbol(symbol);
      const formattedSymbol = this.formatSymbolWithExchange(symbol);
      
      const url = `${this.config.baseUrl}/fundamentals/${formattedSymbol}?api_token=${this.config.apiKey}`;
      const response = await this.makeRequest<EODHDFundamentalsResponse>(url);

      const etfData = response.ETF_Data;
      if (!etfData?.World_Regions) {
        return this.createSuccessResponse([]);
      }

      const countryAllocation: ETFCountryAllocation[] = Object.entries(etfData.World_Regions).map(([country, weight]) => ({
        country,
        weight: weight as number,
      }));

      return this.createSuccessResponse(countryAllocation);
    } catch (error) {
      return this.createErrorResponse(`Failed to fetch country allocation: ${error}`);
    }
  }

  async getPerformance(symbol: string, periods: string[]): Promise<ProviderResponse<ETFPerformance[]>> {
    // Note: Performance calculations would need to be derived from historical data
    return this.createErrorResponse('Performance data calculation not implemented for EODHD');
  }

  async getHistoricalData(
    symbol: string,
    interval: string,
    from: Date,
    to: Date
  ): Promise<ProviderResponse<ETFHistoricalData>> {
    try {
      this.validateSymbol(symbol);
      const formattedSymbol = this.formatSymbolWithExchange(symbol);
      
      const fromStr = from.toISOString().split('T')[0];
      const toStr = to.toISOString().split('T')[0];
      
      // EODHD supports different periods: d (daily), w (weekly), m (monthly)
      const period = this.mapIntervalToPeriod(interval);
      
      const url = `${this.config.baseUrl}/eod/${formattedSymbol}?api_token=${this.config.apiKey}&period=${period}&from=${fromStr}&to=${toStr}&fmt=json`;
      const response = await this.makeRequest<EODHDHistoricalResponse>(url);

      if (!response || response.length === 0) {
        return this.createErrorResponse('No historical data found');
      }

      const data: PricePoint[] = response.map(point => ({
        timestamp: new Date(point.date).getTime(),
        open: point.open,
        high: point.high,
        low: point.low,
        close: point.close,
        volume: point.volume,
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

      const url = `${this.config.baseUrl}/search/${encodeURIComponent(query)}?api_token=${this.config.apiKey}&limit=${limit}&type=etf`;
      const response = await this.makeRequest<EODHDSearchResponse>(url);

      if (!response || response.length === 0) {
        return this.createSuccessResponse([]);
      }

      const results: SearchResult[] = response.map(item => ({
        symbol: item.Code,
        name: item.Name,
        type: item.Type === 'ETF' ? 'ETF' : 'Stock',
        exchange: item.Exchange,
        currency: item.Currency,
      }));

      return this.createSuccessResponse(results);
    } catch (error) {
      return this.createErrorResponse(`Failed to search: ${error}`);
    }
  }

  private formatSymbolWithExchange(symbol: string): string {
    // EODHD requires format like 'AAPL.US' for US stocks
    if (symbol.includes('.')) {
      return symbol;
    }
    return `${symbol}.US`; // Default to US exchange
  }

  private mapIntervalToPeriod(interval: string): string {
    const mapping: Record<string, string> = {
      '1min': 'd', // EODHD doesn't support intraday for free tier
      '5min': 'd',
      '15min': 'd',
      '30min': 'd',
      '1hour': 'd',
      '1day': 'd',
      '1week': 'w',
      '1month': 'm',
    };

    return mapping[interval] || 'd';
  }
}
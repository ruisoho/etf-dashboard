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

// FMP API response types
interface FMPQuoteResponse {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
  change: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  priceAvg50: number;
  priceAvg200: number;
  exchange: string;
  volume: number;
  avgVolume: number;
  open: number;
  previousClose: number;
  eps: number;
  pe: number;
  earningsAnnouncement: string;
  sharesOutstanding: number;
  timestamp: number;
}

interface FMPCompanyProfileResponse {
  symbol: string;
  price: number;
  beta: number;
  volAvg: number;
  mktCap: number;
  lastDiv: number;
  range: string;
  changes: number;
  companyName: string;
  currency: string;
  cik: string;
  isin: string;
  cusip: string;
  exchange: string;
  exchangeShortName: string;
  industry: string;
  website: string;
  description: string;
  ceo: string;
  sector: string;
  country: string;
  fullTimeEmployees: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  dcfDiff: number;
  dcf: number;
  image: string;
  ipoDate: string;
  defaultImage: boolean;
  isEtf: boolean;
  isActivelyTrading: boolean;
  isAdr: boolean;
  isFund: boolean;
}

interface FMPETFHoldingsResponse {
  symbol: string;
  name: string;
  lei: string;
  title: string;
  cusip: string;
  isin: string;
  balance: number;
  units: string;
  curVal: number;
  pctVal: number;
  date: string;
}

interface FMPETFSectorWeightingResponse {
  sector: string;
  weightPercentage: string;
}

interface FMPETFCountryWeightingResponse {
  country: string;
  weightPercentage: string;
}

interface FMPHistoricalResponse {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  adjClose: number;
  volume: number;
  unadjustedVolume: number;
  change: number;
  changePercent: number;
  vwap: number;
  label: string;
  changeOverTime: number;
}

interface FMPSearchResponse {
  symbol: string;
  name: string;
  currency: string;
  stockExchange: string;
  exchangeShortName: string;
}

export class FMPProvider extends BaseETFProvider {
  readonly name = 'Financial Modeling Prep';
  readonly config: ProviderConfig;

  constructor(apiKey: string) {
    super();
    this.config = {
      name: this.name,
      apiKey,
      baseUrl: 'https://financialmodelingprep.com/api/v3',
      rateLimit: {
        requestsPerMinute: 250, // Free tier limit
        requestsPerDay: 250,
      },
      endpoints: {
        quote: '/quote/{symbol}',
        metadata: '/profile/{symbol}',
        holdings: '/etf-holder/{symbol}',
        historical: '/historical-price-full/{symbol}',
        search: '/search',
        etfSector: '/etf-sector-weightings/{symbol}',
        etfCountry: '/etf-country-weightings/{symbol}',
      },
    };
  }

  async getQuote(symbol: string): Promise<ProviderResponse<ETFQuote>> {
    try {
      this.validateSymbol(symbol);
      const formattedSymbol = this.formatSymbol(symbol);
      
      const url = `${this.config.baseUrl}/quote/${formattedSymbol}?apikey=${this.config.apiKey}`;
      const response = await this.makeRequest<FMPQuoteResponse[]>(url);

      if (!response || response.length === 0) {
        return this.createErrorResponse('No quote data found');
      }

      const result = response[0];
      const quote: ETFQuote = {
        symbol: result.symbol,
        name: result.name,
        price: result.price,
        change: result.change,
        changePercent: result.changesPercentage,
        volume: result.volume,
        timestamp: result.timestamp * 1000, // Convert to milliseconds
        currency: 'USD', // Default, should be fetched from profile
        exchange: result.exchange,
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
      
      const url = `${this.config.baseUrl}/profile/${formattedSymbol}?apikey=${this.config.apiKey}`;
      const response = await this.makeRequest<FMPCompanyProfileResponse[]>(url);

      if (!response || response.length === 0) {
        return this.createErrorResponse('No metadata found');
      }

      const result = response[0];
      const metadata: ETFMetadata = {
        symbol: result.symbol,
        name: result.companyName,
        description: result.description || '',
        exchange: result.exchangeShortName,
        currency: result.currency,
        category: result.sector || 'ETF',
        family: '', // Not available in FMP
        inceptionDate: result.ipoDate,
        expenseRatio: 0, // Not available in basic profile
        aum: result.mktCap,
        website: result.website,
      };

      return this.createSuccessResponse(metadata);
    } catch (error) {
      return this.createErrorResponse(`Failed to fetch metadata: ${error}`);
    }
  }

  async getHoldings(symbol: string): Promise<ProviderResponse<ETFHolding[]>> {
    try {
      this.validateSymbol(symbol);
      const formattedSymbol = this.formatSymbol(symbol);
      
      const url = `${this.config.baseUrl}/etf-holder/${formattedSymbol}?apikey=${this.config.apiKey}`;
      const response = await this.makeRequest<FMPETFHoldingsResponse[]>(url);

      if (!response || response.length === 0) {
        return this.createSuccessResponse([]);
      }

      const holdings: ETFHolding[] = response.map(holding => ({
        symbol: holding.symbol,
        name: holding.name,
        weight: holding.pctVal,
        shares: holding.balance,
        marketValue: holding.curVal,
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
      
      const url = `${this.config.baseUrl}/etf-sector-weightings/${formattedSymbol}?apikey=${this.config.apiKey}`;
      const response = await this.makeRequest<FMPETFSectorWeightingResponse[]>(url);

      if (!response || response.length === 0) {
        return this.createSuccessResponse([]);
      }

      const sectorAllocation: ETFSectorAllocation[] = response.map(sector => ({
        sector: sector.sector,
        weight: parseFloat(sector.weightPercentage),
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
      
      const url = `${this.config.baseUrl}/etf-country-weightings/${formattedSymbol}?apikey=${this.config.apiKey}`;
      const response = await this.makeRequest<FMPETFCountryWeightingResponse[]>(url);

      if (!response || response.length === 0) {
        return this.createSuccessResponse([]);
      }

      const countryAllocation: ETFCountryAllocation[] = response.map(country => ({
        country: country.country,
        weight: parseFloat(country.weightPercentage),
      }));

      return this.createSuccessResponse(countryAllocation);
    } catch (error) {
      return this.createErrorResponse(`Failed to fetch country allocation: ${error}`);
    }
  }

  async getPerformance(symbol: string, periods: string[]): Promise<ProviderResponse<ETFPerformance[]>> {
    // Note: Performance calculations would need to be derived from historical data
    return this.createErrorResponse('Performance data calculation not implemented for FMP');
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
      
      const fromStr = from.toISOString().split('T')[0];
      const toStr = to.toISOString().split('T')[0];
      
      // FMP supports different intervals via different endpoints
      const endpoint = this.getHistoricalEndpoint(interval);
      
      const url = `${this.config.baseUrl}${endpoint}/${formattedSymbol}?from=${fromStr}&to=${toStr}&apikey=${this.config.apiKey}`;
      const response = await this.makeRequest<{ historical: FMPHistoricalResponse[] }>(url);

      if (!response?.historical || response.historical.length === 0) {
        return this.createErrorResponse('No historical data found');
      }

      const data: PricePoint[] = response.historical.map(point => ({
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

      const url = `${this.config.baseUrl}/search?query=${encodeURIComponent(query)}&limit=${limit}&apikey=${this.config.apiKey}`;
      const response = await this.makeRequest<FMPSearchResponse[]>(url);

      if (!response || response.length === 0) {
        return this.createSuccessResponse([]);
      }

      const results: SearchResult[] = response.map(item => ({
        symbol: item.symbol,
        name: item.name,
        type: 'ETF', // FMP search doesn't distinguish types clearly
        exchange: item.exchangeShortName,
        currency: item.currency,
      }));

      return this.createSuccessResponse(results);
    } catch (error) {
      return this.createErrorResponse(`Failed to search: ${error}`);
    }
  }

  private getHistoricalEndpoint(interval: string): string {
    const mapping: Record<string, string> = {
      '1min': '/historical-chart/1min',
      '5min': '/historical-chart/5min',
      '15min': '/historical-chart/15min',
      '30min': '/historical-chart/30min',
      '1hour': '/historical-chart/1hour',
      '1day': '/historical-price-full',
      '1week': '/historical-price-full', // Will need to be processed
      '1month': '/historical-price-full', // Will need to be processed
    };

    return mapping[interval] || '/historical-price-full';
  }
}
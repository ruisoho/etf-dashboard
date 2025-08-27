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

// Alpha Vantage API response types
interface AlphaVantageQuoteResponse {
  'Global Quote': {
    '01. symbol': string;
    '02. open': string;
    '03. high': string;
    '04. low': string;
    '05. price': string;
    '06. volume': string;
    '07. latest trading day': string;
    '08. previous close': string;
    '09. change': string;
    '10. change percent': string;
  };
}

interface AlphaVantageOverviewResponse {
  Symbol: string;
  AssetType: string;
  Name: string;
  Description: string;
  CIK: string;
  Exchange: string;
  Currency: string;
  Country: string;
  Sector: string;
  Industry: string;
  Address: string;
  FiscalYearEnd: string;
  LatestQuarter: string;
  MarketCapitalization: string;
  EBITDA: string;
  PERatio: string;
  PEGRatio: string;
  BookValue: string;
  DividendPerShare: string;
  DividendYield: string;
  EPS: string;
  RevenuePerShareTTM: string;
  ProfitMargin: string;
  OperatingMarginTTM: string;
  ReturnOnAssetsTTM: string;
  ReturnOnEquityTTM: string;
  RevenueTTM: string;
  GrossProfitTTM: string;
  DilutedEPSTTM: string;
  QuarterlyEarningsGrowthYOY: string;
  QuarterlyRevenueGrowthYOY: string;
  AnalystTargetPrice: string;
  TrailingPE: string;
  ForwardPE: string;
  PriceToSalesRatioTTM: string;
  PriceToBookRatio: string;
  EVToRevenue: string;
  EVToEBITDA: string;
  Beta: string;
  '52WeekHigh': string;
  '52WeekLow': string;
  '50DayMovingAverage': string;
  '200DayMovingAverage': string;
  SharesOutstanding: string;
  DividendDate: string;
  ExDividendDate: string;
}

interface AlphaVantageTimeSeriesResponse {
  'Meta Data': {
    '1. Information': string;
    '2. Symbol': string;
    '3. Last Refreshed': string;
    '4. Output Size': string;
    '5. Time Zone': string;
  };
  'Time Series (Daily)': {
    [date: string]: {
      '1. open': string;
      '2. high': string;
      '3. low': string;
      '4. close': string;
      '5. volume': string;
    };
  };
}

interface AlphaVantageSearchResponse {
  bestMatches: {
    '1. symbol': string;
    '2. name': string;
    '3. type': string;
    '4. region': string;
    '5. marketOpen': string;
    '6. marketClose': string;
    '7. timezone': string;
    '8. currency': string;
    '9. matchScore': string;
  }[];
}

export class AlphaVantageProvider extends BaseETFProvider {
  readonly name = 'Alpha Vantage';
  readonly config: ProviderConfig;

  constructor(apiKey: string) {
    super();
    this.config = {
      name: this.name,
      apiKey,
      baseUrl: 'https://www.alphavantage.co/query',
      rateLimit: {
        requestsPerMinute: 5, // Free tier limit
        requestsPerDay: 500,
      },
      endpoints: {
        quote: '?function=GLOBAL_QUOTE',
        metadata: '?function=OVERVIEW',
        holdings: '', // Not available
        historical: '?function=TIME_SERIES_DAILY',
        search: '?function=SYMBOL_SEARCH',
      },
    };
  }

  async getQuote(symbol: string): Promise<ProviderResponse<ETFQuote>> {
    try {
      this.validateSymbol(symbol);
      const formattedSymbol = this.formatSymbol(symbol);
      
      const url = `${this.config.baseUrl}?function=GLOBAL_QUOTE&symbol=${formattedSymbol}&apikey=${this.config.apiKey}`;
      const response = await this.makeRequest<AlphaVantageQuoteResponse>(url);

      const globalQuote = response['Global Quote'];
      if (!globalQuote) {
        return this.createErrorResponse('No quote data found');
      }

      const quote: ETFQuote = {
        symbol: globalQuote['01. symbol'],
        name: globalQuote['01. symbol'], // Name not available in quote
        price: parseFloat(globalQuote['05. price']),
        change: parseFloat(globalQuote['09. change']),
        changePercent: parseFloat(globalQuote['10. change percent'].replace('%', '')),
        volume: parseInt(globalQuote['06. volume']),
        timestamp: new Date(globalQuote['07. latest trading day']).getTime(),
        currency: 'USD', // Default, should be fetched from overview
        exchange: 'NASDAQ', // Default
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
      
      const url = `${this.config.baseUrl}?function=OVERVIEW&symbol=${formattedSymbol}&apikey=${this.config.apiKey}`;
      const response = await this.makeRequest<AlphaVantageOverviewResponse>(url);

      if (!response.Symbol) {
        return this.createErrorResponse('No metadata found');
      }

      const metadata: ETFMetadata = {
        symbol: response.Symbol,
        name: response.Name,
        description: response.Description || '',
        exchange: response.Exchange,
        currency: response.Currency,
        category: response.AssetType || 'ETF',
        family: '', // Not available
        inceptionDate: '', // Not available in overview
        expenseRatio: 0, // Not available
        aum: parseFloat(response.MarketCapitalization) || 0,
        website: '',
      };

      return this.createSuccessResponse(metadata);
    } catch (error) {
      return this.createErrorResponse(`Failed to fetch metadata: ${error}`);
    }
  }

  async getHoldings(symbol: string): Promise<ProviderResponse<ETFHolding[]>> {
    // Note: Holdings data is not available in Alpha Vantage
    return this.createErrorResponse('Holdings data not available in Alpha Vantage');
  }

  async getSectorAllocation(symbol: string): Promise<ProviderResponse<ETFSectorAllocation[]>> {
    // Note: Sector allocation data is not available in Alpha Vantage
    return this.createErrorResponse('Sector allocation data not available in Alpha Vantage');
  }

  async getCountryAllocation(symbol: string): Promise<ProviderResponse<ETFCountryAllocation[]>> {
    // Note: Country allocation data is not available in Alpha Vantage
    return this.createErrorResponse('Country allocation data not available in Alpha Vantage');
  }

  async getPerformance(symbol: string, periods: string[]): Promise<ProviderResponse<ETFPerformance[]>> {
    // Note: Performance calculations would need to be derived from historical data
    return this.createErrorResponse('Performance data calculation not implemented for Alpha Vantage');
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
      
      // Alpha Vantage has different functions for different intervals
      const functionName = this.mapIntervalToFunction(interval);
      
      const url = `${this.config.baseUrl}?function=${functionName}&symbol=${formattedSymbol}&apikey=${this.config.apiKey}&outputsize=full`;
      const response = await this.makeRequest<AlphaVantageTimeSeriesResponse>(url);

      const timeSeries = response['Time Series (Daily)'];
      if (!timeSeries) {
        return this.createErrorResponse('No historical data found');
      }

      // Filter data by date range and convert to our format
      const data: PricePoint[] = Object.entries(timeSeries)
        .filter(([date]) => {
          const pointDate = new Date(date);
          return pointDate >= from && pointDate <= to;
        })
        .map(([date, values]) => ({
          timestamp: new Date(date).getTime(),
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseInt(values['5. volume']),
        }))
        .sort((a, b) => a.timestamp - b.timestamp); // Sort by timestamp ascending

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

      const url = `${this.config.baseUrl}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${this.config.apiKey}`;
      const response = await this.makeRequest<AlphaVantageSearchResponse>(url);

      if (!response.bestMatches || response.bestMatches.length === 0) {
        return this.createSuccessResponse([]);
      }

      const results: SearchResult[] = response.bestMatches
        .slice(0, limit)
        .map(match => ({
          symbol: match['1. symbol'],
          name: match['2. name'],
          type: match['3. type'] === 'ETF' ? 'ETF' : 'Stock',
          exchange: match['4. region'],
          currency: match['8. currency'],
        }));

      return this.createSuccessResponse(results);
    } catch (error) {
      return this.createErrorResponse(`Failed to search: ${error}`);
    }
  }

  private mapIntervalToFunction(interval: string): string {
    const mapping: Record<string, string> = {
      '1min': 'TIME_SERIES_INTRADAY&interval=1min',
      '5min': 'TIME_SERIES_INTRADAY&interval=5min',
      '15min': 'TIME_SERIES_INTRADAY&interval=15min',
      '30min': 'TIME_SERIES_INTRADAY&interval=30min',
      '1hour': 'TIME_SERIES_INTRADAY&interval=60min',
      '1day': 'TIME_SERIES_DAILY',
      '1week': 'TIME_SERIES_WEEKLY',
      '1month': 'TIME_SERIES_MONTHLY',
    };

    return mapping[interval] || 'TIME_SERIES_DAILY';
  }
}
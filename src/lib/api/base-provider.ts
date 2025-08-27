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
  RateLimitInfo,
  ProviderConfig,
} from '../types/etf';

// Base interface that all providers must implement
export interface IETFDataProvider {
  readonly name: string;
  readonly config: ProviderConfig;

  // Core data methods
  getQuote(symbol: string): Promise<ProviderResponse<ETFQuote>>;
  getMetadata(symbol: string): Promise<ProviderResponse<ETFMetadata>>;
  getHoldings(symbol: string): Promise<ProviderResponse<ETFHolding[]>>;
  getSectorAllocation(symbol: string): Promise<ProviderResponse<ETFSectorAllocation[]>>;
  getCountryAllocation(symbol: string): Promise<ProviderResponse<ETFCountryAllocation[]>>;
  getPerformance(symbol: string, periods: string[]): Promise<ProviderResponse<ETFPerformance[]>>;
  getHistoricalData(
    symbol: string,
    interval: string,
    from: Date,
    to: Date
  ): Promise<ProviderResponse<ETFHistoricalData>>;
  search(query: string, limit?: number): Promise<ProviderResponse<SearchResult[]>>;

  // Utility methods
  getRateLimitInfo(): Promise<RateLimitInfo>;
  isHealthy(): Promise<boolean>;
}

// Abstract base class with common functionality
export abstract class BaseETFProvider implements IETFDataProvider {
  abstract readonly name: string;
  abstract readonly config: ProviderConfig;

  protected rateLimitInfo: RateLimitInfo = {
    remaining: 0,
    reset: 0,
    limit: 0,
  };

  // Abstract methods that must be implemented by each provider
  abstract getQuote(symbol: string): Promise<ProviderResponse<ETFQuote>>;
  abstract getMetadata(symbol: string): Promise<ProviderResponse<ETFMetadata>>;
  abstract getHoldings(symbol: string): Promise<ProviderResponse<ETFHolding[]>>;
  abstract getSectorAllocation(symbol: string): Promise<ProviderResponse<ETFSectorAllocation[]>>;
  abstract getCountryAllocation(symbol: string): Promise<ProviderResponse<ETFCountryAllocation[]>>;
  abstract getPerformance(symbol: string, periods: string[]): Promise<ProviderResponse<ETFPerformance[]>>;
  abstract getHistoricalData(
    symbol: string,
    interval: string,
    from: Date,
    to: Date
  ): Promise<ProviderResponse<ETFHistoricalData>>;
  abstract search(query: string, limit?: number): Promise<ProviderResponse<SearchResult[]>>;

  // Common utility methods
  async getRateLimitInfo(): Promise<RateLimitInfo> {
    return this.rateLimitInfo;
  }

  async isHealthy(): Promise<boolean> {
    try {
      // Simple health check by searching for a common ETF
      const response = await this.search('SPY', 1);
      return response.success;
    } catch {
      return false;
    }
  }

  // Protected helper methods
  protected createSuccessResponse<T>(data: T): ProviderResponse<T> {
    return {
      data,
      provider: this.name,
      timestamp: Date.now(),
      success: true,
    };
  }

  protected createErrorResponse<T>(error: string): ProviderResponse<T> {
    return {
      data: {} as T,
      provider: this.name,
      timestamp: Date.now(),
      success: false,
      error,
    };
  }

  protected async makeRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Configure fetch options for development environment
    const fetchOptions: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ETF-Dashboard/1.0',
        ...options.headers,
      },
    };

    // In development, we might need to handle certificate issues
    if (process.env.NODE_ENV === 'development') {
      // Add any development-specific configurations if needed
      console.log(`[${this.name}] Making request to: ${url}`);
    }

    try {
      const response = await fetch(url, fetchOptions);

      // Update rate limit info from headers if available
      this.updateRateLimitFromHeaders(response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch failed')) {
        // Enhanced error message for fetch failures
        throw new Error(`Network request failed: ${error.message}. This might be due to network connectivity, certificate issues, or API endpoint problems.`);
      }
      throw error;
    }
  }

  private updateRateLimitFromHeaders(headers: Headers): void {
    const remaining = headers.get('X-RateLimit-Remaining');
    const reset = headers.get('X-RateLimit-Reset');
    const limit = headers.get('X-RateLimit-Limit');

    if (remaining) this.rateLimitInfo.remaining = parseInt(remaining, 10);
    if (reset) this.rateLimitInfo.reset = parseInt(reset, 10);
    if (limit) this.rateLimitInfo.limit = parseInt(limit, 10);
  }

  protected formatSymbol(symbol: string): string {
    return symbol.toUpperCase().trim();
  }

  protected validateSymbol(symbol: string): void {
    if (!symbol || symbol.trim().length === 0) {
      throw new Error('Symbol is required');
    }
  }
}
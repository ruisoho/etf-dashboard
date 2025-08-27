import { IETFDataProvider } from './base-provider';
import { PolygonProvider } from './providers/polygon';
import { FinnhubProvider } from './providers/finnhub';
import { EODHDProvider } from './providers/eodhd';
import { FMPProvider } from './providers/fmp';
import { AlphaVantageProvider } from './providers/alpha-vantage';
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
} from '../types/etf';

export type ProviderName = 'polygon' | 'finnhub' | 'eodhd' | 'fmp' | 'alpha-vantage';

export interface ProviderCredentials {
  polygon?: string;
  finnhub?: string;
  eodhd?: string;
  fmp?: string;
  alphaVantage?: string;
}

export interface ProviderCapabilities {
  quote: boolean;
  metadata: boolean;
  holdings: boolean;
  sectorAllocation: boolean;
  countryAllocation: boolean;
  performance: boolean;
  historicalData: boolean;
  search: boolean;
}

export interface ProviderInfo {
  name: string;
  capabilities: ProviderCapabilities;
  rateLimit: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
  isHealthy: boolean;
}

/**
 * Factory class for managing multiple ETF data providers
 * Provides fallback mechanisms and load balancing across providers
 */
export class ETFProviderFactory {
  private providers: Map<ProviderName, IETFDataProvider> = new Map();
  private providerPriority: ProviderName[] = [];
  private healthStatus: Map<ProviderName, boolean> = new Map();

  constructor(credentials: ProviderCredentials) {
    this.initializeProviders(credentials);
    this.setDefaultPriority();
  }

  private initializeProviders(credentials: ProviderCredentials): void {
    if (credentials.polygon) {
      this.providers.set('polygon', new PolygonProvider(credentials.polygon));
      this.healthStatus.set('polygon', true);
    }

    if (credentials.finnhub) {
      this.providers.set('finnhub', new FinnhubProvider(credentials.finnhub));
      this.healthStatus.set('finnhub', true);
    }

    if (credentials.eodhd) {
      this.providers.set('eodhd', new EODHDProvider(credentials.eodhd));
      this.healthStatus.set('eodhd', true);
    }

    if (credentials.fmp) {
      this.providers.set('fmp', new FMPProvider(credentials.fmp));
      this.healthStatus.set('fmp', true);
    }

    if (credentials.alphaVantage) {
      this.providers.set('alpha-vantage', new AlphaVantageProvider(credentials.alphaVantage));
      this.healthStatus.set('alpha-vantage', true);
    }
  }

  private setDefaultPriority(): void {
    // Set priority based on data quality and rate limits
    // Polygon and EODHD typically have better ETF data
    this.providerPriority = [
      'polygon',
      'eodhd', 
      'fmp',
      'finnhub',
      'alpha-vantage'
    ].filter(name => this.providers.has(name)) as ProviderName[];
  }

  /**
   * Set custom provider priority order
   */
  setProviderPriority(priority: ProviderName[]): void {
    this.providerPriority = priority.filter(name => this.providers.has(name)) as ProviderName[];
  }

  /**
   * Get available providers with their capabilities
   */
  getProviderInfo(): ProviderInfo[] {
    return Array.from(this.providers.entries()).map(([name, provider]) => ({
      name: provider.name,
      capabilities: this.getProviderCapabilities(name),
      rateLimit: provider.config.rateLimit,
      isHealthy: this.healthStatus.get(name) || false,
    }));
  }

  private getProviderCapabilities(providerName: ProviderName): ProviderCapabilities {
    // Define capabilities based on what each provider supports
    const capabilities: Record<ProviderName, ProviderCapabilities> = {
      polygon: {
        quote: true,
        metadata: true,
        holdings: false, // Limited in free tier
        sectorAllocation: false,
        countryAllocation: false,
        performance: false,
        historicalData: true,
        search: true,
      },
      finnhub: {
        quote: true,
        metadata: true,
        holdings: true,
        sectorAllocation: true,
        countryAllocation: true,
        performance: false, // Needs calculation
        historicalData: true,
        search: true,
      },
      eodhd: {
        quote: true,
        metadata: true,
        holdings: true,
        sectorAllocation: true,
        countryAllocation: true,
        performance: false, // Needs calculation
        historicalData: true,
        search: true,
      },
      fmp: {
        quote: true,
        metadata: true,
        holdings: true,
        sectorAllocation: true,
        countryAllocation: true,
        performance: false, // Needs calculation
        historicalData: true,
        search: true,
      },
      'alpha-vantage': {
        quote: true,
        metadata: true,
        holdings: false,
        sectorAllocation: false,
        countryAllocation: false,
        performance: false,
        historicalData: true,
        search: true,
      },
    };

    return capabilities[providerName] || {
      quote: false,
      metadata: false,
      holdings: false,
      sectorAllocation: false,
      countryAllocation: false,
      performance: false,
      historicalData: false,
      search: false,
    };
  }

  /**
   * Execute a method with fallback across providers
   */
  private async executeWithFallback<T>(
    method: (provider: IETFDataProvider) => Promise<ProviderResponse<T>>,
    capability: keyof ProviderCapabilities
  ): Promise<ProviderResponse<T>> {
    const errors: string[] = [];

    for (const providerName of this.providerPriority) {
      const provider = this.providers.get(providerName);
      if (!provider || !this.healthStatus.get(providerName)) {
        continue;
      }

      const capabilities = this.getProviderCapabilities(providerName);
      if (!capabilities[capability]) {
        continue;
      }

      try {
        const result = await method(provider);
        if (result.success) {
          return result;
        }
        errors.push(`${providerName}: ${result.error}`);
      } catch (error) {
        errors.push(`${providerName}: ${error}`);
        // Mark provider as unhealthy if it throws an error
        this.healthStatus.set(providerName, false);
      }
    }

    return {
      success: false,
      error: `All providers failed. Errors: ${errors.join('; ')}`,
      data: null as T,
      provider: 'factory',
      timestamp: Date.now(),
    };
  }

  /**
   * Get ETF quote with fallback
   */
  async getQuote(symbol: string): Promise<ProviderResponse<ETFQuote>> {
    return this.executeWithFallback(
      (provider) => provider.getQuote(symbol),
      'quote'
    );
  }

  /**
   * Get ETF metadata with fallback
   */
  async getMetadata(symbol: string): Promise<ProviderResponse<ETFMetadata>> {
    return this.executeWithFallback(
      (provider) => provider.getMetadata(symbol),
      'metadata'
    );
  }

  /**
   * Get ETF holdings with fallback
   */
  async getHoldings(symbol: string): Promise<ProviderResponse<ETFHolding[]>> {
    return this.executeWithFallback(
      (provider) => provider.getHoldings(symbol),
      'holdings'
    );
  }

  /**
   * Get ETF sector allocation with fallback
   */
  async getSectorAllocation(symbol: string): Promise<ProviderResponse<ETFSectorAllocation[]>> {
    return this.executeWithFallback(
      (provider) => provider.getSectorAllocation(symbol),
      'sectorAllocation'
    );
  }

  /**
   * Get ETF country allocation with fallback
   */
  async getCountryAllocation(symbol: string): Promise<ProviderResponse<ETFCountryAllocation[]>> {
    return this.executeWithFallback(
      (provider) => provider.getCountryAllocation(symbol),
      'countryAllocation'
    );
  }

  /**
   * Get ETF performance with fallback
   */
  async getPerformance(symbol: string, periods: string[]): Promise<ProviderResponse<ETFPerformance[]>> {
    return this.executeWithFallback(
      (provider) => provider.getPerformance(symbol, periods),
      'performance'
    );
  }

  /**
   * Get ETF historical data with fallback
   */
  async getHistoricalData(
    symbol: string,
    interval: string,
    from: Date,
    to: Date
  ): Promise<ProviderResponse<ETFHistoricalData>> {
    return this.executeWithFallback(
      (provider) => provider.getHistoricalData(symbol, interval, from, to),
      'historicalData'
    );
  }

  /**
   * Search ETFs with fallback
   */
  async search(query: string, limit = 10): Promise<ProviderResponse<SearchResult[]>> {
    return this.executeWithFallback(
      (provider) => provider.search(query, limit),
      'search'
    );
  }

  /**
   * Health check all providers
   */
  async healthCheck(): Promise<Map<ProviderName, boolean>> {
    const healthPromises = Array.from(this.providers.entries()).map(
      async ([name, provider]) => {
        try {
          // Simple health check by attempting to get provider info
          const isHealthy = provider.config ? true : false;
          this.healthStatus.set(name, isHealthy);
          return [name, isHealthy] as [ProviderName, boolean];
        } catch {
          this.healthStatus.set(name, false);
          return [name, false] as [ProviderName, boolean];
        }
      }
    );

    const results = await Promise.all(healthPromises);
    return new Map(results);
  }

  /**
   * Get a specific provider by name
   */
  getProvider(name: ProviderName): IETFDataProvider | undefined {
    return this.providers.get(name);
  }

  /**
   * Check if any providers are available
   */
  hasProviders(): boolean {
    return this.providers.size > 0;
  }

  /**
   * Get list of available provider names
   */
  getAvailableProviders(): ProviderName[] {
    return Array.from(this.providers.keys());
  }
}
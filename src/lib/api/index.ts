// Export types
export type * from '../types/etf';

// Export base provider
export type { IETFDataProvider } from './base-provider';
export { BaseETFProvider } from './base-provider';

// Export individual providers
export { PolygonProvider } from './providers/polygon';
export { FinnhubProvider } from './providers/finnhub';
export { EODHDProvider } from './providers/eodhd';
export { FMPProvider } from './providers/fmp';
export { AlphaVantageProvider } from './providers/alpha-vantage';

// Export provider factory
export {
  ETFProviderFactory,
} from './provider-factory';
export type {
  ProviderName,
  ProviderCredentials,
  ProviderCapabilities,
  ProviderInfo,
} from './provider-factory';

// Import for use in functions
import { ETFProviderFactory } from './provider-factory';
import type { ProviderCredentials } from './provider-factory';

// Convenience function to create a provider factory with environment variables
export function createETFProviderFactory(): ETFProviderFactory {
  const credentials = {
    polygon: process.env.POLYGON_API_KEY,
    finnhub: process.env.FINNHUB_API_KEY,
    eodhd: process.env.EODHD_API_KEY,
    fmp: process.env.FMP_API_KEY,
    alphaVantage: process.env.ALPHA_VANTAGE_API_KEY,
  };

  // Filter out undefined credentials
  const validCredentials = Object.entries(credentials)
    .filter(([, value]) => value !== undefined)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}) as ProviderCredentials;

  return new ETFProviderFactory(validCredentials);
}

// Default provider factory instance (singleton)
let defaultFactory: ETFProviderFactory | null = null;

export function getDefaultETFProviderFactory(): ETFProviderFactory {
  if (!defaultFactory) {
    defaultFactory = createETFProviderFactory();
  }
  return defaultFactory;
}

// Reset the default factory (useful for testing)
export function resetDefaultETFProviderFactory(): void {
  defaultFactory = null;
}
// Export all API response types for client-side usage

export type { QuoteAPIResponse } from './quote/route';
export type { ETFMetadataAPIResponse as MetadataAPIResponse } from './etf/meta/route';
export type { ETFHoldingsAPIResponse as HoldingsAPIResponse } from './etf/holdings/route';
export type { SectorAllocationAPIResponse } from './etf/sectors/route';
export type { CountryAllocationAPIResponse } from './etf/countries/route';
export type { PerformanceAPIResponse } from './etf/performance/route';
export type { PriceAPIResponse } from './price/route';
export type { SearchAPIResponse } from './search/route';

// Common API error response
export interface APIErrorResponse {
  success: false;
  error: string;
  timestamp?: number;
}

// Generic API success response
export interface APISuccessResponse<T> {
  success: true;
  data: T;
  provider?: string;
  timestamp?: number;
}

// Union type for all API responses
export type APIResponse<T> = APISuccessResponse<T> | APIErrorResponse;

// API endpoint paths
export const API_ENDPOINTS = {
  quote: '/api/quote',
  metadata: '/api/etf/meta',
  holdings: '/api/etf/holdings',
  sectors: '/api/etf/sectors',
  countries: '/api/etf/countries',
  performance: '/api/etf/performance',
  price: '/api/price',
  search: '/api/search',
} as const;

// Helper type for API endpoint keys
export type APIEndpoint = keyof typeof API_ENDPOINTS;

// Query parameter types for each endpoint
export interface QuoteParams {
  symbol: string;
  provider?: string;
}

export interface MetadataParams {
  symbol: string;
  provider?: string;
}

export interface HoldingsParams {
  symbol: string;
  limit?: number;
  provider?: string;
}

export interface SectorAllocationParams {
  symbol: string;
  provider?: string;
}

export interface CountryAllocationParams {
  symbol: string;
  provider?: string;
}

export interface PerformanceParams {
  symbol: string;
  periods?: string; // Comma-separated list
  provider?: string;
}

export interface PriceParams {
  symbol: string;
  interval?: string;
  from?: string; // ISO date string
  to?: string; // ISO date string
  provider?: string;
}

export interface SearchParams {
  q?: string;
  query?: string;
  limit?: number;
  type?: string;
  provider?: string;
}

// Union type for all query parameters
export type APIParams = 
  | QuoteParams
  | MetadataParams
  | HoldingsParams
  | SectorAllocationParams
  | CountryAllocationParams
  | PerformanceParams
  | PriceParams
  | SearchParams;
import { NextRequest, NextResponse } from 'next/server';
import { getDefaultETFProviderFactory } from '@/lib/api';
import type { ETFPerformance } from '@/lib/api';

// Cache duration in seconds - performance data changes daily
const CACHE_DURATION = 3600; // 1 hour

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const provider = searchParams.get('provider'); // Optional specific provider
    const periodsParam = searchParams.get('periods'); // Optional periods filter

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol parameter is required' },
        { status: 400 }
      );
    }

    // Validate symbol format
    if (!/^[A-Z]{1,5}$/.test(symbol.toUpperCase())) {
      return NextResponse.json(
        { error: 'Invalid symbol format' },
        { status: 400 }
      );
    }

    // Parse periods parameter or use defaults
    const periods = periodsParam 
      ? periodsParam.split(',').map(p => p.trim())
      : ['1D', '1W', '1M', '3M', '6M', '1Y', '3Y', '5Y', 'YTD'];

    // Validate periods
    const validPeriods = ['1D', '1W', '1M', '3M', '6M', '1Y', '2Y', '3Y', '5Y', '10Y', 'YTD', 'MAX'];
    const invalidPeriods = periods.filter(p => !validPeriods.includes(p.toUpperCase()));
    if (invalidPeriods.length > 0) {
      return NextResponse.json(
        { error: `Invalid periods: ${invalidPeriods.join(', ')}. Valid periods: ${validPeriods.join(', ')}` },
        { status: 400 }
      );
    }

    const factory = getDefaultETFProviderFactory();
    
    if (!factory.hasProviders()) {
      return NextResponse.json(
        { error: 'No data providers configured' },
        { status: 503 }
      );
    }

    let result;
    
    if (provider) {
      // Use specific provider if requested
      const specificProvider = factory.getProvider(provider as any);
      if (!specificProvider) {
        return NextResponse.json(
          { error: `Provider '${provider}' not available` },
          { status: 400 }
        );
      }
      result = await specificProvider.getPerformance(symbol.toUpperCase(), periods.map(p => p.toUpperCase()));
    } else {
      // Use factory with fallback
      result = await factory.getPerformance(symbol.toUpperCase(), periods.map(p => p.toUpperCase()));
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 404 }
      );
    }

    const response = NextResponse.json({
      success: true,
      data: result.data,
      provider: result.provider,
      timestamp: result.timestamp,
      symbol: symbol.toUpperCase(),
    });

    // Set cache headers
    response.headers.set(
      'Cache-Control',
      `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`
    );
    response.headers.set('CDN-Cache-Control', `public, s-maxage=${CACHE_DURATION}`);
    response.headers.set('Vercel-CDN-Cache-Control', `public, s-maxage=${CACHE_DURATION}`);

    return response;
  } catch (error) {
    console.error('Performance API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Export type for the API response
export type PerformanceAPIResponse = {
  success: boolean;
  data?: ETFPerformance;
  error?: string;
  provider?: string;
  timestamp?: number;
  symbol?: string;
};
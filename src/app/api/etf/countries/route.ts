import { NextRequest, NextResponse } from 'next/server';
import { getDefaultETFProviderFactory } from '@/lib/api';
import type { ETFCountryAllocation } from '@/lib/api';

// Cache duration in seconds - country allocation changes infrequently
const CACHE_DURATION = 7200; // 2 hours

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const provider = searchParams.get('provider'); // Optional specific provider

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
      result = await specificProvider.getCountryAllocation(symbol.toUpperCase());
    } else {
      // Use factory with fallback
      result = await factory.getCountryAllocation(symbol.toUpperCase());
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
    console.error('Country allocation API error:', error);
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
export type CountryAllocationAPIResponse = {
  success: boolean;
  data?: ETFCountryAllocation;
  error?: string;
  provider?: string;
  timestamp?: number;
  symbol?: string;
};
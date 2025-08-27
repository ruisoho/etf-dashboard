import { NextRequest, NextResponse } from 'next/server';
import { getDefaultETFProviderFactory } from '@/lib/api';
import type { ETFMetadata } from '@/lib/api';

// Cache duration in seconds - metadata changes less frequently
const CACHE_DURATION = 3600; // 1 hour for metadata

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
      result = await specificProvider.getMetadata(symbol.toUpperCase());
    } else {
      // Use factory with fallback
      result = await factory.getMetadata(symbol.toUpperCase());
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
    });

    // Set cache headers - longer cache for metadata
    response.headers.set(
      'Cache-Control',
      `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`
    );
    response.headers.set('CDN-Cache-Control', `public, s-maxage=${CACHE_DURATION}`);
    response.headers.set('Vercel-CDN-Cache-Control', `public, s-maxage=${CACHE_DURATION}`);

    return response;
  } catch (error) {
    console.error('ETF metadata API error:', error);
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
export type ETFMetadataAPIResponse = {
  success: boolean;
  data?: ETFMetadata;
  error?: string;
  provider?: string;
  timestamp?: number;
};
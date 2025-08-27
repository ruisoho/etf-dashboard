import { NextRequest, NextResponse } from 'next/server';
import { getDefaultETFProviderFactory } from '@/lib/api';
import type { ETFHistoricalData } from '@/lib/api';

// Cache duration in seconds - varies by interval
const CACHE_DURATIONS = {
  '1min': 60, // 1 minute
  '5min': 300, // 5 minutes
  '15min': 900, // 15 minutes
  '30min': 1800, // 30 minutes
  '1hour': 3600, // 1 hour
  '1day': 14400, // 4 hours
  '1week': 86400, // 24 hours
  '1month': 86400, // 24 hours
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const interval = searchParams.get('interval') || '1day';
    const from = searchParams.get('from');
    const to = searchParams.get('to');
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

    // Validate interval
    const validIntervals = Object.keys(CACHE_DURATIONS);
    if (!validIntervals.includes(interval)) {
      return NextResponse.json(
        { error: `Invalid interval. Must be one of: ${validIntervals.join(', ')}` },
        { status: 400 }
      );
    }

    // Parse and validate dates
    let fromDate: Date;
    let toDate: Date;

    if (from) {
      fromDate = new Date(from);
      if (isNaN(fromDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid from date format' },
          { status: 400 }
        );
      }
    } else {
      // Default to 30 days ago
      fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 30);
    }

    if (to) {
      toDate = new Date(to);
      if (isNaN(toDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid to date format' },
          { status: 400 }
        );
      }
    } else {
      // Default to now
      toDate = new Date();
    }

    // Validate date range
    if (fromDate >= toDate) {
      return NextResponse.json(
        { error: 'From date must be before to date' },
        { status: 400 }
      );
    }

    // Limit date range to prevent excessive data requests
    const maxDays = interval.includes('min') || interval.includes('hour') ? 7 : 365;
    const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > maxDays) {
      return NextResponse.json(
        { error: `Date range too large. Maximum ${maxDays} days for ${interval} interval` },
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
      result = await specificProvider.getHistoricalData(
        symbol.toUpperCase(),
        interval,
        fromDate,
        toDate
      );
    } else {
      // Use factory with fallback
      result = await factory.getHistoricalData(
        symbol.toUpperCase(),
        interval,
        fromDate,
        toDate
      );
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
      interval,
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
      points: result.data?.data?.length || 0,
    });

    // Set cache headers based on interval
    const cacheDuration = CACHE_DURATIONS[interval as keyof typeof CACHE_DURATIONS] || 3600;
    response.headers.set(
      'Cache-Control',
      `public, s-maxage=${cacheDuration}, stale-while-revalidate=${cacheDuration * 2}`
    );
    response.headers.set('CDN-Cache-Control', `public, s-maxage=${cacheDuration}`);
    response.headers.set('Vercel-CDN-Cache-Control', `public, s-maxage=${cacheDuration}`);

    return response;
  } catch (error) {
    console.error('Price API error:', error);
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
export type PriceAPIResponse = {
  success: boolean;
  data?: ETFHistoricalData;
  error?: string;
  provider?: string;
  timestamp?: number;
  interval?: string;
  from?: string;
  to?: string;
  points?: number;
};
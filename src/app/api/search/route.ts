import { NextRequest, NextResponse } from 'next/server';
import { getDefaultETFProviderFactory } from '@/lib/api';
import type { SearchResult } from '@/lib/api';

// Cache duration in seconds - search results can be cached for a while
const CACHE_DURATION = 1800; // 30 minutes for search results

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('query');
    const limit = searchParams.get('limit');
    const provider = searchParams.get('provider'); // Optional specific provider
    const type = searchParams.get('type'); // Optional filter by type (ETF, Stock)

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter (q or query) is required' },
        { status: 400 }
      );
    }

    // Validate query length
    if (query.trim().length < 1) {
      return NextResponse.json(
        { error: 'Query must be at least 1 character long' },
        { status: 400 }
      );
    }

    if (query.length > 100) {
      return NextResponse.json(
        { error: 'Query must be less than 100 characters' },
        { status: 400 }
      );
    }

    // Validate limit if provided
    const searchLimit = limit ? parseInt(limit, 10) : 10;
    if (limit && (isNaN(searchLimit) || searchLimit < 1 || searchLimit > 50)) {
      return NextResponse.json(
        { error: 'Limit must be a number between 1 and 50' },
        { status: 400 }
      );
    }

    // Validate type filter if provided
    const validTypes = ['ETF', 'Stock', 'etf', 'stock'];
    if (type && !validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type filter. Must be one of: ${validTypes.join(', ')}` },
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
      result = await specificProvider.search(query.trim(), searchLimit);
    } else {
      // Use factory with fallback
      result = await factory.search(query.trim(), searchLimit);
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 404 }
      );
    }

    // Apply type filter if specified
    let searchResults = result.data || [];
    if (type) {
      const filterType = type.toUpperCase();
      searchResults = searchResults.filter(item => 
        item.type.toUpperCase() === filterType
      );
    }

    // Sort results by relevance (exact matches first, then partial matches)
    const queryLower = query.toLowerCase();
    searchResults.sort((a, b) => {
      const aSymbolMatch = a.symbol.toLowerCase() === queryLower;
      const bSymbolMatch = b.symbol.toLowerCase() === queryLower;
      const aNameMatch = a.name.toLowerCase().includes(queryLower);
      const bNameMatch = b.name.toLowerCase().includes(queryLower);
      
      // Exact symbol matches first
      if (aSymbolMatch && !bSymbolMatch) return -1;
      if (!aSymbolMatch && bSymbolMatch) return 1;
      
      // Then partial symbol matches
      const aSymbolPartial = a.symbol.toLowerCase().includes(queryLower);
      const bSymbolPartial = b.symbol.toLowerCase().includes(queryLower);
      if (aSymbolPartial && !bSymbolPartial) return -1;
      if (!aSymbolPartial && bSymbolPartial) return 1;
      
      // Then name matches
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;
      
      // Finally alphabetical by symbol
      return a.symbol.localeCompare(b.symbol);
    });

    const response = NextResponse.json({
      success: true,
      data: searchResults,
      provider: result.provider,
      timestamp: result.timestamp,
      query: query.trim(),
      total: searchResults.length,
      limit: searchLimit,
      type: type || 'all',
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
    console.error('Search API error:', error);
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
export type SearchAPIResponse = {
  success: boolean;
  data?: SearchResult[];
  error?: string;
  provider?: string;
  timestamp?: number;
  query?: string;
  total?: number;
  limit?: number;
  type?: string;
};
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatPercentage, cn, debounce } from '@/lib/utils';

interface SearchResult {
  symbol: string;
  name: string;
  exchange?: string;
  price?: number;
  change?: number;
  changePercent?: number;
  category?: string;
  type?: string;
}

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=8`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Search failed');
        }
        
        setResults(data.data || data.results || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const handleResultClick = (symbol: string) => {
    router.push(`/etf/${symbol}`);
    onClose();
    setQuery('');
    setResults([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20">
      <div className="bg-background rounded-lg shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
        {/* Search Input */}
        <div className="p-6 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search ETFs by symbol, name, or category..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-4 py-3 text-lg"
              autoFocus
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 animate-spin" />
            )}
          </div>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {error && (
            <div className="p-6 text-center">
              <p className="text-destructive">{error}</p>
            </div>
          )}

          {!loading && !error && query && results.length === 0 && (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">No ETFs found for "{query}"</p>
            </div>
          )}

          {!query && (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">Start typing to search for ETFs...</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="divide-y">
              {results.map((result, index) => {
                const isPositive = (result.changePercent || 0) >= 0;
                const changeIcon = isPositive ? TrendingUp : TrendingDown;
                const changeColor = isPositive ? 'text-success' : 'text-destructive';

                return (
                  <button
                    key={`${result.symbol}-${index}`}
                    onClick={() => handleResultClick(result.symbol)}
                    className="w-full p-4 text-left hover:bg-muted/50 transition-colors focus:bg-muted/50 focus:outline-none"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-foreground">{result.symbol}</span>
                          {result.exchange && (
                            <Badge variant="outline" className="text-xs">
                              {result.exchange}
                            </Badge>
                          )}
                          {result.category && (
                            <Badge variant="secondary" className="text-xs">
                              {result.category}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {result.name}
                        </p>
                      </div>
                      
                      {result.price && (
                        <div className="text-right ml-4">
                          <div className="font-semibold text-foreground">
                            {formatCurrency(result.price)}
                          </div>
                          {result.change !== undefined && result.changePercent !== undefined && (
                            <div className={cn('flex items-center justify-end space-x-1 text-sm', changeColor)}>
                              {React.createElement(changeIcon, { className: 'w-3 h-3' })}
                              <span>
                                {formatCurrency(result.change)} ({formatPercentage(result.changePercent || 0)})
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-muted/20">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Press ESC to close</span>
            {results.length > 0 && (
              <span>{results.length} result{results.length !== 1 ? 's' : ''} found</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact search component for header
export function SearchButton() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="relative w-64 justify-start text-muted-foreground"
      >
        <Search className="w-4 h-4 mr-2" />
        <span>Search ETFs...</span>
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      
      <SearchDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Trash2, TrendingUp, TrendingDown, Star, StarOff } from 'lucide-react';
import { formatCurrency, formatPercentage, cn } from '@/lib/utils';
import { Sparkline, generateSparklineData } from '@/components/ui/sparkline';
import Link from 'next/link';
import { Header } from '@/components/header';

interface WatchlistItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  expenseRatio: number;
  dividend: number;
  addedAt: string;
}

const SAMPLE_ETFS = [
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust' },
  { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF' },
  { symbol: 'IWM', name: 'iShares Russell 2000 ETF' },
  { symbol: 'EFA', name: 'iShares MSCI EAFE ETF' },
  { symbol: 'EEM', name: 'iShares MSCI Emerging Markets ETF' },
  { symbol: 'VNQ', name: 'Vanguard Real Estate ETF' },
  { symbol: 'GLD', name: 'SPDR Gold Shares' },
  { symbol: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF' },
  { symbol: 'HYG', name: 'iShares iBoxx $ High Yield Corporate Bond ETF' },
];

const generateMockWatchlistItem = (symbol: string, name: string): WatchlistItem => {
  // Use symbol as seed for deterministic data
  const seed = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seededRandom = (offset: number = 0) => {
    const x = Math.sin(seed + offset) * 10000;
    return x - Math.floor(x);
  };
  
  const basePrice = seededRandom(1) * 200 + 50;
  const change = (seededRandom(2) - 0.5) * 10;
  const changePercent = (change / basePrice) * 100;
  
  return {
    symbol,
    name,
    price: basePrice,
    change,
    changePercent,
    volume: Math.floor(seededRandom(3) * 10000000) + 1000000,
    marketCap: seededRandom(4) * 100000000000 + 1000000000,
    expenseRatio: seededRandom(5) * 0.5 + 0.03,
    dividend: seededRandom(6) * 3 + 1,
    addedAt: new Date(Date.now() - seededRandom(7) * 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
};

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof SAMPLE_ETFS>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Load watchlist from localStorage
    const savedWatchlist = localStorage.getItem('etf-watchlist');
    if (savedWatchlist) {
      const symbols = JSON.parse(savedWatchlist);
      const items = symbols.map((symbol: string) => {
        const etf = SAMPLE_ETFS.find(e => e.symbol === symbol);
        return generateMockWatchlistItem(symbol, etf?.name || `${symbol} ETF`);
      });
      setWatchlist(items);
    } else {
      // Default watchlist
      const defaultItems = ['SPY', 'QQQ', 'VTI'].map(symbol => {
        const etf = SAMPLE_ETFS.find(e => e.symbol === symbol);
        return generateMockWatchlistItem(symbol, etf?.name || `${symbol} ETF`);
      });
      setWatchlist(defaultItems);
      localStorage.setItem('etf-watchlist', JSON.stringify(['SPY', 'QQQ', 'VTI']));
    }
  }, []);

  useEffect(() => {
    if (searchQuery.length > 0) {
      setIsSearching(true);
      // Mock search - filter from sample ETFs
      const results = SAMPLE_ETFS.filter(etf => 
        (etf.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
         etf.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
        !watchlist.some(item => item.symbol === etf.symbol)
      );
      setSearchResults(results);
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, watchlist]);

  const addToWatchlist = (symbol: string, name: string) => {
    const newItem = generateMockWatchlistItem(symbol, name);
    const updatedWatchlist = [...watchlist, newItem];
    setWatchlist(updatedWatchlist);
    
    // Save to localStorage
    const symbols = updatedWatchlist.map(item => item.symbol);
    localStorage.setItem('etf-watchlist', JSON.stringify(symbols));
    
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeFromWatchlist = (symbol: string) => {
    const updatedWatchlist = watchlist.filter(item => item.symbol !== symbol);
    setWatchlist(updatedWatchlist);
    
    // Save to localStorage
    const symbols = updatedWatchlist.map(item => item.symbol);
    localStorage.setItem('etf-watchlist', JSON.stringify(symbols));
  };

  const clearWatchlist = () => {
    setWatchlist([]);
    localStorage.removeItem('etf-watchlist');
  };

  const totalValue = watchlist.reduce((sum, item) => sum + (item.price * 100), 0); // Assuming 100 shares each
  const totalChange = watchlist.reduce((sum, item) => sum + (item.change * 100), 0);
  const totalChangePercent = totalValue > 0 ? (totalChange / (totalValue - totalChange)) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Watchlist</h1>
          <p className="text-muted-foreground">
            Track your favorite ETFs and monitor their performance
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total ETFs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{watchlist.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio Value</CardTitle>
              <CardDescription className="text-xs">Based on 100 shares each</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Change</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold flex items-center space-x-2",
                totalChangePercent >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {totalChangePercent >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                <span>{formatPercentage(totalChangePercent || 0)}</span>
              </div>
              <p className={cn(
                "text-sm mt-1",
                totalChange >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {totalChange >= 0 ? '+' : ''}{formatCurrency(totalChange)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Add ETF Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Add ETF to Watchlist</span>
              {watchlist.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearWatchlist}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search ETFs by symbol or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-background border rounded-md shadow-lg z-10 mt-1 max-h-60 overflow-y-auto">
                  {searchResults.map(etf => (
                    <button
                      key={etf.symbol}
                      className="w-full px-4 py-3 text-left hover:bg-muted flex items-center justify-between border-b last:border-b-0"
                      onClick={() => addToWatchlist(etf.symbol, etf.name)}
                    >
                      <div>
                        <div className="font-medium">{etf.symbol}</div>
                        <div className="text-sm text-muted-foreground">{etf.name}</div>
                      </div>
                      <Plus className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Watchlist Table */}
        {watchlist.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Your ETFs</CardTitle>
              <CardDescription>
                Click on any ETF symbol to view detailed information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Change</TableHead>
                      <TableHead className="text-right">Volume</TableHead>
                      <TableHead className="text-right">Expense Ratio</TableHead>
                      <TableHead className="text-right">Dividend</TableHead>
                      <TableHead className="text-center">Trend</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {watchlist.map((item) => {
                      const isPositive = item.changePercent >= 0;
                      const sparklineData = generateSparklineData(item.price, 20, item.symbol.charCodeAt(0) * 1000);
                      
                      return (
                        <TableRow key={item.symbol}>
                          <TableCell>
                            <Link 
                              href={`/etf/${item.symbol}`} 
                              className="font-bold text-primary hover:underline"
                            >
                              {item.symbol}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <div className="font-medium truncate">{item.name}</div>
                              <div className="text-xs text-muted-foreground">
                                Added {new Date(item.addedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.price)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className={cn(
                              "flex items-center justify-end space-x-1",
                              isPositive ? "text-green-600" : "text-red-600"
                            )}>
                              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                              <div>
                                <div className="font-medium">{formatPercentage(item.changePercent || 0)}</div>
                                <div className="text-xs">
                                  {isPositive ? '+' : ''}{formatCurrency(item.change)}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">
                            {(item.volume / 1000000).toFixed(1)}M
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {formatPercentage(item.expenseRatio || 0)}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {formatPercentage(item.dividend || 0)}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="w-16 h-8 mx-auto">
                              <Sparkline 
                                data={sparklineData} 
                                width={64} 
                                height={32} 
                                color={isPositive ? '#10b981' : '#ef4444'}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromWatchlist(item.symbol)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <StarOff className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Your watchlist is empty</h3>
              <p className="text-muted-foreground mb-4">
                Start by searching and adding ETFs you want to track
              </p>
              <Button onClick={() => document.querySelector('input')?.focus()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First ETF
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
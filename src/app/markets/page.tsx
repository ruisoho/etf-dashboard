'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Globe, DollarSign, BarChart3, Activity } from 'lucide-react';
import { formatCurrency, formatPercentage, cn } from '@/lib/utils';
import { Header } from '@/components/header';
import Link from 'next/link';

interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
}

interface MarketSector {
  name: string;
  change: number;
  changePercent: number;
  marketCap: number;
}

interface CurrencyRate {
  pair: string;
  rate: number;
  change: number;
  changePercent: number;
}

export default function MarketsPage() {
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([]);
  const [sectors, setSectors] = useState<MarketSector[]>([]);
  const [currencies, setCurrencies] = useState<CurrencyRate[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    const mockIndices: MarketIndex[] = [
      { symbol: 'SPY', name: 'SPDR S&P 500 ETF', price: 445.67, change: 2.34, changePercent: 0.53, volume: 45678900 },
      { symbol: 'QQQ', name: 'Invesco QQQ Trust', price: 378.92, change: -1.45, changePercent: -0.38, volume: 32145600 },
      { symbol: 'IWM', name: 'iShares Russell 2000 ETF', price: 198.45, change: 3.21, changePercent: 1.64, volume: 18765400 },
      { symbol: 'EFA', name: 'iShares MSCI EAFE ETF', price: 78.34, change: 0.89, changePercent: 1.15, volume: 12456700 },
      { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', price: 234.56, change: 1.78, changePercent: 0.76, volume: 28934500 },
      { symbol: 'GLD', name: 'SPDR Gold Shares', price: 189.23, change: -2.45, changePercent: -1.28, volume: 8765400 }
    ];

    const mockSectors: MarketSector[] = [
      { name: 'Technology', change: 12.45, changePercent: 2.34, marketCap: 15600000000000 },
      { name: 'Healthcare', change: -5.67, changePercent: -0.89, marketCap: 8900000000000 },
      { name: 'Financial Services', change: 8.90, changePercent: 1.45, marketCap: 7800000000000 },
      { name: 'Consumer Cyclical', change: 3.21, changePercent: 0.67, marketCap: 6700000000000 },
      { name: 'Energy', change: -8.45, changePercent: -2.12, marketCap: 4500000000000 },
      { name: 'Real Estate', change: 2.34, changePercent: 0.89, marketCap: 3400000000000 }
    ];

    const mockCurrencies: CurrencyRate[] = [
      { pair: 'EUR/USD', rate: 1.0845, change: 0.0023, changePercent: 0.21 },
      { pair: 'GBP/USD', rate: 1.2634, change: -0.0045, changePercent: -0.35 },
      { pair: 'USD/JPY', rate: 149.67, change: 0.89, changePercent: 0.60 },
      { pair: 'USD/CAD', rate: 1.3567, change: 0.0034, changePercent: 0.25 },
      { pair: 'AUD/USD', rate: 0.6789, change: -0.0012, changePercent: -0.18 }
    ];

    setTimeout(() => {
      setMarketIndices(mockIndices);
      setSectors(mockSectors);
      setCurrencies(mockCurrencies);
      setLoading(false);
    }, 1000);
  }, []);

  const getChangeIcon = (change: number) => {
    return change >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Markets Overview</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Real-time market data, indices performance, and global financial insights
          </p>
        </div>

        {/* Market Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Market Cap</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$47.2T</div>
              <p className="text-xs text-muted-foreground">Total US Market</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Volume</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156.7B</div>
              <p className="text-xs text-muted-foreground">Daily Trading Volume</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">VIX</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18.45</div>
              <p className="text-xs text-muted-foreground">Volatility Index</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active ETFs</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,847</div>
              <p className="text-xs text-muted-foreground">Listed ETFs</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Major ETF Indices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Major ETF Indices
              </CardTitle>
              <CardDescription>
                Performance of key market ETFs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ETF</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                    <TableHead className="text-right">Volume</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {marketIndices.map((index) => (
                    <TableRow key={index.symbol} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <Link 
                            href={`/etf/${index.symbol}`}
                            className="font-medium hover:text-primary transition-colors"
                          >
                            {index.symbol}
                          </Link>
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {index.name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(index.price)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className={cn('flex items-center justify-end gap-1', getChangeColor(index.change))}>
                          {getChangeIcon(index.change)}
                          <span className="font-medium">
                            {formatCurrency(Math.abs(index.change))}
                          </span>
                          <span className="text-sm">
                            ({formatPercentage(Math.abs(index.changePercent || 0))})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {index.volume ? (index.volume / 1000000).toFixed(1) + 'M' : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Sector Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Sector Performance
              </CardTitle>
              <CardDescription>
                Today's sector winners and losers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sectors.map((sector, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <div className="font-medium">{sector.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Market Cap: {formatCurrency(sector.marketCap / 1000000000000)}T
                      </div>
                    </div>
                    <div className={cn('flex items-center gap-2', getChangeColor(sector.change))}>
                      {getChangeIcon(sector.change)}
                      <div className="text-right">
                        <div className="font-medium">
                          {formatCurrency(Math.abs(sector.change))}
                        </div>
                        <div className="text-sm">
                          {formatPercentage(Math.abs(sector.changePercent || 0))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Currency Exchange Rates */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Currency Exchange Rates
            </CardTitle>
            <CardDescription>
              Major currency pairs and their daily performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {currencies.map((currency, index) => (
                <div key={index} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{currency.pair}</span>
                    {getChangeIcon(currency.change)}
                  </div>
                  <div className="text-lg font-bold mb-1">
                    {currency.rate.toFixed(4)}
                  </div>
                  <div className={cn('text-sm', getChangeColor(currency.change))}>
                    {currency.change >= 0 ? '+' : ''}{currency.change.toFixed(4)} 
                    ({formatPercentage(Math.abs(currency.changePercent || 0))})
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Market News Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Market Insights</CardTitle>
            <CardDescription>
              Stay informed with the latest market trends and analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                <h3 className="font-semibold mb-2">ETF Flows</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Track institutional money movements and ETF inflows/outflows across different sectors.
                </p>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
              
              <div className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                <h3 className="font-semibold mb-2">Market Sentiment</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Real-time sentiment analysis based on news, social media, and trading patterns.
                </p>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
              
              <div className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                <h3 className="font-semibold mb-2">Economic Calendar</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Important economic events and earnings that could impact ETF performance.
                </p>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
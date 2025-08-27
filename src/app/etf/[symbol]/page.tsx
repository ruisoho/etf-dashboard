'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, TrendingUp, TrendingDown, Download, Share2, Heart, PieChart, Users } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/header';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PerformanceChart } from '@/components/performance-chart';
import { HoldingsTable } from '@/components/holdings-table';
import { SectorChart } from '@/components/sector-chart';
import { formatCurrency, formatPercentage, formatLargeNumber, cn } from '@/lib/utils';

interface ETFData {
  symbol: string;
  name: string;
  exchange: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  expenseRatio: number;
  dividendYield: number;
  peRatio: number;
  beta: number;
  description: string;
  inceptionDate: string;
  aum: number;
  avgVolume: number;
  dayRange: { low: number; high: number };
  yearRange: { low: number; high: number };
  topHoldings: Array<{ symbol: string; name: string; weight: number }>;
  sectorAllocation: Array<{ sector: string; weight: number }>;
  performance: Record<string, number>;
  priceHistory: Array<{ date: string; price: number }>;
  lastUpdated: string;
}

const performancePeriods = [
  { key: '1D', label: '1 Day' },
  { key: '1W', label: '1 Week' },
  { key: '1M', label: '1 Month' },
  { key: '3M', label: '3 Months' },
  { key: '6M', label: '6 Months' },
  { key: '1Y', label: '1 Year' },
  { key: '3Y', label: '3 Years' },
  { key: '5Y', label: '5 Years' }
];

export default function ETFPage() {
  const params = useParams();
  const symbol = params.symbol as string;
  const [etfData, setEtfData] = useState<ETFData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchETFData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/etf/${symbol}`);
        
        if (!response.ok) {
          throw new Error('ETF not found');
        }
        
        const data = await response.json();
        console.log('ETF Data received:', data);
        console.log('Price:', data.price, 'Type:', typeof data.price);
        console.log('Top Holdings:', data.topHoldings);
        console.log('Sector Allocation:', data.sectorAllocation);
        setEtfData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch ETF data');
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      fetchETFData();
    }
  }, [symbol]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-muted rounded"></div>
                <div className="h-48 bg-muted rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-32 bg-muted rounded"></div>
                <div className="h-48 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !etfData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">ETF Not Found</h1>
          <p className="text-muted-foreground">{error || 'The requested ETF could not be found.'}</p>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isPositive = etfData.change >= 0;
  const changeIcon = isPositive ? TrendingUp : TrendingDown;
  const changeColor = isPositive ? 'text-success' : 'text-destructive';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{etfData.name}</h1>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline">{etfData.symbol}</Badge>
                <Badge variant="secondary">{etfData.exchange}</Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Heart className="w-4 h-4 mr-2" />
              Watchlist
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Price Quote */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-4">
                      <span className="text-4xl font-bold text-foreground">
                        {formatCurrency(etfData.price)}
                      </span>
                      <div className={cn('flex items-center space-x-1', changeColor)}>
                        {React.createElement(changeIcon, { className: 'w-5 h-5' })}
                        <span className="text-lg font-semibold">
                          {formatCurrency(etfData.change)} ({formatPercentage(etfData.changePercent || 0)})
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Last updated: {new Date(etfData.lastUpdated).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-sm text-muted-foreground">Volume</div>
                    <div className="font-semibold">{formatLargeNumber(etfData.volume)}</div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Performance Chart */}
            <PerformanceChart 
              symbol={symbol} 
              currentPrice={etfData?.price || 0}
            />

            {/* Performance Grid */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {performancePeriods.map((period) => {
                    const performance = etfData.performance[period.key];
                    const isPositivePerf = performance >= 0;
                    return (
                      <div key={period.key} className="text-center p-4 rounded-lg bg-muted/20">
                        <div className="text-sm text-muted-foreground mb-1">{period.label}</div>
                        <div className={cn(
                          'text-lg font-semibold',
                          isPositivePerf ? 'text-success' : 'text-destructive'
                        )}>
                          {formatPercentage(performance || 0)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Top Holdings */}
            <HoldingsTable 
              holdings={etfData.topHoldings}
              totalAssets={etfData.aum}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Key Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Key Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Market Cap</div>
                    <div className="font-semibold">{formatLargeNumber(etfData.marketCap)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">AUM</div>
                    <div className="font-semibold">{formatLargeNumber(etfData.aum)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Expense Ratio</div>
                    <div className="font-semibold">{formatPercentage(etfData.expenseRatio || 0)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Dividend Yield</div>
                    <div className="font-semibold">{formatPercentage(etfData.dividendYield || 0)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">P/E Ratio</div>
                    <div className="font-semibold">{etfData.peRatio ? etfData.peRatio.toFixed(2) : '—'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Beta</div>
                    <div className="font-semibold">{etfData.beta ? etfData.beta.toFixed(2) : '—'}</div>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Day Range</span>
                      <span className="text-sm font-medium">
                        {formatCurrency(etfData.dayRange.low)} - {formatCurrency(etfData.dayRange.high)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">52W Range</span>
                      <span className="text-sm font-medium">
                        {formatCurrency(etfData.yearRange.low)} - {formatCurrency(etfData.yearRange.high)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Avg Volume</span>
                      <span className="text-sm font-medium">{formatLargeNumber(etfData.avgVolume)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Inception</span>
                      <span className="text-sm font-medium">
                        {new Date(etfData.inceptionDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sector Allocation */}
            <SectorChart allocations={etfData.sectorAllocation} />

            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About {etfData.symbol}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {etfData.description}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart } from '@/components/ui/line-chart';
import { Search, X, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { formatCurrency, formatPercentage, cn } from '@/lib/utils';
import Link from 'next/link';
import { Header } from '@/components/header';

interface ETFData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  expenseRatio: number;
  aum: number;
  dividend: number;
  beta: number;
  pe: number;
  ytdReturn: number;
  oneYearReturn: number;
  threeYearReturn: number;
  fiveYearReturn: number;
}

interface ChartData {
  date: string;
  [key: string]: string | number;
}

const SAMPLE_ETFS = [
  'SPY', 'QQQ', 'VTI', 'IWM', 'EFA', 'EEM', 'VNQ', 'GLD', 'TLT', 'HYG'
];

const generateMockData = (symbol: string): ETFData => {
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
    name: `${symbol} ETF`,
    price: basePrice,
    change,
    changePercent,
    expenseRatio: seededRandom(3) * 0.5 + 0.03,
    aum: seededRandom(4) * 100000000000 + 1000000000,
    dividend: seededRandom(5) * 3 + 1,
    beta: seededRandom(6) * 0.5 + 0.8,
    pe: seededRandom(7) * 10 + 15,
    ytdReturn: (seededRandom(8) - 0.5) * 30,
    oneYearReturn: (seededRandom(9) - 0.3) * 40,
    threeYearReturn: (seededRandom(10) - 0.2) * 60,
    fiveYearReturn: (seededRandom(11) - 0.1) * 80,
  };
};

const generateChartData = (symbols: string[], days: number = 252): ChartData[] => {
  const data: ChartData[] = [];
  
  // Use a fixed base date to ensure consistency between server and client
  const baseDate = new Date('2024-01-01');
  
  for (let i = 0; i < days; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i);
    
    const dataPoint: ChartData = {
      date: date.toISOString().split('T')[0],
    };
    
    symbols.forEach(symbol => {
      // Normalize all ETFs to start at 100 for comparison
      const baseValue = 100;
      const volatility = 0.02;
      
      if (i === 0) {
        dataPoint[symbol] = baseValue;
      } else {
        // Use deterministic random based on symbol and day
        const seed = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + i;
        const seededRandom = (offset: number = 0) => {
          const x = Math.sin(seed + offset) * 10000;
          return x - Math.floor(x);
        };
        
        const trend = (seededRandom(1) - 0.4) * 0.001;
        const dailyReturn = (seededRandom(2) - 0.5) * volatility + trend;
        const previousValue = data[i - 1][symbol] as number;
        dataPoint[symbol] = previousValue * (1 + dailyReturn);
      }
    });
    
    data.push(dataPoint);
  }
  
  return data;
};

const CHART_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
];

export default function ComparePage() {
  const [selectedETFs, setSelectedETFs] = useState<string[]>(['SPY', 'QQQ']);
  const [etfData, setETFData] = useState<Record<string, ETFData>>({});
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Generate mock data for selected ETFs
    const data: Record<string, ETFData> = {};
    selectedETFs.forEach(symbol => {
      data[symbol] = generateMockData(symbol);
    });
    setETFData(data);
    
    // Generate chart data
    if (selectedETFs.length > 0) {
      setChartData(generateChartData(selectedETFs));
    }
  }, [selectedETFs]);

  useEffect(() => {
    if (searchQuery.length > 0) {
      setIsSearching(true);
      // Mock search - filter from sample ETFs
      const results = SAMPLE_ETFS.filter(etf => 
        etf.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !selectedETFs.includes(etf)
      );
      setSearchResults(results);
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, selectedETFs]);

  const addETF = (symbol: string) => {
    if (selectedETFs.length < 5 && !selectedETFs.includes(symbol)) {
      setSelectedETFs([...selectedETFs, symbol]);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const removeETF = (symbol: string) => {
    setSelectedETFs(selectedETFs.filter(etf => etf !== symbol));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Compare ETFs</h1>
          <p className="text-muted-foreground">
            Compare performance, costs, and key metrics across multiple ETFs
          </p>
        </div>

        {/* ETF Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Selected ETFs ({selectedETFs.length}/5)</CardTitle>
            <CardDescription>
              Add up to 5 ETFs to compare their performance and characteristics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Selected ETFs */}
              <div className="flex flex-wrap gap-2">
                {selectedETFs.map(symbol => (
                  <Badge key={symbol} variant="secondary" className="px-3 py-1">
                    <Link href={`/etf/${symbol}`} className="hover:underline">
                      {symbol}
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeETF(symbol)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>

              {/* Search Input */}
              {selectedETFs.length < 5 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search ETFs to add..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  
                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-background border rounded-md shadow-lg z-10 mt-1">
                      {searchResults.map(symbol => (
                        <button
                          key={symbol}
                          className="w-full px-4 py-2 text-left hover:bg-muted flex items-center justify-between"
                          onClick={() => addETF(symbol)}
                        >
                          <span>{symbol}</span>
                          <Plus className="h-4 w-4" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {selectedETFs.length > 0 && (
          <>
            {/* Performance Chart */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Normalized Performance Comparison</CardTitle>
                <CardDescription>
                  1-year performance comparison (normalized to 100 at start)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={chartData}
                  series={selectedETFs}
                  width={800}
                  height={320}
                  className="w-full"
                  colors={CHART_COLORS}
                />
              </CardContent>
            </Card>

            {/* Comparison Table */}
            <Card>
              <CardHeader>
                <CardTitle>Key Metrics Comparison</CardTitle>
                <CardDescription>
                  Compare important metrics across selected ETFs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Metric</TableHead>
                        {selectedETFs.map(symbol => (
                          <TableHead key={symbol} className="text-center">
                            <Link href={`/etf/${symbol}`} className="hover:underline font-semibold">
                              {symbol}
                            </Link>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Current Price</TableCell>
                        {selectedETFs.map(symbol => (
                          <TableCell key={symbol} className="text-center">
                            {formatCurrency(etfData[symbol]?.price || 0)}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Daily Change</TableCell>
                        {selectedETFs.map(symbol => {
                          const data = etfData[symbol];
                          const isPositive = (data?.changePercent || 0) >= 0;
                          return (
                            <TableCell key={symbol} className="text-center">
                              <div className={cn(
                                "flex items-center justify-center space-x-1",
                                isPositive ? "text-green-600" : "text-red-600"
                              )}>
                                {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                <span>{formatPercentage(data?.changePercent || 0)}</span>
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Expense Ratio</TableCell>
                        {selectedETFs.map(symbol => (
                          <TableCell key={symbol} className="text-center">
                            {formatPercentage(etfData[symbol]?.expenseRatio || 0)}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">AUM</TableCell>
                        {selectedETFs.map(symbol => (
                          <TableCell key={symbol} className="text-center">
                            ${(etfData[symbol]?.aum || 0) / 1000000000 >= 1 
                              ? `${((etfData[symbol]?.aum || 0) / 1000000000).toFixed(1)}B`
                              : `${((etfData[symbol]?.aum || 0) / 1000000).toFixed(0)}M`}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Dividend Yield</TableCell>
                        {selectedETFs.map(symbol => (
                          <TableCell key={symbol} className="text-center">
                            {formatPercentage(etfData[symbol]?.dividend || 0)}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Beta</TableCell>
                        {selectedETFs.map(symbol => (
                          <TableCell key={symbol} className="text-center">
                            {(etfData[symbol]?.beta || 0).toFixed(2)}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">YTD Return</TableCell>
                        {selectedETFs.map(symbol => {
                          const ytdReturn = etfData[symbol]?.ytdReturn || 0;
                          const isPositive = ytdReturn >= 0;
                          return (
                            <TableCell key={symbol} className="text-center">
                              <span className={cn(
                                isPositive ? "text-green-600" : "text-red-600"
                              )}>
                                {formatPercentage(ytdReturn)}
                              </span>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">1Y Return</TableCell>
                        {selectedETFs.map(symbol => {
                          const oneYearReturn = etfData[symbol]?.oneYearReturn || 0;
                          const isPositive = oneYearReturn >= 0;
                          return (
                            <TableCell key={symbol} className="text-center">
                              <span className={cn(
                                isPositive ? "text-green-600" : "text-red-600"
                              )}>
                                {formatPercentage(oneYearReturn)}
                              </span>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">3Y Return (Annualized)</TableCell>
                        {selectedETFs.map(symbol => {
                          const threeYearReturn = etfData[symbol]?.threeYearReturn || 0;
                          const isPositive = threeYearReturn >= 0;
                          return (
                            <TableCell key={symbol} className="text-center">
                              <span className={cn(
                                isPositive ? "text-green-600" : "text-red-600"
                              )}>
                                {formatPercentage(threeYearReturn)}
                              </span>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">5Y Return (Annualized)</TableCell>
                        {selectedETFs.map(symbol => {
                          const fiveYearReturn = etfData[symbol]?.fiveYearReturn || 0;
                          const isPositive = fiveYearReturn >= 0;
                          return (
                            <TableCell key={symbol} className="text-center">
                              <span className={cn(
                                isPositive ? "text-green-600" : "text-red-600"
                              )}>
                                {formatPercentage(fiveYearReturn)}
                              </span>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
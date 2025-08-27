'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatPercentage, cn } from '@/lib/utils';

interface PricePoint {
  timestamp: number;
  price: number;
  volume?: number;
}

interface PerformanceChartProps {
  symbol: string;
  currentPrice: number;
  className?: string;
}

type TimeRange = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y';

const timeRanges: { label: TimeRange; days: number }[] = [
  { label: '1D', days: 1 },
  { label: '1W', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: '1Y', days: 365 },
  { label: '5Y', days: 1825 },
];

// Generate mock price history data
function generatePriceHistory(days: number, currentPrice: number, symbol: string): PricePoint[] {
  const data: PricePoint[] = [];
  const now = Date.now();
  
  // Ensure currentPrice is a valid number
  const safeCurrentPrice = typeof currentPrice === 'number' && !isNaN(currentPrice) && currentPrice > 0 ? currentPrice : 100;
  let price = safeCurrentPrice;
  
  // Work backwards from current time
  for (let i = days; i >= 0; i--) {
    const timestamp = now - (i * 24 * 60 * 60 * 1000);
    
    // Add some realistic price movement
    const volatility = days > 30 ? 0.02 : 0.01; // Higher volatility for longer periods
    
    // Use deterministic random based on symbol and day index
    const seed = symbol.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) + i;
    const seededRandom = () => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    const change = (seededRandom() - 0.5) * volatility;
    price = price * (1 + change);
    
    // Add some volume data
    const baseVolume = 1000000;
    const volumeSeed = seed + 1000; // Different seed for volume
    const volumeRandom = () => {
      const x = Math.sin(volumeSeed) * 10000;
      return x - Math.floor(x);
    };
    const volume = baseVolume * (0.5 + volumeRandom());
    
    data.push({
      timestamp,
      price: Math.max(price, safeCurrentPrice * 0.5), // Prevent unrealistic drops
      volume: Math.floor(volume),
    });
  }
  
  // Ensure the last point is the current price
  if (data.length > 0) {
    data[data.length - 1].price = safeCurrentPrice;
  }
  
  return data.reverse();
}

// Simple SVG line chart component
function LineChart({ data, width = 800, height = 300 }: { data: PricePoint[]; width?: number; height?: number }) {
  if (data.length < 2) return null;
  
  const prices = data.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;
  
  // Add padding to the chart
  const padding = { top: 20, right: 20, bottom: 20, left: 20 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  // Handle case where all prices are the same (priceRange = 0) and NaN values
  const safeCalculateY = (price: number) => {
    // Ensure price is a valid number
    if (typeof price !== 'number' || isNaN(price)) {
      return padding.top + chartHeight / 2; // Center if invalid
    }
    if (priceRange === 0) {
      return padding.top + chartHeight / 2; // Center the line
    }
    const y = padding.top + ((maxPrice - price) / priceRange) * chartHeight;
    // Ensure the result is a valid number
    return typeof y === 'number' && !isNaN(y) ? y : padding.top + chartHeight / 2;
  };
  
  // Create path for the line
  const pathData = data.map((point, index) => {
    const x = padding.left + (index / (data.length - 1)) * chartWidth;
    const y = safeCalculateY(point.price);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');
  
  // Determine if the trend is positive or negative
  const firstPrice = data[0].price;
  const lastPrice = data[data.length - 1].price;
  const isPositive = lastPrice >= firstPrice;
  
  return (
    <div className="w-full overflow-x-auto">
      <svg width={width} height={height} className="w-full h-auto">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#grid)" />
        
        {/* Price line */}
        <path
          d={pathData}
          fill="none"
          stroke={isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'}
          strokeWidth="2"
          className="drop-shadow-sm"
        />
        
        {/* Data points */}
        {data.map((point, index) => {
          const x = padding.left + (index / (data.length - 1)) * chartWidth;
          const y = safeCalculateY(point.price);
          
          // Additional safety check for SVG attributes
          const safeX = typeof x === 'number' && !isNaN(x) ? x : 0;
          const safeY = typeof y === 'number' && !isNaN(y) ? y : padding.top + chartHeight / 2;
          
          return (
            <circle
              key={index}
              cx={safeX}
              cy={safeY}
              r="3"
              fill={isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'}
              className="opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <title>{`${new Date(point.timestamp).toLocaleDateString()}: ${formatCurrency(point.price)}`}</title>
            </circle>
          );
        })}
      </svg>
    </div>
  );
}

export function PerformanceChart({ symbol, currentPrice, className }: PerformanceChartProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1M');
  const [priceData, setPriceData] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);
  
  console.log('PerformanceChart props:', { symbol, currentPrice, className });
  
  useEffect(() => {
    const loadPriceData = async () => {
      setLoading(true);
      
      try {
        // In a real app, this would fetch from the API
        // For now, we'll generate mock data
        const range = timeRanges.find(r => r.label === selectedRange);
        const days = range?.days || 30;
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const data = generatePriceHistory(days, currentPrice, symbol);
        console.log('Generated price data:', data);
        console.log('Current price used:', currentPrice);
        setPriceData(data);
      } catch (error) {
        console.error('Failed to load price data:', error);
        setPriceData([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadPriceData();
  }, [selectedRange, currentPrice]);
  
  // Calculate performance metrics
  const firstPrice = priceData[0]?.price || currentPrice;
  const lastPrice = priceData[priceData.length - 1]?.price || currentPrice;
  const totalReturn = lastPrice - firstPrice;
  const totalReturnPercent = ((lastPrice - firstPrice) / firstPrice) * 100;
  const isPositive = totalReturn >= 0;
  
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Performance Chart</CardTitle>
          <div className="flex items-center space-x-2">
            {React.createElement(
              isPositive ? TrendingUp : TrendingDown,
              { className: cn('w-4 h-4', isPositive ? 'text-success' : 'text-destructive') }
            )}
            <Badge variant={isPositive ? 'default' : 'destructive'} className="font-medium">
              {formatPercentage(totalReturnPercent || 0)}
            </Badge>
          </div>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex flex-wrap gap-1 mt-4">
          {timeRanges.map((range) => (
            <Button
              key={range.label}
              variant={selectedRange === range.label ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedRange(range.label)}
              className="text-xs px-3 py-1"
            >
              {range.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : priceData.length > 0 ? (
          <div className="space-y-4">
            {/* Performance Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Current Price</p>
                <p className="font-semibold">{formatCurrency(currentPrice)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Change</p>
                <p className={cn('font-semibold', isPositive ? 'text-success' : 'text-destructive')}>
                  {formatCurrency(totalReturn)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">% Change</p>
                <p className={cn('font-semibold', isPositive ? 'text-success' : 'text-destructive')}>
                  {formatPercentage(totalReturnPercent || 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Period</p>
                <p className="font-semibold">{selectedRange}</p>
              </div>
            </div>
            
            {/* Chart */}
            <div className="bg-background rounded-lg border p-4">
              <LineChart data={priceData} />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">No price data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
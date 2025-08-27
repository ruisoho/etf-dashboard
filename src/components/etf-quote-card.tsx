"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkline, generateSparklineData } from "@/components/ui/sparkline";
import { formatCurrency, formatPercentage, formatLargeNumber, getChangeColor, getChangeBgColor } from "@/lib/utils";

interface ETFQuoteCardProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: number;
  className?: string;
}

export function ETFQuoteCard({
  symbol,
  name,
  price,
  change,
  changePercent,
  volume,
  marketCap,
  className,
}: ETFQuoteCardProps) {
  const [currentTime, setCurrentTime] = useState<string>("");
  const isPositive = change >= 0;
  const isNegative = change < 0;

  useEffect(() => {
    // Set initial time after hydration
    setCurrentTime(new Date().toLocaleTimeString());
    
    // Update time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">{symbol}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{name}</p>
          </div>
          <Badge variant="outline" className="text-xs">
            ETF
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Price and Change */}
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-gray-900">
              {formatCurrency(price)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-md text-sm font-medium ${
              getChangeBgColor(change)
            }`}>
              {isPositive && <TrendingUp className="h-4 w-4" />}
              {isNegative && <TrendingDown className="h-4 w-4" />}
              <span>
                {change >= 0 ? "+" : ""}{formatCurrency(change)}
              </span>
              <span>({formatPercentage(changePercent || 0)})</span>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        {(volume || marketCap) && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            {volume && (
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Trend (30D)</p>
                  <Sparkline 
                    data={generateSparklineData(price, 30, symbol.charCodeAt(0) * 1000)} 
                    width={80} 
                    height={24}
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Volume</p>
                  <p className="text-sm font-medium text-gray-900">
                    {volume.toLocaleString()}
                  </p>
                </div>
              </div>
            )}
            {marketCap && (
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Market Cap</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatLargeNumber(marketCap)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Last Updated */}
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Last updated: {currentTime || "Loading..."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
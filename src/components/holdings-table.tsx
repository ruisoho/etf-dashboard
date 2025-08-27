'use client';

import React, { useState } from 'react';
import { Download, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatPercentage, cn } from '@/lib/utils';

interface Holding {
  symbol: string;
  name: string;
  weight: number;
  shares?: number;
  marketValue?: number;
  price?: number;
  change?: number;
  changePercent?: number;
  sector?: string;
}

interface HoldingsTableProps {
  holdings: Holding[];
  totalAssets?: number;
  className?: string;
}

// Generate CSV content for export
function generateCSV(holdings: Holding[]): string {
  const headers = [
    'Symbol',
    'Name',
    'Weight (%)',
    'Shares',
    'Market Value',
    'Price',
    'Change',
    'Change (%)',
    'Sector'
  ];
  
  const rows = holdings.map(holding => [
    holding.symbol,
    holding.name,
    (holding.weight != null && !isNaN(holding.weight)) ? holding.weight.toFixed(2) : '0.00',
    holding.shares?.toLocaleString() || '',
    holding.marketValue ? formatCurrency(holding.marketValue) : '',
    holding.price ? formatCurrency(holding.price) : '',
    holding.change ? formatCurrency(holding.change) : '',
    holding.changePercent ? formatPercentage(holding.changePercent || 0) : '',
    holding.sector || ''
  ]);
  
  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
}

// Download CSV file
function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function HoldingsTable({ holdings, totalAssets, className }: HoldingsTableProps) {
  const [showAll, setShowAll] = useState(false);
  
  const displayedHoldings = showAll ? holdings : holdings.slice(0, 10);
  const totalWeight = holdings.reduce((sum, holding) => sum + holding.weight, 0);
  
  const handleExportCSV = () => {
    const csvContent = generateCSV(holdings);
    const timestamp = new Date().toISOString().split('T')[0];
    downloadCSV(csvContent, `etf-holdings-${timestamp}.csv`);
  };
  
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Top Holdings</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {holdings.length} holdings • {formatPercentage(totalWeight || 0)} of total assets
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Rank</TableHead>
                <TableHead className="min-w-48">Security</TableHead>
                <TableHead className="text-right">Weight</TableHead>
                <TableHead className="text-right">Shares</TableHead>
                <TableHead className="text-right">Market Value</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Change</TableHead>
                <TableHead className="w-24">Sector</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedHoldings.map((holding, index) => {
                const isPositive = (holding.changePercent || 0) >= 0;
                const changeIcon = isPositive ? TrendingUp : TrendingDown;
                const changeColor = isPositive ? 'text-success' : 'text-destructive';
                
                return (
                  <TableRow key={`${holding.symbol}-${index}`} className="hover:bg-muted/50">
                    <TableCell className="font-medium text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-foreground">{holding.symbol}</span>
                          <ExternalLink className="w-3 h-3 text-muted-foreground hover:text-foreground cursor-pointer" />
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {holding.name}
                        </p>
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <div className="space-y-1">
                        <span className="font-semibold">{formatPercentage(holding.weight || 0)}</span>
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div 
                            className="bg-primary h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(holding.weight * 2, 100)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-right text-muted-foreground">
                      {holding.shares ? holding.shares.toLocaleString() : '—'}
                    </TableCell>
                    
                    <TableCell className="text-right font-medium">
                      {holding.marketValue ? formatCurrency(holding.marketValue) : '—'}
                    </TableCell>
                    
                    <TableCell className="text-right">
                      {holding.price ? formatCurrency(holding.price) : '—'}
                    </TableCell>
                    
                    <TableCell className="text-right">
                      {holding.change !== undefined && holding.changePercent !== undefined ? (
                        <div className={cn('flex items-center justify-end space-x-1', changeColor)}>
                          {React.createElement(changeIcon, { className: 'w-3 h-3' })}
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {formatCurrency(holding.change)}
                            </div>
                            <div className="text-xs">
                              {formatPercentage(holding.changePercent || 0)}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {holding.sector && (
                        <Badge variant="outline" className="text-xs">
                          {holding.sector}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        {/* Show More/Less Button */}
        {holdings.length > 10 && (
          <div className="flex justify-center mt-6">
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="flex items-center space-x-2"
            >
              <span>
                {showAll ? 'Show Less' : `Show All ${holdings.length} Holdings`}
              </span>
            </Button>
          </div>
        )}
        
        {/* Summary Stats */}
        {totalAssets && (
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Total Holdings</p>
                <p className="font-semibold">{holdings.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Top 10 Weight</p>
                <p className="font-semibold">
                  {formatPercentage(holdings.slice(0, 10).reduce((sum, h) => sum + (h.weight || 0), 0))}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Assets</p>
                <p className="font-semibold">{formatCurrency(totalAssets)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Concentration</p>
                <p className="font-semibold">
                  {holdings.length > 0 ? formatPercentage(holdings[0]?.weight || 0) : '—'}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
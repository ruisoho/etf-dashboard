'use client';

import React, { useState } from 'react';
import { PieChart, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPercentage, cn } from '@/lib/utils';

interface SectorAllocation {
  sector: string;
  weight: number;
  color?: string;
}

interface SectorChartProps {
  allocations: SectorAllocation[];
  className?: string;
}

type ChartType = 'pie' | 'bar';

// Predefined colors for sectors
const sectorColors = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
  '#ec4899', // pink
  '#6b7280', // gray
  '#14b8a6', // teal
  '#a855f7', // purple
];

// Simple SVG Pie Chart
function PieChartSVG({ data, size = 200 }: { data: SectorAllocation[]; size?: number }) {
  // Ensure size is a valid number
  const safeSize = typeof size === 'number' && !isNaN(size) && size > 0 ? size : 200;
  const radius = safeSize / 2 - 10;
  const centerX = safeSize / 2;
  const centerY = safeSize / 2;
  
  let cumulativePercentage = 0;
  
  return (
    <div className="flex items-center justify-center">
      <svg width={safeSize} height={safeSize} className="transform -rotate-90">
        {data.map((sector, index) => {
          const startAngle = cumulativePercentage * 3.6; // Convert to degrees
          const endAngle = (cumulativePercentage + sector.weight) * 3.6;
          const largeArcFlag = sector.weight > 50 ? 1 : 0;
          
          const startAngleRad = (startAngle * Math.PI) / 180;
          const endAngleRad = (endAngle * Math.PI) / 180;
          
          const x1 = centerX + radius * Math.cos(startAngleRad);
          const y1 = centerY + radius * Math.sin(startAngleRad);
          const x2 = centerX + radius * Math.cos(endAngleRad);
          const y2 = centerY + radius * Math.sin(endAngleRad);
          
          const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ');
          
          cumulativePercentage += sector.weight;
          
          return (
            <path
              key={sector.sector}
              d={pathData}
              fill={sector.color || sectorColors[index % sectorColors.length]}
              stroke="white"
              strokeWidth="2"
              className="hover:opacity-80 transition-opacity cursor-pointer"
            >
              <title>{`${sector.sector}: ${formatPercentage(sector.weight || 0)}`}</title>
            </path>
          );
        })}
        
        {/* Center circle for donut effect */}
        <circle
          cx={typeof centerX === 'number' && !isNaN(centerX) ? centerX : safeSize / 2}
          cy={typeof centerY === 'number' && !isNaN(centerY) ? centerY : safeSize / 2}
          r={radius * 0.4}
          fill="white"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}

// Simple Bar Chart
function BarChartSVG({ data, width = 400, height = 300 }: { data: SectorAllocation[]; width?: number; height?: number }) {
  // Ensure dimensions are valid numbers
  const safeWidth = typeof width === 'number' && !isNaN(width) && width > 0 ? width : 400;
  const safeHeight = typeof height === 'number' && !isNaN(height) && height > 0 ? height : 300;
  
  const padding = { top: 20, right: 20, bottom: 60, left: 120 };
  const chartWidth = safeWidth - padding.left - padding.right;
  const chartHeight = safeHeight - padding.top - padding.bottom;
  
  // Ensure we have valid data and calculate maxWeight safely
  const validWeights = data.filter(d => typeof d.weight === 'number' && !isNaN(d.weight)).map(d => d.weight);
  const maxWeight = validWeights.length > 0 ? Math.max(...validWeights) : 1;
  const barHeight = data.length > 0 ? chartHeight / data.length - 10 : 0;
  
  return (
    <div className="w-full overflow-x-auto">
      <svg width={safeWidth} height={safeHeight}>
        {data.map((sector, index) => {
          const barWidth = (typeof sector.weight === 'number' && !isNaN(sector.weight) && maxWeight > 0) 
            ? (sector.weight / maxWeight) * chartWidth 
            : 0;
          const y = padding.top + index * (barHeight + 10);
          
          return (
            <g key={sector.sector}>
              {/* Bar */}
              <rect
                x={padding.left}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={sector.color || sectorColors[index % sectorColors.length]}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              >
                <title>{`${sector.sector}: ${formatPercentage(sector.weight || 0)}`}</title>
              </rect>
              
              {/* Sector label */}
              <text
                x={padding.left - 10}
                y={y + barHeight / 2}
                textAnchor="end"
                dominantBaseline="middle"
                className="text-xs fill-current text-muted-foreground"
              >
                {sector.sector}
              </text>
              
              {/* Percentage label */}
              <text
                x={padding.left + barWidth + 5}
                y={y + barHeight / 2}
                dominantBaseline="middle"
                className="text-xs fill-current font-medium"
              >
                {formatPercentage(sector.weight || 0)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function SectorChart({ allocations, className }: SectorChartProps) {
  const [chartType, setChartType] = useState<ChartType>('pie');
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  
  // Add colors to allocations if not provided
  const dataWithColors = allocations.map((allocation, index) => ({
    ...allocation,
    color: allocation.color || sectorColors[index % sectorColors.length]
  }));
  
  // Sort by weight descending
  const sortedData = [...dataWithColors].sort((a, b) => b.weight - a.weight);
  
  const totalWeight = sortedData.reduce((sum, sector) => sum + sector.weight, 0);
  
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Sector Allocation</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {sortedData.length} sectors • {formatPercentage(totalWeight || 0)} allocated
            </p>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant={chartType === 'pie' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('pie')}
              className="flex items-center space-x-1"
            >
              <PieChart className="w-4 h-4" />
              <span className="hidden sm:inline">Pie</span>
            </Button>
            <Button
              variant={chartType === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setChartType('bar')}
              className="flex items-center space-x-1"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Bar</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Chart */}
          <div className="flex justify-center">
            {chartType === 'pie' ? (
              <PieChartSVG data={sortedData} size={280} />
            ) : (
              <BarChartSVG data={sortedData} width={500} height={Math.max(300, sortedData.length * 40)} />
            )}
          </div>
          
          {/* Legend */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground">Sector Breakdown</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {sortedData.map((sector, index) => (
                <div
                  key={sector.sector}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer',
                    selectedSector === sector.sector
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-muted/50'
                  )}
                  onClick={() => setSelectedSector(
                    selectedSector === sector.sector ? null : sector.sector
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: sector.color }}
                    />
                    <span className="text-sm font-medium truncate">{sector.sector}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs font-medium">
                      {formatPercentage(sector.weight || 0)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">#{index + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Top Sector</p>
              <p className="font-semibold text-sm">
                {sortedData[0]?.sector || '—'}
              </p>
              <p className="text-xs text-muted-foreground">
                {sortedData[0] ? formatPercentage(sortedData[0].weight || 0) : '—'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Sectors</p>
              <p className="font-semibold text-sm">{sortedData.length}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Top 3 Weight</p>
              <p className="font-semibold text-sm">
                {formatPercentage(
                  sortedData.slice(0, 3).reduce((sum, s) => sum + (s.weight || 0), 0)
                )}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Diversification</p>
              <p className="font-semibold text-sm">
                {sortedData.length > 5 ? 'High' : sortedData.length > 3 ? 'Medium' : 'Low'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
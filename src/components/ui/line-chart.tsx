'use client';

import React from 'react';

interface DataPoint {
  date: string;
  value?: number;
  [key: string]: any; // Allow additional properties for multi-series data
}

interface LineChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  colors?: string[];
  strokeWidth?: number;
  series?: string[]; // Array of keys to plot as separate lines
  className?: string;
}

export function LineChart({ 
  data, 
  width = 600, 
  height = 300, 
  colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
  strokeWidth = 2,
  series = ['value'],
  className = ''
}: LineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-50 rounded-lg border ${className}`}
        style={{ width, height }}
      >
        <p className="text-gray-500 text-sm">No data available</p>
      </div>
    );
  }

  // Get all values across all series to determine range
  const allValues = data.flatMap(d => 
    series.map(key => typeof d[key] === 'number' && !isNaN(d[key]) ? d[key] : 0)
  );
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const valueRange = maxValue - minValue || 1;
  
  // Safe calculation for y coordinate to prevent NaN
  const safeCalculateY = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) {
      return chartHeight / 2; // Center if invalid
    }
    if (valueRange === 0) {
      return chartHeight / 2; // Center if all values are the same
    }
    return chartHeight - ((value - minValue) / valueRange) * chartHeight;
  };

  // Padding for the chart
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Create paths for each series
  const createPath = (seriesKey: string) => {
    return data.map((point, index) => {
      const x = (index / (data.length - 1)) * chartWidth;
      const value = typeof point[seriesKey] === 'number' ? point[seriesKey] : 0;
      const y = safeCalculateY(value);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  return (
    <div className={`relative bg-white rounded-lg border p-4 ${className}`}>
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          {series.map((_, seriesIndex) => {
            const color = colors[seriesIndex % colors.length];
            return (
              <linearGradient key={`gradient-${seriesIndex}`} id={`gradient-${seriesIndex}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="0.1" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            );
          })}
        </defs>
        
        <g transform={`translate(${padding.left}, ${padding.top})`}>
          {/* Grid lines */}
          <g className="opacity-20">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
              <line
                key={`h-${ratio}`}
                x1={0}
                y1={chartHeight * ratio}
                x2={chartWidth}
                y2={chartHeight * ratio}
                stroke="#e5e7eb"
                strokeWidth={1}
              />
            ))}
            {[0, 0.2, 0.4, 0.6, 0.8, 1].map((ratio) => (
              <line
                key={`v-${ratio}`}
                x1={chartWidth * ratio}
                y1={0}
                x2={chartWidth * ratio}
                y2={chartHeight}
                stroke="#e5e7eb"
                strokeWidth={1}
              />
            ))}
          </g>
          
          {/* Lines for each series */}
          {series.map((seriesKey, seriesIndex) => {
            const color = colors[seriesIndex % colors.length];
            const pathData = createPath(seriesKey);
            
            return (
              <g key={seriesKey}>
                {/* Area under the line (only for first series) */}
                {seriesIndex === 0 && (
                  <path
                    d={`${pathData} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`}
                    fill={`url(#gradient-${seriesIndex})`}
                  />
                )}
                
                {/* Main line */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={color}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* Data points */}
                {data.map((point, index) => {
                  const x = (index / (data.length - 1)) * chartWidth;
                  const value = typeof point[seriesKey] === 'number' ? point[seriesKey] : 0;
                  const y = safeCalculateY(value);
                  
                  // Additional safety check for SVG attributes
                  const safeX = typeof x === 'number' && !isNaN(x) ? x : 0;
                  const safeY = typeof y === 'number' && !isNaN(y) ? y : chartHeight / 2;
                  
                  return (
                    <circle
                      key={`${seriesKey}-${index}`}
                      cx={safeX}
                      cy={safeY}
                      r={3}
                      fill={color}
                      className="opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <title>{`${seriesKey}: ${typeof value === 'number' && !isNaN(value) ? value.toFixed(2) : '0.00'}%`}</title>
                    </circle>
                  );
                })}
              </g>
            );
          })}
        </g>
        
        {/* Y-axis labels */}
        <g transform={`translate(${padding.left - 10}, ${padding.top})`}>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const value = maxValue - (ratio * valueRange);
            const y = chartHeight * ratio;
            return (
              <text
                key={index}
                x={0}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                className="text-xs fill-gray-500"
              >
                {value.toFixed(1)}%
              </text>
            );
          })}
        </g>
        
        {/* X-axis labels */}
        <g transform={`translate(${padding.left}, ${height - padding.bottom + 15})`}>
          {data.filter((_, index) => index % Math.ceil(data.length / 6) === 0).map((point, index) => {
            const originalIndex = data.findIndex(d => d.date === point.date);
            const x = (originalIndex / (data.length - 1)) * chartWidth;
            return (
              <text
                key={index}
                x={x}
                y={0}
                textAnchor="middle"
                className="text-xs fill-gray-500"
              >
                {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </text>
            );
          })}
        </g>
      </svg>
      
      {/* Legend */}
      {series.length > 1 && (
        <div className="flex flex-wrap gap-4 mt-4 justify-center">
          {series.map((seriesKey, index) => (
            <div key={seriesKey} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-sm text-gray-600 capitalize">
                {seriesKey.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
  color?: string;
  strokeWidth?: number;
}

export function Sparkline({
  data,
  width = 100,
  height = 30,
  className,
  color = 'currentColor',
  strokeWidth = 1.5
}: SparklineProps) {
  // Generate deterministic ID based on data to avoid hydration mismatch
  const gradientId = useMemo(() => {
    if (!data || data.length === 0) return 'gradient-empty';
    const dataHash = data.reduce((acc, val, idx) => acc + val * (idx + 1), 0);
    return `gradient-${Math.abs(Math.floor(dataHash * 1000))}`;
  }, [data]);
  if (!data || data.length < 2) {
    return (
      <div 
        className={cn('flex items-center justify-center', className)}
        style={{ width, height }}
      >
        <div className="w-full h-px bg-muted" />
      </div>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  
  // If all values are the same, show a flat line
  if (range === 0) {
    return (
      <div 
        className={cn('flex items-center justify-center', className)}
        style={{ width, height }}
      >
        <div className="w-full h-px bg-current opacity-50" />
      </div>
    );
  }

  // Create SVG path with NaN safety
  const points = data.map((value, index) => {
    // Ensure value is a valid number
    const safeValue = typeof value === 'number' && !isNaN(value) ? value : min;
    const x = (index / (data.length - 1)) * width;
    const y = height - ((safeValue - min) / range) * height;
    
    // Ensure coordinates are valid numbers
    const safeX = typeof x === 'number' && !isNaN(x) ? x : 0;
    const safeY = typeof y === 'number' && !isNaN(y) ? y : height / 2;
    
    return `${safeX},${safeY}`;
  });

  const pathData = `M ${points.join(' L ')}`;

  // Determine if trend is positive or negative
  const isPositive = data[data.length - 1] >= data[0];
  const defaultColor = isPositive ? '#10b981' : '#ef4444'; // green or red

  return (
    <div className={cn('inline-block', className)}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        <path
          d={pathData}
          fill="none"
          stroke={color === 'currentColor' ? defaultColor : color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300"
        />
        {/* Optional: Add a subtle gradient fill */}
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color === 'currentColor' ? defaultColor : color} stopOpacity="0.1" />
            <stop offset="100%" stopColor={color === 'currentColor' ? defaultColor : color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`${pathData} L ${width},${height} L 0,${height} Z`}
          fill={`url(#${gradientId})`}
        />
      </svg>
    </div>
  );
}

// Generate sample sparkline data for demo purposes
export function generateSparklineData(baseValue: number, points: number = 20, seed?: number): number[] {
  // Ensure baseValue is a valid number
  const safeBaseValue = typeof baseValue === 'number' && !isNaN(baseValue) && baseValue > 0 ? baseValue : 100;
  const data = [];
  let currentValue = safeBaseValue;
  
  // Use a more deterministic seeded random number generator (Linear Congruential Generator)
  const seededRandom = (seed: number) => {
    // LCG parameters (same as used in many standard libraries)
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);
    return ((a * seed + c) % m) / m;
  };
  
  const baseSeed = seed || Math.floor(baseValue * 1000);
  let currentSeed = baseSeed;
  
  for (let i = 0; i < points; i++) {
    // Add some variation (±2%) using seeded random
    const randomValue = seededRandom(currentSeed);
    currentSeed = Math.floor(randomValue * Math.pow(2, 32)); // Update seed for next iteration
    const variation = (randomValue - 0.5) * 0.04 * safeBaseValue;
    currentValue += variation;
    
    // Ensure the result is a valid number
    const safeCurrentValue = typeof currentValue === 'number' && !isNaN(currentValue) ? currentValue : safeBaseValue;
    data.push(Math.max(0, safeCurrentValue)); // Ensure no negative values
  }
  
  return data;
}
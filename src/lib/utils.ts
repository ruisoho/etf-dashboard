import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency values
export function formatCurrency(value: number | undefined | null, currency = "USD"): string {
  if (value === undefined || value === null || isNaN(value)) {
    return "—";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Format percentage values
export function formatPercentage(value: number | undefined | null, decimals = 2): string {
  if (value === undefined || value === null || isNaN(value)) {
    return "—";
  }
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}%`;
}

// Format large numbers (e.g., market cap)
export function formatLargeNumber(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return "—";
  }
  if (value >= 1e12) {
    return `$${(value / 1e12).toFixed(1)}T`;
  }
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(1)}B`;
  }
  if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(1)}M`;
  }
  if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
}

// Generate sparkline data for charts
export function generateSparklineData(days: number = 30, seed: number = 12345): number[] {
  const data: number[] = [];
  let currentPrice = 100;
  
  // Use a deterministic seeded random number generator (Linear Congruential Generator)
  const seededRandom = (seed: number) => {
    // LCG parameters (same as used in many standard libraries)
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);
    return ((a * seed + c) % m) / m;
  };
  
  let currentSeed = seed;
  
  for (let i = 0; i < days; i++) {
    // Random walk with slight upward bias using seeded random
    const randomValue = seededRandom(currentSeed);
    currentSeed = Math.floor(randomValue * Math.pow(2, 32)); // Update seed for next iteration
    const change = (randomValue - 0.48) * 2;
    currentPrice += change;
    data.push(Math.max(currentPrice, 50)); // Prevent negative prices
  }
  
  return data;
}

// Debounce utility function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

// Get color based on percentage change
export function getChangeColor(change: number | undefined | null): string {
  if (change === undefined || change === null || isNaN(change)) {
    return "text-gray-600";
  }
  if (change > 0) return "text-green-600";
  if (change < 0) return "text-red-600";
  return "text-gray-600";
}

// Get background color based on percentage change
export function getChangeBgColor(change: number | undefined | null): string {
  if (change === undefined || change === null || isNaN(change)) {
    return "bg-gray-50 text-gray-700";
  }
  if (change > 0) return "bg-green-50 text-green-700";
  if (change < 0) return "bg-red-50 text-red-700";
  return "bg-gray-50 text-gray-700";
}
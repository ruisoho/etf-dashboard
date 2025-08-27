import React, { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Hook for debouncing values
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook for throttling function calls
 */
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now())

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args)
        lastRun.current = Date.now()
      }
    }) as T,
    [callback, delay]
  )
}

/**
 * Hook for intersection observer (lazy loading)
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options?: IntersectionObserverInit
) {
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      {
        threshold: 0.1,
        ...options,
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [elementRef, options])

  return isIntersecting
}

/**
 * Hook for measuring component performance
 */
export function usePerformanceMonitor(name: string) {
  const startTime = useRef<number>()

  useEffect(() => {
    startTime.current = performance.now()

    return () => {
      if (startTime.current) {
        const duration = performance.now() - startTime.current
        if (duration > 0) {
          console.log(`Component ${name} render time: ${duration.toFixed(2)}ms`)
        }
      }
    }
  }, [name])

  const measureFunction = useCallback(
    <T extends (...args: unknown[]) => unknown>(fn: T, functionName: string): T => {
      return ((...args: unknown[]) => {
        const start = performance.now()
        const result = fn(...args)
        const end = performance.now()
        console.log(`Function ${functionName} execution time: ${(end - start).toFixed(2)}ms`)
        return result
      }) as T
    },
    []
  )

  return { measureFunction }
}

/**
 * Utility for lazy loading components
 */
export function createLazyComponent<T extends React.ComponentType<Record<string, unknown>>>(
  importFn: () => Promise<{ default: T }>
) {
  return React.lazy(importFn)
}

/**
 * Memory usage monitor
 */
export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState<Record<string, number> | null>(null)

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        setMemoryInfo((performance as unknown as { memory: Record<string, number> }).memory)
      }
    }

    updateMemoryInfo()
    const interval = setInterval(updateMemoryInfo, 5000)

    return () => clearInterval(interval)
  }, [])

  return memoryInfo
}

/**
 * Image optimization utility
 */
export function optimizeImageUrl(
  src: string,
  width?: number,
  height?: number,
  quality: number = 75
): string {
  // For Next.js Image optimization
  if (src.startsWith('/')) {
    const params = new URLSearchParams()
    if (width) params.set('w', width.toString())
    if (height) params.set('h', height.toString())
    params.set('q', quality.toString())
    
    return `/_next/image?url=${encodeURIComponent(src)}&${params.toString()}`
  }
  
  return src
}
'use client'

import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; reset: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} reset={this.reset} />
      }

      return <DefaultErrorFallback error={this.state.error} reset={this.reset} />
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error?: Error
  reset: () => void
}

function DefaultErrorFallback({ error, reset }: ErrorFallbackProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <AlertTriangle className="h-16 w-16 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            Something went wrong
          </h2>
          <p className="text-muted-foreground">
            {error?.message || 'An unexpected error occurred. Please try again.'}
          </p>
        </div>
        <Button onClick={reset} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
      </div>
    </div>
  )
}

export function ErrorFallback({ error, reset }: ErrorFallbackProps) {
  return <DefaultErrorFallback error={error} reset={reset} />
}

// Hook for functional components
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const captureError = React.useCallback((error: Error) => {
    setError(error)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { captureError, resetError }
}
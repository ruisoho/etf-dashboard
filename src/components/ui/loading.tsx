import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-muted border-t-primary",
        sizeClasses[size],
        className
      )}
    />
  )
}

interface LoadingSkeletonProps {
  className?: string
}

export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
    />
  )
}

interface LoadingCardProps {
  className?: string
}

export function LoadingCard({ className }: LoadingCardProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-6 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <LoadingSkeleton className="h-6 w-24" />
        <LoadingSkeleton className="h-4 w-16" />
      </div>
      <LoadingSkeleton className="h-8 w-32" />
      <div className="space-y-2">
        <LoadingSkeleton className="h-4 w-full" />
        <LoadingSkeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}

export function LoadingPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="space-y-4">
        <LoadingSkeleton className="h-8 w-48" />
        <LoadingSkeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <LoadingCard key={i} />
        ))}
      </div>
    </div>
  )
}
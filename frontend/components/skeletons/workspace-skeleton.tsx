import { Skeleton, SkeletonText } from "@/components/ui/skeleton"

export function WorkspaceCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-6 space-y-4 animate-fadeIn">
      {/* Header with icon */}
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted animate-shimmer" />
        <div className="h-5 w-5 rounded bg-muted animate-shimmer" />
      </div>

      {/* Title */}
      <Skeleton className="h-6 w-2/3 rounded-md" />

      {/* Description */}
      <SkeletonText lines={2} />

      {/* Footer info */}
      <div className="flex items-center gap-4 pt-4 border-t border-border/50">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-20 rounded" />
        </div>
      </div>
    </div>
  )
}

export function WorkspaceCardGridSkeleton({ columns = 3 }: { columns?: number }) {
  return (
    <div className={`grid gap-6 md:grid-cols-2 lg:grid-cols-${columns}`}>
      {[...Array(6)].map((_, i) => (
        <WorkspaceCardSkeleton key={i} />
      ))}
    </div>
  )
}

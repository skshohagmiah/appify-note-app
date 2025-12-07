import { Skeleton, SkeletonText } from "@/components/ui/skeleton"

export function NoteCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4 animate-fadeIn">
      {/* Header with icon */}
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted animate-shimmer" />
        <div className="h-5 w-5 rounded bg-muted animate-shimmer" />
      </div>

      {/* Title */}
      <Skeleton className="h-6 w-2/3 rounded-md" />

      {/* Preview text */}
      <SkeletonText lines={2} />

      {/* Workspace info */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-24 rounded" />
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>

      {/* Footer with votes and date */}
      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
        <Skeleton className="h-4 w-20 rounded" />
      </div>
    </div>
  )
}

export function NoteCardListSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4 animate-fadeIn">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-3">
          <Skeleton className="h-5 w-1/2 rounded-md" />
          <Skeleton className="h-4 w-1/3 rounded-md" />
          <div className="flex flex-wrap gap-1.5 pt-1">
            <Skeleton className="h-6 w-14 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
        </div>
        <div className="flex-shrink-0 space-y-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
    </div>
  )
}

export function NoteCardGridSkeleton({ columns = 3 }: { columns?: number }) {
  return (
    <div className={`grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns}`}>
      {[...Array(6)].map((_, i) => (
        <NoteCardSkeleton key={i} />
      ))}
    </div>
  )
}

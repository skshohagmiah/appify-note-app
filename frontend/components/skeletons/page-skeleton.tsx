import { Skeleton, SkeletonText } from "@/components/ui/skeleton"

export function SearchBarSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full rounded-lg" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  )
}

export function PageHeaderSkeleton() {
  return (
    <div className="space-y-3 mb-6 animate-fadeIn">
      <Skeleton className="h-8 w-1/2 rounded-lg" />
      <Skeleton className="h-5 w-2/3 rounded-lg" />
    </div>
  )
}

export function HeaderSkeleton() {
  return (
    <div className="h-16 border-b border-border bg-card sticky top-0 z-40 animate-slideInDown">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-6 w-24 rounded-lg" />
          </div>
          <div className="hidden gap-4 md:flex">
            <Skeleton className="h-5 w-20 rounded-lg" />
            <Skeleton className="h-5 w-20 rounded-lg" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export function PaginationSkeleton() {
  return (
    <div className="flex items-center justify-center gap-4 pt-6 animate-fadeIn">
      <Skeleton className="h-10 w-10 rounded-lg" />
      <Skeleton className="h-6 w-32 rounded-lg" />
      <Skeleton className="h-10 w-10 rounded-lg" />
    </div>
  )
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
    </div>
  )
}

import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        'bg-gradient-to-r from-muted via-muted-foreground/10 to-muted animate-shimmer rounded-lg',
        className,
      )}
      {...props}
    />
  )
}

function SkeletonText({ lines = 1, className, ...props }: React.ComponentProps<'div'> & { lines?: number }) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {[...Array(lines)].map((_, i) => (
        <Skeleton key={i} className={cn('h-4 w-full', i === lines - 1 && 'w-3/4')} />
      ))}
    </div>
  )
}

function SkeletonCard({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-muted bg-card p-6 space-y-4',
        className,
      )}
      {...props}
    >
      <div className="space-y-3">
        <Skeleton className="h-6 w-2/3 rounded-md" />
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-4/5 rounded-md" />
      </div>
      <div className="flex gap-2 pt-4">
        <Skeleton className="h-8 w-16 rounded-md" />
        <Skeleton className="h-8 w-16 rounded-md" />
      </div>
    </div>
  )
}

function SkeletonAvatar({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <Skeleton
      className={cn('h-10 w-10 rounded-full', className)}
      {...props}
    />
  )
}

export { Skeleton, SkeletonText, SkeletonCard, SkeletonAvatar }

import { cn } from '@/lib/cn';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-none bg-ink-200 dark:bg-ink-700',
        className,
      )}
    />
  );
}

export function SkeletonLine({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-4 w-full', className)} />;
}

export function SkeletonBlock({ className }: SkeletonProps) {
  return <Skeleton className={cn('h-24 w-full', className)} />;
}

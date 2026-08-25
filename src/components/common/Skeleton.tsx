interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-slate-200/80 rounded-md ${className}`} />
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full divide-y divide-slate-100">
      <div className="flex gap-4 py-3.5 px-4 bg-slate-50">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={`head-${i}`} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={`row-${r}`} className="flex gap-4 py-4 px-4 items-center">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton
              key={`cell-${r}-${c}`}
              className={`h-4 flex-1 ${c === 0 ? 'w-24' : ''}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-7 w-20" />
        </div>
        <Skeleton className="w-10 h-10 rounded-full" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-4 w-16 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}

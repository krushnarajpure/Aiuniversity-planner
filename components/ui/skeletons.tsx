export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="h-7 w-40 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse" />
        <div className="h-10 w-32 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="card space-y-3">
            <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
            <div className="h-5 w-3/4 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse" />
            <div className="h-4 w-1/2 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse" />
            <div className="flex gap-2">
              <div className="h-6 w-16 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse" />
              <div className="h-6 w-16 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="card">
        <div className="h-6 w-44 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse" />
        <div className="mt-3 h-9 w-72 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse" />
        <div className="mt-3 h-4 w-56 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="card space-y-3">
            <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
            <div className="h-6 w-16 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse" />
            <div className="h-4 w-24 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="card h-64 animate-pulse bg-slate-100 dark:bg-slate-800" />
        <div className="card h-64 animate-pulse bg-slate-100 dark:bg-slate-800" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_1fr]">
        <div className="card h-72 animate-pulse bg-slate-100 dark:bg-slate-800" />
        <div className="card h-72 animate-pulse bg-slate-100 dark:bg-slate-800" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_1fr]">
        <div className="card h-72 animate-pulse bg-slate-100 dark:bg-slate-800" />
        <div className="card h-72 animate-pulse bg-slate-100 dark:bg-slate-800" />
      </div>
    </div>
  );
}

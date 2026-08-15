export default function Loading() {
    return (
        <div className="p-6">
            <div className="mb-8">
                <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg mb-2 animate-pulse" />
                <div className="h-4 w-96 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
            </div>

            {/* Statistics skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                {Array(5)
                    .fill(0)
                    .map((_, i) => (
                        <div key={i} className="card h-24 bg-slate-200 dark:bg-slate-700 animate-pulse" />
                    ))}
            </div>

            {/* Search and buttons skeleton */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex-1 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
            </div>

            {/* Filters skeleton */}
            <div className="flex flex-wrap gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
                {Array(8)
                    .fill(0)
                    .map((_, i) => (
                        <div key={i} className="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                    ))}
            </div>

            {/* Cards skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array(6)
                    .fill(0)
                    .map((_, i) => (
                        <div key={i} className="card h-64 bg-slate-200 dark:bg-slate-700 animate-pulse" />
                    ))}
            </div>
        </div>
    );
}

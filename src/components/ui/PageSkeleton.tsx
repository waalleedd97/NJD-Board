/** Reusable loading skeleton for pages while data loads from Supabase */
export function PageSkeleton({ variant = 'default' }: { variant?: 'default' | 'board' | 'grid' }) {
  const bar = 'bg-gray-200/60 dark:bg-white/5 animate-pulse rounded-[20px]';

  if (variant === 'board') {
    return (
      <div className="p-6 space-y-6">
        <div className={`${bar} h-8 w-72`} />
        <div className={`${bar} h-12 w-full`} />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => (
            <div key={i} className="space-y-3">
              <div className={`${bar} h-10`} />
              <div className={`${bar} h-40`} />
              <div className={`${bar} h-40`} />
              <div className={`${bar} h-28`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1,2,3].map((i) => <div key={i} className={`${bar} h-20`} />)}
        </div>
        <div className={`${bar} h-12 w-full`} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map((i) => <div key={i} className={`${bar} h-48`} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1,2,3].map((i) => <div key={i} className={`${bar} h-20`} />)}
      </div>
      <div className={`${bar} h-12 w-full`} />
      <div className="space-y-4">
        {[1,2,3,4].map((i) => <div key={i} className={`${bar} h-32`} />)}
      </div>
    </div>
  );
}

export default function MainLoading() {
  return (
    <div className="min-h-screen bg-[#1d2429]">
      {/* Hero Banner Skeleton */}
      <div className="relative h-screen animate-pulse">
        <div className="absolute inset-0 bg-gray-800/50" />
        <div className="relative flex h-full items-center justify-center px-4 md:px-6">
          <div className="mx-auto w-full max-w-[1440px]">
            <div className="mx-auto flex max-w-4xl flex-col items-center gap-4">
              <div className="h-8 w-64 rounded bg-gray-700 md:h-12 md:w-96" />
              <div className="h-5 w-48 rounded bg-gray-700/60 md:h-6 md:w-72" />
              <div className="mt-2 h-10 w-32 rounded bg-gray-700/40 md:h-12 md:w-40" />
            </div>
          </div>
        </div>
      </div>

      {/* NEW ARRIVALS Skeleton */}
      <div className="py-6 md:py-12">
        <div className="mx-auto max-w-[1440px] px-4 lg:px-10">
          <div className="mb-4 md:mb-8">
            <div className="mb-2 h-6 w-40 animate-pulse rounded bg-gray-700" />
            <div className="h-4 w-56 animate-pulse rounded bg-gray-700/60" />
          </div>
          <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4 lg:gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="mb-2 aspect-square bg-gray-700/40" />
                <div className="mb-1 h-3 w-16 rounded bg-gray-700/40" />
                <div className="mb-1 h-4 w-full rounded bg-gray-700/50" />
                <div className="h-3 w-20 rounded bg-gray-700/30" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

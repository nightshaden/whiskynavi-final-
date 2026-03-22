export default function BottleListSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4 lg:gap-8">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="animate-pulse border-b border-white/10 pb-2">
          <div className="mb-2 aspect-square bg-white/5" />
          <div className="space-y-2">
            <div className="h-3 w-16 rounded bg-white/10" />
            <div className="h-4 w-3/4 rounded bg-white/10" />
            <div className="flex justify-between">
              <div className="h-3 w-20 rounded bg-white/5" />
              <div className="h-3 w-10 rounded bg-white/5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

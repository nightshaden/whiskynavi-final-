import { Skeleton } from "@/components/ui/skeleton";

export default function MyPageLoading() {
  return (
    <div className="min-h-screen bg-[#1d2429] px-4 py-8 sm:px-6 md:py-12 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        {/* Header */}
        <div className="mb-3 md:mb-8">
          <Skeleton className="h-10 w-40 bg-white/10" />
        </div>

        {/* User Info Card */}
        <div className="mb-6 border border-white/10 bg-white/5 p-4 md:mb-8 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48 bg-white/10" />
              <Skeleton className="h-4 w-32 bg-white/10" />
              <Skeleton className="h-4 w-52 bg-white/10" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16 bg-white/10" />
              <Skeleton className="h-8 w-16 bg-white/10" />
              <Skeleton className="h-8 w-24 bg-white/10" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border border-white/10 bg-white/5 md:mb-8">
          <div className="flex border-b border-white/10">
            <Skeleton className="h-12 flex-1 bg-white/10" />
            <Skeleton className="h-12 flex-1 bg-white/10" />
          </div>
          <div className="space-y-4 p-4 md:p-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full bg-white/10" />
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="border border-white/10 bg-white/5 p-4 md:p-8">
          <Skeleton className="mb-4 h-8 w-40 bg-white/10" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full bg-white/10" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

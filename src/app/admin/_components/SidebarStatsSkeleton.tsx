import { Skeleton } from "@/components/ui/skeleton";

export default function SidebarStatsSkeleton() {
  return (
    <div className="mt-6 border-t border-gray-200 p-6">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">빠른 통계</h3>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="mb-1 h-3 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

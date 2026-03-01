import { Skeleton } from "@/components/ui/skeleton";

export default function SidebarStatsSkeleton() {
  return (
    <div className="p-6 mt-6 border-t border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">빠른 통계</h3>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-3 w-16 mb-1" />
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Dialog defaultOpen>
      <DialogContent
        className="max-h-[90vh] max-w-[95vw] overflow-y-auto border-white/10 bg-[#1d2429] p-4 sm:max-w-3xl sm:p-6 [&_[data-slot=dialog-close]]:text-white"
        showCloseButton
      >
        <DialogTitle>
          <Skeleton className="h-7 w-48 bg-white/10" />
        </DialogTitle>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Image skeleton */}
          <Skeleton className="aspect-square w-full bg-white/10" />

          {/* Info skeleton */}
          <div className="space-y-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className={`flex items-center justify-between pb-2 ${
                  i < 8 ? "border-b border-white/10" : ""
                }`}
              >
                <Skeleton className="h-4 w-16 bg-white/10" />
                <Skeleton className="h-4 w-24 bg-white/10" />
              </div>
            ))}
          </div>
        </div>

        {/* Tasting note skeleton */}
        <div className="mt-4">
          <Skeleton className="mb-3 h-5 w-28 bg-white/10" />
          <div className="border border-white/10 p-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full bg-white/10" />
              <Skeleton className="h-4 w-full bg-white/10" />
              <Skeleton className="h-4 w-3/4 bg-white/10" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

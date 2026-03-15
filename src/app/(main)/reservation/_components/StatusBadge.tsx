import type { NoticeStatus } from "../_lib/utils";
import { getStatusBadge } from "../_lib/utils";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: NoticeStatus;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const badge = getStatusBadge(status);
  return (
    <div
      className={cn(
        "px-2 py-1 text-xs font-bold text-white lg:px-4 lg:py-2 lg:text-sm",
        badge.className,
        className,
      )}
    >
      {badge.label}
    </div>
  );
}

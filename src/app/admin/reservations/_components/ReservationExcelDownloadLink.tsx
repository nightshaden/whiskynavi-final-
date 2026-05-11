import { Download } from "lucide-react";

interface ReservationExcelDownloadLinkProps {
  noticeId: number;
  compact?: boolean;
}

export function getReservationExcelDownloadHref(noticeId: number): string {
  return `/api/admin/reservations/${noticeId}/excel`;
}

export default function ReservationExcelDownloadLink({ noticeId, compact = false }: ReservationExcelDownloadLinkProps) {
  const href = getReservationExcelDownloadHref(noticeId);

  if (compact) {
    return (
      <a
        href={href}
        className="cursor-pointer rounded-md p-1.5 text-gray-500 transition-colors hover:bg-green-50 hover:text-green-600"
        title="엑셀 다운로드"
        aria-label="엑셀 다운로드"
      >
        <Download size={16} />
      </a>
    );
  }

  return (
    <a
      href={href}
      className="typo-medium-14 flex cursor-pointer items-center gap-1.5 rounded-lg border border-green-200 bg-white px-4 py-2 text-green-700 transition-colors hover:bg-green-50"
    >
      <Download size={16} />
      엑셀 다운로드
    </a>
  );
}

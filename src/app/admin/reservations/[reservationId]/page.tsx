"use client";

import { use, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import AdminHeader from "../../_components/AdminHeader";
import { useSidebar } from "../../_components/AdminLayoutClient";
import { generateReservations, type Reservation } from "../../_data/mockData";
import AdminPageDetailSection from "../../components/AdminPageDetailSection";

interface ReservationDetailPageProps {
  params: Promise<{ reservationId: string }>;
}

export default function ReservationDetailPage({
  params,
}: ReservationDetailPageProps) {
  const { reservationId } = use(params);
  const { toggle } = useSidebar();
  const router = useRouter();

  const reservations = useMemo(() => generateReservations(), []);

  const reservation = reservations.find((r) => r.id === Number(reservationId));

  // 날짜 형식 변환 함수
  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return "";
    // "2026.01.10" 형식을 "2026-01-10T00:00" 형식으로 변환
    const parts = dateStr.split(".");
    if (parts.length === 3) {
      return `${parts[0]}-${parts[1]}-${parts[2]}T00:00`;
    }
    return dateStr;
  };

  // 예약 상세 정보에 필요한 데이터 구조로 변환
  const initialReservationDetails = reservation
    ? {
        ...reservation,
        noticeDate: formatDateForInput(reservation.noticeDate),
        deadline: formatDateForInput(reservation.deadline),
        applicants: reservation.applicants.map((a) => ({
          ...a,
          requestedBottles: a.requestedBottles || a.quantity,
          approvedBottles: a.approvedBottles || a.confirmedQuantity,
          appliedAt: a.appliedAt || a.createdAt,
        })),
      }
    : null;

  const [reservationDetails, setReservationDetails] = useState<any>(
    initialReservationDetails,
  );
  const [isEditMode, setIsEditMode] = useState(false);

  if (!reservation || !reservationDetails) {
    return (
      <>
        <AdminHeader
          title="예약 상세"
          onToggleSidebar={toggle}
          showSearch={false}
        />
        <div className="p-8">
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-gray-500">예약을 찾을 수 없습니다.</p>
            <button
              onClick={() => router.push("/admin/reservations")}
              className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader
        title="예약 상세"
        onToggleSidebar={toggle}
        showSearch={false}
      />

      <div className="p-8">
        <button
          onClick={() => router.push("/admin/reservations")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          예약 목록으로 돌아가기
        </button>

        <AdminPageDetailSection
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
          reservationDetails={reservationDetails}
          setReservationDetails={setReservationDetails}
          formatDateForInput={(dateStr: string) => dateStr}
        />
      </div>
    </>
  );
}

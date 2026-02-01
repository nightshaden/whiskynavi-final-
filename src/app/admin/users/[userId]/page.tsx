"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useMemo, useState } from "react";
import AdminHeader from "../../_components/AdminHeader";
import { useSidebar } from "../../_components/AdminLayoutClient";
import {
  generateReservations,
  generateUsers,
  type User,
} from "../../_data/mockData";
import AdminUserDetailSection from "../../components/AdminUserDetailSection";

interface UserDetailPageProps {
  params: Promise<{ userId: string }>;
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const { userId } = use(params);
  const { toggle } = useSidebar();
  const router = useRouter();

  const users = useMemo(() => generateUsers(), []);
  const reservations = useMemo(() => generateReservations(), []);

  const user = users.find((u) => u.id === Number(userId));
  const [userDetails, setUserDetails] = useState<User | null>(user || null);
  const [isEditMode, setIsEditMode] = useState(false);

  if (!user || !userDetails) {
    return (
      <>
        <AdminHeader
          title="회원 상세"
          onToggleSidebar={toggle}
          showSearch={false}
        />
        <div className="p-8">
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-gray-500">회원을 찾을 수 없습니다.</p>
            <button
              type="button"
              onClick={() => router.push("/admin/users")}
              className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 cursor-pointer"
            >
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </>
    );
  }

  const handleSave = () => {
    // TODO: API 호출
    setIsEditMode(false);
  };

  const handleCancel = () => {
    setUserDetails(user);
    setIsEditMode(false);
  };

  return (
    <>
      <AdminHeader
        title="회원 상세"
        onToggleSidebar={toggle}
        showSearch={false}
      />

      <div className="p-8">
        <button
          type="button"
          onClick={() => router.push("/admin/users")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 cursor-pointer"
        >
          <ArrowLeft size={20} />
          회원 목록으로 돌아가기
        </button>

        {userDetails && (
          <AdminUserDetailSection
            isEditMode={isEditMode}
            setIsEditMode={setIsEditMode}
            userDetails={userDetails}
            setUserDetails={setUserDetails}
            allReservations={reservations}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}
      </div>
    </>
  );
}

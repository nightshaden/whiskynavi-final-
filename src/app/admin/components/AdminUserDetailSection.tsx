"use client";
import {
  Mail,
  Phone,
  Calendar,
  User,
  Shield,
  CheckCircle,
  XCircle,
  Ban,
  Search,
  Eye,
  X,
  Plus,
  Edit2,
  AlertTriangle,
} from "lucide-react";
import { useState } from "react";

interface UserDetailProps {
  isEditMode: boolean;
  setIsEditMode: (value: boolean) => void;
  userDetails: any;
  setUserDetails: (details: any) => void;
  allReservations?: any[];
  onSave: () => void;
  onCancel: () => void;
}

export default function AdminUserDetailSection({
  isEditMode,
  setIsEditMode,
  userDetails,
  setUserDetails,
  allReservations = [],
  onSave,
  onCancel,
}: UserDetailProps) {
  if (!userDetails) return null;

  const [showReservationModal, setShowReservationModal] = useState(false);
  const [reservationSearchQuery, setReservationSearchQuery] = useState("");
  const [isEditingRoles, setIsEditingRoles] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [showAdminConfirm, setShowAdminConfirm] = useState(false);
  const [showConflictWarning, setShowConflictWarning] = useState(false);
  const [conflictMessage, setConflictMessage] = useState("");
  const [pendingRole, setPendingRole] = useState("");

  // 사용자의 예약 내역 필터링
  const userReservations = allReservations.filter(
    (res: any) =>
      res.applicants?.some((app: any) => app.userId === userDetails.id) ||
      res.userId === userDetails.id,
  );

  // 검색된 예약 내역
  const filteredReservations = userReservations.filter((res: any) => {
    const searchLower = reservationSearchQuery.toLowerCase();
    return (
      res.productName?.toLowerCase().includes(searchLower) ||
      res.brand?.toLowerCase().includes(searchLower) ||
      res.status?.toLowerCase().includes(searchLower)
    );
  });

  // 권한 충돌 체크 함수
  const checkRoleConflict = (roleToAdd: string) => {
    const naviRoles = ["ROLE_NAVI_VIP", "ROLE_NAVI_GOLD", "ROLE_NAVI_SILVER"];
    const talesRoles = [
      "ROLE_TALES_VIP",
      "ROLE_TALES_GOLD",
      "ROLE_TALES_SILVER",
    ];

    let conflictingRole = null;
    let brandName = "";

    if (naviRoles.includes(roleToAdd)) {
      conflictingRole = userDetails.roles.find(
        (role: string) => naviRoles.includes(role) && role !== roleToAdd,
      );
      brandName = "위스키내비";
    } else if (talesRoles.includes(roleToAdd)) {
      conflictingRole = userDetails.roles.find(
        (role: string) => talesRoles.includes(role) && role !== roleToAdd,
      );
      brandName = "더 위스키테일즈";
    }

    if (conflictingRole) {
      const conflictingRoleName = getRoleName(conflictingRole);
      const newRoleName = getRoleName(roleToAdd);
      return {
        hasConflict: true,
        message: `이미 ${brandName} ${conflictingRoleName.split(" ")[1]} 권한이 있습니다. ${newRoleName.split(" ")[1]} 권한으로 교체하시겠습니까?`,
        conflictingRole,
      };
    }

    return { hasConflict: false, message: "", conflictingRole: null };
  };

  // 권한 추가 핸들러
  const handleAddRole = () => {
    if (!newRole) return;

    // 이미 같은 권한이 있는지 체크
    if (userDetails.roles.includes(newRole)) {
      alert("이미 보유한 권한입니다.");
      return;
    }

    // 관리자 권한인 경우 확인 모달 표시
    if (newRole === "ROLE_ADMIN") {
      setPendingRole(newRole);
      setShowAdminConfirm(true);
      return;
    }

    // 권한 충돌 체크
    const conflict = checkRoleConflict(newRole);
    if (conflict.hasConflict) {
      setPendingRole(newRole);
      setConflictMessage(conflict.message);
      setShowConflictWarning(true);
      return;
    }

    // 충돌 없으면 바로 추가
    setUserDetails({ ...userDetails, roles: [...userDetails.roles, newRole] });
    setNewRole("");
  };

  // 관리자 권한 확정
  const confirmAdminRole = () => {
    setUserDetails({
      ...userDetails,
      roles: [...userDetails.roles, pendingRole],
    });
    setShowAdminConfirm(false);
    setPendingRole("");
    setNewRole("");
  };

  // 권한 교체 확정
  const confirmRoleReplace = () => {
    const conflict = checkRoleConflict(pendingRole);
    if (conflict.conflictingRole) {
      // 기존 권한 제거하고 새 권한 추가
      const updatedRoles = userDetails.roles.filter(
        (role: string) => role !== conflict.conflictingRole,
      );
      setUserDetails({ ...userDetails, roles: [...updatedRoles, pendingRole] });
    }
    setShowConflictWarning(false);
    setPendingRole("");
    setNewRole("");
  };

  const getRoleName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      ROLE_ADMIN: "관리자",
      ROLE_USER: "일반 회원",
      ROLE_NAVI_VIP: "위스키내비 VIP",
      ROLE_NAVI_GOLD: "위스키내비 GOLD",
      ROLE_NAVI_SILVER: "위스키내비 SILVER",
      ROLE_TALES_VIP: "더 위스키테일즈 VIP",
      ROLE_TALES_GOLD: "더 위스키테일즈 GOLD",
      ROLE_TALES_SILVER: "더 위스키테일즈 SILVER",
    };
    return roleMap[role] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    if (role.includes("ADMIN")) return "bg-red-100 text-red-700";
    if (role.includes("VIP")) return "bg-orange-100 text-orange-700";
    if (role.includes("GOLD")) return "bg-yellow-100 text-yellow-700";
    if (role.includes("SILVER")) return "bg-gray-200 text-gray-700";
    return "bg-blue-100 text-blue-700";
  };

  return (
    <div className="space-y-6">
      {/* 기본 정보 섹션 */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <User size={20} className="text-amber-600" />
            기본 정보
          </h3>
          <div className="flex gap-2">
            {isEditMode ? (
              <>
                <button
                  onClick={onSave}
                  className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors font-semibold"
                >
                  저장
                </button>
                <button
                  onClick={onCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  취소
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditMode(true)}
                className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors font-semibold flex items-center gap-1"
              >
                <Edit2 size={14} />
                수정
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              이름
            </label>
            <p className="text-gray-900">{userDetails.name}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              사용자명
            </label>
            {isEditMode ? (
              <input
                type="text"
                value={userDetails.username}
                onChange={(e) =>
                  setUserDetails({ ...userDetails, username: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="부적절한 사용자명 수정 가능"
              />
            ) : (
              <p className="text-gray-900">@{userDetails.username}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
              <Mail size={14} />
              이메일
            </label>
            <p className="text-gray-900">{userDetails.email}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
              <Phone size={14} />
              전화번호
            </label>
            <p className="text-gray-900">{userDetails.phone}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              회원 유형
            </label>
            {isEditMode ? (
              <select
                value={userDetails.memberType}
                onChange={(e) =>
                  setUserDetails({ ...userDetails, memberType: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="일반">일반</option>
                <option value="업장">업장</option>
              </select>
            ) : (
              <span
                className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                  userDetails.memberType === "업장"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {userDetails.memberType}
              </span>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              계정 상태
            </label>
            {isEditMode ? (
              <select
                value={userDetails.status}
                onChange={(e) =>
                  setUserDetails({ ...userDetails, status: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="ACTIVE">활성</option>
                <option value="INACTIVE">비활성</option>
              </select>
            ) : (
              <span
                className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                  userDetails.status === "ACTIVE"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {userDetails.status === "ACTIVE" ? "활성" : "비활성"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 활동 정보 섹션 */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-amber-600" />
          활동 정보
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              가입일
            </label>
            <p className="text-gray-900">{userDetails.joinDate}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              마지막 로그인
            </label>
            <p className="text-gray-900">{userDetails.lastLoginAt}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              총 예약 수
            </label>
            <div className="flex items-center gap-3">
              <p className="text-gray-900 text-2xl font-bold">
                {userReservations.length}건
              </p>
              <button
                onClick={() => setShowReservationModal(true)}
                className="text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center gap-1"
              >
                <Eye size={16} />
                자세히보기
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              총 구매 금액
            </label>
            <p className="text-gray-900 text-2xl font-bold">
              {userDetails.totalSpent.toLocaleString()}원
            </p>
          </div>
        </div>

        {/* 소셜 로그인 연동 정보 */}
        {(userDetails.socialConnections?.google ||
          userDetails.socialConnections?.kakao ||
          userDetails.socialConnections?.naver) && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              소셜 로그인 연동
            </label>
            <div className="flex gap-2">
              {userDetails.socialConnections?.google && (
                <div className="px-3 py-2 bg-white border-2 border-red-200 rounded-lg flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">
                    Google
                  </span>
                </div>
              )}
              {userDetails.socialConnections?.kakao && (
                <div className="px-3 py-2 bg-[#FEE500] rounded-lg flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#000000"
                      d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7-.2.8-.7 2.8-.8 3.2-.1.5.2.5.4.4.3-.1 3.1-2.1 3.6-2.5.7.1 1.4.2 2.1.2 5.5 0 10-3.6 10-8S17.5 3 12 3z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-900">
                    Kakao
                  </span>
                </div>
              )}
              {userDetails.socialConnections?.naver && (
                <div className="px-3 py-2 bg-[#03C75A] rounded-lg flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#FFFFFF"
                      d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-white">Naver</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 권한 및 멤버십 섹션 */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Shield size={20} className="text-amber-600" />
            권한 및 멤버십
          </h3>
          {!isEditingRoles ? (
            <button
              onClick={() => setIsEditingRoles(true)}
              className="px-3 py-1.5 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors font-medium flex items-center gap-1"
            >
              <Edit2 size={14} />
              권한 수정
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsEditingRoles(false);
                  setNewRole("");
                }}
                className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                완료
              </button>
            </div>
          )}
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              보유 권한
            </label>
            <div className="flex flex-wrap gap-2">
              {userDetails.roles &&
                userDetails.roles.map((role: string, index: number) => (
                  <span
                    key={index}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 ${getRoleBadgeColor(role)}`}
                  >
                    {getRoleName(role)}
                    {isEditingRoles && (
                      <button
                        onClick={() => {
                          const updatedRoles = userDetails.roles.filter(
                            (_: string, i: number) => i !== index,
                          );
                          setUserDetails({
                            ...userDetails,
                            roles: updatedRoles,
                          });
                        }}
                        className="hover:opacity-70"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </span>
                ))}
            </div>
            {isEditingRoles && (
              <div className="mt-3 flex gap-2">
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                >
                  <option value="">권한 선택</option>
                  <option value="ROLE_ADMIN">관리자</option>
                  <option value="ROLE_USER">일반 회원</option>
                  <option value="ROLE_NAVI_VIP">위스키내비 VIP</option>
                  <option value="ROLE_NAVI_GOLD">위스키내비 GOLD</option>
                  <option value="ROLE_NAVI_SILVER">위스키내비 SILVER</option>
                  <option value="ROLE_TALES_VIP">더 위스키테일즈 VIP</option>
                  <option value="ROLE_TALES_GOLD">더 위스키테일즈 GOLD</option>
                  <option value="ROLE_TALES_SILVER">
                    더 위스키테일즈 SILVER
                  </option>
                </select>
                <button
                  onClick={handleAddRole}
                  disabled={!newRole}
                  className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <Plus size={14} />
                  추가
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 예약 내역 모달 */}
      {showReservationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-900">예약 내역</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {userDetails.name} ({userDetails.username}) - 총{" "}
                  {userReservations.length}건
                </p>
              </div>
              <button
                onClick={() => {
                  setShowReservationModal(false);
                  setReservationSearchQuery("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* 검색 바 */}
            <div className="p-6 border-b border-gray-200">
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="제품명, 브랜드, 상태로 검색..."
                  value={reservationSearchQuery}
                  onChange={(e) => setReservationSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* 예약 목록 */}
            <div className="flex-1 overflow-y-auto p-6">
              {filteredReservations.length > 0 ? (
                <div className="space-y-3">
                  {filteredReservations.map((reservation: any) => {
                    // 해당 회원의 신청 정보 찾기
                    const userApplication = reservation.applicants?.find(
                      (app: any) => app.userId === userDetails.id,
                    );

                    return (
                      <div
                        key={reservation.id}
                        className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-bold text-gray-900">
                                {reservation.productName}
                              </h4>
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  reservation.brand === "위스키내비"
                                    ? "bg-amber-100 text-amber-700"
                                    : reservation.brand === "더 위스키테일즈"
                                      ? "bg-blue-100 text-blue-700"
                                      : reservation.brand === "트레일 앤 테일"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-purple-100 text-purple-700"
                                }`}
                              >
                                {reservation.brand}
                              </span>
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  reservation.status === "예약진행중"
                                    ? "bg-blue-100 text-blue-700"
                                    : reservation.status === "예약마감"
                                      ? "bg-gray-200 text-gray-700"
                                      : reservation.status === "통관중"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : reservation.status === "배송중"
                                          ? "bg-orange-100 text-orange-700"
                                          : "bg-green-100 text-green-700"
                                }`}
                              >
                                {reservation.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                              <p className="text-gray-600">
                                예약기간:{" "}
                                <span className="text-gray-900 font-medium">
                                  {reservation.startDate} ~{" "}
                                  {reservation.endDate}
                                </span>
                              </p>
                              {userApplication && (
                                <>
                                  <p className="text-gray-600">
                                    신청:{" "}
                                    <span className="text-gray-900 font-bold">
                                      {userApplication.quantity}병
                                    </span>
                                  </p>
                                  <p className="text-gray-600">
                                    배정:{" "}
                                    <span className="text-amber-700 font-bold">
                                      {userApplication.confirmedQuantity}병
                                    </span>
                                  </p>
                                  <p className="text-gray-600">
                                    신청일:{" "}
                                    <span className="text-gray-900 font-medium">
                                      {new Date(userApplication.createdAt)
                                        .toLocaleDateString("ko-KR", {
                                          year: "numeric",
                                          month: "2-digit",
                                          day: "2-digit",
                                        })
                                        .replace(/\. /g, ".")
                                        .replace(/\.$/, "")}
                                    </span>
                                  </p>
                                  <p className="text-gray-600">
                                    상태:{" "}
                                    <span
                                      className={`font-medium ${
                                        userApplication.status === "CONFIRMED"
                                          ? "text-green-700"
                                          : userApplication.status === "APPLIED"
                                            ? "text-blue-700"
                                            : "text-red-700"
                                      }`}
                                    >
                                      {userApplication.status === "CONFIRMED"
                                        ? "승인"
                                        : userApplication.status === "APPLIED"
                                          ? "신청"
                                          : "거절"}
                                    </span>
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  {reservationSearchQuery
                    ? "검색 결과가 없습니다."
                    : "예약 내역이 없습니다."}
                </div>
              )}
            </div>

            {/* 모달 푸터 */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowReservationModal(false);
                  setReservationSearchQuery("");
                }}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 약관 동의 정보 섹션 */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle size={20} className="text-amber-600" />
          약관 동의 정보
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700">개인정보 처리방침</span>
            {userDetails.userExt?.privacyAgree ? (
              <CheckCircle size={20} className="text-green-600" />
            ) : (
              <XCircle size={20} className="text-red-600" />
            )}
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700">마케팅 수신 동의</span>
            {userDetails.userExt?.marketingAgree ? (
              <CheckCircle size={20} className="text-green-600" />
            ) : (
              <XCircle size={20} className="text-red-600" />
            )}
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700">이메일 수신 동의</span>
            {userDetails.userExt?.emailAgree ? (
              <CheckCircle size={20} className="text-green-600" />
            ) : (
              <XCircle size={20} className="text-red-600" />
            )}
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700">SMS 수신 동의</span>
            {userDetails.userExt?.smsAgree ? (
              <CheckCircle size={20} className="text-green-600" />
            ) : (
              <XCircle size={20} className="text-red-600" />
            )}
          </div>
        </div>
      </div>

      {/* 제재 정보 섹션 */}
      {userDetails.userExt?.isBanned && (
        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
            <Ban size={20} className="text-red-600" />
            제재 정보
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-red-700 mb-1">
                제재 사유
              </label>
              <p className="text-red-900">{userDetails.userExt.banReason}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-red-700 mb-1">
                  제재 시작일
                </label>
                <p className="text-red-900">
                  {userDetails.userExt.banStartDate}
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-red-700 mb-1">
                  제재 종료일
                </label>
                <p className="text-red-900">{userDetails.userExt.banEndDate}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 관리자 권한 확인 모달 */}
      {showAdminConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md overflow-hidden flex flex-col">
            {/* 모달 헤더 */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle size={24} className="text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  관리자 권한 추가
                </h3>
              </div>
              <p className="text-gray-700">
                <span className="font-bold text-gray-900">
                  {userDetails.name}({userDetails.username})
                </span>{" "}
                회원을
                <br />
                정말로 <span className="font-bold text-red-600">관리자</span>로
                등록하시겠습니까?
              </p>
              <p className="text-sm text-red-600 mt-2">
                ⚠️ 관리자는 모든 회원 정보와 시스템을 관리할 수 있습니다.
              </p>
            </div>

            {/* 모달 푸터 */}
            <div className="p-6 bg-gray-50 flex gap-2">
              <button
                onClick={confirmAdminRole}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                확인
              </button>
              <button
                onClick={() => {
                  setShowAdminConfirm(false);
                  setPendingRole("");
                  setNewRole("");
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 권한 충돌 경고 모달 */}
      {showConflictWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md overflow-hidden flex flex-col">
            {/* 모달 헤더 */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <AlertTriangle size={24} className="text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  권한 교체 확인
                </h3>
              </div>
              <p className="text-gray-700">{conflictMessage}</p>
            </div>

            {/* 모달 푸터 */}
            <div className="p-6 bg-gray-50 flex gap-2">
              <button
                onClick={confirmRoleReplace}
                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold"
              >
                교체
              </button>
              <button
                onClick={() => {
                  setShowConflictWarning(false);
                  setPendingRole("");
                  setNewRole("");
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

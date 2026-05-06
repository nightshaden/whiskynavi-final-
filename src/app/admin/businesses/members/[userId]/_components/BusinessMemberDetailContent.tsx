"use client";

import type {
  AdminBusinessUserDetailResponse,
  PatchApiAdminBusinessesMembersUseridBusinessBodyBusinessType,
} from "@/apis/generated/api";
import { Badge } from "@/components/ui/badge";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AdminHeader from "../../../../_components/AdminHeader";
import { useSidebar } from "../../../../_components/AdminLayoutClient";
import {
  grantBusinessRoleAction,
  revokeBusinessRoleAction,
  updateBusinessAction,
  type BusinessMemberRole,
} from "../actions";

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date
    .toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\. /g, ".")
    .replace(/\.$/, "");
};

const BUSINESS_TYPE_LABEL: Record<string, string> = {
  HOUSEHOLD: "가정용",
  ENTERTAINMENT: "유흥용",
};

const FALLBACK_SAVE_ERROR_MESSAGE = "사업자 정보 수정에 실패했습니다.";
const FALLBACK_ROLE_ERROR_MESSAGE = "사업자 권한 변경에 실패했습니다.";

const BUSINESS_ROLE_CONFIGS = [
  {
    role: "ROLE_BUSINESS",
    label: "사업자 권한",
    roleKey: "hasBusinessRole",
    badgeClassName: "bg-purple-100 text-purple-700",
  },
  {
    role: "ROLE_TRAILNTALE_BUSINESS",
    label: "트레일앤테일",
    roleKey: "hasTrailntaleBusinessRole",
    badgeClassName: "bg-blue-100 text-blue-700",
  },
  {
    role: "ROLE_COMMUNITY_BUSINESS",
    label: "커뮤니티",
    roleKey: "hasCommunityBusinessRole",
    badgeClassName: "bg-emerald-100 text-emerald-700",
  },
  {
    role: "ROLE_PICK_UP_BUSINESS",
    label: "픽업",
    roleKey: "hasPickupRole",
    badgeClassName: "bg-amber-100 text-amber-700",
  },
] as const satisfies readonly {
  role: BusinessMemberRole;
  label: string;
  roleKey: string;
  badgeClassName: string;
}[];

const isBusinessType = (value: string): value is PatchApiAdminBusinessesMembersUseridBusinessBodyBusinessType =>
  value === "HOUSEHOLD" || value === "ENTERTAINMENT";

type BusinessEditForm = {
  businessName: string;
  businessRegistrationNumber: string;
  businessType: PatchApiAdminBusinessesMembersUseridBusinessBodyBusinessType;
  contact: string;
  pickupAddress: string;
};

const formatBusinessType = (member: AdminBusinessUserDetailResponse & { businessType?: string }): string => {
  const businessType = member.businessType;
  if (!businessType) return "-";
  return BUSINESS_TYPE_LABEL[businessType] ?? businessType;
};

const hasRole = (member: AdminBusinessUserDetailResponse, roleKey: string, role: BusinessMemberRole) => {
  const value = (member as Record<string, unknown>)[roleKey];
  return typeof value === "boolean" ? value : (member.roles?.includes(role) ?? false);
};

const createInitialForm = (member: AdminBusinessUserDetailResponse): BusinessEditForm => ({
  businessName: member.businessName ?? "",
  businessRegistrationNumber: member.businessRegistrationNumber ?? "",
  businessType: member.businessType ?? "HOUSEHOLD",
  contact: member.contact ?? "",
  pickupAddress: member.pickupAddress ?? "",
});

interface BusinessMemberDetailContentProps {
  member: AdminBusinessUserDetailResponse;
}

export default function BusinessMemberDetailContent({ member }: BusinessMemberDetailContentProps) {
  const router = useRouter();
  const { toggle } = useSidebar();
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    variant: "error" | "success";
  } | null>(null);
  const [pendingRoleAction, setPendingRoleAction] = useState<string | null>(null);
  const [form, setForm] = useState<BusinessEditForm>(() => createInitialForm(member));

  const handleEditStart = () => {
    setForm(createInitialForm(member));
    setMessage(null);
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setForm(createInitialForm(member));
    setMessage(null);
    setIsEditing(false);
  };

  const handleChange = (field: Exclude<keyof BusinessEditForm, "businessType">, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setMessage(null);
  };

  const handleBusinessTypeChange = (value: PatchApiAdminBusinessesMembersUseridBusinessBodyBusinessType) => {
    setForm((current) => ({
      ...current,
      businessType: value,
    }));
    setMessage(null);
  };

  const handleSave = async () => {
    setIsPending(true);
    setMessage(null);

    try {
      const result = await updateBusinessAction(member.userId!, {
        businessName: form.businessName,
        businessRegistrationNumber: form.businessRegistrationNumber,
        businessType: form.businessType,
        contact: form.contact,
        pickupAddress: form.pickupAddress,
      });

      if (result.success) {
        setMessage({
          text: "사업자 정보가 수정되었습니다.",
          variant: "success",
        });
        setIsEditing(false);
        router.refresh();
        return;
      }

      setMessage({
        text: result.error ?? FALLBACK_SAVE_ERROR_MESSAGE,
        variant: "error",
      });
    } catch {
      setMessage({
        text: FALLBACK_SAVE_ERROR_MESSAGE,
        variant: "error",
      });
    } finally {
      setIsPending(false);
    }
  };

  const handleRoleAction = async (mode: "grant" | "revoke", role: BusinessMemberRole, label: string) => {
    setPendingRoleAction(`${mode}:${role}`);
    setMessage(null);

    try {
      const result =
        mode === "grant"
          ? await grantBusinessRoleAction(member.userId!, role)
          : await revokeBusinessRoleAction(member.userId!, role);

      if (result.success) {
        setMessage({
          text: `${label}을 ${mode === "grant" ? "부여" : "회수"}했습니다.`,
          variant: "success",
        });
        router.refresh();
        return;
      }

      setMessage({
        text: result.error ?? FALLBACK_ROLE_ERROR_MESSAGE,
        variant: "error",
      });
    } catch {
      setMessage({
        text: FALLBACK_ROLE_ERROR_MESSAGE,
        variant: "error",
      });
    } finally {
      setPendingRoleAction(null);
    }
  };

  return (
    <>
      <AdminHeader title="사업자 멤버 상세" onToggleSidebar={toggle} showSearch={false} />

      <div className="p-8">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/admin/businesses/members")}
            className="flex cursor-pointer items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            멤버 목록으로 돌아가기
          </button>
        </div>

        <FormMessage message={message?.text} variant={message?.variant} className="mb-4" />

        <div className="space-y-4">
          {/* 멤버 정보 */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h3 className="font-bold text-gray-900">멤버 정보</h3>
            </div>
            <div className="grid grid-cols-2 gap-6 p-6 md:grid-cols-3">
              <div>
                <p className="text-xs text-gray-500">User ID</p>
                <p className="text-sm font-medium text-gray-900">{member.userId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">이름</p>
                <p className="text-sm font-medium text-gray-900">{member.name ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">이메일</p>
                <p className="text-sm font-medium text-gray-900">{member.username ?? "-"}</p>
              </div>
            </div>
          </div>

          {/* 사업자 정보 */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">사업자 정보</h3>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={isPending}
                        className="typo-medium-14 flex cursor-pointer items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        저장
                      </button>
                      <button
                        type="button"
                        onClick={handleEditCancel}
                        disabled={isPending}
                        className="typo-medium-14 flex cursor-pointer items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        취소
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleEditStart}
                      className="typo-medium-14 flex cursor-pointer items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      수정
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 p-6 md:grid-cols-3">
              <div>
                <Label htmlFor="businessName" className="mb-1 text-xs text-gray-500">
                  업체명
                </Label>
                {isEditing ? (
                  <Input
                    id="businessName"
                    value={form.businessName}
                    onChange={(event) => handleChange("businessName", event.target.value)}
                    disabled={isPending}
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-900">{member.businessName ?? "-"}</p>
                )}
              </div>
              <div>
                <Label htmlFor="businessRegistrationNumber" className="mb-1 text-xs text-gray-500">
                  사업자등록번호
                </Label>
                {isEditing ? (
                  <Input
                    id="businessRegistrationNumber"
                    value={form.businessRegistrationNumber}
                    onChange={(event) => handleChange("businessRegistrationNumber", event.target.value)}
                    disabled={isPending}
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-900">{member.businessRegistrationNumber ?? "-"}</p>
                )}
              </div>
              <div>
                <Label htmlFor="businessType" className="mb-1 text-xs text-gray-500">
                  사업자 구분
                </Label>
                {isEditing ? (
                  <select
                    id="businessType"
                    value={form.businessType}
                    onChange={(event) => {
                      if (isBusinessType(event.target.value)) {
                        handleBusinessTypeChange(event.target.value);
                      }
                    }}
                    disabled={isPending}
                    className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="HOUSEHOLD">가정용</option>
                    <option value="ENTERTAINMENT">유흥용</option>
                  </select>
                ) : (
                  <p className="text-sm font-medium text-gray-900">{formatBusinessType(member)}</p>
                )}
              </div>
              <div>
                <Label htmlFor="contact" className="mb-1 text-xs text-gray-500">
                  연락처
                </Label>
                {isEditing ? (
                  <Input
                    id="contact"
                    value={form.contact}
                    onChange={(event) => handleChange("contact", event.target.value)}
                    disabled={isPending}
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-900">{member.contact ?? "-"}</p>
                )}
              </div>
              <div className="col-span-2">
                <Label htmlFor="pickupAddress" className="mb-1 text-xs text-gray-500">
                  픽업 주소
                </Label>
                {isEditing ? (
                  <Input
                    id="pickupAddress"
                    value={form.pickupAddress}
                    onChange={(event) => handleChange("pickupAddress", event.target.value)}
                    disabled={isPending}
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-900">{member.pickupAddress ?? "-"}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500">사업자 등록일</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(member.businessCreatedAt)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">사업자 수정일</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(member.businessUpdatedAt)}</p>
              </div>
            </div>
          </div>

          {/* 권한 정보 */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h3 className="font-bold text-gray-900">권한 정보</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {BUSINESS_ROLE_CONFIGS.map((roleConfig) => {
                const enabled = hasRole(member, roleConfig.roleKey, roleConfig.role);
                const grantPending = pendingRoleAction === `grant:${roleConfig.role}`;
                const revokePending = pendingRoleAction === `revoke:${roleConfig.role}`;
                const grantDisabled = enabled || pendingRoleAction !== null;
                const revokeDisabled = !enabled || pendingRoleAction !== null;

                return (
                  <div key={roleConfig.role} className="flex items-center justify-between gap-4 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-medium text-gray-900">{roleConfig.label}</p>
                      {enabled ? (
                        <Badge className={roleConfig.badgeClassName}>보유</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-500">미보유</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={`${roleConfig.label} 부여`}
                        onClick={() => handleRoleAction("grant", roleConfig.role, roleConfig.label)}
                        disabled={grantDisabled}
                        className={`typo-medium-14 rounded-lg border px-3 py-1.5 transition-colors ${
                          grantDisabled
                            ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                            : "cursor-pointer border-amber-600 bg-amber-600 text-white hover:bg-amber-700"
                        }`}
                      >
                        {grantPending ? "처리 중..." : "부여"}
                      </button>
                      <button
                        type="button"
                        aria-label={`${roleConfig.label} 회수`}
                        onClick={() => handleRoleAction("revoke", roleConfig.role, roleConfig.label)}
                        disabled={revokeDisabled}
                        className={`typo-medium-14 rounded-lg border px-3 py-1.5 transition-colors ${
                          revokeDisabled
                            ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                            : "cursor-pointer border-red-600 bg-red-600 text-white hover:bg-red-700"
                        }`}
                      >
                        {revokePending ? "처리 중..." : "회수"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

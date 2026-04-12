"use client";

import type { UserSelfResponse } from "@/apis/generated/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDays } from "lucide-react";
import { useActionState } from "react";
import { updateProfile } from "../actions";

interface ProfileEditFormProps {
  user: UserSelfResponse;
  onClose: () => void;
}

export default function ProfileEditForm({
  user,
  onClose,
}: ProfileEditFormProps) {
  const [profileState, profileAction, profilePending] = useActionState(
    updateProfile,
    { success: false },
  );

  return (
    <div className="space-y-4 md:space-y-6">
      {/* 기본 정보 */}
      <form action={profileAction}>
        <div className="border-b border-gray-200 pb-4 md:pb-6">
          <h4 className="mb-3 font-bold text-gray-900 md:mb-4">기본 정보</h4>
          <div className="space-y-3 md:space-y-4">
            <div>
              <Label className="typo-bold-14 mb-2 block text-gray-700">
                닉네임
              </Label>
              <Input
                name="username"
                defaultValue={user.username}
                className="text-sm md:text-base"
              />
            </div>
            <div>
              <Label className="typo-bold-14 mb-2 block text-gray-700">
                이름
              </Label>
              <Input
                defaultValue={user.name}
                disabled
                className="cursor-not-allowed bg-gray-50 text-sm text-gray-500 md:text-base"
              />
              <p className="mt-1 text-xs text-gray-500">
                이름은 변경할 수 없습니다
              </p>
            </div>
            <div>
              <Label className="typo-bold-14 mb-2 block text-gray-700">
                이메일
              </Label>
              <Input
                name="email"
                type="email"
                defaultValue={user.email}
                className="text-sm md:text-base"
              />
            </div>
            <div>
              <Label className="typo-bold-14 mb-2 block text-gray-700">
                전화번호
              </Label>
              <Input
                disabled
                name="phone"
                type="tel"
                defaultValue={user.phone}
                className="text-sm md:text-base"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div>
                <Label className="typo-bold-14 mb-2 block text-gray-700">
                  생년월일
                </Label>
                <div className="relative">
                  <Input
                    disabled
                    name="birthDate"
                    type="date"
                    defaultValue={user.birthDate}
                    className="py-2 pr-3 pl-10 text-sm md:py-3 md:pr-4 md:pl-12 md:text-base"
                  />
                  <CalendarDays
                    className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 md:left-4"
                    size={16}
                  />
                </div>
              </div>
              <div>
                <Label className="typo-bold-14 mb-2 block text-gray-700">
                  성별
                </Label>
                <Input
                  disabled
                  name="gender"
                  defaultValue={
                    user.gender === "M"
                      ? "남성"
                      : user.gender === "F"
                        ? "여성"
                        : "-"
                  }
                  className="text-sm md:text-base"
                />
              </div>
            </div>
          </div>

          {/* 마케팅 수신 동의 */}
          <div className="mt-4 md:mt-6">
            <h4 className="mb-3 font-bold text-gray-900 md:mb-4">
              마케팅 수신 동의
            </h4>
            <div className="space-y-2 md:space-y-3">
              {[
                {
                  name: "emailAgree",
                  label: "이메일 수신 동의",
                  checked: user.emailAgree,
                },
                {
                  name: "smsAgree",
                  label: "SMS 수신 동의",
                  checked: user.smsAgree,
                },
                {
                  name: "marketingAgree",
                  label: "마케팅 정보 수신 동의",
                  checked: user.marketingAgree,
                },
                {
                  name: "snsAgree",
                  label: "SNS 수신 동의",
                  checked: user.snsAgree,
                },
              ].map((item) => (
                <label
                  key={item.name}
                  className="flex cursor-pointer items-center gap-2 border border-gray-200 p-2 hover:bg-gray-50 md:gap-3 md:p-3"
                >
                  <Checkbox name={item.name} defaultChecked={item.checked} />
                  <span className="text-sm text-gray-900 md:text-base">
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <FormMessage message={profileState.error} className="mt-3" />
          <FormMessage
            message={
              profileState.success ? "프로필이 수정되었습니다." : undefined
            }
            variant="success"
            className="mt-3"
          />

          <div className="mt-4 flex gap-3">
            <Button type="submit" disabled={profilePending} className="flex-1">
              {profilePending ? "저장 중..." : "정보 수정"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

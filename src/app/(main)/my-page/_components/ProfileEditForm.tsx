"use client";

import { useActionState, useState } from "react";
import type { UserSelfResponse } from "@/apis/generated/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDays } from "lucide-react";
import { changePassword, updateProfile } from "../actions";

interface ProfileEditFormProps {
  user: UserSelfResponse;
  onClose: () => void;
}

export default function ProfileEditForm({ user, onClose }: ProfileEditFormProps) {
  const [pwState, pwAction, pwPending] = useActionState(changePassword, {
    success: false,
  });
  const [profileState, profileAction, profilePending] = useActionState(
    updateProfile,
    { success: false },
  );

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const passwordMatch = !confirmPassword || newPassword === confirmPassword;

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
                <select
                  name="gender"
                  defaultValue={user.gender}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-gray-600 focus:outline-none md:px-4 md:py-3 md:text-base"
                >
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                  <option value="other">기타</option>
                </select>
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
                { name: "emailAgree", label: "이메일 수신 동의", checked: user.emailAgree },
                { name: "smsAgree", label: "SMS 수신 동의", checked: user.smsAgree },
                { name: "marketingAgree", label: "마케팅 정보 수신 동의", checked: user.marketingAgree },
                { name: "snsAgree", label: "SNS 수신 동의", checked: user.snsAgree },
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
            message={profileState.success ? "프로필이 수정되었습니다." : undefined}
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

      {/* 비밀번호 변경 */}
      <form action={pwAction}>
        <h4 className="mb-3 font-bold text-gray-900 md:mb-4">비밀번호 변경</h4>
        <div className="space-y-3 md:space-y-4">
          <div>
            <Label className="typo-bold-14 mb-2 block text-gray-700">
              현재 비밀번호
            </Label>
            <Input
              name="currentPassword"
              type="password"
              placeholder="현재 비밀번호를 입력하세요"
              className="text-sm md:text-base"
            />
          </div>
          <div>
            <Label className="typo-bold-14 mb-2 block text-gray-700">
              새 비밀번호
            </Label>
            <Input
              name="newPassword"
              type="password"
              placeholder="새 비밀번호를 입력하세요"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="text-sm md:text-base"
            />
          </div>
          <div>
            <Label className="typo-bold-14 mb-2 block text-gray-700">
              새 비밀번호 확인
            </Label>
            <Input
              name="confirmPassword"
              type="password"
              placeholder="새 비밀번호를 다시 입력하세요"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`text-sm md:text-base ${!passwordMatch ? "border-red-500 focus:ring-red-600" : ""}`}
            />
            {!passwordMatch && (
              <p className="mt-1 text-xs text-red-600">
                비밀번호가 일치하지 않습니다
              </p>
            )}
          </div>
        </div>

        <FormMessage message={pwState.error} className="mt-3" />
        <FormMessage
          message={pwState.success ? "비밀번호가 변경되었습니다." : undefined}
          variant="success"
          className="mt-3"
        />

        <div className="mt-4">
          <Button type="submit" disabled={pwPending || !passwordMatch}>
            {pwPending ? "변경 중..." : "비밀번호 변경"}
          </Button>
        </div>
      </form>
    </div>
  );
}

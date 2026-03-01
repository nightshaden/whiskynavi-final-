"use client";

import { useReducer, useTransition } from "react";
import { toast } from "sonner";
import { z } from "zod";

import type { BlacklistRequest } from "@/apis/apis";

type BlacklistFormData = BlacklistRequest & {
  userId: number;
  name: string;
};

export type FormState = {
  userId: string;
  name: string;
  reason: string;
  startAt: string | undefined;
  endAt: string | null;
  isPermanent: boolean;
};

type FormAction =
  | { type: "SET_USER"; payload: { userId: string; name: string } }
  | { type: "CLEAR_USER" }
  | { type: "SET_REASON"; payload: string }
  | { type: "SET_START_DATE"; payload: string | undefined }
  | { type: "SET_END_DATE"; payload: string | null }
  | { type: "TOGGLE_PERMANENT"; payload: boolean }
  | { type: "RESET"; payload: FormState };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_USER":
      return {
        ...state,
        userId: action.payload.userId,
        name: action.payload.name,
      };
    case "CLEAR_USER":
      return { ...state, userId: "", name: "" };
    case "SET_REASON":
      return { ...state, reason: action.payload };
    case "SET_START_DATE":
      return { ...state, startAt: action.payload };
    case "SET_END_DATE":
      return { ...state, endAt: action.payload };
    case "TOGGLE_PERMANENT":
      return {
        ...state,
        isPermanent: action.payload,
        endAt: action.payload ? null : state.endAt,
      };
    case "RESET":
      return action.payload;
  }
}

function isPermanentBanDate(endAt?: string | null): boolean {
  if (!endAt) return true;
  const year = new Date(endAt).getFullYear();
  return year >= 3000;
}

function getInitialState(initialData?: BlacklistFormData): FormState {
  const isPermanent = isPermanentBanDate(initialData?.endAt);
  return {
    userId: initialData?.userId?.toString() ?? "",
    name: initialData?.name ?? "",
    reason: initialData?.reason ?? "",
    startAt: initialData?.startAt || undefined,
    endAt: isPermanent ? null : initialData?.endAt || null,
    isPermanent,
  };
}

const blacklistFormSchema = z.object({
  userId: z.string().min(1, "사용자를 선택해주세요."),
  reason: z.string().min(1, "사유를 입력해주세요."),
});

type UseBlacklistFormOptions = {
  mode: "add" | "edit";
  initialData?: BlacklistFormData;
  onSubmit: (data: BlacklistFormData) => void | Promise<void>;
};

export function useBlacklistForm({
  mode,
  initialData,
  onSubmit,
}: UseBlacklistFormOptions) {
  const [formState, dispatch] = useReducer(
    formReducer,
    initialData,
    getInitialState,
  );
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    const result = blacklistFormSchema.safeParse({
      userId:
        mode === "edit"
          ? (initialData?.userId?.toString() ?? formState.userId)
          : formState.userId,
      reason: formState.reason,
    });

    if (!result.success) {
      const firstError = result.error.issues[0];
      toast.error(firstError.message);
      return;
    }

    startTransition(async () => {
      await onSubmit({
        userId: Number(formState.userId),
        name: formState.name,
        reason: formState.reason,
        startAt: formState.startAt ?? "",
        endAt: formState.isPermanent ? null : (formState.endAt ?? null),
      });
    });
  };

  return {
    formState,
    dispatch,
    isPending,
    handleSubmit,
  };
}

"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function RegisteredToast() {
  useEffect(() => {
    toast.success("회원가입이 완료되었습니다. 로그인해주세요.");
  }, []);

  return null;
}

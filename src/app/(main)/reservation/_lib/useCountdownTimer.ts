"use client";

import { useEffect, useState } from "react";
import {
  calculateTimeRemaining,
  getNoticeStatus,
  type NoticeStatus,
} from "./utils";
import type { BottleReservationNoticePublicResponse } from "@/apis/generated/api";

interface CountdownTimerResult {
  timeRemaining: string;
  status: NoticeStatus;
}

export function useCountdownTimer(
  notice: BottleReservationNoticePublicResponse,
): CountdownTimerResult {
  const status = getNoticeStatus(notice);
  const [timeRemaining, setTimeRemaining] = useState("");

  // string deps로 매 렌더 새 Date 객체 생성 방지 (rerender-dependencies)
  const startAt = notice.reservationStartAt;
  const endAt = notice.reservationEndAt;

  useEffect(() => {
    const targetDateStr = status === "pending" ? startAt : endAt;
    if (!targetDateStr || status === "closed") return;

    const targetDate = new Date(targetDateStr);
    const updateTimer = () =>
      setTimeRemaining(calculateTimeRemaining(targetDate));
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [status, startAt, endAt]);

  return { timeRemaining, status };
}

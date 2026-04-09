"use client";

import { Button } from "@/components/ui/button";

export default function MainError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="typo-bold-20 text-gray-900">
        페이지를 불러올 수 없습니다
      </h2>
      <p className="typo-regular-14 mt-3 text-gray-500">
        일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
      </p>
      <Button onClick={reset} className="mt-6" variant="outline">
        다시 시도
      </Button>
    </div>
  );
}

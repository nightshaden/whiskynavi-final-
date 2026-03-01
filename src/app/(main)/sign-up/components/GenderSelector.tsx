"use client";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { cn } from "@/lib/utils";
import { useState } from "react";

type Gender = "male" | "female" | "";

export function GenderSelector() {
  const [gender, setGender] = useState<Gender>("");

  return (
    <fieldset className="flex w-full flex-col justify-between self-stretch md:w-auto">
      <legend className="typo-medium-14 font-semibold text-black">성별</legend>
      <ButtonGroup
        role="radiogroup"
        aria-label="성별 선택"
        className="mt-auto [&>*:first-child]:rounded-l-[10px] [&>*:last-child]:rounded-r-[10px]"
      >
        <Button
          type="button"
          variant="outline"
          role="radio"
          aria-checked={gender === "male"}
          onClick={() => setGender("male")}
          className={cn(
            "typo-medium-14 h-7 border-gray-200 transition-colors",
            gender === "male"
              ? "border-[#1E2A38] bg-[#1E2A38] text-white hover:bg-[#1E2A38] hover:text-white"
              : "bg-white text-black hover:bg-gray-50",
          )}
        >
          남
        </Button>
        <Button
          type="button"
          variant="outline"
          role="radio"
          aria-checked={gender === "female"}
          onClick={() => setGender("female")}
          className={cn(
            "typo-medium-14 h-7 border-gray-200 transition-colors",
            gender === "female"
              ? "border-[#1E2A38] bg-[#1E2A38] text-white hover:bg-[#1E2A38] hover:text-white"
              : "bg-white text-black hover:bg-gray-50",
          )}
        >
          여
        </Button>
      </ButtonGroup>
      {/* Hidden input for form submission */}
      <input type="hidden" name="gender" value={gender} />
    </fieldset>
  );
}

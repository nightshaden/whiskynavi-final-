"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { cn } from "@/lib/utils";

type Gender = "male" | "female" | "";

export function GenderSelector() {
  const [gender, setGender] = useState<Gender>("");

  return (
    <fieldset className="self-stretch w-full md:w-auto flex flex-col justify-between">
      <legend className="text-black font-semibold typo-medium-14">성별</legend>
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
            "h-7 typo-medium-14 transition-colors border-gray-200",
            gender === "male"
              ? "bg-[#1E2A38] text-white border-[#1E2A38] hover:bg-[#1E2A38] hover:text-white"
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
            "h-7 typo-medium-14 transition-colors border-gray-200",
            gender === "female"
              ? "bg-[#1E2A38] text-white border-[#1E2A38] hover:bg-[#1E2A38] hover:text-white"
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

"use client";

import { Input } from "@/components/ui/input";
import { useCallback, useState } from "react";

function formatBirthDate(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

export function BirthDateInput() {
  const [value, setValue] = useState("");

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(formatBirthDate(e.target.value));
  }, []);

  return (
    <>
      <Input
        id="birthDate"
        type="text"
        inputMode="numeric"
        maxLength={10}
        value={value}
        onChange={handleChange}
        placeholder="YYYY-MM-DD"
        className="typo-regular-14 rounded-none border-0 border-b border-gray-200 bg-transparent px-0 py-3 pr-8 text-black placeholder:text-gray-400 focus-visible:border-black focus-visible:ring-0"
      />
      <input type="hidden" name="birthDate" value={value} />
    </>
  );
}

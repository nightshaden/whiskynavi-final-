"use client";

import { useState, useCallback, type InputHTMLAttributes } from "react";

interface CurrencyInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> {
  name: string;
  defaultValue?: number | string;
  suffix?: string;
}

function formatNumber(value: string | number | undefined): string {
  if (value === undefined || value === "") return "";
  const num = typeof value === "string" ? Number(value.replace(/,/g, "")) : value;
  if (isNaN(num)) return "";
  return num.toLocaleString("ko-KR");
}

function parseNumber(formatted: string): string {
  return formatted.replace(/,/g, "");
}

export default function CurrencyInput({
  name,
  defaultValue,
  suffix = "₩",
  className = "",
  ...rest
}: CurrencyInputProps) {
  const [display, setDisplay] = useState(() => formatNumber(defaultValue));

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9]/g, "");
      setDisplay(raw ? Number(raw).toLocaleString("ko-KR") : "");
    },
    [],
  );

  return (
    <div className="relative flex-1">
      <input type="hidden" name={name} value={parseNumber(display)} />
      <input
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        className={`${className} ${suffix ? "pr-8" : ""}`}
        {...rest}
      />
      {suffix && (
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  );
}

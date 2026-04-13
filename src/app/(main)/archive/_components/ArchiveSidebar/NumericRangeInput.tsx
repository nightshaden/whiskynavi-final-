import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}

interface NumericRangeInputProps {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  className?: string;
}

export function NumericRangeInput({ value, min, max, onChange, className }: NumericRangeInputProps) {
  const [local, setLocal] = useState(String(value));

  useEffect(() => {
    setLocal(String(value));
  }, [value]);

  return (
    <Input
      type="text"
      inputMode="numeric"
      value={local}
      onChange={(e) => setLocal(e.target.value.replace(/[^0-9]/g, ""))}
      onBlur={() => {
        const num = local === "" ? min : clamp(Number(local), min, max);
        setLocal(String(num));
        onChange(num);
      }}
      className={className}
    />
  );
}

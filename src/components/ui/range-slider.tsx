"use client";

import { debounce } from "es-toolkit/compat";
import { useCallback, useState } from "react";
import { Input } from "./input";
import { Slider } from "./slider";

interface RangeSliderProps {
  value: [number, number];
  onChange: (value: [number, number]) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  debounceMs?: number;
}

export function RangeSlider({
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "",
  debounceMs = 300,
}: RangeSliderProps) {
  // 로컬 상태 (즉각적인 UI 반응)
  const [localValue, setLocalValue] = useState<[number, number]>(value);

  // debounced 콜백 (부모에게 전달)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedOnChange = useCallback(
    debounce((newValue: [number, number]) => {
      onChange(newValue);
    }, debounceMs),
    [onChange, debounceMs],
  );

  const handleChange = (newValue: [number, number]) => {
    setLocalValue(newValue); // 즉각 UI 업데이트
    debouncedOnChange(newValue); // debounced 부모 업데이트
  };

  return (
    <div className="pb-4">
      <div className="flex items-center gap-2 mb-3">
        <Input
          type="number"
          value={localValue[0]}
          onChange={(e) => {
            const newValue: [number, number] = [
              Number(e.target.value),
              localValue[1],
            ];
            handleChange(newValue);
          }}
          className="w-20 bg-white/10 border-white/20 text-white text-center typo-regular-14"
        />
        <span className="text-white/60 typo-regular-14">{unit}</span>
        <span className="text-white/60">–</span>
        <Input
          type="number"
          value={localValue[1]}
          onChange={(e) => {
            const newValue: [number, number] = [
              localValue[0],
              Number(e.target.value),
            ];
            handleChange(newValue);
          }}
          className="w-20 bg-white/10 border-white/20 text-white text-center typo-regular-14"
        />
        <span className="text-white/60 typo-regular-14">{unit}</span>
      </div>
      <Slider
        value={localValue}
        onValueChange={(val) => handleChange(val as [number, number])}
        min={min}
        max={max}
        step={step}
      />
    </div>
  );
}


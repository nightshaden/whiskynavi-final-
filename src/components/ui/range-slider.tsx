"use client";

import { debounce } from "es-toolkit/compat";
import { useEffect, useMemo, useState } from "react";
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

export function RangeSlider({ value, onChange, min, max, step = 1, unit = "", debounceMs = 300 }: RangeSliderProps) {
  // 로컬 상태 (즉각적인 UI 반응)
  const [localValue, setLocalValue] = useState<[number, number]>(value);

  // 부모의 value prop이 변경되면 localValue 동기화
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // debounced 콜백 (부모에게 전달)
  const debouncedOnChange = useMemo(
    () =>
      debounce((newValue: [number, number]) => {
        onChange(newValue);
      }, debounceMs),
    [debounceMs, onChange],
  );

  // 컴포넌트 언마운트 시 pending 호출 취소
  useEffect(() => {
    return () => {
      debouncedOnChange.cancel();
    };
  }, [debouncedOnChange]);

  const handleChange = (newValue: [number, number]) => {
    setLocalValue(newValue); // 즉각 UI 업데이트
    debouncedOnChange(newValue); // debounced 부모 업데이트
  };

  return (
    <div className="pb-4">
      <div className="mb-3 flex items-center gap-2">
        <Input
          type="number"
          value={localValue[0]}
          onChange={(e) => {
            const newValue: [number, number] = [Number(e.target.value), localValue[1]];
            handleChange(newValue);
          }}
          className="typo-regular-14 w-20 border-white/20 bg-white/10 text-center text-white"
        />
        <span className="typo-regular-14 text-white/60">{unit}</span>
        <span className="text-white/60">–</span>
        <Input
          type="number"
          value={localValue[1]}
          onChange={(e) => {
            const newValue: [number, number] = [localValue[0], Number(e.target.value)];
            handleChange(newValue);
          }}
          className="typo-regular-14 w-20 border-white/20 bg-white/10 text-center text-white"
        />
        <span className="typo-regular-14 text-white/60">{unit}</span>
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

"use client";

import { Filter } from "lucide-react";

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterHeaderProps {
  label: string;
  filterKey: string;
  options: FilterOption[];
  currentValue: string;
  isOpen: boolean;
  onToggle: (key: string) => void;
  onSelect: (key: string, value: string) => void;
  onClose: () => void;
  /** 아이콘 크기 (기본 12) */
  iconSize?: number;
  /** 드롭다운 너비 클래스 (기본 "w-36") */
  dropdownWidth?: string;
  /** th에 적용할 추가 className */
  className?: string;
}

export default function FilterHeader({
  label,
  filterKey,
  options,
  currentValue,
  isOpen,
  onToggle,
  onSelect,
  onClose,
  iconSize = 12,
  dropdownWidth = "w-36",
  className = "typo-bold-12 px-4 py-3 text-left text-gray-700 uppercase",
}: FilterHeaderProps) {
  const isActive = currentValue !== "all";

  return (
    <th className={`${className} relative`}>
      <button
        type="button"
        onClick={() => onToggle(filterKey)}
        className={`flex cursor-pointer items-center gap-1 hover:text-amber-600 ${isActive ? "text-amber-600" : ""}`}
      >
        {label}
        <Filter size={iconSize} className={isActive ? "fill-amber-600" : ""} />
      </button>
      {isOpen && (
        <div
          className={`absolute top-full left-0 z-50 mt-1 rounded-lg border border-gray-300 bg-white shadow-lg ${dropdownWidth}`}
        >
          {options.map((option) => (
            <button
              type="button"
              key={option.value}
              onClick={() => {
                onSelect(filterKey, option.value);
                onClose();
              }}
              className={`block w-full cursor-pointer px-3 py-2 text-left text-xs hover:bg-gray-100 ${
                currentValue === option.value ? "bg-amber-50 text-amber-700" : ""
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </th>
  );
}

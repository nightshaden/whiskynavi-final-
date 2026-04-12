"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { searchBottlesAction } from "../../actions";

interface BottleOption {
  id: number;
  name: string;
  stockQuantity: number | null;
}

interface BottleSearchComboboxProps {
  defaultBottleId?: number;
  defaultBottleName?: string;
}

export default function BottleSearchCombobox({
  defaultBottleId,
  defaultBottleName,
}: BottleSearchComboboxProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<BottleOption | null>(
    defaultBottleId && defaultBottleName
      ? { id: defaultBottleId, name: defaultBottleName, stockQuantity: null }
      : null,
  );
  const [options, setOptions] = useState<BottleOption[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const cacheRef = useRef<Map<string, BottleOption[]>>(new Map());

  const fetchBottles = useCallback(async (keyword: string) => {
    const cached = cacheRef.current.get(keyword);
    if (cached) {
      setOptions(cached);
      return;
    }

    setLoading(true);
    try {
      const results = await searchBottlesAction(keyword);
      cacheRef.current.set(keyword, results);
      setOptions(results);
    } finally {
      setLoading(false);
    }
  }, []);

  // 포커스 시 초기 목록 로드
  useEffect(() => {
    if (open && options.length === 0 && !search) {
      fetchBottles("");
    }
  }, [open, options.length, search, fetchBottles]);

  // 검색어 변경 시 debounced fetch
  useEffect(() => {
    if (!open) return;
    // 캐시 히트 시 즉시 반영
    const cached = cacheRef.current.get(search);
    if (cached) {
      setOptions(cached);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchBottles(search);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, open, fetchBottles]);

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const displayValue = selected ? `${selected.name} (ID: ${selected.id})` : "";

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name="bottleId" value={selected?.id ?? ""} />

      <input
        ref={inputRef}
        type="text"
        value={open ? search : displayValue}
        placeholder="제품명을 검색하세요"
        className={cn(
          "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none",
          !open && !selected && "text-gray-400",
        )}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => {
          setOpen(true);
          setSearch("");
        }}
      />

      {selected && !open && (
        <p className="mt-1.5 text-xs text-gray-500">
          재고 수량:{" "}
          <span className="font-medium text-gray-700">
            {selected.stockQuantity != null
              ? `${selected.stockQuantity.toLocaleString("ko-KR")}병`
              : "-"}
          </span>
        </p>
      )}

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          <Command shouldFilter={false}>
            <CommandList>
              {loading ? (
                <div className="py-4 text-center text-sm text-gray-400">
                  검색 중...
                </div>
              ) : (
                <>
                  <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
                  <CommandGroup>
                    {options.map((bottle) => (
                      <CommandItem
                        key={bottle.id}
                        value={String(bottle.id)}
                        onSelect={() => {
                          setSelected(bottle);
                          setOpen(false);
                          setSearch("");
                        }}
                        className="flex items-center justify-between"
                      >
                        <span>
                          {bottle.name} (ID: {bottle.id})
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">
                            {bottle.stockQuantity != null
                              ? `${bottle.stockQuantity.toLocaleString("ko-KR")}병`
                              : "-"}
                          </span>
                          <Check
                            className={cn(
                              selected?.id === bottle.id
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}

"use client";

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useImperativeHandle, useMemo, useRef, useState } from "react";

export interface SearchableDropdownProps {
  items: string[];
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
  inputClassName?: string;
  popoverClassName?: string;
  containerClassName?: string;
  disabled?: boolean;
  ref?: React.Ref<HTMLInputElement>;
}

export default function SearchableDropdown({
  items,
  value: controlledValue,
  onChange,
  placeholder = "검색...",
  emptyMessage = "결과가 없습니다.",
  className,
  inputClassName,
  popoverClassName,
  containerClassName,
  disabled = false,
  ref,
}: SearchableDropdownProps) {
  const [internalValue, setInternalValue] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isControlled = controlledValue !== undefined;
  const selectedValues = isControlled ? controlledValue : internalValue;

  const shouldShowDropdown = isFocused && !disabled;

  const filteredItems = useMemo(() => {
    return items.filter((item) => item.toLowerCase().includes(searchValue.toLowerCase()));
  }, [items, searchValue]);

  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  return (
    <div className={cn("relative", containerClassName)}>
      <Command
        shouldFilter={false}
        className={cn("overflow-visible", shouldShowDropdown && "rounded-b-none", className)}
      >
        <CommandInput
          ref={inputRef}
          placeholder={placeholder}
          className={cn("h-9", inputClassName)}
          value={searchValue}
          onValueChange={setSearchValue}
          onFocus={() => {
            if (!disabled) {
              setIsFocused(true);
            }
          }}
          onBlur={() => {
            setTimeout(() => {
              setIsFocused(false);
            }, 100);
          }}
          disabled={disabled}
        />
        {shouldShowDropdown && (
          <div
            className={cn(
              "bg-popover text-popover-foreground absolute top-full left-0 z-50 w-full rounded-b-md border border-t-0 shadow-md",
              popoverClassName,
            )}
            onMouseDown={(e) => {
              e.preventDefault();
            }}
          >
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {filteredItems.map((item, index) => (
                  <CommandItem
                    key={`${item}-${index}`}
                    value={item}
                    onSelect={(currentValue) => {
                      const newValue = selectedValues.includes(currentValue)
                        ? selectedValues.filter((v) => v !== currentValue)
                        : [...selectedValues, currentValue];

                      if (!isControlled) {
                        setInternalValue(newValue);
                      }
                      onChange?.(newValue);
                    }}
                  >
                    {item}
                    <Check className={cn("ml-auto", selectedValues.includes(item) ? "opacity-100" : "opacity-0")} />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </div>
        )}
      </Command>
    </div>
  );
}

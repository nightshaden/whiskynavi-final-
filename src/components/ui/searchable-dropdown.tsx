"use client";

import { Check } from "lucide-react";
import * as React from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface SearchableDropdownItem {
  value: string;
  label: string;
}

export interface SearchableDropdownProps {
  items: SearchableDropdownItem[];
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
  inputClassName?: string;
  popoverClassName?: string;
  containerClassName?: string;
  disabled?: boolean;
}

const SearchableDropdown = React.forwardRef<
  HTMLInputElement,
  SearchableDropdownProps
>(
  (
    {
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
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState<string[]>([]);
    const [searchValue, setSearchValue] = React.useState("");
    const [isFocused, setIsFocused] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Controlled vs Uncontrolled
    const isControlled = controlledValue !== undefined;
    const selectedValues = isControlled ? controlledValue : internalValue;

    // focus 상태이거나 명시적으로 open이면 dropdown 표시
    const shouldShowDropdown = (isFocused || open) && !disabled;

    const filteredItems = React.useMemo(() => {
      return items.filter((item) =>
        item.label.toLowerCase().includes(searchValue.toLowerCase()),
      );
    }, [items, searchValue]);

    // ref 통합 (외부 ref와 내부 ref)
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    return (
      <div className={cn("relative", containerClassName)}>
        <Popover open={shouldShowDropdown} onOpenChange={setOpen}>
          <Command
            shouldFilter={false}
            className={cn(shouldShowDropdown && "rounded-b-none", className)}
          >
            <PopoverAnchor asChild>
              <CommandInput
                ref={inputRef}
                placeholder={placeholder}
                className={cn(
                  "h-9",
                  shouldShowDropdown && "rounded-b-none",
                  inputClassName,
                )}
                value={searchValue}
                onValueChange={setSearchValue}
                onFocus={() => {
                  if (!disabled) {
                    setIsFocused(true);
                    setOpen(true);
                  }
                }}
                onBlur={() => {
                  // 약간의 지연을 두어 항목 클릭이 먼저 처리되도록 함
                  setTimeout(() => {
                    setIsFocused(false);
                    setOpen(false);
                  }, 100);
                }}
                disabled={disabled}
              />
            </PopoverAnchor>
            <PopoverContent
              sideOffset={0}
              className={cn(
                "w-[269px] b-none p-0 translate-x-[-12px] rounded-t-none border-t-0",
                popoverClassName,
              )}
              onOpenAutoFocus={(e) => {
                // Popover가 열릴 때 자동 focus를 방지
                e.preventDefault();
              }}
            >
              <CommandList
                onMouseDown={(e) => {
                  // dropdown 내부 클릭 시 input의 blur 방지
                  e.preventDefault();
                }}
              >
                <CommandEmpty>{emptyMessage}</CommandEmpty>
                <CommandGroup>
                  {filteredItems.map((item) => (
                    <CommandItem
                      key={item.value}
                      value={item.value}
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
                      {item.label}
                      <Check
                        className={cn(
                          "ml-auto",
                          selectedValues.includes(item.value)
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </PopoverContent>
          </Command>
        </Popover>
      </div>
    );
  },
);

export default SearchableDropdown;

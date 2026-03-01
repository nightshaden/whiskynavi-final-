"use client";

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
import { Check } from "lucide-react";
import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

// export interface SearchableDropdownItem {
//   value: string;
//   label: string;
// }

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
}

const SearchableDropdown = forwardRef<
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
    const [open, setOpen] = useState(false);
    const [internalValue, setInternalValue] = useState<string[]>([]);
    const [searchValue, setSearchValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Controlled vs Uncontrolled
    const isControlled = controlledValue !== undefined;
    const selectedValues = isControlled ? controlledValue : internalValue;

    // focus 상태이거나 명시적으로 open이면 dropdown 표시
    const shouldShowDropdown = (isFocused || open) && !disabled;

    const filteredItems = useMemo(() => {
      return items.filter((item) =>
        item.toLowerCase().includes(searchValue.toLowerCase()),
      );
    }, [items, searchValue]);

    // ref 통합 (외부 ref와 내부 ref)
    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);
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
                "b-none w-[239.5px] translate-x-[-12px] rounded-t-none border-t-0 p-0",
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
                      key={item}
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
                      <Check
                        className={cn(
                          "ml-auto",
                          selectedValues.includes(item)
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

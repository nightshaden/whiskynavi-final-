import * as React from "react";
import { IconSearch } from "@/icons";
import { cn } from "@/lib/utils";
import { Input } from "./input";

interface SearchInputProps extends React.ComponentProps<typeof Input> {
  containerClassName?: string;
  iconClassName?: string;
  inputClassName?: string;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    { containerClassName, iconClassName, inputClassName, className, ...props },
    ref,
  ) => {
    return (
      <div className={cn("relative", containerClassName)}>
        <IconSearch
          className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400",
            iconClassName,
          )}
        />
        <Input
          ref={ref}
          className={cn(
            "pl-9 bg-white border-white/20 placeholder:text-[#4C4C4C] typo-regular-12",
            inputClassName,
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);

SearchInput.displayName = "SearchInput";

export { SearchInput };

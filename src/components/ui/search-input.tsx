import { IconSearch } from "@/icons";
import { cn } from "@/lib/utils";
import * as React from "react";
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
            "absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400",
            iconClassName,
          )}
        />
        <Input
          ref={ref}
          className={cn(
            "typo-regular-12 border-white/20 bg-white pl-9 placeholder:text-[#4C4C4C]",
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

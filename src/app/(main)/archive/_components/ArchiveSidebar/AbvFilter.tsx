import { Input } from "@/components/ui/input";
import { FILTER_DEFAULTS, FilterState } from "../../_types";
import { FilterGroup } from "./FilterGroup";

interface AbvFilterProps {
  value: FilterState["abv"];
  onChange: (value: FilterState["abv"]) => void;
}

export function AbvFilter({ value, onChange }: AbvFilterProps) {
  return (
    <FilterGroup.Section title="도수" sectionKey="abv">
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={value[0]}
          onChange={(e) => onChange([Number(e.target.value), value[1]])}
          min={FILTER_DEFAULTS.ABV_MIN}
          max={value[1]}
          className="h-8 w-full border-white/10 bg-white/5 text-center text-xs text-white focus-visible:border-white/20 focus-visible:ring-0"
        />
        <span className="shrink-0 text-xs text-white/40">%</span>
        <span className="shrink-0 text-xs text-white/40">~</span>
        <Input
          type="number"
          value={value[1]}
          onChange={(e) => onChange([value[0], Number(e.target.value)])}
          min={value[0]}
          max={FILTER_DEFAULTS.ABV_MAX}
          className="h-8 w-full border-white/10 bg-white/5 text-center text-xs text-white focus-visible:border-white/20 focus-visible:ring-0"
        />
        <span className="shrink-0 text-xs text-white/40">%</span>
      </div>
    </FilterGroup.Section>
  );
}

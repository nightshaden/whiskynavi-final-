"use client";

import { ChevronDown } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

// ============================================================================
// Context
// ============================================================================

interface FilterGroupContextValue {
  expandedSections: Record<string, boolean>;
  toggleSection: (key: string) => void;
}

const FilterGroupContext = createContext<FilterGroupContextValue | null>(null);

function useFilterGroup() {
  const ctx = useContext(FilterGroupContext);
  if (!ctx) throw new Error("FilterGroup.Section must be used within FilterGroup");
  return ctx;
}

// ============================================================================
// FilterGroup (Root)
// ============================================================================

interface FilterGroupProps {
  defaultExpanded?: string[];
  children: React.ReactNode;
}

function FilterGroupRoot({
  defaultExpanded = [],
  children,
}: FilterGroupProps) {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >(() =>
    Object.fromEntries(defaultExpanded.map((key) => [key, true])),
  );

  const toggleSection = useCallback((key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const value = useMemo(
    () => ({ expandedSections, toggleSection }),
    [expandedSections, toggleSection],
  );

  return (
    <FilterGroupContext.Provider value={value}>
      {children}
    </FilterGroupContext.Provider>
  );
}

// ============================================================================
// FilterGroup.Section
// ============================================================================

interface SectionProps {
  title: string;
  sectionKey: string;
  children: React.ReactNode;
}

function Section({ title, sectionKey, children }: SectionProps) {
  const { expandedSections, toggleSection } = useFilterGroup();
  const isExpanded = expandedSections[sectionKey] ?? false;

  return (
    <div className="border-b border-white/10">
      <button
        type="button"
        className="flex w-full items-center justify-between py-3 text-sm font-medium text-white"
        onClick={() => toggleSection(sectionKey)}
      >
        {title}
        <ChevronDown
          className={`h-4 w-4 text-white/50 transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>
      {isExpanded && <div className="pb-4">{children}</div>}
    </div>
  );
}

// ============================================================================
// Compound export
// ============================================================================

export const FilterGroup = Object.assign(FilterGroupRoot, {
  Section,
});

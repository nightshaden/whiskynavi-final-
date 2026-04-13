"use client";

import { createContext, useCallback, useContext, useRef } from "react";

interface BrandScrollContextValue {
  registerRef: (id: string, el: HTMLElement | null) => void;
  scrollTo: (id: string) => void;
}

const BrandScrollContext = createContext<BrandScrollContextValue | null>(null);

export function BrandScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const refs = useRef<Record<string, HTMLElement | null>>({});

  const registerRef = useCallback((id: string, el: HTMLElement | null) => {
    refs.current[id] = el;
  }, []);

  const scrollTo = useCallback((id: string) => {
    const element = refs.current[id];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <BrandScrollContext value={{ registerRef, scrollTo }}>
      {children}
    </BrandScrollContext>
  );
}

export function useBrandScroll() {
  const context = useContext(BrandScrollContext);
  if (!context) {
    throw new Error("useBrandScroll must be used within BrandScrollProvider");
  }
  return context;
}

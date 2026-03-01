"use client";

import { Menu, Search } from "lucide-react";
import { useState, useTransition } from "react";

interface AdminHeaderProps {
  title: string;
  onToggleSidebar: () => void;
  showSearch?: boolean;
  searchQuery?: string;
  onSearch?: (value: string) => void;
}

export default function AdminHeader({
  title,
  onToggleSidebar,
  showSearch = true,
  searchQuery = "",
  onSearch,
}: AdminHeaderProps) {
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(searchQuery);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (onSearch) {
      startTransition(() => {
        onSearch(value);
      });
    }
  };

  return (
    <div className="sticky top-0 z-10 border-b border-gray-200 bg-white">
      <div className="px-8 py-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onToggleSidebar}
              className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-gray-100"
            >
              <Menu size={24} className="text-gray-600" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          </div>
        </div>

        {showSearch && (
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute top-1/2 left-4 -translate-y-1/2 transform text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="이름으로 검색..."
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-3 pr-4 pl-12 focus:border-transparent focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              {isPending && (
                <div className="absolute top-1/2 right-4 -translate-y-1/2 transform">
                  <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-amber-600"></div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

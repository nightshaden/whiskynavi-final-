"use client";

import { Menu, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

interface AdminHeaderProps {
  title: string;
  onToggleSidebar: () => void;
  showSearch?: boolean;
}

export default function AdminHeader({
  title,
  onToggleSidebar,
  showSearch = true,
}: AdminHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "");

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      // 검색어가 변경되면 페이지를 1로 리셋
      params.set("page", "1");
      return params.toString();
    },
    [searchParams],
  );

  const handleSearch = (value: string) => {
    setSearchValue(value);
    startTransition(() => {
      router.push(`${pathname}?${createQueryString("q", value)}`);
    });
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onToggleSidebar}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={24} className="text-gray-600" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          </div>
        </div>

        {showSearch && (
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="검색..."
                value={searchValue}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              {isPending && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-600"></div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

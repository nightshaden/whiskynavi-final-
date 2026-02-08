"use client";

import { useDeferredValue, useEffect, useRef, useState } from "react";

import type { AdminUserResponse } from "@/apis/apis";
import { searchUsersAction } from "../../actions";

export function useUserSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AdminUserResponse[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserResponse | null>(
    null,
  );
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const deferredQuery = useDeferredValue(searchQuery);
  const isSearching = searchQuery !== deferredQuery;

  // deferredQuery 변경 시 API 호출
  useEffect(() => {
    if (!deferredQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    let cancelled = false;

    async function search() {
      try {
        const result = await searchUsersAction(deferredQuery);
        if (cancelled) return;
        if (result.success && result.data) {
          setSearchResults(result.data);
          setShowDropdown(true);
        } else {
          console.error("사용자 검색 실패:", result.error);
          setSearchResults([]);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("사용자 검색 실패:", error);
          setSearchResults([]);
        }
      }
    }

    search();

    return () => {
      cancelled = true;
    };
  }, [deferredQuery]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectUser = (user: AdminUserResponse) => {
    setSelectedUser(user);
    setSearchQuery("");
    setShowDropdown(false);
  };

  const clearSelection = () => {
    setSelectedUser(null);
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    showDropdown,
    setShowDropdown,
    selectedUser,
    searchContainerRef,
    selectUser,
    clearSelection,
  };
}

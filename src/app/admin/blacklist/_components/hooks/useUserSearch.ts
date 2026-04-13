"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

import type { AdminUserResponse } from "@/apis/generated/api";
import { searchUsersAction } from "../../actions";

export function useUserSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AdminUserResponse[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserResponse | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const deferredQuery = useDeferredValue(searchQuery);
  const isSearching = searchQuery !== deferredQuery;
  const trimmedQuery = deferredQuery.trim();

  // 빈 쿼리 → 결과/드롭다운을 derived state로 처리
  const visibleResults = useMemo(() => (trimmedQuery ? searchResults : []), [trimmedQuery, searchResults]);
  const isDropdownVisible = showDropdown && trimmedQuery.length > 0;

  // deferredQuery 변경 시 API 호출 (비어있으면 skip)
  useEffect(() => {
    if (!trimmedQuery) return;

    let cancelled = false;

    searchUsersAction(trimmedQuery).then((result) => {
      if (cancelled) return;
      if (result.success && result.data) {
        setSearchResults(result.data);
        setShowDropdown(true);
      } else {
        setSearchResults([]);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [trimmedQuery]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
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
    searchResults: visibleResults,
    isSearching,
    showDropdown: isDropdownVisible,
    setShowDropdown,
    selectedUser,
    searchContainerRef,
    selectUser,
    clearSelection,
  };
}

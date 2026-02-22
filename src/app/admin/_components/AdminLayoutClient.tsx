"use client";

import { useState } from "react";
import type { SidebarStats } from "../layout";
import AdminSidebar from "./AdminSidebar";

interface AdminLayoutClientProps {
  children: React.ReactNode;
  stats: SidebarStats;
}

export default function AdminLayoutClient({
  children,
  stats,
}: AdminLayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-50 justify-center">
      <div className="flex w-full max-w-[1440px]">
        <AdminSidebar isOpen={isSidebarOpen} stats={stats} />
        <div className="flex-1 overflow-auto">
          <SidebarContext.Provider
            value={{
              isOpen: isSidebarOpen,
              toggle: () => setIsSidebarOpen(!isSidebarOpen),
              stats,
            }}
          >
            {children}
          </SidebarContext.Provider>
        </div>
      </div>
    </div>
  );
}

// Context for sidebar toggle
import { createContext, useContext } from "react";

interface SidebarContextType {
  isOpen: boolean;
  toggle: () => void;
  stats: SidebarStats;
}

const SidebarContext = createContext<SidebarContextType>({
  isOpen: true,
  toggle: () => {},
  stats: {
    totalUsers: null,
    totalOrders: null,
    totalBottles: null,
    totalNotices: null,
    totalApplications: null,
    totalBusinessMembers: null,
  },
});

export const useSidebar = () => useContext(SidebarContext);

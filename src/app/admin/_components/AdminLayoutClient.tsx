"use client";

import { useState } from "react";
import AdminSidebar from "./AdminSidebar";

interface AdminLayoutClientProps {
  children: React.ReactNode;
}

export default function AdminLayoutClient({
  children,
}: AdminLayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-50 justify-center">
      <div className="flex w-full max-w-[1440px]">
        <AdminSidebar isOpen={isSidebarOpen} />
        <div className="flex-1 overflow-auto">
          <SidebarContext.Provider
            value={{
              isOpen: isSidebarOpen,
              toggle: () => setIsSidebarOpen(!isSidebarOpen),
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
}

const SidebarContext = createContext<SidebarContextType>({
  isOpen: true,
  toggle: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

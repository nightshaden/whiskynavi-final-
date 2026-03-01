"use client";

import { type ReactNode, useState, createContext, useContext } from "react";
import AdminSidebar from "./AdminSidebar";

interface AdminLayoutClientProps {
  children: ReactNode;
  statsSlot: ReactNode;
}

export default function AdminLayoutClient({
  children,
  statsSlot,
}: AdminLayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-50 justify-center">
      <div className="flex w-full max-w-[1440px]">
        <AdminSidebar isOpen={isSidebarOpen} statsSlot={statsSlot} />
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

interface SidebarContextType {
  isOpen: boolean;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isOpen: true,
  toggle: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

"use client";

import { createContext, type ReactNode, useContext, useState } from "react";
import AdminSidebar from "./AdminSidebar";

interface AdminLayoutClientProps {
  children: ReactNode;
  statsSlot: ReactNode;
}

export default function AdminLayoutClient({ children, statsSlot }: AdminLayoutClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen justify-center bg-gray-50">
      <div className="flex w-full max-w-[1680px]">
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

"use client";

import { useApp } from "@/store/AppContext";
import Sidebar from "@/components/layout/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isSidebarCollapsed } = useApp();

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A]">
      <Sidebar />
      <main className={`transition-all duration-300 ${isSidebarCollapsed ? "ml-[72px]" : "ml-60"}`}>
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
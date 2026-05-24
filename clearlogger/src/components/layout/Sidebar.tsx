"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/store/AppContext";
import {
  LayoutDashboard,
  ArrowUpCircle,
  ArrowDownCircle,
  FileText,
  Users,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/income", icon: ArrowUpCircle, label: "Income" },
  { href: "/expenses", icon: ArrowDownCircle, label: "Expenses" },
  { href: "/invoices", icon: FileText, label: "Invoices" },
  { href: "/clients", icon: Users, label: "Clients" },
  { href: "/calendar", icon: Calendar, label: "Calendar" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isDarkMode, isSidebarCollapsed, toggleDarkMode, toggleSidebar } = useApp();

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-slate-700 flex flex-col transition-all duration-300 z-20 ${
        isSidebarCollapsed ? "w-[72px]" : "w-60"
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          {!isSidebarCollapsed && (
            <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">ClearLedger</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                isActive
                  ? "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-l-2 border-teal-600"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <Icon
                size={20}
                className={isActive ? "text-teal-600 dark:text-teal-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"}
              />
              {!isSidebarCollapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom controls */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-700 space-y-1">
        <button
          onClick={toggleDarkMode}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          {!isSidebarCollapsed && <span className="text-sm font-medium">Dark Mode</span>}
        </button>

        <button
          onClick={toggleSidebar}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          {!isSidebarCollapsed && <span className="text-sm font-medium">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
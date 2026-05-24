"use client";

import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: number; // positive or negative percentage
  accentColor?: string;
  icon?: ReactNode;
}

export default function KPICard({ title, value, subtitle, trend, accentColor = "text-teal-600", icon }: KPICardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-150 animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</span>
        {icon && <div className={`${accentColor}`}>{icon}</div>}
      </div>
      <div className="space-y-1">
        <p className={`text-3xl font-bold font-mono ${accentColor}`}>{value}</p>
        {subtitle && (
          <p className="text-xs text-slate-400 dark:text-slate-500">{subtitle}</p>
        )}
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            trend >= 0 ? "text-emerald-500" : "text-red-500"
          }`}>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{Math.abs(trend)}% vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className = "", hover = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm ${
        hover ? "hover:-translate-y-0.5 hover:shadow-md transition-all duration-150 cursor-pointer" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
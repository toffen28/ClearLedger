"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useApp } from "@/store/AppContext";

export default function ProfitLossChart() {
  const { getDashboardData } = useApp();
  const data = getDashboardData().monthlyData;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm animate-fade-in">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Profit &amp; Loss</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Monthly overview for the last 6 months</p>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} barGap={8}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" darkStroke="#334E65" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#64748B' }} tickLine={false} axisLine={false} tickFormatter={(v) => `£${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              fontSize: '13px',
            }}
            formatter={(value: number) => [`£${value.toLocaleString()}`, '']}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
          <Bar dataKey="income" name="Income" fill="#0D9488" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
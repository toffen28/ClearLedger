"use client";

import { useState } from "react";
import { useApp } from "@/store/AppContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  DollarSign,
} from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  parseISO,
  startOfWeek,
  endOfWeek,
  getDay,
} from "date-fns";

type ViewRange = 30 | 60 | 90;

export default function CalendarPage() {
  const { transactions, invoices } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewRange, setViewRange] = useState<ViewRange>(30);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getDayEvents = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const income = transactions
      .filter(t => t.type === 'income' && t.date === dayStr)
      .reduce((s, t) => s + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === 'expense' && t.date === dayStr)
      .reduce((s, t) => s + t.amount, 0);
    const invoicesDue = invoices
      .filter(i => i.dueDate === dayStr && (i.status === 'sent' || i.status === 'overdue'))
      .reduce((s, i) => s + i.amount, 0);

    return { income, expenses, invoicesDue };
  };

  const prevMonth = () => setCurrentDate(d => subMonths(d, 1));
  const nextMonth = () => setCurrentDate(d => addMonths(d, 1));

  // Cashflow summary
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + viewRange);

  const projectedIncome = transactions
    .filter(t => {
      const d = parseISO(t.date);
      return t.type === 'income' && d >= today && d <= futureDate;
    })
    .reduce((s, t) => s + t.amount, 0);

  const projectedExpenses = transactions
    .filter(t => {
      const d = parseISO(t.date);
      return t.type === 'expense' && d >= today && d <= futureDate;
    })
    .reduce((s, t) => s + t.amount, 0);

  const upcomingInvoices = invoices
    .filter(i => {
      const d = parseISO(i.dueDate);
      return (i.status === 'sent' || i.status === 'overdue') && d >= today && d <= futureDate;
    })
    .reduce((s, i) => s + i.amount, 0);

  const formatCurrency = (n: number) => `£${n.toLocaleString('en-GB', { minimumFractionDigits: 0 })}`;

  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Cashflow Calendar</h1>
          <p className="text-slate-500 mt-1">See your projected income and expenses</p>
        </div>
        <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
          {([30, 60, 90] as ViewRange[]).map(r => (
            <button
              key={r}
              onClick={() => setViewRange(r)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewRange === r
                  ? "bg-teal-600 text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              {r} days
            </button>
          ))}
        </div>
      </div>

      {/* Cashflow Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <DollarSign size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Projected Income</p>
              <p className="text-xl font-bold font-mono text-emerald-600">{formatCurrency(projectedIncome)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <DollarSign size={20} className="text-red-600" style={{ transform: 'rotate(180deg)' }} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Projected Expenses</p>
              <p className="text-xl font-bold font-mono text-red-600">{formatCurrency(projectedExpenses)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <CalendarIcon size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Invoice Payments Due</p>
              <p className="text-xl font-bold font-mono text-amber-600">{formatCurrency(upcomingInvoices)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Calendar */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map(d => (
            <div key={d} className="text-center text-xs font-semibold text-slate-400 dark:text-slate-500 py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            const events = getDayEvents(day);
            const hasEvents = events.income > 0 || events.expenses > 0 || events.invoicesDue > 0;
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={idx}
                className={`min-h-[80px] p-2 rounded-lg border transition-colors ${
                  isCurrentMonth
                    ? "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700"
                    : "bg-slate-50 dark:bg-slate-800/30 border-transparent opacity-50"
                } ${isToday ? "ring-2 ring-teal-500 ring-offset-2" : ""}`}
              >
                <div className={`text-xs font-medium mb-1 ${isToday ? "text-teal-600" : isCurrentMonth ? "text-slate-700 dark:text-slate-300" : "text-slate-400"}`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-0.5">
                  {events.income > 0 && (
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-mono text-emerald-600 truncate">{formatCurrency(events.income)}</span>
                    </div>
                  )}
                  {events.expenses > 0 && (
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      <span className="text-[10px] font-mono text-red-600 truncate">{formatCurrency(events.expenses)}</span>
                    </div>
                  )}
                  {events.invoicesDue > 0 && (
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span className="text-[10px] font-mono text-amber-600 truncate">INV {formatCurrency(events.invoicesDue)}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
          {[
            { color: "bg-emerald-500", label: "Income received" },
            { color: "bg-red-500", label: "Expense paid" },
            { color: "bg-amber-500", label: "Invoice due" },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
              <span className="text-xs text-slate-500">{l.label}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
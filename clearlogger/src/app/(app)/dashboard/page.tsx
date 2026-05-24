"use client";

import { useApp } from "@/store/AppContext";
import KPICard from "@/components/dashboard/KPICard";
import ProfitLossChart from "@/components/dashboard/ProfitLossChart";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
  ArrowUpCircle,
  DollarSign,
  PiggyBank,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  X,
} from "lucide-react";
import Link from "next/link";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  paid: { label: "Paid", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  sent: { label: "Sent", color: "bg-blue-100 text-blue-700", icon: Clock },
  overdue: { label: "Overdue", color: "bg-amber-100 text-amber-700", icon: AlertCircle },
  draft: { label: "Draft", color: "bg-slate-100 text-slate-600", icon: FileText },
  cancelled: { label: "Cancelled", color: "bg-slate-100 text-slate-400", icon: X },
};

export default function DashboardPage() {
  const { getDashboardData, invoices } = useApp();
  const data = getDashboardData();

  const formatCurrency = (n: number) => `£${n.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Here's how your business is performing</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/income">
            <Button variant="secondary" size="md">
              <Plus size={16} />
              Add Income
            </Button>
          </Link>
          <Link href="/invoices/new">
            <Button variant="primary" size="md">
              <Plus size={16} />
              New Invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Net Profit This Month"
          value={formatCurrency(data.netProfitThisMonth)}
          subtitle="After all expenses"
          trend={12}
          accentColor="text-teal-600 dark:text-teal-400"
          icon={<TrendingUp size={20} />}
        />
        <KPICard
          title="Outstanding Invoices"
          value={formatCurrency(data.outstandingInvoices)}
          subtitle={`${data.outstandingInvoicesList.length} unpaid invoice${data.outstandingInvoicesList.length !== 1 ? 's' : ''}`}
          accentColor="text-amber-600 dark:text-amber-400"
          icon={<DollarSign size={20} />}
        />
        <KPICard
          title="Tax to Set Aside"
          value={formatCurrency(data.taxToSetAside)}
          subtitle="20% of income (UK estimate)"
          accentColor="text-blue-600 dark:text-blue-400"
          icon={<PiggyBank size={20} />}
        />
        <KPICard
          title="Biggest Expense"
          value={data.biggestExpenseCategory}
          subtitle="This month"
          accentColor="text-slate-600 dark:text-slate-400"
          icon={<ArrowUpCircle size={20} />}
        />
      </div>

      {/* Charts + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2">
          <ProfitLossChart />
        </div>

        {/* Quick stats */}
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">Invoice Status</h3>
            <div className="space-y-3">
              {[
                { label: "Paid this month", value: invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0), color: "bg-emerald-500" },
                { label: "Sent & awaiting", value: invoices.filter(i => i.status === 'sent').reduce((s, i) => s + i.amount, 0), color: "bg-blue-500" },
                { label: "Overdue", value: invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0), color: "bg-amber-500" },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${s.color}`} />
                    <span className="text-sm text-slate-600 dark:text-slate-300">{s.label}</span>
                  </div>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">{formatCurrency(s.value)}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/invoices" className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">View all invoices</span>
                <ArrowUpRight size={16} className="text-slate-400" />
              </Link>
              <Link href="/clients" className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Manage clients</span>
                <ArrowUpRight size={16} className="text-slate-400" />
              </Link>
              <Link href="/calendar" className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Cashflow calendar</span>
                <ArrowUpRight size={16} className="text-slate-400" />
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Transactions + Outstanding Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Transactions</h3>
            <Link href="/income" className="text-sm text-teal-600 dark:text-teal-400 font-medium hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {data.recentTransactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {t.type === 'income' ? <ArrowUpCircle size={18} /> : <ArrowUpCircle size={18} style={{ transform: 'rotate(180deg)' }} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{t.description}</p>
                    <p className="text-xs text-slate-500">{t.category} · {formatDate(t.date)}</p>
                  </div>
                </div>
                <span className={`font-mono font-semibold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Outstanding Invoices */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Outstanding Invoices</h3>
            <Link href="/invoices" className="text-sm text-teal-600 dark:text-teal-400 font-medium hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {data.outstandingInvoicesList.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle size={32} className="text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">All invoices are paid!</p>
              </div>
            ) : (
              data.outstandingInvoicesList.map((inv) => {
                const config = STATUS_CONFIG[inv.status] || STATUS_CONFIG.draft;
                const StatusIcon = config.icon;
                return (
                  <div key={inv.id} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                        <FileText size={18} className="text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{inv.clientName}</p>
                        <p className="text-xs text-slate-500">{inv.invoiceNumber} · Due {formatDate(inv.dueDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                        <StatusIcon size={12} />
                        {config.label}
                      </span>
                      <span className="font-mono font-semibold text-slate-900 dark:text-white">{formatCurrency(inv.amount)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

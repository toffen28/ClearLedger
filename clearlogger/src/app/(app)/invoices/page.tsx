"use client";

import { useState } from "react";
import { useApp } from "@/store/AppContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";
import {
  Plus,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Send,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import type { Invoice, InvoiceStatus } from "@/types";

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; color: string; bg: string; icon: any }> = {
  paid: { label: "Paid", color: "text-emerald-700", bg: "bg-emerald-100", icon: CheckCircle },
  sent: { label: "Sent", color: "text-blue-700", bg: "bg-blue-100", icon: Clock },
  overdue: { label: "Overdue", color: "text-amber-700", bg: "bg-amber-100", icon: AlertCircle },
  draft: { label: "Draft", color: "text-slate-600", bg: "bg-slate-100", icon: FileText },
  cancelled: { label: "Cancelled", color: "text-slate-500", bg: "bg-slate-100", icon: X },
};

export default function InvoicesPage() {
  const { invoices, updateInvoice, deleteInvoice } = useApp();
  const [filter, setFilter] = useState<InvoiceStatus | "all">("all");

  const filtered = filter === "all" ? invoices : invoices.filter(i => i.status === filter);
  const totalOutstanding = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + i.amount, 0);

  const formatCurrency = (n: number) => `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`;
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const handleMarkPaid = (inv: Invoice) => {
    updateInvoice(inv.id, { ...inv, status: 'paid', paidAt: new Date().toISOString().split('T')[0] });
  };

  const handleSendReminder = (inv: Invoice) => {
    alert(`Reminder sent to ${inv.clientEmail} for invoice ${inv.invoiceNumber}`);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this invoice?")) deleteInvoice(id);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Invoices</h1>
          <p className="text-slate-500 mt-1">Create, send, and track your invoices</p>
        </div>
        <Link href="/invoices/new">
          <Button variant="primary"><Plus size={16} /> New Invoice</Button>
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-sm text-slate-500 mb-1">Outstanding</p>
          <p className="text-2xl font-bold font-mono text-amber-600">{formatCurrency(totalOutstanding)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 mb-1">Total Invoices</p>
          <p className="text-2xl font-bold font-mono text-slate-700 dark:text-slate-200">{invoices.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500 mb-1">Paid This Month</p>
          <p className="text-2xl font-bold font-mono text-emerald-600">
            {formatCurrency(invoices.filter(i => i.status === 'paid' && i.paidAt && i.paidAt.startsWith(new Date().toISOString().slice(0, 7))).reduce((s, i) => s + i.amount, 0))}
          </p>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["all", "draft", "sent", "paid", "overdue", "cancelled"] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === s
                ? "bg-teal-600 text-white"
                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            {s !== 'all' && (
              <span className="ml-2 text-xs opacity-70">({invoices.filter(i => i.status === s).length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Invoice List */}
      <Card className="overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No invoices found</p>
              <Link href="/invoices/new">
                <Button variant="primary" size="sm" className="mt-4"><Plus size={14} /> Create your first invoice</Button>
              </Link>
            </div>
          ) : (
            filtered.map((inv) => {
              const config = STATUS_CONFIG[inv.status];
              const StatusIcon = config.icon;
              return (
                <div key={inv.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                        <FileText size={20} className="text-slate-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-900 dark:text-white">{inv.invoiceNumber}</p>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                            <StatusIcon size={10} />
                            {config.label}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">{inv.clientName} · Due {formatDate(inv.dueDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-mono font-semibold text-slate-900 dark:text-white">{formatCurrency(inv.amount)}</p>
                        <p className="text-xs text-slate-400">{inv.items.length} item{inv.items.length !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {inv.status !== 'paid' && (
                          <button onClick={() => handleMarkPaid(inv)} className="p-2 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600" title="Mark as paid">
                            <CheckCircle size={16} />
                          </button>
                        )}
                        {inv.status === 'sent' || inv.status === 'overdue' ? (
                          <button onClick={() => handleSendReminder(inv)} className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600" title="Send reminder">
                            <Send size={16} />
                          </button>
                        ) : null}
                        <button onClick={() => handleDelete(inv.id)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
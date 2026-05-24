"use client";

import { useState } from "react";
import { useApp } from "@/store/AppContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Plus, ArrowDownCircle, Pencil, Trash2, Search, X, Upload } from "lucide-react";
import type { Transaction } from "@/types";
import CSVImportModal from "@/components/import/CSVImportModal";

const EXPENSE_CATEGORIES = ["Software & Tools", "Office & Supplies", "Travel", "Marketing", "Professional Services", "Equipment", "Other Expenses"];

export default function ExpensesPage() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  const filtered = expenseTransactions.filter(t => {
    const matchSearch = t.description.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !filter || t.category === filter;
    return matchSearch && matchCategory;
  });
  const total = expenseTransactions.reduce((s, t) => s + t.amount, 0);

  const [form, setForm] = useState({ description: "", category: "Software & Tools", amount: "", date: new Date().toISOString().split('T')[0], notes: "" });

  const resetForm = () => { setForm({ description: "", category: "Software & Tools", amount: "", date: new Date().toISOString().split('T')[0], notes: "" }); setShowAdd(false); setEditingId(null); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!form.description || isNaN(amount)) return;
    if (editingId) {
      const existing = transactions.find(t => t.id === editingId)!;
      updateTransaction(editingId, { ...existing, description: form.description, category: form.category, amount, date: form.date, notes: form.notes });
    } else {
      addTransaction({ id: `t-${Date.now()}`, type: 'expense', description: form.description, category: form.category, amount, date: form.date, notes: form.notes });
    }
    resetForm();
  };

  const handleEdit = (t: Transaction) => { setForm({ description: t.description, category: t.category, amount: t.amount.toString(), date: t.date, notes: t.notes || "" }); setEditingId(t.id); setShowAdd(true); };
  const handleDelete = (id: string) => { if (confirm("Delete this transaction?")) deleteTransaction(id); };

  const formatCurrency = (n: number) => `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`;
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Expenses</h1>
          <p className="text-slate-500 mt-1">Keep track of your business costs and outgoings</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => setShowImport(true)}><Upload size={16} /> Import CSV</Button>
          <Button variant="primary" onClick={() => setShowAdd(true)}><Plus size={16} /> Add Expense</Button>
        </div>
      </div>

      {/* Summary */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
              <ArrowDownCircle size={24} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Expenses</p>
              <p className="text-2xl font-bold font-mono text-red-600">{formatCurrency(total)}</p>
            </div>
          </div>
          <p className="text-sm text-slate-500">{expenseTransactions.length} transaction{expenseTransactions.length !== 1 ? 's' : ''}</p>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search expenses..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm">
          <option value="">All categories</option>
          {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Add/Edit Form */}
      {showAdd && (
        <Card className="p-6 border-2 border-teal-200 dark:border-teal-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white">{editingId ? "Edit Expense" : "Add New Expense"}</h3>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Description" placeholder="What did you pay for?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                  {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <Input label="Amount (£)" type="number" step="0.01" placeholder="0.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
              <Input label="Date" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
            </div>
            <Input label="Notes (optional)" placeholder="Any additional details..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" variant="primary">{editingId ? "Update" : "Add Expense"}</Button>
              <Button type="button" variant="ghost" onClick={resetForm}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Transaction List */}
      <Card className="overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <ArrowDownCircle size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No expense transactions yet</p>
              <p className="text-sm text-slate-400 mt-1">Click "Add Expense" to log your first cost</p>
            </div>
          ) : (
            filtered.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                    <ArrowDownCircle size={20} className="text-red-600" style={{ transform: 'rotate(180deg)' }} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{t.description}</p>
                    <p className="text-sm text-slate-500">{t.category} · {formatDate(t.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono font-semibold text-red-600">-{formatCurrency(t.amount)}</span>
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                    <button onClick={() => handleEdit(t)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(t.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {showImport && <CSVImportModal onClose={() => setShowImport(false)} />}
    </div>
  );
}
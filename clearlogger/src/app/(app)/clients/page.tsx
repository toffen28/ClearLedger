"use client";

import { useState } from "react";
import { useApp } from "@/store/AppContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Plus, Users, Mail, Phone, Building, Pencil, Trash2, X, DollarSign } from "lucide-react";
import type { Client } from "@/types";

export default function ClientsPage() {
  const { clients, invoices, addClient, updateClient, deleteClient } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", company: "", phone: "" });

  const resetForm = () => { setForm({ name: "", email: "", company: "", phone: "" }); setShowAdd(false); setEditingId(null); };

  const getOutstanding = (clientId: string) =>
    invoices.filter(i => (i.clientId === clientId) && (i.status === 'sent' || i.status === 'overdue')).reduce((s, i) => s + i.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    if (editingId) {
      updateClient(editingId, { id: editingId, ...form, createdAt: clients.find(c => c.id === editingId)?.createdAt || new Date().toISOString().split('T')[0] });
    } else {
      addClient({ id: `c-${Date.now()}`, ...form, createdAt: new Date().toISOString().split('T')[0] });
    }
    resetForm();
  };

  const handleEdit = (c: Client) => { setForm({ name: c.name, email: c.email, company: c.company || "", phone: c.phone || "" }); setEditingId(c.id); setShowAdd(true); };
  const handleDelete = (id: string) => { if (confirm("Delete this client?")) deleteClient(id); };

  const formatCurrency = (n: number) => `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Clients</h1>
          <p className="text-slate-500 mt-1">Manage your client relationships and billing history</p>
        </div>
        <Button variant="primary" onClick={() => setShowAdd(true)}><Plus size={16} /> Add Client</Button>
      </div>

      {/* Add/Edit Form */}
      {showAdd && (
        <Card className="p-6 border-2 border-teal-200 dark:border-teal-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white">{editingId ? "Edit Client" : "Add New Client"}</h3>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Name" placeholder="Sarah Mitchell" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              <Input label="Email" type="email" placeholder="sarah@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              <Input label="Company (optional)" placeholder="Mitchell Design Studio" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
              <Input label="Phone (optional)" placeholder="+44 7700 900123" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" variant="primary">{editingId ? "Update" : "Add Client"}</Button>
              <Button type="button" variant="ghost" onClick={resetForm}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Client Grid */}
      {clients.length === 0 ? (
        <Card className="p-12 text-center">
          <Users size={48} className="text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">No clients yet</p>
          <p className="text-sm text-slate-400 mt-1">Add your first client to start billing</p>
          <Button variant="primary" className="mt-4" onClick={() => setShowAdd(true)}><Plus size={14} /> Add Client</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map(c => {
            const outstanding = getOutstanding(c.id);
            const clientInvoices = invoices.filter(i => i.clientId === c.id);
            const totalBilled = clientInvoices.reduce((s, i) => s + i.amount, 0);
            return (
              <Card key={c.id} className="p-5 hover:-translate-y-0.5 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 font-bold text-lg">
                    {c.name.charAt(0)}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(c)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white text-lg mb-1">{c.name}</h3>
                {c.company && <p className="text-sm text-slate-500 flex items-center gap-1 mb-2"><Building size={12} /> {c.company}</p>}
                <div className="space-y-1 mb-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2"><Mail size={12} /> {c.email}</p>
                  {c.phone && <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2"><Phone size={12} /> {c.phone}</p>}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                  <div>
                    <p className="text-xs text-slate-500">Total billed</p>
                    <p className="font-mono font-semibold text-slate-900 dark:text-white">{formatCurrency(totalBilled)}</p>
                  </div>
                  {outstanding > 0 && (
                    <div className="text-right">
                      <p className="text-xs text-amber-600 font-medium">Outstanding</p>
                      <p className="font-mono font-bold text-amber-600">{formatCurrency(outstanding)}</p>
                    </div>
                  )}
                </div>
                {clientInvoices.length > 0 && (
                  <p className="text-xs text-slate-400 mt-2">{clientInvoices.length} invoice{clientInvoices.length !== 1 ? 's' : ''} · {clientInvoices.filter(i => i.status === 'paid').length} paid</p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/store/AppContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  FileText,
  Send,
  CheckCircle,
  Users,
  Eye,
} from "lucide-react";
import type { InvoiceItem } from "@/types";

const STEPS = ["Client", "Line Items", "Details", "Review"];

export default function NewInvoicePage() {
  const router = useRouter();
  const { clients, addInvoice } = useApp();

  const [step, setStep] = useState(0);
  const [clientId, setClientId] = useState("");
  const [newClient, setNewClient] = useState({ name: "", email: "", company: "" });
  const [useNewClient, setUseNewClient] = useState(false);
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "i1", description: "", quantity: 1, rate: 0, amount: 0 },
  ]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState("");
  const [sending, setSending] = useState(false);

  const selectedClient = useNewClient ? newClient : clients.find(c => c.id === clientId);

  const total = items.reduce((s, i) => s + i.amount, 0);
  const invoiceNumber = `CL-${String(Date.now()).slice(-4)}`;

  const handleAddItem = () => {
    setItems(prev => [...prev, { id: `i-${Date.now()}`, description: "", quantity: 1, rate: 0, amount: 0 }]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(prev => prev.map(i => {
      if (i.id !== id) return i;
      const updated = { ...i, [field]: value };
      if (field === 'quantity' || field === 'rate') {
        updated.amount = updated.quantity * updated.rate;
      }
      return updated;
    }));
  };

  const canProceed = () => {
    if (step === 0) return useNewClient ? (newClient.name && newClient.email) : !!clientId;
    if (step === 1) return items.every(i => i.description && i.amount > 0);
    if (step === 2) return !!dueDate;
    return true;
  };

  const handleSend = async () => {
    setSending(true);
    await new Promise(r => setTimeout(r, 1000));
    const client = selectedClient!;
    addInvoice({
      id: `inv-${Date.now()}`,
      invoiceNumber,
      clientId: ('id' in client ? (client as {id: string}).id : undefined) || "new",
      clientName: client.name,
      clientEmail: client.email,
      items,
      status: 'sent',
      amount: total,
      dueDate,
      sentAt: new Date().toISOString().split('T')[0],
      notes,
    });
    setSending(false);
    router.push("/invoices");
  };

  const formatCurrency = (n: number) => `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`;
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/invoices">
          <Button variant="ghost" size="sm"><ChevronLeft size={16} /> Back</Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">New Invoice</h1>
          <p className="text-slate-500 text-sm">Create and send a professional invoice</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
              i <= step ? "bg-teal-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500"
            }`}>
              {i < step ? <CheckCircle size={16} /> : i + 1}
            </div>
            <span className={`text-sm font-medium hidden sm:block ${i <= step ? "text-slate-900 dark:text-white" : "text-slate-400"}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`w-8 h-0.5 ${i < step ? "bg-teal-600" : "bg-slate-200 dark:bg-slate-700"}`} />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className="p-8">
        {/* Step 0: Client */}
        {step === 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Who is this invoice for?</h2>
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setUseNewClient(false)}
                className={`flex-1 p-4 rounded-xl border-2 transition-colors ${!useNewClient ? "border-teal-500 bg-teal-50/50" : "border-slate-200 dark:border-slate-700"}`}
              >
                <Users size={24} className={`mb-2 ${!useNewClient ? "text-teal-600" : "text-slate-400"}`} />
                <p className="font-medium text-slate-900 dark:text-white">Existing Client</p>
                <p className="text-xs text-slate-500 mt-1">Select from your saved clients</p>
              </button>
              <button
                onClick={() => setUseNewClient(true)}
                className={`flex-1 p-4 rounded-xl border-2 transition-colors ${useNewClient ? "border-teal-500 bg-teal-50/50" : "border-slate-200 dark:border-slate-700"}`}
              >
                <Plus size={24} className={`mb-2 ${useNewClient ? "text-teal-600" : "text-slate-400"}`} />
                <p className="font-medium text-slate-900 dark:text-white">New Client</p>
                <p className="text-xs text-slate-500 mt-1">Enter details for a new client</p>
              </button>
            </div>

            {!useNewClient ? (
              <div className="space-y-2">
                {clients.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setClientId(c.id)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-colors ${
                      clientId === c.id ? "border-teal-500 bg-teal-50/50" : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <p className="font-medium text-slate-900 dark:text-white">{c.name}</p>
                    <p className="text-sm text-slate-500">{c.email} {c.company ? `· ${c.company}` : ''}</p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <Input label="Client Name" placeholder="Sarah Mitchell" value={newClient.name} onChange={e => setNewClient(c => ({ ...c, name: e.target.value }))} required />
                <Input label="Email" type="email" placeholder="sarah@example.com" value={newClient.email} onChange={e => setNewClient(c => ({ ...c, email: e.target.value }))} required />
                <Input label="Company (optional)" placeholder="Mitchell Design Studio" value={newClient.company} onChange={e => setNewClient(c => ({ ...c, company: e.target.value }))} />
              </div>
            )}
          </div>
        )}

        {/* Step 1: Line Items */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">What are you charging for?</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-3 text-sm font-medium text-slate-500 dark:text-slate-400 px-1">
                <div className="col-span-5">Description</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-2">Rate</div>
                <div className="col-span-2 text-right">Amount</div>
                <div className="col-span-1"></div>
              </div>
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-3 items-center">
                  <input
                    type="text"
                    placeholder="Design services"
                    value={item.description}
                    onChange={e => handleItemChange(item.id, 'description', e.target.value)}
                    className="col-span-5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <input
                    type="number"
                    placeholder="1"
                    value={item.quantity || ''}
                    onChange={e => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                    className="col-span-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <input
                    type="number"
                    placeholder="0.00"
                    value={item.rate || ''}
                    onChange={e => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
                    className="col-span-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <div className="col-span-2 text-right font-mono font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(item.amount)}
                  </div>
                  <button onClick={() => handleRemoveItem(item.id)} className="col-span-1 p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 flex justify-end">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" onClick={handleAddItem}><Plus size={14} /> Add Line Item</Button>
            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700">
              <div className="text-right">
                <p className="text-sm text-slate-500">Total</p>
                <p className="text-3xl font-bold font-mono text-slate-900 dark:text-white">{formatCurrency(total)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Invoice details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Invoice Number</p>
                  <p className="font-mono text-lg text-slate-900 dark:text-white">{invoiceNumber}</p>
                </div>
                <Input label="Due Date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes (optional)</label>
                <textarea
                  placeholder="Payment terms, thank you message, etc."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Review & Send</h2>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Invoice</p>
                  <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{invoiceNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Total Due</p>
                  <p className="text-3xl font-bold font-mono text-teal-600">{formatCurrency(total)}</p>
                </div>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Bill To</p>
                <p className="font-semibold text-slate-900 dark:text-white">{selectedClient?.name}</p>
                <p className="text-sm text-slate-500">{selectedClient?.email}</p>
                {selectedClient?.company && <p className="text-sm text-slate-500">{selectedClient.company}</p>}
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Due Date</p>
                <p className="text-slate-900 dark:text-white">{formatDate(dueDate)}</p>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Items</p>
                {items.map(item => (
                  <div key={item.id} className="flex justify-between py-1">
                    <span className="text-slate-700 dark:text-slate-300">{item.description}</span>
                    <span className="font-mono text-slate-900 dark:text-white">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-700 mt-2">
                  <span className="font-semibold text-slate-900 dark:text-white">Total</span>
                  <span className="font-bold font-mono text-slate-900 dark:text-white">{formatCurrency(total)}</span>
                </div>
              </div>
              {notes && (
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Notes</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{notes}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-8 border-t border-slate-100 dark:border-slate-700 mt-8">
          <Button variant="ghost" onClick={() => step > 0 ? setStep(s => s - 1) : router.push('/invoices')}>
            <ChevronLeft size={16} /> {step > 0 ? "Back" : "Cancel"}
          </Button>
          {step < 3 ? (
            <Button variant="primary" onClick={() => setStep(s => s + 1)} disabled={!canProceed()}>
              Continue <ChevronRight size={16} />
            </Button>
          ) : (
            <Button variant="primary" onClick={handleSend} disabled={sending}>
              {sending ? "Sending..." : <><Send size={16} /> Send Invoice</>}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

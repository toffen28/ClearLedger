"use client";

import { useState, useRef, useCallback } from "react";
import { useApp } from "@/store/AppContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { X, Upload, FileSpreadsheet, Check, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import Papa from "papaparse";

interface ParsedRow {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  categoryLocked: boolean;
  isNew: boolean;
}

interface ColumnMapping {
  date: string;
  description: string;
  amount: string;
  credit?: string;
  debit?: string;
}

const EXPENSE_KEYWORDS: Record<string, string> = {
  'TFL': 'Travel', 'UBER': 'Travel', 'TAXI': 'Travel', 'LULOTR': 'Travel',
  'DELIVERY': 'Travel', 'AMAZON': 'Office & Supplies', 'AMZN': 'Office & Supplies',
  'EBAY': 'Office & Supplies', 'IKEA': 'Equipment', 'ARGOS': 'Equipment',
  'NETFLIX': 'Software & Tools', 'SPOTIFY': 'Software & Tools',
  'ADOBE': 'Software & Tools', 'FIGMA': 'Software & Tools',
  'NOTION': 'Software & Tools', 'GITHUB': 'Software & Tools',
  'MICROSOFT': 'Software & Tools', 'APPLE': 'Software & Tools',
  'GOOGLE': 'Software & Tools', 'SLACK': 'Software & Tools',
  'CANVA': 'Software & Tools', 'CHATGPT': 'Software & Tools', 'OPENAI': 'Software & Tools',
  'BARCLAY': 'Professional Services', 'MONZO': 'Other Expenses',
  'STELLAR': 'Other Expenses', 'STARDUST': 'Other Expenses',
  'GROCERY': 'Other Expenses', 'SAINSBURY': 'Other Expenses',
  'TESCO': 'Other Expenses', 'WAITROSE': 'Other Expenses',
  'MCDONALD': 'Other Expenses', 'STARBUCKS': 'Other Expenses',
  'COSTA': 'Other Expenses', 'RESTAURANT': 'Other Expenses',
  'CATERER': 'Other Expenses', 'BAR': 'Other Expenses',
  'PETROL': 'Travel', 'SHELL': 'Travel', 'BP': 'Travel',
  'HOTEL': 'Travel', 'AIRBNB': 'Travel', 'FLIGHT': 'Travel',
  'INSURANCE': 'Professional Services', 'SUBSCRIPTION': 'Software & Tools',
  'PHONE': 'Software & Tools', 'INTERNET': 'Software & Tools',
  'UTILITY': 'Other Expenses', 'ELECTRICITY': 'Other Expenses',
  'GAS': 'Other Expenses', 'WATER': 'Other Expenses',
  'RENT': 'Other Expenses', 'MORTGAGE': 'Other Expenses',
  'MARKETING': 'Marketing', 'FACEBOOK': 'Marketing', 'GOOGLE ADS': 'Marketing',
  'PAYPAL': 'Other Expenses', 'STRIPE': 'Other Expenses',
  'BANK CHARGE': 'Professional Services', 'FEE': 'Professional Services',
  'LEGAL': 'Professional Services', 'ACCOUNTANT': 'Professional Services',
  'SOFTWARE': 'Software & Tools', 'LICENSE': 'Software & Tools',
};

const INCOME_KEYWORDS: Record<string, string> = {
  'PAYMENT FROM': 'Freelance Work', 'PAYMENT REC': 'Freelance Work',
  'CLIENT PAYMENT': 'Freelance Work', 'INVOICE PAYMENT': 'Freelance Work',
  'TRANSFER FROM': 'Other Income', 'REFUND': 'Other Income',
  'INTEREST': 'Other Income', 'DIVIDEND': 'Other Income',
  'FREELANCE': 'Freelance Work', 'CONSULTING': 'Consulting',
  'AD HOC': 'Freelance Work', 'THANK YOU': 'Freelance Work',
};

const EXPENSE_CATEGORIES = ["Software & Tools", "Office & Supplies", "Travel", "Marketing", "Professional Services", "Equipment", "Other Expenses"];
const INCOME_CATEGORIES = ["Freelance Work", "Consulting", "Product Sales", "Royalties", "Other Income"];

const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

function autoCategorise(description: string, amount: number): { type: 'income' | 'expense'; category: string } {
  const upper = description.toUpperCase();
  const isPositive = amount > 0;

  if (isPositive) {
    for (const [keyword, category] of Object.entries(INCOME_KEYWORDS)) {
      if (upper.includes(keyword)) return { type: 'income', category };
    }
    return { type: 'income', category: 'Other Income' };
  }

  for (const [keyword, category] of Object.entries(EXPENSE_KEYWORDS)) {
    if (upper.includes(keyword)) return { type: 'expense', category };
  }
  return { type: 'expense', category: 'Other Expenses' };
}

function detectColumns(headers: string[]): ColumnMapping {
  const lower = headers.map(h => h.toLowerCase().trim());
  const mapping: ColumnMapping = { date: '', description: '', amount: '' };

  const datePatterns = ['date', 'transaction date', 'posting date', 'trans date'];
  const descPatterns = ['description', 'details', 'narrative', 'particulars', 'reference', 'merchant', 'transaction'];
  const amountPatterns = ['amount', 'value', 'sum', 'total'];
  const creditPatterns = ['credit', 'money in', 'incoming', 'deposit', 'cr'];
  const debitPatterns = ['debit', 'money out', 'outgoing', 'withdrawal', 'dr'];

  lower.forEach((col, i) => {
    const actual = headers[i];
    if (datePatterns.some(p => col.includes(p))) mapping.date = actual;
    if (descPatterns.some(p => col.includes(p))) mapping.description = actual;
    if (creditPatterns.some(p => col.includes(p))) mapping.credit = actual;
    if (debitPatterns.some(p => col.includes(p))) mapping.debit = actual;
    if (amountPatterns.some(p => col.includes(p)) && !mapping.credit && !mapping.debit) mapping.amount = actual;
  });

  return mapping;
}

function parseAmount(raw: string): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[^0-9.\-()]/g, '');
  const isParen = cleaned.includes('(');
  const num = parseFloat(cleaned.replace(/[()]/g, ''));
  if (isNaN(num)) return 0;
  return isParen ? -Math.abs(num) : num;
}

function parseDate(raw: string): string {
  if (!raw) return new Date().toISOString().split('T')[0];
  try {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    const parts = raw.split(/[\/\-]/);
    if (parts.length === 3) {
      const [a, b, c] = parts.map(Number);
      if (a > 31) return `${a}-${String(b).padStart(2,'0')}-${String(c).padStart(2,'0')}`;
      if (c > 31) return `${c}-${String(b).padStart(2,'0')}-${String(a).padStart(2,'0')}`;
      return `${b}-${String(a).padStart(2,'0')}-${String(c).padStart(2,'0')}`;
    }
  } catch {}
  return new Date().toISOString().split('T')[0];
}

interface CSVImportModalProps {
  onClose: () => void;
}

export default function CSVImportModal({ onClose }: CSVImportModalProps) {
  const { addTransaction } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'done'>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({ date: '', description: '', amount: '' });
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const handleFile = useCallback((file: File) => {
    setError('');
    Papa.parse(file, {
      complete: (results) => {
        const data = results.data as string[][];
        if (data.length < 2) { setError('CSV file is empty or has no data rows.'); return; }
        const headers = data[0];
        const rows = data.slice(1).filter(r => r.some(c => c.trim()));
        setRawHeaders(headers);
        setRawRows(rows);
        const detected = detectColumns(headers);
        setMapping(detected);
        setStep('mapping');
      },
      error: () => setError('Failed to parse CSV file. Please check the format.'),
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) handleFile(file);
    else setError('Please upload a .csv file');
  }, [handleFile]);

  const handleMappingApply = () => {
    if (!mapping.date || !mapping.description || (!mapping.amount && !mapping.credit && !mapping.debit)) {
      setError('Please map all required columns: Date, Description, and Amount (or Credit/Debit).');
      return;
    }
    setError('');

    const dateIdx = rawHeaders.indexOf(mapping.date);
    const descIdx = rawHeaders.indexOf(mapping.description);
    const creditIdx = mapping.credit ? rawHeaders.indexOf(mapping.credit) : -1;
    const debitIdx = mapping.debit ? rawHeaders.indexOf(mapping.debit) : -1;
    const amountIdx = mapping.amount ? rawHeaders.indexOf(mapping.amount) : -1;

    const parsed: ParsedRow[] = rawRows.map((row, i) => {
      const description = row[descIdx]?.trim() || '';
      let amount = 0;

      if (amountIdx >= 0) {
        amount = parseAmount(row[amountIdx]);
      } else {
        const credit = creditIdx >= 0 ? parseAmount(row[creditIdx]) : 0;
        const debit = debitIdx >= 0 ? parseAmount(row[debitIdx]) : 0;
        amount = credit - Math.abs(debit);
      }

      const { type, category } = autoCategorise(description, amount);
      return {
        id: `import-${i}-${Date.now()}`,
        date: parseDate(row[dateIdx]),
        description,
        amount: Math.abs(amount),
        type,
        category,
        categoryLocked: false,
        isNew: true,
      };
    }).filter(r => r.description && r.amount !== 0);

    setParsedRows(parsed);
    setStep('preview');
  };

  const toggleCategory = (id: string) => {
    setParsedRows(prev => prev.map(r => {
      if (r.id !== id) return r;
      const newType = r.type === 'income' ? 'expense' : 'income';
      return { ...r, type: newType, category: newType === 'income' ? 'Other Income' : 'Other Expenses', categoryLocked: false };
    }));
  };

  const setCategory = (id: string, category: string) => {
    setParsedRows(prev => prev.map(r => r.id === id ? { ...r, category, categoryLocked: true } : r));
  };

  const toggleRow = (id: string) => {
    setParsedRows(prev => prev.map(r => r.id === id ? { ...r, isNew: !r.isNew } : r));
  };

  const toggleAll = (selected: boolean) => {
    setParsedRows(prev => prev.map(r => ({ ...r, isNew: selected })));
  };

  const handleImport = async () => {
    setImporting(true);
    const toImport = parsedRows.filter(r => r.isNew);
    for (const row of toImport) {
      addTransaction({
        id: `t-${Date.now()}-${row.id}`,
        type: row.type,
        amount: row.amount,
        category: row.category,
        description: row.description,
        date: row.date,
        notes: 'Imported from CSV',
      });
      await new Promise(r => setTimeout(r, 20));
    }
    setImporting(false);
    setStep('done');
  };

  const incomeCount = parsedRows.filter(r => r.type === 'income').length;
  const expenseCount = parsedRows.filter(r => r.type === 'expense').length;
  const totalIncome = parsedRows.filter(r => r.type === 'income' && r.isNew).reduce((s, r) => s + r.amount, 0);
  const totalExpense = parsedRows.filter(r => r.type === 'expense' && r.isNew).reduce((s, r) => s + r.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Import Bank CSV</h2>
            <p className="text-sm text-slate-500">
              {step === 'upload' && 'Upload your bank statement to bulk-import transactions'}
              {step === 'mapping' && 'Map your CSV columns to the right fields'}
              {step === 'preview' && 'Review and categorise transactions before importing'}
              {step === 'done' && 'Import complete!'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"><X size={20} /></button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
          {['upload', 'mapping', 'preview'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === s ? 'bg-teal-600 text-white' : (['mapping', 'preview', 'done'].includes(step) && i < ['upload', 'mapping', 'preview'].indexOf(step)) ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                {i + 1}
              </div>
              <span className={`text-sm font-medium ${step === s ? 'text-teal-600' : 'text-slate-400'}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
              {i < 2 && <div className={`w-8 h-0.5 ${i < ['upload', 'mapping', 'preview'].indexOf(step) ? 'bg-teal-600' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* STEP 1: Upload */}
          {step === 'upload' && (
            <div className="space-y-4">
              <div
                onDrop={handleDrop}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors ${dragOver ? 'border-teal-500 bg-teal-50' : 'border-slate-200 dark:border-slate-700 hover:border-teal-300'}`}
              >
                <FileSpreadsheet size={48} className="mx-auto mb-4 text-slate-400" />
                <p className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">Drop your CSV file here</p>
                <p className="text-sm text-slate-500 mb-4">or click to browse your files</p>
                <Button variant="secondary" size="sm"><Upload size={14} /> Choose File</Button>
                <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/50">
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-semibold mb-1">Supported formats</p>
                    <p>Most UK bank CSV exports are supported — including Barclays, Lloyds, NatWest, Monzo, Starling, and Revolut. Upload a bank statement that includes transaction dates, descriptions, and amounts.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Column Mapping */}
          {step === 'mapping' && (
            <div className="space-y-6">
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-100 dark:border-amber-800/50">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  <span className="font-semibold">Auto-detected columns:</span> We found {rawRows.length} transaction rows. Please confirm or correct the column mapping below.
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(['date', 'description', 'amount', 'credit', 'debit'] as const).map((field) => (
                  <div key={field} className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                      {field === 'amount' ? 'Amount Column' : field === 'credit' ? 'Credit Column (optional)' : field === 'debit' ? 'Debit Column (optional)' : field.charAt(0).toUpperCase() + field.slice(1) + ' Column'}
                    </label>
                    <select
                      value={mapping[field] || ''}
                      onChange={e => setMapping(m => ({ ...m, [field]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                    >
                      <option value="">— Not mapped —</option>
                      {rawHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              {rawRows.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Preview (first 3 rows)</p>
                  <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50">
                          {rawHeaders.map((h, i) => i < 6 && <th key={i} className="px-3 py-2 text-left text-xs font-semibold text-slate-500">{h}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {rawRows.slice(0, 3).map((row, ri) => (
                          <tr key={ri} className="border-t border-slate-100 dark:border-slate-700">
                            {row.map((cell, ci) => ci < 6 && <td key={ci} className="px-3 py-2 text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{cell}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          )}

          {/* STEP 3: Preview */}
          {step === 'preview' && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 text-center border border-emerald-100 dark:border-emerald-800/30">
                  <p className="text-xs text-emerald-600 font-medium mb-1">Income</p>
                  <p className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-300">£{totalIncome.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</p>
                  <p className="text-xs text-emerald-500">{incomeCount} item{incomeCount !== 1 ? 's' : ''}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center border border-red-100 dark:border-red-800/30">
                  <p className="text-xs text-red-600 font-medium mb-1">Expenses</p>
                  <p className="text-lg font-bold font-mono text-red-700 dark:text-red-300">£{totalExpense.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</p>
                  <p className="text-xs text-red-500">{expenseCount} item{expenseCount !== 1 ? 's' : ''}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500 font-medium mb-1">Selected</p>
                  <p className="text-lg font-bold font-mono text-slate-700 dark:text-slate-200">{parsedRows.filter(r => r.isNew).length}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-500 font-medium mb-1">Auto-categorised</p>
                  <p className="text-lg font-bold font-mono text-slate-700 dark:text-slate-200">{parsedRows.filter(r => !r.categoryLocked).length}</p>
                </div>
              </div>

              {/* Select all */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <input type="checkbox" checked={parsedRows.every(r => r.isNew)} onChange={e => toggleAll(e.target.checked)} className="rounded border-slate-300" />
                    Select all ({parsedRows.filter(r => r.isNew).length} of {parsedRows.length})
                  </label>
                </div>
                <p className="text-xs text-slate-400">Click any row to toggle selection · Click category to change</p>
              </div>

              {/* Transaction list */}
              <div className="overflow-y-auto max-h-[400px] rounded-lg border border-slate-200 dark:border-slate-700">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="w-8 px-3 py-2"></th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500">Date</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500">Description</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500">Type</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500">Category</th>
                      <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.map((row) => (
                      <tr key={row.id} className={`border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer ${!row.isNew ? 'opacity-40' : ''}`} onClick={() => toggleRow(row.id)}>
                        <td className="px-3 py-2">
                          <input type="checkbox" checked={row.isNew} onChange={() => toggleRow(row.id)} className="rounded border-slate-300" onClick={e => e.stopPropagation()} />
                        </td>
                        <td className="px-3 py-2 text-slate-600 dark:text-slate-300 font-mono text-xs">{new Date(row.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
                        <td className="px-3 py-2 text-slate-900 dark:text-slate-100 max-w-[200px] truncate">{row.description}</td>
                        <td className="px-3 py-2">
                          <button onClick={(e) => { e.stopPropagation(); toggleCategory(row.id); }} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${row.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {row.type === 'income' ? '↑ Income' : '↓ Expense'}
                          </button>
                        </td>
                        <td className="px-3 py-2" onClick={e => e.stopPropagation()}>
                          <select
                            value={row.category}
                            onChange={e => setCategory(row.id, e.target.value)}
                            className={`px-2 py-1 rounded-lg text-xs border-0 ring-1 ring-slate-200 dark:ring-slate-600 ${row.categoryLocked ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'}`}
                          >
                            <optgroup label="Income">
                              {INCOME_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </optgroup>
                            <optgroup label="Expenses">
                              {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </optgroup>
                          </select>
                        </td>
                        <td className={`px-3 py-2 text-right font-mono font-semibold ${row.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {row.type === 'income' ? '+' : '-'}{`£${row.amount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 4: Done */}
          {step === 'done' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Import Successful!</h3>
              <p className="text-slate-500 mb-6">{parsedRows.filter(r => r.isNew).length} transactions have been added to your account.</p>
              <Button variant="primary" onClick={onClose}>Done</Button>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== 'done' && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div />
            <div className="flex items-center gap-3">
              {step === 'mapping' && <Button variant="ghost" onClick={() => setStep('upload')}>Back</Button>}
              {step === 'preview' && <Button variant="ghost" onClick={() => setStep('mapping')}>Back</Button>}
              {step === 'upload' && <Button variant="ghost" onClick={onClose}>Cancel</Button>}
              {step === 'mapping' && <Button variant="primary" disabled={!mapping.date || !mapping.description || (!mapping.amount && !mapping.credit && !mapping.debit)} onClick={handleMappingApply}>Continue <ChevronDown size={14} /></Button>}
              {step === 'preview' && <Button variant="primary" disabled={importing || parsedRows.filter(r => r.isNew).length === 0} onClick={handleImport}>
                {importing ? 'Importing...' : `Import ${parsedRows.filter(r => r.isNew).length} Transaction${parsedRows.filter(r => r.isNew).length !== 1 ? 's' : ''}`}
              </Button>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
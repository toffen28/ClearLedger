"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { User, Transaction, Invoice, Client, Category, DashboardData } from "@/types";

interface AppState {
  user: User | null;
  transactions: Transaction[];
  invoices: Invoice[];
  clients: Client[];
  categories: Category[];
  isDarkMode: boolean;
  isSidebarCollapsed: boolean;
}

interface AppContextType extends AppState {
  setUser: (user: User | null) => void;
  addTransaction: (t: Transaction) => void;
  updateTransaction: (id: string, t: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addInvoice: (inv: Invoice) => void;
  updateInvoice: (id: string, inv: Invoice) => void;
  deleteInvoice: (id: string) => void;
  addClient: (c: Client) => void;
  updateClient: (id: string, c: Client) => void;
  deleteClient: (id: string) => void;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  getDashboardData: () => DashboardData;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_CATEGORIES: Category[] = [
  { id: "1", name: "Freelance Work", type: "income", icon: "💼" },
  { id: "2", name: "Consulting", type: "income", icon: "📊" },
  { id: "3", name: "Product Sales", type: "income", icon: "🛒" },
  { id: "4", name: "Royalties", type: "income", icon: "🎵" },
  { id: "5", name: "Other Income", type: "income", icon: "💰" },
  { id: "6", name: "Software & Tools", type: "expense", icon: "💻" },
  { id: "7", name: "Office & Supplies", type: "expense", icon: "📎" },
  { id: "8", name: "Travel", type: "expense", icon: "✈️" },
  { id: "9", name: "Marketing", type: "expense", icon: "📣" },
  { id: "10", name: "Professional Services", type: "expense", icon: "👔" },
  { id: "11", name: "Equipment", type: "expense", icon: "🔧" },
  { id: "12", name: "Other Expenses", type: "expense", icon: "📦" },
];

const SAMPLE_INVOICES: Invoice[] = [
  {
    id: "inv-1",
    invoiceNumber: "CL-0001",
    clientId: "c-1",
    clientName: "Sarah Mitchell",
    clientEmail: "sarah@designstudio.co.uk",
    items: [
      { id: "i1", description: "Brand identity redesign", quantity: 1, rate: 2500, amount: 2500 },
      { id: "i2", description: "Logo design", quantity: 1, rate: 800, amount: 800 },
    ],
    status: "sent",
    amount: 3300,
    dueDate: "2024-07-15",
    sentAt: "2024-06-28",
  },
  {
    id: "inv-2",
    invoiceNumber: "CL-0002",
    clientId: "c-2",
    clientName: "James Wright",
    clientEmail: "james@techstartup.io",
    items: [
      { id: "i3", description: "Website development", quantity: 40, rate: 95, amount: 3800 },
    ],
    status: "paid",
    amount: 3800,
    dueDate: "2024-06-20",
    sentAt: "2024-06-01",
    paidAt: "2024-06-18",
  },
  {
    id: "inv-3",
    invoiceNumber: "CL-0003",
    clientId: "c-3",
    clientName: "Emma Davies",
    clientEmail: "emma@creativeagency.com",
    items: [
      { id: "i4", description: "Photography services", quantity: 1, rate: 1200, amount: 1200 },
      { id: "i5", description: "Photo editing", quantity: 8, rate: 75, amount: 600 },
    ],
    status: "overdue",
    amount: 1800,
    dueDate: "2024-06-01",
    sentAt: "2024-05-15",
  },
];

const SAMPLE_TRANSACTIONS: Transaction[] = [
  { id: "t1", type: "income", amount: 3300, category: "Freelance Work", description: "Brand identity project", date: "2024-06-28", notes: "Phase 1 complete" },
  { id: "t2", type: "expense", amount: 49.99, category: "Software & Tools", description: "Figma subscription", date: "2024-06-25", notes: "Monthly" },
  { id: "t3", type: "income", amount: 3800, category: "Consulting", description: "Tech startup consulting", date: "2024-06-18", notes: "Completed" },
  { id: "t4", type: "expense", amount: 180, category: "Office & Supplies", description: "Standing desk mat", date: "2024-06-15" },
  { id: "t5", type: "expense", amount: 89, category: "Software & Tools", description: "Notion annual plan", date: "2024-06-10" },
  { id: "t6", type: "income", amount: 1200, category: "Freelance Work", description: "Photography project", date: "2024-06-05" },
  { id: "t7", type: "expense", amount: 35, category: "Travel", description: "Tube fares", date: "2024-06-01" },
  { id: "t8", type: "income", amount: 600, category: "Freelance Work", description: "Photo editing work", date: "2024-05-28" },
  { id: "t9", type: "expense", amount: 2200, category: "Equipment", description: "New MacBook charger", date: "2024-05-22" },
  { id: "t10", type: "income", amount: 800, category: "Consulting", description: "Strategy session", date: "2024-05-20" },
];

const SAMPLE_CLIENTS: Client[] = [
  { id: "c-1", name: "Sarah Mitchell", email: "sarah@designstudio.co.uk", company: "Mitchell Design Studio", phone: "+44 7700 900123", createdAt: "2024-04-10" },
  { id: "c-2", name: "James Wright", email: "james@techstartup.io", company: "TechStartup Ltd", phone: "+44 7700 900456", createdAt: "2024-03-15" },
  { id: "c-3", name: "Emma Davies", email: "emma@creativeagency.com", company: "Creative Agency Co", phone: "+44 7700 900789", createdAt: "2024-05-01" },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    user: null,
    transactions: SAMPLE_TRANSACTIONS,
    invoices: SAMPLE_INVOICES,
    clients: SAMPLE_CLIENTS,
    categories: DEFAULT_CATEGORIES,
    isDarkMode: false,
    isSidebarCollapsed: false,
  });

  const setUser = (user: User | null) => setState(s => ({ ...s, user }));

  const addTransaction = (t: Transaction) =>
    setState(s => ({ ...s, transactions: [t, ...s.transactions] }));

  const updateTransaction = (id: string, t: Transaction) =>
    setState(s => ({ ...s, transactions: s.transactions.map(x => x.id === id ? t : x) }));

  const deleteTransaction = (id: string) =>
    setState(s => ({ ...s, transactions: s.transactions.filter(x => x.id !== id) }));

  const addInvoice = (inv: Invoice) =>
    setState(s => ({ ...s, invoices: [inv, ...s.invoices] }));

  const updateInvoice = (id: string, inv: Invoice) =>
    setState(s => ({ ...s, invoices: s.invoices.map(x => x.id === id ? inv : x) }));

  const deleteInvoice = (id: string) =>
    setState(s => ({ ...s, invoices: s.invoices.filter(x => x.id !== id) }));

  const addClient = (c: Client) =>
    setState(s => ({ ...s, clients: [c, ...s.clients] }));

  const updateClient = (id: string, c: Client) =>
    setState(s => ({ ...s, clients: s.clients.map(x => x.id === id ? c : x) }));

  const deleteClient = (id: string) =>
    setState(s => ({ ...s, clients: s.clients.filter(x => x.id !== id) }));

  const toggleDarkMode = () => setState(s => ({ ...s, isDarkMode: !s.isDarkMode }));
  const toggleSidebar = () => setState(s => ({ ...s, isSidebarCollapsed: !s.isSidebarCollapsed }));

  const getDashboardData = (): DashboardData => {
    const now = new Date();
    const thisMonth = state.transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const incomeThisMonth = thisMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenseThisMonth = thisMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const netProfit = incomeThisMonth - expenseThisMonth;

    const outstanding = state.invoices.filter(i => i.status === 'sent' || i.status === 'overdue')
      .reduce((s, i) => s + i.amount, 0);
    const taxToSetAside = incomeThisMonth * 0.20;

    const expenseByCategory: Record<string, number> = {};
    state.transactions.filter(t => t.type === 'expense').forEach(t => {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
    });
    const biggestCategory = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
      const mTransactions = state.transactions.filter(t => {
        const dt = new Date(t.date);
        return dt.getMonth() === d.getMonth() && dt.getFullYear() === d.getFullYear();
      });
      monthlyData.push({
        month: monthName,
        income: mTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expenses: mTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      });
    }

    const outstandingList = state.invoices.filter(i => i.status === 'sent' || i.status === 'overdue').slice(0, 3);

    return {
      netProfitThisMonth: netProfit,
      outstandingInvoices: outstanding,
      taxToSetAside,
      biggestExpenseCategory: biggestCategory,
      recentTransactions: state.transactions.slice(0, 5),
      outstandingInvoicesList: outstandingList,
      monthlyData,
    };
  };

  return (
    <AppContext.Provider value={{
      ...state,
      setUser,
      addTransaction, updateTransaction, deleteTransaction,
      addInvoice, updateInvoice, deleteInvoice,
      addClient, updateClient, deleteClient,
      toggleDarkMode, toggleSidebar,
      getDashboardData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
// Core types for ClearLedger

export type TransactionType = 'income' | 'expense';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
export type PlanTier = 'free' | 'pro' | 'business';

export interface User {
  id: string;
  email: string;
  fullName: string;
  businessName?: string;
  planTier: PlanTier;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
  notes?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  items: InvoiceItem[];
  status: InvoiceStatus;
  amount: number;
  dueDate: string;
  sentAt?: string;
  paidAt?: string;
  notes?: string;
}

export interface DashboardData {
  netProfitThisMonth: number;
  outstandingInvoices: number;
  taxToSetAside: number;
  biggestExpenseCategory: string;
  recentTransactions: Transaction[];
  outstandingInvoicesList: Invoice[];
  monthlyData: { month: string; income: number; expenses: number }[];
}
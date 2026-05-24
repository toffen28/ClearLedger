"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/store/AppContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  ArrowRight,
  CheckCircle,
  TrendingUp,
  FileText,
  Calculator,
  Calendar,
  Shield,
  Zap,
  ChevronRight,
} from "lucide-react";

const FEATURES = [
  {
    icon: TrendingUp,
    title: "Real-time profit tracking",
    description: "See your running profit and loss as you log transactions. No end-of-month surprises.",
  },
  {
    icon: FileText,
    title: "Beautiful invoices",
    description: "Create and send professional invoices in minutes. Track paid, unpaid, and overdue at a glance.",
  },
  {
    icon: Calculator,
    title: "Automatic tax estimates",
    description: "Know exactly how much to set aside for tax as you earn. No more panic at self-assessment time.",
  },
  {
    icon: Calendar,
    title: "Cashflow calendar",
    description: "See what's coming in and going out over the next 30, 60, and 90 days.",
  },
];

const TESTIMONIALS = [
  { quote: "I replaced three spreadsheets with ClearLedger. My accountant loves it.", name: "Alex T.", role: "Graphic Designer" },
  { quote: "Finally an invoicing tool that doesn't require a degree to understand.", name: "Priya S.", role: "Content Writer" },
  { quote: "The tax estimation alone saved me from a nasty surprise last April.", name: "Marcus H.", role: "Photographer" },
];

export default function HomePage() {
  const router = useRouter();
  const { setUser } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setUser({ id: "demo-user", email, fullName: fullName || "Demo User", planTier: "pro" });
    router.push("/dashboard");
    setLoading(false);
  };

  const handleDemo = () => {
    setUser({ id: "demo-user", email: "demo@clearledger.app", fullName: "Demo User", planTier: "pro" });
    router.push("/dashboard");
  };

  const handleUpgrade = async (tier: string) => {
    const priceId = tier === "Pro"
      ? process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
      : process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID;
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop:blur-12 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">ClearLedger</span>
          </div>
          ...

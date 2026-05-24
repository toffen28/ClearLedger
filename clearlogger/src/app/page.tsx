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
    // Simulate auth - in production this calls Supabase
    await new Promise(r => setTimeout(r, 800));
    setUser({ id: "demo-user", email, fullName: fullName || "Demo User", planTier: "pro" });
    router.push("/dashboard");
    setLoading(false);
  };

 const handleDemo = () => {
    setUser({ id: "demo-user", email: "demo@clearlogger.app", fullName: "Demo User", planTier: "pro" });
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
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-600 hover:text-slate-900 font-medium">Features</a>
            <a href="#pricing" className="text-sm text-slate-600 hover:text-slate-900 font-medium">Pricing</a>
            <a href="#testimonials" className="text-sm text-slate-600 hover:text-slate-900 font-medium">Reviews</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setIsSignUp(false)}>Sign In</Button>
            <Button variant="primary" size="sm" onClick={() => setIsSignUp(true)}>Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-sm font-medium mb-8 animate-fade-in">
            <Zap size={14} />
            <span>Trusted by 2,400+ freelancers</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight mb-6 animate-fade-in leading-tight">
            Your business finances,
            <br />
            <span className="text-teal-600">crystal clear.</span>
          </h1>
          <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto animate-fade-in">
            Track income, expenses, invoices, and tax — all in one beautifully simple dashboard. No more spreadsheets. No more surprises.
          </p>
          <div className="flex items-center justify-center gap-4 animate-fade-in">
            <button
              onClick={handleDemo}
              className="inline-flex items-center gap-2 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-teal-200/50 transition-all hover:-translate-y-0.5"
            >
              Try the Demo
              <ArrowRight size={18} />
            </button>
            <Link
              href="#features"
              className="inline-flex items-center gap-2 px-8 py-4 text-slate-600 hover:text-slate-900 font-medium"
            >
              See how it works
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="max-w-5xl mx-auto mt-20 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFC] via-transparent to-transparent z-10 pointer-events-none" />
            <div className="bg-slate-900 rounded-2xl p-4 shadow-2xl shadow-slate-200/20 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="bg-[#1a2332] rounded-xl p-6 font-mono text-sm">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Net Profit", value: "£4,832", color: "text-teal-400" },
                    { label: "Outstanding", value: "£5,100", color: "text-amber-400" },
                    { label: "Tax Reserve", value: "£1,460", color: "text-blue-400" },
                    { label: "Top Category", value: "Software", color: "text-purple-400" },
                  ].map((kpi) => (
                    <div key={kpi.label} className="bg-slate-800/50 rounded-lg p-4">
                      <div className="text-slate-500 text-xs mb-1">{kpi.label}</div>
                      <div className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</div>
                    </div>
                  ))}
                </div>
                <div className="h-32 bg-slate-800/30 rounded-lg flex items-end gap-2 p-4">
                  {[65, 85, 72, 90, 78, 95, 88].map((h, i) => (
                    <div key={i} className="flex-1 bg-teal-500/60 rounded-t" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      {(isSignUp || email) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setIsSignUp(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-slide-up" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{isSignUp ? "Create your account" : "Welcome back"}</h2>
            <p className="text-slate-500 mb-6 text-sm">{isSignUp ? "Start your 14-day free trial" : "Sign in to your ClearLedger"}</p>
            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && (
                <Input label="Full Name" placeholder="Alex Thompson" value={fullName} onChange={e => setFullName(e.target.value)} required />
              )}
              <Input label="Email" type="email" placeholder="alex@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
              </Button>
            </form>
            <p className="text-center text-sm text-slate-500 mt-4">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button onClick={() => setIsSignUp(!isSignUp)} className="text-teal-600 font-medium hover:underline">
                {isSignUp ? "Sign in" : "Sign up free"}
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Everything you need, nothing you don't</h2>
            <p className="text-xl text-slate-500">Built for freelancers who want control without complexity.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="p-6 rounded-xl border border-slate-100 hover:border-teal-100 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-4">
                    <Icon size={24} className="text-teal-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-slate-500">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Simple, honest pricing</h2>
            <p className="text-xl text-slate-500">Start free. Upgrade when you're ready.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                tier: "Free", price: "£0", period: "forever",
                desc: "For freelancers just getting started",
                features: ["Up to 5 invoices/month", "Basic expense tracking", "1 client"],
                highlight: false,
              },
              {
                tier: "Pro", price: "£12.99", period: "/month",
                desc: "For established freelancers",
                features: ["Unlimited invoices", "Tax estimation", "Cashflow calendar", "CSV import", "Automated reminders", "Up to 20 clients"],
                highlight: true,
              },
              {
                tier: "Business", price: "£29.99", period: "/month",
                desc: "For growing businesses",
                features: ["Everything in Pro", "Unlimited clients", "Team access", "Accountant export", "Priority support"],
                highlight: false,
              },
            ].map((plan) => (
              <div key={plan.tier} className={`p-8 rounded-2xl border-2 ${plan.highlight ? "border-teal-500 bg-teal-50/50 shadow-xl shadow-teal-100/30" : "border-slate-200 bg-white"}`}>
                {plan.highlight && <div className="inline-block px-3 py-1 rounded-full bg-teal-600 text-white text-xs font-bold mb-4">MOST POPULAR</div>}
                <h3 className="text-xl font-bold text-slate-900 mb-1">{plan.tier}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                  <span className="text-slate-500">{plan.period}</span>
                </div>
                <p className="text-sm text-slate-500 mb-6">{plan.desc}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle size={16} className="text-teal-600 flex-shrink-0" />
                      <span className="text-slate-700">{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleDemo}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${plan.highlight ? "bg-teal-600 hover:bg-teal-700 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-900"}`}
                >
                  {plan.tier === "Free" ? "Start Free" : `Try ${plan.tier}`}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6 bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Loved by freelancers</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="p-6 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-slate-700 mb-4 italic">"{t.quote}"</p>
                <div>
                  <p className="font-semibold text-slate-900">{t.name}</p>
                  <p className="text-sm text-slate-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Ready to replace your spreadsheets?</h2>
          <p className="text-xl text-slate-500 mb-8">Join 2,400+ freelancers who trust ClearLedger with their business finances.</p>
          <button
            onClick={handleDemo}
            className="inline-flex items-center gap-2 px-10 py-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-teal-200/50 transition-all hover:-translate-y-0.5"
          >
            Start for free
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-bold text-slate-900">ClearLedger</span>
          </div>
          <p className="text-sm text-slate-500">© 2024 ClearLedger. Built for freelancers.</p>
        </div>
      </footer>
    </div>
  );
}

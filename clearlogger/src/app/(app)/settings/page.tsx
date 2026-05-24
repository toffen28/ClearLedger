"use client";

import { useState } from "react";
import { useApp } from "@/store/AppContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  User,
  Mail,
  Building,
  CreditCard,
  Check,
  Zap,
  Shield,
  Bell,
  LogOut,
  ChevronRight,
} from "lucide-react";

const PLANS = [
  {
    tier: "Free",
    price: "£0",
    features: ["5 invoices/month", "Basic expense tracking", "1 client", "Email support"],
    highlight: false,
  },
  {
    tier: "Pro",
    price: "£12.99",
    period: "/month",
    features: ["Unlimited invoices", "Tax estimation", "Cashflow calendar", "CSV import", "Automated reminders", "20 clients"],
    highlight: true,
  },
  {
    tier: "Business",
    price: "£29.99",
    period: "/month",
    features: ["Everything in Pro", "Unlimited clients", "Team access", "Accountant export", "Priority support"],
    highlight: false,
  },
];

export default function SettingsPage() {
  const { user, isDarkMode, toggleDarkMode } = useApp();
  const [profile, setProfile] = useState({ fullName: user?.fullName || "Demo User", email: user?.email || "demo@clearlogger.app", businessName: "" });
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your profile and preferences</p>
      </div>

      {/* Profile */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
            <User size={20} className="text-teal-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Profile</h2>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full Name" value={profile.fullName} onChange={e => setProfile(p => ({ ...p, fullName: e.target.value }))} />
            <Input label="Email" type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
            <Input label="Business Name (optional)" placeholder="My Freelance Business" value={profile.businessName} onChange={e => setProfile(p => ({ ...p, businessName: e.target.value }))} />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" variant="primary">{saved ? <><Check size={14} /> Saved</> : "Save Changes"}</Button>
          </div>
        </form>
      </Card>

      {/* Appearance */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <Zap size={20} className="text-purple-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Appearance</h2>
        </div>
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium text-slate-900 dark:text-white">Dark Mode</p>
            <p className="text-sm text-slate-500">Switch between light and dark themes</p>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`relative w-12 h-6 rounded-full transition-colors ${isDarkMode ? "bg-teal-600" : "bg-slate-200"}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${isDarkMode ? "translate-x-7" : "translate-x-1"}`} />
          </button>
        </div>
      </Card>

      {/* Billing / Plan */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <CreditCard size={20} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Plan & Billing</h2>
            <p className="text-sm text-slate-500">Current plan: <span className="font-semibold text-teal-600">{user?.planTier || 'Free'}</span></p>
          </div>
        </div>
        <div className="space-y-4">
          {PLANS.map((plan) => (
            <div
              key={plan.tier}
              className={`p-4 rounded-xl border-2 transition-colors ${
                plan.highlight
                  ? "border-teal-500 bg-teal-50/30"
                  : "border-slate-200 dark:border-slate-700"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{plan.tier}</h3>
                    {plan.highlight && <span className="px-2 py-0.5 rounded-full bg-teal-600 text-white text-xs font-bold">POPULAR</span>}
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">{plan.price}</span>
                    {plan.period && <span className="text-sm text-slate-500">{plan.period}</span>}
                  </div>
                </div>
                <div>
                  {(user?.planTier?.toLowerCase() === plan.tier.toLowerCase()) ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-sm font-medium">
                      <Check size={14} /> Current Plan
                    </span>
                  ) : (
                    <Button variant={plan.highlight ? "primary" : "secondary"} size="sm">
                      Upgrade <ChevronRight size={14} />
                    </Button>
                  )}
                </div>
              </div>
              <ul className="mt-3 space-y-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Check size={12} className="text-teal-600 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Bell size={20} className="text-amber-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Notifications</h2>
        </div>
        <div className="space-y-4">
          {[
            { label: "Invoice payment reminders", desc: "Get notified when invoices are overdue", enabled: true },
            { label: "Weekly summary", desc: "Receive a weekly summary of your finances", enabled: true },
            { label: "Tax deadline alerts", desc: "Reminder before tax payment deadlines", enabled: false },
          ].map(n => (
            <div key={n.label} className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{n.label}</p>
                <p className="text-sm text-slate-500">{n.desc}</p>
              </div>
              <button
                className={`relative w-11 h-6 rounded-full transition-colors ${n.enabled ? "bg-teal-600" : "bg-slate-200"}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${n.enabled ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 border-red-200 dark:border-red-900/50">
        <h2 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h2>
        <p className="text-sm text-slate-500 mb-4">Once you delete your account, there is no going back.</p>
        <Button variant="danger" size="sm">
          <LogOut size={14} /> Delete Account
        </Button>
      </Card>
    </div>
  );
}
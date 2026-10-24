'use client';

import React, { useState } from 'react';
import {
  Settings,
  CreditCard,
  Mail,
  Shield,
  Bot,
  Globe,
  Save,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const categories = [
  { id: 'general', title: 'General & Localization', icon: Globe },
  { id: 'payment', title: 'Payment Gateways (35+)', icon: CreditCard },
  { id: 'email', title: 'Email & SMTP', icon: Mail },
  { id: 'security', title: 'Security & 2FA', icon: Shield },
  { id: 'ai', title: 'AI Concierge & LLM', icon: Bot },
];

export default function SettingsPage() {
  const [activeCategory, setActiveCategory] = useState('general');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header (PDF Figure 2.1 Global Configuration Hub) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" /> Global Configuration Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise system parameters, multi-gateway payment processing, and AI concierge configurations (PDF Figure 2.1).
          </p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Parameters Saved Successfully
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Category Sidebar */}
        <div className="lg:col-span-4 space-y-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold text-left transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                    : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{cat.title}</span>
              </button>
            );
          })}
        </div>

        {/* Right Settings Form */}
        <div className="lg:col-span-8">
          <Card>
            <form onSubmit={handleSave}>
              {activeCategory === 'general' && (
                <>
                  <CardHeader>
                    <CardTitle>System & Localization Parameters</CardTitle>
                    <CardDescription>
                      Configure hotel operating currency, tax rates, and check-in window policies.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Default Currency</label>
                      <Input defaultValue="USD - United States Dollar ($)" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">City Tax / VAT (%)</label>
                        <Input type="number" defaultValue="15" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">System Timezone</label>
                        <Input defaultValue="Asia/Dhaka (GMT+6)" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Standard Check-In Time</label>
                        <Input defaultValue="14:00" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Standard Check-Out Time</label>
                        <Input defaultValue="11:00" />
                      </div>
                    </div>
                  </CardContent>
                </>
              )}

              {activeCategory === 'payment' && (
                <>
                  <CardHeader>
                    <CardTitle>Enterprise Payment Gateways (35+)</CardTitle>
                    <CardDescription>
                      Active merchant payment processors for automated folio settlement and guest checkout.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        'Stripe Connect',
                        'bKash Merchant Checkout',
                        'Nagad Payment Gateway',
                        'SSLCommerz',
                        'PayPal Commerce',
                        'Adyen Hospitality',
                        'Authorize.Net',
                        'Square Terminal POS',
                      ].map((gw) => (
                        <div
                          key={gw}
                          className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between"
                        >
                          <span className="text-xs font-bold text-slate-800">{gw}</span>
                          <Badge variant="outline" className="text-[10px] border-emerald-300 text-emerald-700 bg-emerald-50">
                            Enabled
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </>
              )}

              {activeCategory === 'ai' && (
                <>
                  <CardHeader>
                    <CardTitle>AI Concierge & RAG Configuration</CardTitle>
                    <CardDescription>
                      Configure autonomous guest chat agent, vector knowledge stores, and temperature (PDF Figure 14.1).
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">AI Concierge Model</label>
                      <Input defaultValue="gemini-1.5-flash / gpt-4o-mini" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Concierge Persona / System Prompt</label>
                      <textarea
                        className="w-full h-24 rounded-lg border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs"
                        defaultValue="You are the luxury 24/7 AI Concierge for OmniStay 360. Assist guests with room bookings, restaurant reservations, amenities, and room service."
                      />
                    </div>
                  </CardContent>
                </>
              )}

              {activeCategory === 'email' && (
                <>
                  <CardHeader>
                    <CardTitle>SMTP & Notification Gateway</CardTitle>
                    <CardDescription>Transactional emails for reservation confirmations and invoices.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">SMTP Host</label>
                      <Input defaultValue="smtp.sendgrid.net" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Port</label>
                        <Input defaultValue="587" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">From Name</label>
                        <Input defaultValue="OmniStay Reservations" />
                      </div>
                    </div>
                  </CardContent>
                </>
              )}

              {activeCategory === 'security' && (
                <>
                  <CardHeader>
                    <CardTitle>Enterprise Security & Compliance</CardTitle>
                    <CardDescription>Enforce 2FA TOTP challenges and session timeouts.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-2">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                      <div>
                        <p className="text-xs font-bold text-slate-800">Enforce 2FA for Administrators</p>
                        <p className="text-[11px] text-slate-500">Require TOTP authenticator token on sign in</p>
                      </div>
                      <Badge variant="success">Active</Badge>
                    </div>
                  </CardContent>
                </>
              )}

              <div className="p-5 pt-2 flex items-center justify-end border-t border-slate-100 mt-4">
                <Button type="submit" variant="default" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Save className="w-4 h-4 mr-2" /> Save Parameters
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

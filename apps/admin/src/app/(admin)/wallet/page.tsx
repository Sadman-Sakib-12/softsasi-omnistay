'use client';

import React, { useState } from 'react';
import { Wallet, Gift, Award, Share2, DollarSign, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function DigitalWalletLoyaltyPage() {
  const [activeTab, setActiveTab] = useState<'wallet' | 'loyalty' | 'giftcards'>('wallet');

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-[#00a8ff] font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-slate-400">Digital Wallet & Loyalty</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-[#00a8ff]" /> Digital Wallet, Loyalty & Gift Cards
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pre-funded customer wallets, 4-tier guest loyalty program, and instant digital gift cards (Chapter 13).
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab('wallet')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'wallet' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Digital Wallet
          </button>
          <button
            onClick={() => setActiveTab('loyalty')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'loyalty' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            4-Tier Loyalty
          </button>
          <button
            onClick={() => setActiveTab('giftcards')}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'giftcards' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Gift Cards
          </button>
        </div>
      </div>

      {activeTab === 'wallet' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-2">
            <span className="text-xs text-slate-500 font-medium">Total Stored Value Liability</span>
            <div className="text-2xl font-black text-slate-900">$184,250.00</div>
            <p className="text-[11px] text-emerald-600">Across 1,280 active guest wallets</p>
          </div>
          <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-2">
            <span className="text-xs text-slate-500 font-medium">30-Day Wallet Top-Ups</span>
            <div className="text-2xl font-black text-slate-900">$42,900.00</div>
            <p className="text-[11px] text-blue-600">1-click instant booking checkout</p>
          </div>
          <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-2">
            <span className="text-xs text-slate-500 font-medium">Instant Refunds Settled</span>
            <div className="text-2xl font-black text-slate-900">&lt; 1 Second</div>
            <p className="text-[11px] text-slate-500">Retaining capital within ecosystem</p>
          </div>
        </div>
      )}

      {activeTab === 'loyalty' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { tier: 'Bronze Explorer', criteria: '0 - 4 Nights', perk: '1 pt/$1 · 5% Member Rate Discount', color: 'bg-amber-100 text-amber-800' },
            { tier: 'Silver Voyager', criteria: '5 - 14 Nights / $1,500', perk: '1.25 pts/$1 · Free 14:00 Late Checkout', color: 'bg-slate-200 text-slate-800' },
            { tier: 'Gold Elite', criteria: '15 - 29 Nights / $5,000', perk: '1.5 pts/$1 · Free Space-Available Room Upgrade', color: 'bg-yellow-100 text-yellow-800' },
            { tier: 'Platinum Ambassador', criteria: '30+ Nights / $10,000', perk: '2.0 pts/$1 · Guaranteed 16:00 Late Checkout + Airport VIP', color: 'bg-purple-100 text-purple-800' },
          ].map((l) => (
            <div key={l.tier} className="p-5 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-3">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${l.color}`}>
                {l.tier}
              </span>
              <div>
                <p className="text-xs font-bold text-slate-900">{l.criteria}</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{l.perk}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'giftcards' && (
        <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Active Gift Card Campaigns</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { code: 'GIFT-ANNIV-2026', value: '$250.00', balance: '$180.00', to: 'Sarah Jenkins' },
              { code: 'GIFT-HONEYMOON-99', value: '$500.00', balance: '$500.00', to: 'David & Mia' },
              { code: 'GIFT-CORP-REWARD-1', value: '$100.00', balance: '$25.00', to: 'Michael Chang' },
            ].map((g) => (
              <div key={g.code} className="p-4 bg-slate-50 rounded border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#00a8ff]">{g.code}</span>
                  <span className="font-bold text-xs text-slate-900">{g.value}</span>
                </div>
                <p className="text-[11px] text-slate-500">Recipient: {g.to}</p>
                <p className="text-[11px] text-emerald-600 font-semibold">Available: {g.balance}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

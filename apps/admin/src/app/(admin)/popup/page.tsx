'use client';

import React, { useState } from 'react';
import { Layers, Plus, Search, Eye, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function PopupsPage() {
  const [popups] = useState([
    { id: 'pop-1', title: 'Winter Escape 25% Off Promo Banner', trigger: 'After 5s Page Load', impressions: 4200, status: 'Active' },
    { id: 'pop-2', title: 'Loyalty Club Member Instant Sign-Up Modal', trigger: 'Exit Intent', impressions: 1840, status: 'Active' },
    { id: 'pop-3', title: 'Gourmet Dining Autumn Tasting Voucher', trigger: 'On Scroll 50%', impressions: 980, status: 'Paused' },
  ]);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-[#00a8ff] font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-slate-400">System / Popups</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#00a8ff]" /> Marketing Popups & Promo Modals
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure exit-intent banners, seasonal discount modals, and guest newsletter opt-ins.
          </p>
        </div>

        <button className="h-9 px-4 bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>Create Popup</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Campaign Title</th>
              <th className="py-3 px-4">Display Trigger</th>
              <th className="py-3 px-4">Impressions</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {popups.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-4 font-semibold text-slate-900">{p.title}</td>
                <td className="py-3 px-4 text-slate-500">{p.trigger}</td>
                <td className="py-3 px-4 text-slate-600">{p.impressions.toLocaleString()} views</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      p.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

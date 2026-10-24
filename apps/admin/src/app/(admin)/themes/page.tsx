'use client';

import React, { useState } from 'react';
import { Palette, CheckCircle2, Sparkles, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ThemesPage() {
  const [selectedTheme, setSelectedTheme] = useState('enterprise-blue');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const themes = [
    { id: 'enterprise-blue', name: 'Enterprise Royal Blue (Default)', primary: '#00a8ff', bg: '#ffffff', desc: 'Standard luxury white corporate PMS theme' },
    { id: 'emerald-luxury', name: 'Emerald Eco-Resort', primary: '#10b981', bg: '#ffffff', desc: 'Curated for tropical villas and safari retreats' },
    { id: 'gold-boutique', name: 'Gold Boutique Heritage', primary: '#fbc531', bg: '#ffffff', desc: 'Opulent gold accents for 5-star palace hotels' },
    { id: 'midnight-dark', name: 'Midnight Executive Dark', primary: '#3b82f6', bg: '#0f172a', desc: 'High-contrast dark mode for night auditors' },
  ];

  const handleApply = (id: string) => {
    setSelectedTheme(id);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-[#00a8ff] font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-slate-400">System / Themes</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Palette className="w-6 h-6 text-[#00a8ff]" /> Brand Themes & Visual Identity
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Customize platform primary color palettes, typography, and dark/light mode appearance.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Brand theme styling applied successfully!</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {themes.map((t) => (
          <div
            key={t.id}
            onClick={() => handleApply(t.id)}
            className={`p-5 rounded-lg border transition-all cursor-pointer shadow-2xs space-y-3 ${
              selectedTheme === t.id
                ? 'bg-white border-[#00a8ff] ring-2 ring-[#00a8ff]/20'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">{t.name}</span>
              <div className="w-5 h-5 rounded-full border border-slate-300" style={{ backgroundColor: t.primary }} />
            </div>
            <p className="text-xs text-slate-500">{t.desc}</p>
            <div className="pt-2 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Primary: {t.primary}</span>
              {selectedTheme === t.id && (
                <span className="font-bold text-[#00a8ff] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active Theme
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

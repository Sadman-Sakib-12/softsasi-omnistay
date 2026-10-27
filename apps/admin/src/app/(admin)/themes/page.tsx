'use client';

import React, { useState } from 'react';
import { Palette, CheckCircle2, Sparkles, Sun, Moon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contentService, ThemeConfig } from '@/features/content/services/content.service';

export const THEME_PRESETS = [
  {
    id: 'enterprise-blue',
    name: 'Enterprise Royal Blue (Default)',
    primary: '#00a8ff',
    bg: '#f8fafc',
    sidebarBg: '#111927',
    desc: 'Standard luxury white corporate PMS theme',
  },
  {
    id: 'emerald-luxury',
    name: 'Emerald Eco-Resort',
    primary: '#10b981',
    bg: '#f0fdf4',
    sidebarBg: '#064e3b',
    desc: 'Curated for tropical villas and safari retreats',
  },
  {
    id: 'gold-boutique',
    name: 'Gold Boutique Heritage',
    primary: '#f59e0b',
    bg: '#fffdf5',
    sidebarBg: '#451a03',
    desc: 'Opulent gold accents for 5-star palace hotels',
  },
  {
    id: 'midnight-dark',
    name: 'Midnight Executive Dark',
    primary: '#3b82f6',
    bg: '#0b1120',
    sidebarBg: '#030712',
    desc: 'High-contrast dark mode for night auditors',
  },
];

export function applyThemeStyles(themeId: string) {
  if (typeof document === 'undefined') return;
  const preset = THEME_PRESETS.find((t) => t.id === themeId) || THEME_PRESETS[0];
  document.documentElement.style.setProperty('--brand-primary', preset.primary);
  document.documentElement.style.setProperty('--brand-bg', preset.sidebarBg);
  document.documentElement.style.setProperty('--primary', preset.primary);
  document.documentElement.style.setProperty('--ring', preset.primary);
  document.documentElement.style.setProperty('--background', preset.bg);

  if (preset.id === 'midnight-dark') {
    document.documentElement.classList.add('dark');
    document.documentElement.style.setProperty('--foreground', '#f8fafc');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.setProperty('--foreground', '#0f172a');
  }
}

export default function ThemesPage() {
  const queryClient = useQueryClient();
  const [savedSuccess, setSavedSuccess] = useState(false);

  const { data: currentTheme, isLoading } = useQuery<ThemeConfig>({
    queryKey: ['systemTheme'],
    queryFn: () => contentService.getThemeConfig(),
  });

  const updateThemeMutation = useMutation({
    mutationFn: (config: Partial<ThemeConfig>) => contentService.updateThemeConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemTheme'] });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    },
  });

  const handleApply = (id: string, primaryColor: string) => {
    applyThemeStyles(id);
    updateThemeMutation.mutate({ activeThemeId: id, primaryColor });
  };

  const selectedTheme = currentTheme?.activeThemeId || 'enterprise-blue';

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
          <span>Brand theme styling applied and saved to system preferences!</span>
        </div>
      )}

      {isLoading ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#00a8ff]" />
          <span className="mt-2 block">Loading theme settings...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {THEME_PRESETS.map((t) => (
            <div
              key={t.id}
              onClick={() => handleApply(t.id, t.primary)}
              className={`p-5 rounded-lg border transition-all cursor-pointer shadow-2xs space-y-3 ${
                selectedTheme === t.id
                  ? 'bg-white ring-2'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
              style={selectedTheme === t.id ? { borderColor: t.primary, boxShadow: `0 0 0 2px ${t.primary}33` } : {}}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{t.name}</span>
                {selectedTheme === t.id && (
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-semibold border"
                    style={{ backgroundColor: `${t.primary}15`, color: t.primary, borderColor: `${t.primary}55` }}
                  >
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">{t.desc}</p>
              <div className="flex items-center gap-2 pt-2">
                <div className="w-6 h-6 rounded-full border border-slate-200 shadow-2xs" style={{ backgroundColor: t.primary }} title="Primary Accent"></div>
                <div className="w-6 h-6 rounded-full border border-slate-200 shadow-2xs" style={{ backgroundColor: t.sidebarBg }} title="Sidebar Background"></div>
                <div className="w-6 h-6 rounded-full border border-slate-200 shadow-2xs" style={{ backgroundColor: t.bg }} title="Page Background"></div>
                <span className="text-[11px] font-mono text-slate-400 ml-2">{t.primary}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

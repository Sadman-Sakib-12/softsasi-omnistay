'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { GutenbergEditor } from '@/components/gutenberg/gutenberg-editor';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contentService, ThemeConfig } from '@/features/content/services/content.service';
import {
  Palette,
  Check,
  X,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { BeatLoader } from 'react-spinners';

export const THEME_PRESETS = [
  {
    id: 'enterprise-blue',
    name: 'Enterprise Royal Blue',
    primary: '#00a8ff',
    accent: '#0097e6',
    desc: 'Standard luxury corporate PMS and multi-vertical marketplace',
  },
  {
    id: 'emerald-luxury',
    name: 'Emerald Eco-Resort',
    primary: '#10b981',
    accent: '#059669',
    desc: 'Curated for tropical villas, islands, and eco-safari retreats',
  },
  {
    id: 'gold-boutique',
    name: 'Gold Boutique Heritage',
    primary: '#f59e0b',
    accent: '#d97706',
    desc: 'Opulent gold accents for 5-star palace hotels & VIP suites',
  },
  {
    id: 'midnight-dark',
    name: 'Midnight Executive Dark',
    primary: '#3b82f6',
    accent: '#2563eb',
    desc: 'High-contrast luxury dark mode for modern urban penthouses',
  },
];

export function applyThemeStyles(themeId: string) {
  if (typeof document === 'undefined') return;
  const preset = THEME_PRESETS.find((t) => t.id === themeId) || THEME_PRESETS[0];
  document.documentElement.style.setProperty('--brand-primary', preset.primary);
  document.documentElement.style.setProperty('--primary', preset.primary);
  document.documentElement.style.setProperty('--ring', preset.primary);

  if (preset.id === 'midnight-dark') {
    document.documentElement.classList.add('dark');
    document.documentElement.style.setProperty('--foreground', '#f8fafc');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.setProperty('--foreground', '#0f172a');
  }
}

function WebsiteBuilderContent({ onOpenTheme }: { onOpenTheme: () => void }) {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug') || undefined;
  const pageId = searchParams.get('pageId') || undefined;
  const isCreate = searchParams.get('create') === 'true';

  return (
    <GutenbergEditor
      initialSlug={slug}
      initialPageId={pageId}
      isCreateMode={isCreate}
      onOpenThemeCustomizer={onOpenTheme}
    />
  );
}

export default function WebsiteBuilderThemesPage() {
  const queryClient = useQueryClient();
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  const { data: themeConfig } = useQuery<ThemeConfig>({
    queryKey: ['systemTheme'],
    queryFn: () => contentService.getThemeConfig(),
  });

  const updateThemeMutation = useMutation({
    mutationFn: (newThemeId: string) =>
      contentService.updateThemeConfig({
        activeThemeId: newThemeId,
        primaryColor: THEME_PRESETS.find((t) => t.id === newThemeId)?.primary || '#00a8ff',
        mode: newThemeId === 'midnight-dark' ? 'dark' : 'light',
      }),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['systemTheme'] });
      applyThemeStyles(updated.activeThemeId);
    },
  });

  return (
    <div className="relative w-full h-full">
      {/* Authentic WordPress Gutenberg Block Editor with Query Param Hydration */}
      <Suspense
        fallback={
          <div className="h-[80vh] flex flex-col items-center justify-center gap-3">
            <BeatLoader color="#22d3ee" size={18} speedMultiplier={1.2} />
            <p className="text-slate-500 text-sm font-medium animate-pulse">
              Loading OmniStay Gutenberg Block Editor...
            </p>
          </div>
        }
      >
        <WebsiteBuilderContent onOpenTheme={() => setIsThemeModalOpen(true)} />
      </Suspense>

      {/* Theme Presets & Palette Modal */}
      {isThemeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-[#00a8ff]" />
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  Global Website Theme Presets
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsThemeModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
              <p className="text-xs text-slate-500">
                Choose an enterprise theme preset to apply consistent branding colors, buttons, and accents across all public guest portals.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {THEME_PRESETS.map((preset) => {
                  const isActive = (themeConfig?.activeThemeId || 'enterprise-blue') === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => updateThemeMutation.mutate(preset.id)}
                      className={`p-3.5 rounded-xl border-2 transition cursor-pointer relative ${
                        isActive
                          ? 'border-[#00a8ff] bg-sky-50/40 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-full border border-slate-200 shrink-0"
                            style={{ backgroundColor: preset.primary }}
                          />
                          <h4 className="font-bold text-xs text-slate-900">{preset.name}</h4>
                        </div>
                        {isActive && <Check className="w-4 h-4 text-[#00a8ff] shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                        {preset.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                {updateThemeMutation.isPending ? 'Updating theme...' : 'Changes apply live.'}
              </span>
              <button
                type="button"
                onClick={() => setIsThemeModalOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-black transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

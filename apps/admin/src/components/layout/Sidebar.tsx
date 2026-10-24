'use client';

import React from 'react';
import { useAdminStore, AdminViewTab } from '../../store/adminStore';
import {
  Building2,
  BedDouble,
  CalendarDays,
  CalendarCheck,
  UtensilsCrossed,
  Receipt,
  Sparkles,
  Settings,
  ShieldCheck,
  Layers,
  KeyRound,
  FileSpreadsheet,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavItemConfig {
  id: AdminViewTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
  figure?: string;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, properties, selectedPropertyId, setSelectedPropertyId } = useAdminStore();

  const navItems: NavItemConfig[] = [
    {
      id: 'hotels',
      label: 'All Hotels & Properties',
      icon: Building2,
      figure: 'Fig 4.1',
      badge: `${properties.length}`,
      badgeColor: 'bg-sky-500/20 text-sky-300 border border-sky-500/30',
    },
    {
      id: 'room-management',
      label: 'Room Management & Beds',
      icon: BedDouble,
      figure: 'Fig 3.1',
    },
    {
      id: 'availability',
      label: 'Availability & Rate Calendar',
      icon: CalendarDays,
      figure: 'Fig 4.3',
      badge: 'Rates',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    },
    {
      id: 'bookings',
      label: 'Reservations & Front Desk',
      icon: CalendarCheck,
      badge: 'Live',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
    },
    {
      id: 'pos-kds',
      label: 'Restaurant POS & KDS',
      icon: UtensilsCrossed,
      badge: 'KDS',
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    {
      id: 'accounting',
      label: 'USALI Accounting & Night Audit',
      icon: Receipt,
      badge: 'GL',
      badgeColor: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    },
    {
      id: 'ai-concierge',
      label: 'AI Concierge & RAG Config',
      icon: Sparkles,
      figure: 'Fig 14.1',
      badge: 'RAG',
      badgeColor: 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30',
    },
    {
      id: 'settings',
      label: 'Global Configuration Hub',
      icon: Settings,
      figure: 'Fig 2.1',
    },
  ];

  return (
    <aside className="w-72 bg-[#090d16] border-r border-slate-800/80 flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto select-none">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-amber-400 p-[1.5px] shadow-lg shadow-sky-500/10">
              <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-sky-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">OmniStay</span>
                <span className="text-xs px-1.5 py-0.5 rounded font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  360
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                Enterprise Admin & ERP Suite
              </p>
            </div>
          </div>

          {/* Active Property Pill */}
          <div className="mt-4 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/80 flex items-center justify-between text-xs">
            <div className="truncate flex-1 pr-2">
              <p className="font-semibold text-slate-200 truncate">
                {properties.length > 0
                  ? (properties.find((p) => p.id === selectedPropertyId)?.name || properties[0].name)
                  : 'Enterprise Multi-Tenant'}
              </p>
              <p className="text-[10px] text-slate-400">
                {properties.length > 0
                  ? (properties.find((p) => p.id === selectedPropertyId)?.code || properties[0].code)
                  : 'PostgreSQL 16 Gateway'}
              </p>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
          </div>
        </div>

        {/* Navigation List matching PDF Chapter Hierarchy */}
        <div className="px-3 py-4 space-y-1">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Operations & PDF Modules
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group',
                  isActive
                    ? 'bg-gradient-to-r from-sky-500/20 via-sky-500/10 to-transparent text-sky-300 border border-sky-500/30 font-bold shadow-sm shadow-sky-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40',
                )}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={cn(
                      'w-4 h-4 transition-transform group-hover:scale-110 shrink-0',
                      isActive ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300',
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {item.figure && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                      {item.figure}
                    </span>
                  )}
                  {item.badge && (
                    <span
                      className={cn(
                        'text-[9px] px-1.5 py-0.5 rounded font-mono font-bold',
                        item.badgeColor || 'bg-slate-800 text-slate-300',
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 text-[11px] text-slate-400">
        <div className="flex items-center justify-between">
          <span>Backend REST API</span>
          <span className="font-mono text-emerald-400 font-bold">:4000</span>
        </div>
        <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
          <span>Database Engine</span>
          <span className="font-mono text-slate-300">PostgreSQL (320 Tables)</span>
        </div>
      </div>
    </aside>
  );
};

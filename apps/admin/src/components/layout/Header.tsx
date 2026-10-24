'use client';

import React, { useEffect } from 'react';
import { useAdminStore } from '../../store/adminStore';
import {
  Search,
  Building2,
  PlusCircle,
  Play,
  CheckCircle2,
  Bell,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const Header: React.FC = () => {
  const {
    properties,
    selectedPropertyId,
    setSelectedPropertyId,
    setAddHotelModalOpen,
    setWalkInModalOpen,
    runNightAudit,
    backendConnected,
    checkBackendHealth,
    fetchProperties,
  } = useAdminStore();

  const [propertyDropdownOpen, setPropertyDropdownOpen] = React.useState(false);
  const [runningAudit, setRunningAudit] = React.useState(false);
  const [auditSuccess, setAuditSuccess] = React.useState(false);

  useEffect(() => {
    checkBackendHealth();
  }, [checkBackendHealth]);

  const activeProperty = properties.find((p) => p.id === selectedPropertyId) || properties[0];

  const handleTriggerAudit = async () => {
    setRunningAudit(true);
    try {
      await runNightAudit();
      setAuditSuccess(true);
      setTimeout(() => setAuditSuccess(false), 3000);
    } finally {
      setRunningAudit(false);
    }
  };

  return (
    <header className="h-20 border-b border-slate-800/80 bg-[#090d16]/90 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Search Input */}
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search hotels, rooms, guests, folios (Press ⌘K)..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500/60 transition-all"
          />
        </div>
      </div>

      {/* Gateway Status Badge */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
        <span
          className={cn(
            'w-2 h-2 rounded-full',
            backendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400',
          )}
        ></span>
        <span className="text-slate-400">Gateway:</span>
        <span
          className={cn(
            'font-mono font-bold text-[11px] px-1.5 py-0.5 rounded border',
            backendConnected
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          )}
        >
          {backendConnected ? 'API Live (:4000)' : 'API Ready'}
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Add Hotel */}
        <button
          onClick={() => setAddHotelModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
        >
          <Building2 className="w-4 h-4 text-sky-400" />
          <span className="hidden sm:inline">Add Hotel</span>
        </button>

        {/* Quick New Booking */}
        <button
          onClick={() => setWalkInModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold shadow-md shadow-sky-500/20 transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Reservation</span>
        </button>

        {/* Execute Night Audit */}
        <button
          onClick={handleTriggerAudit}
          disabled={runningAudit}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-colors disabled:opacity-50"
        >
          <Play className={cn('w-3.5 h-3.5', runningAudit && 'animate-spin')} />
          <span>{runningAudit ? 'Auditing...' : auditSuccess ? '✓ Balanced $0' : 'Night Audit'}</span>
        </button>

        {/* Property Selector */}
        {properties.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setPropertyDropdownOpen(!propertyDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200"
            >
              <Building2 className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-semibold max-w-[120px] truncate">{activeProperty?.code || 'Select'}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {propertyDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl glass-dropdown p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                <p className="px-3 py-1 text-[10px] font-bold uppercase text-slate-400">Select Hotel</p>
                {properties.map((prop) => (
                  <button
                    key={prop.id || prop.code}
                    onClick={() => {
                      if (prop.id) setSelectedPropertyId(prop.id);
                      setPropertyDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-left text-xs text-slate-300 hover:bg-slate-800/60"
                  >
                    <Building2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="truncate">{prop.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

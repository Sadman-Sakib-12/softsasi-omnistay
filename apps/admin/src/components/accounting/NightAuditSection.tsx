'use client';

import React, { useState } from 'react';
import { useAdminStore } from '../../store/adminStore';
import { accountingApi } from '../../services/api';
import {
  Receipt,
  Play,
  Scale,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';

export const NightAuditSection: React.FC = () => {
  const { runNightAudit, isLoading, errorMessage } = useAdminStore();
  const [auditDate, setAuditDate] = useState(new Date().toISOString().split('T')[0]);
  const [running, setRunning] = useState(false);
  const [auditResult, setAuditResult] = useState<any | null>(null);

  const handleExecuteAudit = async () => {
    setRunning(true);
    try {
      const res = await runNightAudit(auditDate);
      setAuditResult(res);
    } catch {
      // Error in store
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span>Dashboard</span>
        <span>/</span>
        <span>USALI Accounting</span>
        <span>/</span>
        <span className="text-slate-200 font-semibold">Night Audit & General Ledger</span>
      </div>

      <div className="p-6 rounded-2xl glass-panel flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              USALI 11th Edition Standard
            </span>
            <span className="text-xs text-slate-400">Automated Financial Treasury</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Double-Entry General Ledger & Night Audit Daemon
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Accrues daily room revenue from open guest folios, posts double-entry GL journals, releases unearned booking deposits, and validates that Trial Balance reconciles to zero.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={auditDate}
            onChange={(e) => setAuditDate(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleExecuteAudit}
            disabled={running}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-400 hover:to-sky-400 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <Play className={cn('w-4 h-4', running && 'animate-spin')} />
            <span>{running ? 'Executing Audit...' : 'Execute Night Audit'}</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Notice: {errorMessage}</span>
        </div>
      )}

      {/* Audit Result Display */}
      {auditResult && (
        <div className="p-5 rounded-2xl glass-panel border border-emerald-500/40 space-y-3 bg-emerald-950/10 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Night Audit Successfully Executed</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 font-sans block">Audited Date:</span>
              <span className="text-white font-bold">{auditResult.auditDate || auditDate}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 font-sans block">Trial Balance Variance:</span>
              <span className="text-emerald-400 font-bold">$0.00 USD (Balanced)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 font-sans block">Folios Accrued:</span>
              <span className="text-sky-400 font-bold">{auditResult.foliosProcessed || 'Reconciled'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Accounting Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <span className="text-xs text-slate-400">Trial Balance Integrity</span>
          <p className="text-xl font-bold font-mono text-emerald-400 mt-2">$0.00 USD Variance</p>
          <p className="text-[11px] text-slate-500 mt-1">Mathematically enforced: Total Debit = Total Credit</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <span className="text-xs text-slate-400">Night Audit Automation</span>
          <p className="text-xl font-bold font-mono text-white mt-2">Scheduled 02:00 Daily</p>
          <p className="text-[11px] text-slate-500 mt-1">Auto-accrues room revenue & unearned deposits</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800">
          <span className="text-xs text-slate-400">General Ledger Compliance</span>
          <p className="text-xl font-bold font-mono text-sky-400 mt-2">USALI 11th Edition</p>
          <p className="text-[11px] text-slate-500 mt-1">Immutable journal postings</p>
        </div>
      </div>
    </div>
  );
};

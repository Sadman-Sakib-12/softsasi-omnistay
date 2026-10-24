'use client';

import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../../store/adminStore';
import { posApi } from '../../services/api';
import { ChefHat, Clock, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';

export const KdsMonitorSection: React.FC = () => {
  const { kdsTickets, fetchKdsQueue, updateKdsTicket, isLoading, errorMessage } = useAdminStore();
  const [activeOutletId, setActiveOutletId] = useState('00000000-0000-0000-0000-000000000001');

  useEffect(() => {
    fetchKdsQueue(activeOutletId);
  }, [fetchKdsQueue, activeOutletId]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span>Dashboard</span>
        <span>/</span>
        <span>Point of Sale</span>
        <span>/</span>
        <span className="text-slate-200 font-semibold">Kitchen Display System (KDS)</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Kitchen Display System (KDS) Monitor</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time station order queue connected to backend <code className="text-sky-400">GET /api/v1/pos/kds/:outletId/queue</code>.
          </p>
        </div>

        <button
          onClick={() => fetchKdsQueue(activeOutletId)}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          title="Refresh Queue"
        >
          <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
        </button>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Notice: {errorMessage}</span>
        </div>
      )}

      {/* Live Ticket Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {kdsTickets.length > 0 ? (
          kdsTickets.map((ticket) => (
            <div key={ticket.id} className="rounded-2xl glass-panel p-4 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-mono font-bold text-sky-400">{ticket.orderNumber}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                  {ticket.tableNumber || 'Table 1'}
                </span>
              </div>
              <div className="space-y-1 text-xs">
                {ticket.items?.map((it: any, idx: number) => (
                  <p key={idx} className="text-slate-200">
                    {it.quantity}× {it.name}
                  </p>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => updateKdsTicket(ticket.id, 'ready')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                >
                  Mark Ready
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-12 rounded-2xl glass-panel border border-slate-800">
            <ChefHat className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-300">Kitchen Display Queue is Clear</p>
            <p className="text-xs text-slate-500 mt-1">
              No active dining orders waiting at KDS stations from POS registers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

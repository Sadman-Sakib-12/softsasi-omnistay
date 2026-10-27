'use client';

import React, { useState } from 'react';
import { UtensilsCrossed, Plus, LayoutGrid, Monitor, CreditCard, Receipt, CheckCircle2, BedDouble, Loader2, Store } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { posApi } from '@omnistay/api-client';

interface DiningTable {
  id: string;
  tableNumber: string;
  section: string;
  capacity: number;
  status: 'Vacant' | 'Seated' | 'Kitchen Cooking' | 'Served';
  currentBill?: number;
}

interface KdsTicket {
  orderId: string;
  table: string;
  station: string;
  elapsed: string;
  items: string[];
}

export default function PosTerminalPage() {
  const [activeTab, setActiveTab] = useState<'tables' | 'kds' | 'charge'>('tables');

  // Load real POS outlets from database
  const { data: outlets = [], isLoading: isLoadingOutlets } = useQuery({
    queryKey: ['posOutlets'],
    queryFn: () => posApi.getOutlets(),
  });

  const [selectedOutletId, setSelectedOutletId] = useState<string>('');
  const activeOutletId = selectedOutletId || outlets[0]?.id || '';

  // Load tables for selected outlet
  const { data: outletDetail, isLoading: isLoadingOutletDetail } = useQuery({
    queryKey: ['posOutletDetail', activeOutletId],
    queryFn: () => posApi.getOutletById(activeOutletId),
    enabled: !!activeOutletId,
  });

  const tables: DiningTable[] = (outletDetail?.tables || []).map((t: any) => ({
    id: t.id,
    tableNumber: t.tableNumber || `Table ${t.number || ''}`,
    section: t.section || 'Main Dining',
    capacity: t.capacity || 4,
    status: t.status || 'Vacant',
    currentBill: t.currentBill ? Number(t.currentBill) : undefined,
  }));

  // Load live KDS queue from backend
  const { data: rawKdsQueue = [], isLoading: isLoadingKds } = useQuery({
    queryKey: ['posKdsQueue', activeOutletId],
    queryFn: () => (activeOutletId ? posApi.getKdsQueue(activeOutletId) : Promise.resolve([])),
    enabled: !!activeOutletId,
  });

  const kdsQueue: KdsTicket[] = rawKdsQueue.map((k: any) => ({
    orderId: k.orderId || k.id || `KDS-${k.number || ''}`,
    table: k.tableNumber || k.table || 'Table',
    station: k.stationName || k.station || 'Main Kitchen',
    elapsed: k.elapsed || `${k.minutesElapsed || 5} mins`,
    items: Array.isArray(k.items) ? k.items.map((i: any) => (typeof i === 'string' ? i : i.name)) : [],
  }));

  const [chargeRoomNumber, setChargeRoomNumber] = useState('');
  const [chargeAmount, setChargeAmount] = useState('');
  const [chargedSuccess, setChargedSuccess] = useState(false);
  const [isCharging, setIsCharging] = useState(false);

  const handleChargeToRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chargeRoomNumber || !chargeAmount) return;
    setIsCharging(true);
    try {
      await posApi.chargeToRoom({
        propertyId: outletDetail?.propertyId || '00000000-0000-0000-0000-000000000001',
        roomNumber: chargeRoomNumber,
        amount: Number(chargeAmount),
        outletName: outletDetail?.name || 'Main Dining Restaurant',
      });
      setChargedSuccess(true);
      setTimeout(() => setChargedSuccess(false), 3000);
      setChargeRoomNumber('');
      setChargeAmount('');
    } catch {
      // Handled
    } finally {
      setIsCharging(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-[#00a8ff] font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-slate-400">Point of Sale (POS)</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-[#00a8ff]" /> Omnichannel Point of Sale (POS)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Visual table floorplans, Kitchen Display System (KDS), and direct room charge folio settlement (Chapter 9).
          </p>
        </div>

        {/* Outlet Selector & Tabs */}
        <div className="flex items-center gap-3">
          {outlets.length > 0 && (
            <select
              value={activeOutletId}
              onChange={(e) => setSelectedOutletId(e.target.value)}
              className="h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none"
            >
              {outlets.map((o: any) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          )}

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveTab('tables')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'tables' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dining Tables
            </button>
            <button
              onClick={() => setActiveTab('kds')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'kds' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kitchen KDS Display
            </button>
            <button
              onClick={() => setActiveTab('charge')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'charge' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Charge to Room Folio
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'tables' && (
        <>
          {isLoadingOutlets || isLoadingOutletDetail ? (
            <div className="flex items-center justify-center p-12 bg-white rounded-lg border border-slate-200">
              <Loader2 className="w-6 h-6 animate-spin text-[#00a8ff]" />
            </div>
          ) : tables.length === 0 ? (
            <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-lg space-y-3">
              <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">No dining tables registered</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Create a POS outlet and configure tables to manage floor plans and seated orders.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {tables.map((t) => (
                <div
                  key={t.id}
                  className={`p-4 rounded-lg border transition-all shadow-2xs space-y-3 ${
                    t.status === 'Vacant'
                      ? 'bg-white border-slate-200'
                      : t.status === 'Kitchen Cooking'
                      ? 'bg-amber-50/50 border-amber-200'
                      : 'bg-blue-50/50 border-blue-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{t.tableNumber}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.status === 'Vacant'
                          ? 'bg-emerald-100 text-emerald-800'
                          : t.status === 'Kitchen Cooking'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{t.section} · {t.capacity} Seats</p>
                  {t.currentBill && (
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">Current Tab:</span>
                      <span className="font-bold text-xs text-slate-900">{formatCurrency(t.currentBill)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'kds' && (
        <>
          {isLoadingKds ? (
            <div className="flex items-center justify-center p-12 bg-white rounded-lg border border-slate-200">
              <Loader2 className="w-6 h-6 animate-spin text-[#00a8ff]" />
            </div>
          ) : kdsQueue.length === 0 ? (
            <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-lg space-y-3">
              <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <Monitor className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Kitchen Display is Clear</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No active kitchen tickets in queue. New restaurant or in-room orders will stream live to this station.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {kdsQueue.map((k) => (
                <div key={k.orderId} className="p-4 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <span className="font-bold text-xs text-slate-900">{k.orderId}</span>
                      <p className="text-[10px] text-slate-500">{k.table}</p>
                    </div>
                    <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50 text-[10px]">
                      {k.elapsed}
                    </Badge>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {k.items.map((it, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00a8ff]" />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <Button size="sm" className="h-7 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white">
                      Mark Order Ready
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'charge' && (
        <div className="max-w-lg mx-auto bg-white border border-slate-200 rounded-lg p-6 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BedDouble className="w-4 h-4 text-[#00a8ff]" /> Two-Way Guest Room Folio Charge
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verify occupied guest room and post dining check directly to open guest folio (Chapter 9.4).
            </p>
          </div>

          {chargedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Charge posted to Room Folio successfully!</span>
            </div>
          )}

          <form onSubmit={handleChargeToRoom} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Occupied Room Number *</label>
              <input
                type="text"
                placeholder="e.g. 101"
                value={chargeRoomNumber}
                onChange={(e) => setChargeRoomNumber(e.target.value)}
                required
                className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Bill Amount ($) *</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={chargeAmount}
                onChange={(e) => setChargeAmount(e.target.value)}
                required
                className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none"
              />
            </div>
            <Button type="submit" disabled={isCharging} className="w-full bg-[#00a8ff] hover:bg-[#0097e6] text-white">
              {isCharging ? 'Authorizing & Posting...' : 'Authorize & Post to Folio'}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}

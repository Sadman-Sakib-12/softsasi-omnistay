'use client';

import React, { useState } from 'react';
import { UtensilsCrossed, Plus, LayoutGrid, Monitor, CreditCard, Receipt, CheckCircle2, BedDouble } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DiningTable {
  id: string;
  tableNumber: string;
  section: string;
  capacity: number;
  status: 'Vacant' | 'Seated' | 'Kitchen Cooking' | 'Served';
  currentBill?: number;
}

export default function PosTerminalPage() {
  const [activeTab, setActiveTab] = useState<'tables' | 'kds' | 'charge'>('tables');
  const [tables, setTables] = useState<DiningTable[]>([
    { id: 't-1', tableNumber: 'Table 01', section: 'Main Indoor', capacity: 4, status: 'Vacant' },
    { id: 't-2', tableNumber: 'Table 02', section: 'Main Indoor', capacity: 2, status: 'Seated', currentBill: 85.50 },
    { id: 't-3', tableNumber: 'Table 03', section: 'Garden Terrace', capacity: 6, status: 'Kitchen Cooking', currentBill: 160.00 },
    { id: 't-4', tableNumber: 'Table 04', section: 'Pool Cabana VIP', capacity: 8, status: 'Served', currentBill: 240.00 },
    { id: 't-5', tableNumber: 'Table 05', section: 'Rooftop Bar', capacity: 4, status: 'Vacant' },
  ]);

  const [chargeRoomNumber, setChargeRoomNumber] = useState('302');
  const [chargeAmount, setChargeAmount] = useState('85.50');
  const [chargedSuccess, setChargedSuccess] = useState(false);

  const handleChargeToRoom = (e: React.FormEvent) => {
    e.preventDefault();
    setChargedSuccess(true);
    setTimeout(() => setChargedSuccess(false), 3000);
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

        {/* Navigation Tabs */}
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

      {activeTab === 'tables' && (
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

      {activeTab === 'kds' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { orderId: 'KDS-108', table: 'Table 03', station: 'Grill Station', elapsed: '8 mins', items: ['Wagyu Ribeye Steak (Medium)', 'Grilled Asparagus', 'Truffle Mash'] },
            { orderId: 'KDS-109', table: 'Table 02', station: 'Salad & Cold Station', elapsed: '4 mins', items: ['Burrata Caprese Salad', 'Lobster Bisque'] },
            { orderId: 'KDS-110', table: 'Room 304 (In-Room Dining)', station: 'Main Kitchen', elapsed: '14 mins', items: ['Club Sandwich with Fries', 'San Pellegrino Sparkling'] },
          ].map((k) => (
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
              <span>Charge of ${chargeAmount} posted to Room #{chargeRoomNumber} Folio!</span>
            </div>
          )}

          <form onSubmit={handleChargeToRoom} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Occupied Room Number *</label>
              <input
                type="text"
                value={chargeRoomNumber}
                onChange={(e) => setChargeRoomNumber(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Bill Amount ($) *</label>
              <input
                type="text"
                value={chargeAmount}
                onChange={(e) => setChargeAmount(e.target.value)}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800"
              />
            </div>
            <Button type="submit" className="w-full bg-[#00a8ff] hover:bg-[#0097e6] text-white">
              Authorize & Post to Folio
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}

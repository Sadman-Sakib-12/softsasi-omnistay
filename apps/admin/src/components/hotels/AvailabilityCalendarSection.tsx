'use client';

import React, { useState } from 'react';
import { useAdminStore } from '../../store/adminStore';
import { CalendarDays, ChevronLeft, ChevronRight, Sliders, DollarSign, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

export const AvailabilityCalendarSection: React.FC = () => {
  const { properties, selectedPropertyId } = useAdminStore();
  const selectedHotel = properties.find((p) => p.id === selectedPropertyId) || properties[0];

  const [currentMonth, setCurrentMonth] = useState('October 2026');

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const roomCategories = [
    {
      title: 'Deluxe Double Room',
      baseRate: 150,
      inventory: 12,
      calendarDays: [
        { day: 1, price: 150, status: 'open' },
        { day: 2, price: 150, status: 'open' },
        { day: 3, price: 180, status: 'surge' },
        { day: 4, price: 180, status: 'surge' },
        { day: 5, price: 210, status: 'weekend' },
        { day: 6, price: 210, status: 'weekend' },
        { day: 7, price: 150, status: 'open' },
      ],
    },
    {
      title: 'Overwater Sunset Bungalow',
      baseRate: 420,
      inventory: 6,
      calendarDays: [
        { day: 1, price: 420, status: 'open' },
        { day: 2, price: 420, status: 'open' },
        { day: 3, price: 480, status: 'surge' },
        { day: 4, price: 480, status: 'surge' },
        { day: 5, price: 550, status: 'weekend' },
        { day: 6, price: 550, status: 'weekend' },
        { day: 7, price: 420, status: 'open' },
      ],
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Breadcrumb matching Figure 4.3 in PDF */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span>Dashboard</span>
        <span>/</span>
        <span>Hotels</span>
        <span>/</span>
        <span className="text-slate-200 font-semibold">Room Availability Calendar</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Room Availability & Dynamic Rate Calendar</h1>
          <p className="text-xs text-slate-400 mt-1">
            Replicating Figure 4.3: Interactive Dynamic Pricing & Availability Calendar Grid.
          </p>
        </div>

        {/* Month Selector matching Figure 4.3 */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1.5">
          <button className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-white px-3 font-mono">{currentMonth}</span>
          <button className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Matrix Grid matching Figure 4.3 */}
      <div className="space-y-6">
        {roomCategories.map((cat, idx) => (
          <div key={idx} className="p-5 rounded-2xl glass-panel space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">{cat.title}</h3>
                <p className="text-[11px] text-slate-400">
                  Total Inventory: <span className="text-sky-400 font-mono font-bold">{cat.inventory} units</span> • Standard Base Rate: <span className="font-mono text-emerald-400">{formatCurrency(cat.baseRate)}</span>
                </p>
              </div>
            </div>

            {/* 7-Day Header */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs">
              {daysOfWeek.map((dow, dIdx) => (
                <div key={dIdx} className="font-bold text-slate-400 uppercase text-[10px] py-1">
                  {dow}
                </div>
              ))}

              {/* Day Rate Blocks matching Figure 4.3 */}
              {cat.calendarDays.map((cd, dIdx) => (
                <div
                  key={dIdx}
                  className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-sky-500/50 transition-all text-center space-y-1.5 cursor-pointer group"
                >
                  <p className="text-[10px] text-slate-400 font-mono">Oct {cd.day}</p>
                  <div className="py-1 px-2 rounded-lg bg-sky-500/15 group-hover:bg-sky-500 text-sky-300 group-hover:text-slate-950 font-bold font-mono text-xs transition-colors">
                    {formatCurrency(cd.price)}
                  </div>
                  <span className="text-[9px] text-emerald-400 font-semibold block">Available</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

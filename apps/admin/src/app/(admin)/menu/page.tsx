'use client';

import React, { useState } from 'react';
import { Menu as MenuIcon, Plus, MoveVertical, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MenuManagerPage() {
  const [menuItems] = useState([
    { id: '1', title: 'Home', url: '/', target: '_self' },
    { id: '2', title: 'Hotels & Resorts', url: '/hotels', target: '_self' },
    { id: '3', title: 'Tours & Excursions', url: '/tours', target: '_self' },
    { id: '4', title: 'Coworking Spaces', url: '/spaces', target: '_self' },
    { id: '5', title: 'Car Rentals', url: '/cars', target: '_self' },
    { id: '6', title: 'Yacht Charters', url: '/boats', target: '_self' },
    { id: '7', title: 'Event Passes', url: '/events', target: '_self' },
    { id: '8', title: 'Flight Transfers', url: '/flights', target: '_self' },
    { id: '9', title: 'About Us', url: '/about-us', target: '_self' },
  ]);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-[#00a8ff] font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-slate-400">System / Menu</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <MenuIcon className="w-6 h-6 text-[#00a8ff]" /> Navigation Menu Builder
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure header and footer navigation menus across guest portals.
          </p>
        </div>

        <button className="h-9 px-4 bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>Add Menu Item</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-2">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-2 border-b border-slate-100">
          Main Header Menu (9 Items)
        </div>
        <div className="space-y-1.5">
          {menuItems.map((item, idx) => (
            <div key={item.id} className="p-3 rounded border border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MoveVertical className="w-4 h-4 text-slate-400 cursor-grab" />
                <span className="text-xs font-bold text-slate-800">{idx + 1}. {item.title}</span>
                <span className="text-[11px] font-mono text-slate-500">{item.url}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Standard Link</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

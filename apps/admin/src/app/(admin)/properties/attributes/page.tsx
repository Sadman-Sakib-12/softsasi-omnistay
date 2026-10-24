'use client';

import React, { useState } from 'react';
import { Tag, Plus, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PropertyAttributesPage() {
  const [attributes] = useState([
    { id: '1', name: 'Infinity Swimming Pool', category: 'Facilities', itemsCount: 12 },
    { id: '2', name: 'Private Beach Access', category: 'Location Features', itemsCount: 6 },
    { id: '3', name: '24/7 Fine Dining Restaurant', category: 'Dining', itemsCount: 18 },
    { id: '4', name: 'Luxury Spa & Sauna', category: 'Wellness', itemsCount: 9 },
    { id: '5', name: 'Helipad & Seaplane Dock', category: 'Transport', itemsCount: 3 },
  ]);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-[#00a8ff] font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-slate-400">Hotels / Attributes</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Tag className="w-6 h-6 text-[#00a8ff]" /> Property Attributes & Facilities
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Global amenity catalog, property badges, and listing filter tags (Chapter 4.1.1).
          </p>
        </div>

        <button className="h-9 px-4 bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>Add Attribute</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Attribute Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Properties Tagged</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {attributes.map((att) => (
              <tr key={att.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-4 font-semibold text-slate-900">{att.name}</td>
                <td className="py-3 px-4 text-slate-600">{att.category}</td>
                <td className="py-3 px-4 text-slate-600 font-bold">{att.itemsCount} properties</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

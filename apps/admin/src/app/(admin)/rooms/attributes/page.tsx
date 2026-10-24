'use client';

import React, { useState } from 'react';
import { BedDouble, Plus, Wifi, Tv, Wind, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RoomAttributesPage() {
  const [attributes] = useState([
    { id: '1', name: 'High-Speed Wi-Fi 6', category: 'Technology', roomsCount: 38 },
    { id: '2', name: 'Smart Digital Climate Control / HVAC', category: 'Comfort', roomsCount: 38 },
    { id: '3', name: '65-inch 4K Smart TV with AirPlay', category: 'Technology', roomsCount: 24 },
    { id: '4', name: 'Nespresso Gourmet Coffee Machine', category: 'Refreshment', roomsCount: 16 },
    { id: '5', name: 'Marble Deep Soaking Bathtub', category: 'Bathroom & Wellness', roomsCount: 8 },
  ]);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-[#00a8ff] font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-slate-400">Hotels / Room Attributes</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <BedDouble className="w-6 h-6 text-[#00a8ff]" /> Room Amenities & Bed Attributes
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            In-room technology, bed classifications, and wellness amenities taxonomy (Chapter 4.1.2.4).
          </p>
        </div>

        <button className="h-9 px-4 bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>Add Room Attribute</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Amenity Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Rooms Equipped</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {attributes.map((att) => (
              <tr key={att.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-4 font-semibold text-slate-900">{att.name}</td>
                <td className="py-3 px-4 text-slate-600">{att.category}</td>
                <td className="py-3 px-4 text-slate-600 font-bold">{att.roomsCount} units</td>
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

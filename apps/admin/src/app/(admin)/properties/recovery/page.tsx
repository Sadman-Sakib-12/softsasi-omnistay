'use client';

import React, { useState } from 'react';
import { RotateCcw, Search, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PropertiesRecoveryPage() {
  const [archivedItems, setArchivedItems] = useState([
    { id: '1', name: 'Standard Twin Room #104', type: 'Physical Room Unit', deletedAt: '2026-10-22', deletedBy: 'Super Admin' },
    { id: '2', name: 'Executive Suite Sea View', type: 'Room Category', deletedAt: '2026-10-18', deletedBy: 'GM' },
  ]);

  const handleRestore = (id: string) => {
    setArchivedItems(archivedItems.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-[#00a8ff] font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-slate-400">Hotels / Recovery</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <RotateCcw className="w-6 h-6 text-[#00a8ff]" /> Soft-Deleted Entity Recovery
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Restore archived hotels, room types, and deleted inventory units without data loss.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Entity Name</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Deleted Date</th>
              <th className="py-3 px-4">Archived By</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {archivedItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  Trash bin is clean. No soft-deleted items found.
                </td>
              </tr>
            ) : (
              archivedItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">{item.name}</td>
                  <td className="py-3 px-4 text-slate-500">{item.type}</td>
                  <td className="py-3 px-4 text-slate-500">{item.deletedAt}</td>
                  <td className="py-3 px-4 text-slate-500">{item.deletedBy}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleRestore(item.id)}
                      className="px-3 py-1 bg-[#00a8ff] hover:bg-[#0097e6] text-white text-[11px] font-semibold rounded inline-flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" /> Restore
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

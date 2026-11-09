'use client';

import React, { useState, useEffect } from 'react';
import { RotateCcw, Search, Trash2, CheckCircle2 } from 'lucide-react';
import { BeatLoader } from 'react-spinners';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api/client';
import { showAlert } from '@/lib/sweetalert';

export interface ArchivedItem {
  id: string;
  name: string;
  type: string;
  deletedAt: string;
  archivedBy: string;
}

export default function PropertiesRecoveryPage() {
  const [archivedItems, setArchivedItems] = useState<ArchivedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadArchived = async () => {
    setLoading(true);
    try {
      const res = await api.get<ArchivedItem[]>('/api/v1/properties/archived/all');
      setArchivedItems(Array.isArray(res) ? res : []);
    } catch {
      setArchivedItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArchived();
  }, []);

  const handleRestore = async (id: string, type: string) => {
    setRestoringId(id);
    try {
      await api.post('/api/v1/properties/archived/restore', { id, type });
      setActionNotice(`Successfully restored "${type}" back to active database.`);
      setArchivedItems((prev) => prev.filter((item) => item.id !== id));
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err: any) {
      await showAlert({
        title: 'Restore Failed',
        text: `Failed to restore item: ${err?.message || 'Database error'}`,
        icon: 'error',
      });
    } finally {
      setRestoringId(null);
    }
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
            Restore archived hotels, room types, and deleted inventory units directly from PostgreSQL without data loss.
          </p>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionNotice}</span>
        </div>
      )}

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
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <BeatLoader color="#00a8ff" size={10} />
                    <span className="text-xs text-slate-500">Querying soft-deleted records from PostgreSQL...</span>
                  </div>
                </td>
              </tr>
            ) : archivedItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  Trash bin is clean. No soft-deleted items found in PostgreSQL database.
                </td>
              </tr>
            ) : (
              archivedItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">{item.name}</td>
                  <td className="py-3 px-4 text-slate-500 font-medium">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold uppercase">
                      {item.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {new Date(item.deletedAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-slate-500">{item.archivedBy}</td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      size="sm"
                      onClick={() => handleRestore(item.id, item.type)}
                      disabled={restoringId === item.id}
                      className="h-7 px-3 bg-[#00a8ff] hover:bg-[#0097e6] text-white text-[11px] font-semibold rounded inline-flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {restoringId === item.id ? (
                        <BeatLoader color="#ffffff" size={6} />
                      ) : (
                        <>
                          <RotateCcw className="w-3 h-3" /> Restore
                        </>
                      )}
                    </Button>
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

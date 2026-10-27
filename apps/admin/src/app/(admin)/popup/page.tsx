'use client';

import React, { useState } from 'react';
import { Layers, Plus, Search, Eye, CheckCircle2, Pause, Play, Trash2, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contentService, PopupModalItem } from '@/features/content/services/content.service';

export default function PopupsPage() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newPopup, setNewPopup] = useState<Partial<PopupModalItem>>({
    title: '',
    trigger: '',
  });

  const { data: popups = [], isLoading } = useQuery<PopupModalItem[]>({
    queryKey: ['systemPopups'],
    queryFn: () => contentService.getPopups(),
  });

  const createMutation = useMutation({
    mutationFn: (dto: Partial<PopupModalItem>) => contentService.createPopup(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemPopups'] });
      setIsAddOpen(false);
      setNewPopup({ title: '', trigger: '' });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => contentService.togglePopupStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemPopups'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contentService.deletePopup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemPopups'] });
    },
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-[#00a8ff] font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-slate-400">System / Popups</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#00a8ff]" /> Marketing Popups & Promo Modals
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure exit-intent banners, seasonal discount modals, and guest newsletter opt-ins.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="h-9 px-4 bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Popup</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Campaign Title</th>
              <th className="py-3 px-4">Display Trigger</th>
              <th className="py-3 px-4">Impressions</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#00a8ff]" />
                  <span className="mt-2 block text-xs">Loading popups...</span>
                </td>
              </tr>
            ) : popups.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                  No marketing popups active.
                </td>
              </tr>
            ) : (
              popups.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">{p.title}</td>
                  <td className="py-3 px-4 text-slate-500">{p.trigger}</td>
                  <td className="py-3 px-4 text-slate-600">{p.impressions.toLocaleString()} views</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        p.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleStatusMutation.mutate(p.id)}
                        className="text-xs text-slate-500 hover:text-slate-800 font-semibold inline-flex items-center gap-1"
                      >
                        {p.status === 'Active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span>{p.status === 'Active' ? 'Pause' : 'Activate'}</span>
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(p.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Popup Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#00a8ff]" /> Create Marketing Popup
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await createMutation.mutateAsync(newPopup);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={newPopup.title}
                  onChange={(e) => setNewPopup({ ...newPopup, title: e.target.value })}
                  placeholder="e.g. Easter Weekend Staycation 20% Off"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff]"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Display Trigger</label>
                <select
                  required
                  value={newPopup.trigger}
                  onChange={(e) => setNewPopup({ ...newPopup, trigger: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff]"
                >
                  <option value="" disabled>Select Trigger...</option>
                  <option value="After 5s Page Load">After 5s Page Load</option>
                  <option value="Exit Intent">Exit Intent</option>
                  <option value="On Scroll 50%">On Scroll 50%</option>
                  <option value="Immediate">Immediate Upon Landing</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createMutation.isPending}
                  className="bg-[#00a8ff] hover:bg-[#0097e6] text-white"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Popup'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

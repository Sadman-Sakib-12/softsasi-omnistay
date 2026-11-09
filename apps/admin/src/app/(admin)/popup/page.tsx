'use client';
import { BeatLoader } from 'react-spinners';

import React, { useState } from 'react';
import { Layers, Plus, Search, Eye, CheckCircle2, Pause, Play, Edit, Trash2, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contentService, PopupModalItem } from '@/features/content/services/content.service';
import { showConfirm } from '@/lib/sweetalert';

export default function PopupsPage() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPopup, setEditingPopup] = useState<PopupModalItem | null>(null);

  const [newPopup, setNewPopup] = useState<Partial<PopupModalItem>>({
    title: '',
    trigger: 'On Page Load',
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
      setNewPopup({ title: '', trigger: 'On Page Load' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<PopupModalItem> }) => contentService.updatePopup(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemPopups'] });
      setEditingPopup(null);
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

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPopup.title) return;
    createMutation.mutate(newPopup);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPopup) return;
    updateMutation.mutate({
      id: editingPopup.id,
      dto: {
        title: editingPopup.title,
        trigger: editingPopup.trigger,
      },
    });
  };

  const handleDelete = async (id: string, title: string) => {
    const confirmed = await showConfirm({
      title: 'Delete Popup?',
      text: `Are you sure you want to delete popup "${title}"?`,
      confirmButtonText: 'Yes, delete',
      icon: 'warning',
    });
    if (confirmed) {
      deleteMutation.mutate(id);
    }
  };

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
                  No marketing popups active. Click "Create Popup" to configure your first campaign.
                </td>
              </tr>
            ) : (
              popups.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-[#00a8ff]" />
                    <span>{p.title}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{p.trigger}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{p.impressions} Views</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        p.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => toggleStatusMutation.mutate(p.id)}
                        className={`p-1 rounded transition-colors ${
                          p.status === 'Active'
                            ? 'text-amber-500 hover:text-amber-700 hover:bg-amber-50'
                            : 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50'
                        }`}
                        title={p.status === 'Active' ? 'Pause Campaign' : 'Resume Campaign'}
                      >
                        {p.status === 'Active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => setEditingPopup(p)}
                        className="p-1 text-slate-500 hover:text-[#00a8ff] transition-colors rounded hover:bg-slate-100"
                        title="Edit Popup"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.title)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors rounded hover:bg-rose-50"
                        title="Delete Popup"
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
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#00a8ff]" /> Create Marketing Popup
              </h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Popup Campaign Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Winter Holiday 25% Off Banner"
                  value={newPopup.title}
                  onChange={(e) => setNewPopup({ ...newPopup, title: e.target.value })}
                  className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded focus:outline-none focus:border-[#00a8ff]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Display Trigger</label>
                <select
                  value={newPopup.trigger}
                  onChange={(e) => setNewPopup({ ...newPopup, trigger: e.target.value })}
                  className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-700"
                >
                  <option value="On Page Load">On Page Load (Immediate)</option>
                  <option value="Exit Intent">Exit Intent (Mouse Leaves Screen)</option>
                  <option value="5-Second Delay">5-Second Delay</option>
                  <option value="50% Scroll Depth">50% Scroll Depth</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-[#00a8ff] hover:bg-[#0097e6] text-white">
                  Save Campaign
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Popup Modal */}
      {editingPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#00a8ff]" /> Edit Marketing Popup
              </h3>
              <button
                type="button"
                onClick={() => setEditingPopup(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Popup Campaign Title *</label>
                <input
                  type="text"
                  required
                  value={editingPopup.title}
                  onChange={(e) => setEditingPopup({ ...editingPopup, title: e.target.value })}
                  className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded focus:outline-none focus:border-[#00a8ff]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Display Trigger</label>
                <select
                  value={editingPopup.trigger}
                  onChange={(e) => setEditingPopup({ ...editingPopup, trigger: e.target.value })}
                  className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-700"
                >
                  <option value="On Page Load">On Page Load (Immediate)</option>
                  <option value="Exit Intent">Exit Intent (Mouse Leaves Screen)</option>
                  <option value="5-Second Delay">5-Second Delay</option>
                  <option value="50% Scroll Depth">50% Scroll Depth</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingPopup(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-[#00a8ff] hover:bg-[#0097e6] text-white">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

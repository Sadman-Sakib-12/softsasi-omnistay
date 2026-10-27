'use client';

import React, { useState } from 'react';
import { Menu as MenuIcon, Plus, MoveVertical, ExternalLink, Trash2, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contentService, NavigationMenuItem } from '@/features/content/services/content.service';

export default function MenuManagerPage() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<NavigationMenuItem>>({
    title: '',
    url: '',
    target: '_self',
  });

  const { data: menuItems = [], isLoading } = useQuery<NavigationMenuItem[]>({
    queryKey: ['systemMenus'],
    queryFn: () => contentService.getMenus(),
  });

  const createMutation = useMutation({
    mutationFn: (dto: Partial<NavigationMenuItem>) => contentService.createMenuItem(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemMenus'] });
      setIsAddOpen(false);
      setNewItem({ title: '', url: '', target: '_self' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contentService.deleteMenuItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemMenus'] });
    },
  });

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

        <button
          onClick={() => setIsAddOpen(true)}
          className="h-9 px-4 bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Menu Item</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-2">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
          <span>Main Header Navigation</span>
          <span className="font-mono text-slate-400">{menuItems.length} Links</span>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            <Loader2 className="w-4 h-4 animate-spin mx-auto text-[#00a8ff]" />
            <span className="mt-2 block">Loading navigation tree...</span>
          </div>
        ) : menuItems.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No navigation menu items configured.
          </div>
        ) : (
          <div className="space-y-1.5">
            {menuItems.map((item, idx) => (
              <div key={item.id} className="p-3 rounded border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MoveVertical className="w-4 h-4 text-slate-400 cursor-grab" />
                  <span className="text-xs font-bold text-slate-800">{idx + 1}. {item.title}</span>
                  <span className="text-[11px] font-mono text-slate-500">{item.url}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-medium">Standard Link</span>
                  <button
                    onClick={() => deleteMutation.mutate(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Menu Item Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <MenuIcon className="w-4 h-4 text-[#00a8ff]" /> Add Navigation Menu Link
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await createMutation.mutateAsync(newItem);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Link Title</label>
                <input
                  type="text"
                  required
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  placeholder="e.g. Special Offers"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff]"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Target URL</label>
                <input
                  type="text"
                  required
                  value={newItem.url}
                  onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                  placeholder="e.g. /offers"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono focus:outline-hidden focus:border-[#00a8ff]"
                />
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
                  {createMutation.isPending ? 'Adding...' : 'Add Link'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

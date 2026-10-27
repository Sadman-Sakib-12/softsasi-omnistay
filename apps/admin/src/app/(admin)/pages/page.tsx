'use client';

import React, { useState } from 'react';
import { FileText, Plus, Search, Trash2, Loader2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contentService, CustomPageItem } from '@/features/content/services/content.service';

export default function StaticPagesCmsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newPage, setNewPage] = useState<Partial<CustomPageItem>>({
    title: '',
    slug: '',
    template: '',
    status: 'Published',
  });

  const { data: pages = [], isLoading } = useQuery<CustomPageItem[]>({
    queryKey: ['systemPages'],
    queryFn: () => contentService.getPages(),
  });

  const createMutation = useMutation({
    mutationFn: (dto: Partial<CustomPageItem>) => contentService.createPage(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemPages'] });
      setIsAddOpen(false);
      setNewPage({ title: '', slug: '', template: '', status: 'Published' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contentService.deletePage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemPages'] });
    },
  });

  const filtered = pages.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-[#00a8ff] font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-slate-400">Content / Pages</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#00a8ff]" /> Static & Custom Site Pages
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Build bespoke landing pages, legal disclosures, and about pages.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="h-9 px-4 bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Page</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Page Title</th>
              <th className="py-3 px-4">URL Slug</th>
              <th className="py-3 px-4">Template</th>
              <th className="py-3 px-4">Last Updated</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#00a8ff]" />
                  <span className="mt-2 block text-xs">Loading custom pages...</span>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                  No static pages found.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">{p.title}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{p.slug}</td>
                  <td className="py-3 px-4 text-slate-600">{p.template}</td>
                  <td className="py-3 px-4 text-slate-500">{p.updated}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => deleteMutation.mutate(p.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete page"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Page Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#00a8ff]" /> Create Custom Web Page
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await createMutation.mutateAsync(newPage);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Page Title</label>
                <input
                  type="text"
                  required
                  value={newPage.title}
                  onChange={(e) => setNewPage({ ...newPage, title: e.target.value })}
                  placeholder="e.g. Wellness Spa Guidelines"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff]"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">URL Slug</label>
                <input
                  type="text"
                  value={newPage.slug}
                  onChange={(e) => setNewPage({ ...newPage, slug: e.target.value })}
                  placeholder="e.g. /spa-guidelines"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono focus:outline-hidden focus:border-[#00a8ff]"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Layout Template</label>
                <select
                  required
                  value={newPage.template}
                  onChange={(e) => setNewPage({ ...newPage, template: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff]"
                >
                  <option value="" disabled>Select Layout Template...</option>
                  <option value="Standard Template">Standard Template</option>
                  <option value="Corporate Story">Corporate Story</option>
                  <option value="Legal Terms">Legal Terms</option>
                  <option value="Careers Portal">Careers Portal</option>
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
                  {createMutation.isPending ? 'Saving...' : 'Create Page'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

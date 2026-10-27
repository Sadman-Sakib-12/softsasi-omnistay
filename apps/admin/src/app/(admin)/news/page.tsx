'use client';

import React, { useState } from 'react';
import { Newspaper, Plus, Search, Calendar, User, Eye, Trash2, Loader2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contentService, NewsArticleItem } from '@/features/content/services/content.service';

export default function NewsCmsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [newArticle, setNewArticle] = useState<Partial<NewsArticleItem>>({
    title: '',
    category: '',
    author: '',
    status: 'Published',
  });

  const { data: articles = [], isLoading } = useQuery<NewsArticleItem[]>({
    queryKey: ['systemNews'],
    queryFn: () => contentService.getNews(),
  });

  const createMutation = useMutation({
    mutationFn: (dto: Partial<NewsArticleItem>) => contentService.createNews(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemNews'] });
      setIsWriteOpen(false);
      setNewArticle({ title: '', category: '', author: '', status: 'Published' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contentService.deleteNews(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemNews'] });
    },
  });

  const filtered = articles.filter((a) =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-[#00a8ff] font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-slate-400">Content / News</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-[#00a8ff]" /> Articles & News Manager
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Publish travel destination guides, hotel announcements, and culinary stories.
          </p>
        </div>

        <button
          onClick={() => setIsWriteOpen(true)}
          className="h-9 px-4 bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Write Article</span>
        </button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search news..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-hidden focus:border-[#00a8ff]"
          />
        </div>
        <span className="text-xs text-slate-500">Found {filtered.length} articles</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Article Title</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Author</th>
              <th className="py-3 px-4">Publish Date</th>
              <th className="py-3 px-4">Views</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#00a8ff]" />
                  <span className="mt-2 block text-xs">Loading articles...</span>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                  No articles found.
                </td>
              </tr>
            ) : (
              filtered.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">{a.title}</td>
                  <td className="py-3 px-4 text-slate-600">{a.category}</td>
                  <td className="py-3 px-4 text-slate-600 flex items-center gap-1.5 pt-4">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{a.author}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{a.date}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{a.views}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {a.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => deleteMutation.mutate(a.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete article"
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

      {/* Write Article Modal */}
      {isWriteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-[#00a8ff]" /> Write New Editorial Article
              </h3>
              <button onClick={() => setIsWriteOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await createMutation.mutateAsync(newArticle);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Article Headline</label>
                <input
                  type="text"
                  required
                  value={newArticle.title}
                  onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                  placeholder="e.g. Exploring Coral Lagoons in the Bay of Bengal"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff]"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Category</label>
                <select
                  value={newArticle.category}
                  onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff]"
                  required
                >
                  <option value="" disabled>Select Category...</option>
                  <option value="Destination Travel">Destination Travel</option>
                  <option value="Dining & Culinary">Dining & Culinary</option>
                  <option value="Hospitality Insights">Hospitality Insights</option>
                  <option value="Resort Activities">Resort Activities</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Author Byline</label>
                <input
                  type="text"
                  value={newArticle.author}
                  onChange={(e) => setNewArticle({ ...newArticle, author: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff]"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsWriteOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createMutation.isPending}
                  className="bg-[#00a8ff] hover:bg-[#0097e6] text-white"
                >
                  {createMutation.isPending ? 'Publishing...' : 'Publish Article'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';
import { BeatLoader } from 'react-spinners';

import React, { useState } from 'react';
import { Newspaper, Plus, Search, Calendar, User, Eye, Edit, Trash2, Loader2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contentService, NewsArticleItem } from '@/features/content/services/content.service';
import { UnifiedRichEditor } from '@/components/editor/unified-rich-editor';
import { showConfirm } from '@/lib/sweetalert';

export default function NewsCmsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticleItem | null>(null);

  const [newArticle, setNewArticle] = useState<Partial<NewsArticleItem>>({
    title: '',
    category: 'Travel Guides',
    author: 'OmniStay Editor',
    status: 'Published',
    content: '',
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
      setNewArticle({ title: '', category: 'Travel Guides', author: 'OmniStay Editor', status: 'Published', content: '' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<NewsArticleItem> }) => contentService.updateNews(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemNews'] });
      setEditingArticle(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contentService.deleteNews(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemNews'] });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArticle.title) return;
    createMutation.mutate(newArticle);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;
    updateMutation.mutate({
      id: editingArticle.id,
      dto: {
        title: editingArticle.title,
        category: editingArticle.category,
        author: editingArticle.author,
        status: editingArticle.status,
        content: editingArticle.content,
      },
    });
  };

  const handleDelete = async (id: string, title: string) => {
    const confirmed = await showConfirm({
      title: 'Delete Article?',
      text: `Are you sure you want to delete article "${title}"?`,
      confirmButtonText: 'Yes, delete',
      icon: 'warning',
    });
    if (confirmed) {
      deleteMutation.mutate(id);
    }
  };

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
            Publish travel destination guides, hotel announcements, and culinary stories (Chapter 19.1).
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
            className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff]"
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
                  No articles found. Click "Write Article" to publish your first post.
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
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setEditingArticle(a)}
                        className="p-1 text-slate-500 hover:text-[#00a8ff] transition-colors rounded hover:bg-slate-100"
                        title="Edit article"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(a.id, a.title)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors rounded hover:bg-rose-50"
                        title="Delete article"
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

      {/* Write Article Modal */}
      {isWriteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-[#00a8ff]" /> Write New Article
              </h3>
              <button
                type="button"
                onClick={() => setIsWriteOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Article Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ultimate Travel Guide to Cox's Bazar 2026"
                  value={newArticle.title}
                  onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                  className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded focus:outline-none focus:border-[#00a8ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category</label>
                  <select
                    value={newArticle.category}
                    onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-700"
                  >
                    <option value="Travel Guides">Travel Guides</option>
                    <option value="Company News">Company News</option>
                    <option value="Culinary & Dining">Culinary & Dining</option>
                    <option value="Hospitality Trends">Hospitality Trends</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Author</label>
                  <input
                    type="text"
                    value={newArticle.author}
                    onChange={(e) => setNewArticle({ ...newArticle, author: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded focus:outline-none focus:border-[#00a8ff]"
                  />
                </div>
              </div>

              <UnifiedRichEditor
                label="Article Body (Tiptap / Editor.js / Markdown)"
                value={newArticle.content || ''}
                onChange={(content) => setNewArticle({ ...newArticle, content })}
                placeholder="Write the article copy here..."
              />

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsWriteOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-[#00a8ff] hover:bg-[#0097e6] text-white">
                  Publish Article
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Article Modal */}
      {editingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-[#00a8ff]" /> Edit Article
              </h3>
              <button
                type="button"
                onClick={() => setEditingArticle(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Article Title *</label>
                <input
                  type="text"
                  required
                  value={editingArticle.title}
                  onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                  className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded focus:outline-none focus:border-[#00a8ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category</label>
                  <select
                    value={editingArticle.category}
                    onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-700"
                  >
                    <option value="Travel Guides">Travel Guides</option>
                    <option value="Company News">Company News</option>
                    <option value="Culinary & Dining">Culinary & Dining</option>
                    <option value="Hospitality Trends">Hospitality Trends</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Status</label>
                  <select
                    value={editingArticle.status}
                    onChange={(e) => setEditingArticle({ ...editingArticle, status: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-700"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <UnifiedRichEditor
                label="Article Body (Tiptap / Editor.js / Markdown)"
                value={editingArticle.content || ''}
                onChange={(content) => setEditingArticle({ ...editingArticle, content })}
                placeholder="Write the article copy here..."
              />

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingArticle(null)}>
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

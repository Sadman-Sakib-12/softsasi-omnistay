'use client';
import { BeatLoader } from 'react-spinners';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Search,
  Edit3,
  Trash2,
  Loader2,
  X,
  ExternalLink,
  Eye,
  Code2,
  CheckCircle2,
  Globe,
  Sparkles,
  Heading1,
  Heading2,
  Bold,
  Italic,
  List,
  Quote,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contentService, CustomPageItem } from '@/features/content/services/content.service';
import { UnifiedRichEditor } from '@/components/editor/unified-rich-editor';

export default function StaticPagesCmsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<CustomPageItem | null>(null);
  const [previewMode, setPreviewMode] = useState<'editor' | 'preview'>('editor');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [newPage, setNewPage] = useState<Partial<CustomPageItem>>({
    title: '',
    slug: '',
    template: 'Standard Template',
    status: 'Published',
    metaTitle: '',
    metaDescription: '',
    content: '',
  });

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const { data: pages = [], isLoading } = useQuery<CustomPageItem[]>({
    queryKey: ['systemPages'],
    queryFn: () => contentService.getPages(),
  });

  const createMutation = useMutation({
    mutationFn: (dto: Partial<CustomPageItem>) => contentService.createPage(dto),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['systemPages'] });
      setIsAddOpen(false);
      setNewPage({
        title: '',
        slug: '',
        template: 'Standard Template',
        status: 'Published',
        metaTitle: '',
        metaDescription: '',
        content: '',
      });
      showToast(`Page "${saved.title}" published successfully!`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CustomPageItem> }) => contentService.updatePage(id, dto),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['systemPages'] });
      setEditingPage(null);
      showToast(`Page "${updated.title}" updated successfully!`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contentService.deletePage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemPages'] });
      showToast('Page deleted successfully.');
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPage.title) return;
    createMutation.mutate(newPage);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;
    updateMutation.mutate({
      id: editingPage.id,
      dto: {
        title: editingPage.title,
        slug: editingPage.slug,
        template: editingPage.template,
        status: editingPage.status,
        metaTitle: editingPage.metaTitle,
        metaDescription: editingPage.metaDescription,
        content: editingPage.content,
      },
    });
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete static page "${title}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const insertSnippet = (snippet: string, isEditing: boolean) => {
    if (isEditing && editingPage) {
      setEditingPage({
        ...editingPage,
        content: (editingPage.content || '') + '\n' + snippet,
      });
    } else {
      setNewPage({
        ...newPage,
        content: (newPage.content || '') + '\n' + snippet,
      });
    }
  };

  const filtered = pages.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Toast alert */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-[#00a8ff] font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-slate-400">Content / Pages CMS</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#00a8ff]" /> CMS Custom & Static Pages
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Author and publish dynamic site pages, legal policies, and custom landing experiences (Sakib Plan Chapter 19).
          </p>
        </div>

        <Link
          href="/themes?create=true"
          className="h-9 px-4 bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Page (Gutenberg)</span>
        </Link>
      </div>

      {/* Search and count */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search pages by title or slug..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#00a8ff]"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">{filtered.length} total pages configured</span>
      </div>

      {/* Pages Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Page Title</th>
              <th className="py-3 px-4">Public URL</th>
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
                  <span className="mt-2 block text-xs">Loading CMS pages from database...</span>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                  No pages found. Click "Add New Page" to publish your first static landing page.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span>{p.title}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">
                    <a
                      href={`http://localhost:3001${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#00a8ff] hover:underline"
                      title="Open page in public marketplace"
                    >
                      <span>{p.slug}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {p.template}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{p.updated}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === 'Published'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/themes?slug=${encodeURIComponent(p.slug.replace(/^\//, ''))}`}
                        className="p-1.5 text-slate-600 hover:text-[#00a8ff] hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Page in WordPress Gutenberg Block Editor"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id, p.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Page"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Page Modal */}
      {editingPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-[#00a8ff]" /> Edit Static Page: {editingPage.title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Update markdown body, page layout template, and SEO indexing meta tags.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingPage(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Page Title *</label>
                  <input
                    type="text"
                    required
                    value={editingPage.title}
                    onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#00a8ff]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">URL Path Slug *</label>
                  <input
                    type="text"
                    required
                    value={editingPage.slug}
                    onChange={(e) => {
                      const val = e.target.value.startsWith('/') ? e.target.value : `/${e.target.value}`;
                      setEditingPage({ ...editingPage, slug: val });
                    }}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-lg font-mono text-slate-700 focus:outline-none focus:border-[#00a8ff]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Page Template</label>
                  <select
                    value={editingPage.template}
                    onChange={(e) => setEditingPage({ ...editingPage, template: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
                  >
                    <option value="Standard Template">Standard Template (Informational / About)</option>
                    <option value="Legal Template">Legal Terms Template (Terms / Privacy)</option>
                    <option value="Landing Page">Landing Page (Marketing Banner & Sections)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Publication Status</label>
                  <select
                    value={editingPage.status}
                    onChange={(e) => setEditingPage({ ...editingPage, status: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
                  >
                    <option value="Published">Published (Live to Public)</option>
                    <option value="Draft">Draft (Internal Only)</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* SEO Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">SEO Meta Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Terms of Service | OmniStay 360"
                    value={editingPage.metaTitle || ''}
                    onChange={(e) => setEditingPage({ ...editingPage, metaTitle: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">SEO Meta Description</label>
                  <input
                    type="text"
                    placeholder="Brief description for search engine snippet..."
                    value={editingPage.metaDescription || ''}
                    onChange={(e) => setEditingPage({ ...editingPage, metaDescription: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              {/* Tiptap / Editor.js Unified Rich Text Editor */}
              <UnifiedRichEditor
                label="Page Body Content (Tiptap / Editor.js / Markdown)"
                value={editingPage.content || ''}
                onChange={(content) => setEditingPage({ ...editingPage, content })}
                placeholder="Compose your rich luxury page content..."
              />

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <a
                  href={`http://localhost:3001${editingPage.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#00a8ff] hover:underline inline-flex items-center gap-1 font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Preview Live Web Page</span>
                </a>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setEditingPage(null)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={updateMutation.isPending}
                    className="bg-[#00a8ff] hover:bg-[#0097e6] text-white"
                  >
                    {updateMutation.isPending ? 'Saving...' : 'Save & Publish Changes'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Page Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#00a8ff]" /> Create Custom Site Page
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Add a new landing page or legal disclosure to the OmniStay portal.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Page Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Host Safety Guidelines"
                    value={newPage.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      const slug = title ? `/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '';
                      setNewPage({ ...newPage, title, slug });
                    }}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#00a8ff]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">URL Path Slug *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. /host-guidelines"
                    value={newPage.slug}
                    onChange={(e) => {
                      const val = e.target.value.startsWith('/') ? e.target.value : `/${e.target.value}`;
                      setNewPage({ ...newPage, slug: val });
                    }}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-lg font-mono text-slate-700 focus:outline-none focus:border-[#00a8ff]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Page Template</label>
                  <select
                    value={newPage.template}
                    onChange={(e) => setNewPage({ ...newPage, template: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
                  >
                    <option value="Standard Template">Standard Template (Informational / About)</option>
                    <option value="Legal Template">Legal Terms Template (Terms / Privacy)</option>
                    <option value="Landing Page">Landing Page (Marketing Banner & Sections)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Publication Status</label>
                  <select
                    value={newPage.status}
                    onChange={(e) => setNewPage({ ...newPage, status: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
                  >
                    <option value="Published">Published (Live to Public)</option>
                    <option value="Draft">Draft (Internal Only)</option>
                  </select>
                </div>
              </div>

              {/* SEO Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">SEO Meta Title</label>
                  <input
                    type="text"
                    placeholder="Meta title for Google and browser tab..."
                    value={newPage.metaTitle || ''}
                    onChange={(e) => setNewPage({ ...newPage, metaTitle: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">SEO Meta Description</label>
                  <input
                    type="text"
                    placeholder="Search engine meta description..."
                    value={newPage.metaDescription || ''}
                    onChange={(e) => setNewPage({ ...newPage, metaDescription: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <UnifiedRichEditor
                label="Page Body Content (Tiptap / Editor.js / Markdown)"
                value={newPage.content || ''}
                onChange={(content) => setNewPage({ ...newPage, content })}
                placeholder="Write the content of this page using Tiptap, Editor.js, or Markdown..."
              />

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createMutation.isPending}
                  className="bg-[#00a8ff] hover:bg-[#0097e6] text-white"
                >
                  {createMutation.isPending ? 'Publishing...' : 'Publish Page'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

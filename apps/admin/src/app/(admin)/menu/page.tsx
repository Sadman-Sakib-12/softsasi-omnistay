'use client';
import { BeatLoader } from 'react-spinners';

import React, { useState } from 'react';
import {
  Menu as MenuIcon,
  Plus,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Edit2,
  Trash2,
  Loader2,
  X,
  CheckCircle2,
  Globe,
  Compass,
  LayoutTemplate,
  ToggleLeft,
  ToggleRight,
  FileText,
  Layers,
  Link as LinkIcon,
  Check,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPublicWebUrl } from '@/config/site.config';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  contentService,
  NavigationMenuItem,
  CustomPageItem,
} from '@/features/content/services/content.service';

const PRESET_VERTICALS = [
  { title: 'Hotels & Resorts', url: '/stays' },
  { title: 'Guided Tours', url: '/tours' },
  { title: 'Car Rentals', url: '/cars' },
  { title: 'Yacht & Boats', url: '/boats' },
  { title: 'Event Spaces', url: '/spaces' },
  { title: 'Flights & Helis', url: '/flights' },
];

export default function MenuManagerPage() {
  const queryClient = useQueryClient();
  const [activeLocation, setActiveLocation] = useState<'header' | 'footer'>('header');
  const [isAddCustomOpen, setIsAddCustomOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NavigationMenuItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Custom link inputs
  const [customTitle, setCustomTitle] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customTarget, setCustomTarget] = useState<'_self' | '_blank'>('_self');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Fetch live CMS pages
  const { data: pages = [], isLoading: isPagesLoading } = useQuery<CustomPageItem[]>({
    queryKey: ['systemPages'],
    queryFn: () => contentService.getPages(),
  });

  // 2. Fetch live navigation menus for selected location
  const { data: allMenuItems = [], isLoading: isMenusLoading } = useQuery<NavigationMenuItem[]>({
    queryKey: ['systemMenus', activeLocation],
    queryFn: () => contentService.getMenus(activeLocation),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (dto: Partial<NavigationMenuItem>) =>
      contentService.createMenuItem({ ...dto, location: activeLocation }),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['systemMenus'] });
      setIsAddCustomOpen(false);
      setCustomTitle('');
      setCustomUrl('');
      showToast(`Added "${saved.title}" to ${activeLocation === 'header' ? 'Header Navbar' : 'Footer'}!`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, item }: { id: string; item: Partial<NavigationMenuItem> }) =>
      contentService.updateMenuItem(id, item),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['systemMenus'] });
      setEditingItem(null);
      showToast(`Updated menu link "${updated.title}"!`);
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (items: { id: string; order: number }[]) => contentService.reorderMenuItems(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemMenus'] });
      showToast('Navigation menu order updated.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contentService.deleteMenuItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemMenus'] });
      showToast('Menu item removed.');
    },
  });

  const handleAddPageToMenu = (page: CustomPageItem) => {
    createMutation.mutate({
      title: page.title,
      url: page.slug,
      target: '_self',
      location: activeLocation,
      isActive: true,
    });
  };

  const handleAddVerticalToMenu = (vertical: { title: string; url: string }) => {
    createMutation.mutate({
      title: vertical.title,
      url: vertical.url,
      target: '_self',
      location: activeLocation,
      isActive: true,
    });
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle || !customUrl) return;
    createMutation.mutate({
      title: customTitle,
      url: customUrl.startsWith('/') || customUrl.startsWith('http') ? customUrl : `/${customUrl}`,
      target: customTarget,
      location: activeLocation,
      isActive: true,
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    updateMutation.mutate({
      id: editingItem.id,
      item: {
        title: editingItem.title,
        url: editingItem.url,
        target: editingItem.target,
        isActive: editingItem.isActive,
      },
    });
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to remove navigation link "${title}" from the ${activeLocation} menu?`)) {
      deleteMutation.mutate(id);
    }
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const list = [...allMenuItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);

    const reorderedPayload = list.map((item, idx) => ({
      id: item.id,
      order: idx + 1,
    }));

    reorderMutation.mutate(reorderedPayload);
  };

  const toggleItemActive = (item: NavigationMenuItem) => {
    updateMutation.mutate({
      id: item.id,
      item: { isActive: !item.isActive },
    });
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-[#00a8ff] font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-slate-400">System / Menu Builder (Booking Core CMS)</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <MenuIcon className="w-6 h-6 text-[#00a8ff]" /> Navigation Menu Builder
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Build and organize public website navigation trees, headers, and footer link collections without code (Chapter 19.1).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={getPublicWebUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
          >
            <Globe className="w-4 h-4 text-[#00a8ff]" />
            <span>View Public Web</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>

      {/* Two-Column Booking Core / WordPress Style Menu Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 cols): Source Accordions (Pages, Verticals, Custom Links) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#00a8ff]" /> Add Items to Menu
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Click any page or vertical to automatically add it to the active menu.
              </p>
            </div>

            {/* Accordion 1: CMS Static Pages */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-[#00a8ff]" /> CMS Custom Pages
                </span>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono font-semibold">
                  {pages.length} Pages
                </span>
              </div>
              <div className="p-2 space-y-1 max-h-48 overflow-y-auto divide-y divide-slate-100">
                {isPagesLoading ? (
                  <div className="py-4 text-center text-xs text-slate-400">Loading pages...</div>
                ) : pages.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-400">No CMS pages found.</div>
                ) : (
                  pages.map((p) => {
                    const isAlreadyInMenu = allMenuItems.some((m) => m.url === p.slug);
                    return (
                      <div key={p.id} className="pt-1.5 first:pt-0 flex items-center justify-between text-xs">
                        <div className="truncate mr-2">
                          <span className="font-semibold text-slate-800 block truncate">{p.title}</span>
                          <span className="font-mono text-[10px] text-slate-400">{p.slug}</span>
                        </div>
                        <button
                          type="button"
                          disabled={createMutation.isPending}
                          onClick={() => handleAddPageToMenu(p)}
                          className={`px-2 py-1 text-[11px] font-semibold rounded shrink-0 transition-colors cursor-pointer flex items-center gap-1 ${
                            isAlreadyInMenu
                              ? 'bg-slate-100 text-slate-600 hover:bg-sky-50 hover:text-[#00a8ff]'
                              : 'bg-sky-50 text-[#00a8ff] hover:bg-[#00a8ff] hover:text-white'
                          }`}
                          title="Add to active menu"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add</span>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Accordion 2: Travel Verticals */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-3.5 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" /> Travel Verticals
                </span>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono font-semibold">
                  6 Verticals
                </span>
              </div>
              <div className="p-2 space-y-1 max-h-48 overflow-y-auto divide-y divide-slate-100">
                {PRESET_VERTICALS.map((v) => {
                  const isAlreadyInMenu = allMenuItems.some((m) => m.url === v.url);
                  return (
                    <div key={v.url} className="pt-1.5 first:pt-0 flex items-center justify-between text-xs">
                      <div className="truncate mr-2">
                        <span className="font-semibold text-slate-800 block">{v.title}</span>
                        <span className="font-mono text-[10px] text-slate-400">{v.url}</span>
                      </div>
                      <button
                        type="button"
                        disabled={createMutation.isPending}
                        onClick={() => handleAddVerticalToMenu(v)}
                        className={`px-2 py-1 text-[11px] font-semibold rounded shrink-0 transition-colors cursor-pointer flex items-center gap-1 ${
                          isAlreadyInMenu
                            ? 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600'
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                        }`}
                        title="Add to active menu"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Accordion 3: Custom External or Internal Link */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-3.5 py-2.5 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                  <LinkIcon className="w-3.5 h-3.5 text-purple-600" /> Custom Link / External URL
                </span>
              </div>
              <form onSubmit={handleCreateCustom} className="p-3 space-y-2.5 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Navigation Label *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VIP Concierge or Blog"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded focus:outline-none focus:border-[#00a8ff]"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Target URL *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. /concierge or https://facebook.com/..."
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="w-full h-8 px-2.5 text-xs font-mono bg-white border border-slate-200 rounded focus:outline-none focus:border-[#00a8ff]"
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <select
                    value={customTarget}
                    onChange={(e) => setCustomTarget(e.target.value as any)}
                    className="h-8 px-2 text-xs bg-white border border-slate-200 rounded text-slate-700"
                  >
                    <option value="_self">Same Tab (_self)</option>
                    <option value="_blank">New Tab (_blank)</option>
                  </select>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={createMutation.isPending}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    + Add to Menu
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Menu Structure Canvas with Tabs & Reordering */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            {/* Location Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Select Menu To Edit:
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <button
                    type="button"
                    onClick={() => setActiveLocation('header')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeLocation === 'header'
                        ? 'bg-[#00a8ff] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Primary Header Navbar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveLocation('footer')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeLocation === 'footer'
                        ? 'bg-[#00a8ff] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <LayoutTemplate className="w-3.5 h-3.5" />
                    <span>Footer Navigation</span>
                  </button>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-semibold text-slate-500">
                  {allMenuItems.length} links active
                </span>
              </div>
            </div>

            {/* Menu Structure Notice */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 flex items-center justify-between">
              <span>
                Use <strong>▲ / ▼</strong> to adjust ordering. Changes instantly update the live public website.
              </span>
              <span className="text-[11px] font-mono text-[#00a8ff] font-semibold">
                Auto-saved to DB
              </span>
            </div>

            {/* Menu Items List */}
            {isMenusLoading ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#00a8ff]" />
                <span className="mt-2 block">Loading navigation structure...</span>
              </div>
            ) : allMenuItems.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs bg-slate-50 rounded-lg border border-dashed border-slate-200">
                No items in this menu. Use the left panel to add CMS Pages, Verticals, or Custom Links.
              </div>
            ) : (
              <div className="space-y-2">
                {allMenuItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-[#00a8ff]/60 hover:shadow-2xs transition-all flex items-center justify-between gap-3"
                  >
                    {/* Left: Reorder Controls & Details */}
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          disabled={idx === 0 || reorderMutation.isPending}
                          onClick={() => moveItem(idx, 'up')}
                          className="p-1 rounded text-slate-400 hover:text-[#00a8ff] hover:bg-sky-50 disabled:opacity-20 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === allMenuItems.length - 1 || reorderMutation.isPending}
                          onClick={() => moveItem(idx, 'down')}
                          className="p-1 rounded text-slate-400 hover:text-[#00a8ff] hover:bg-sky-50 disabled:opacity-20 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[11px] font-bold border border-slate-200">
                        {idx + 1}
                      </span>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{item.title}</span>
                          {item.target === '_blank' && (
                            <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                              External Tab
                            </span>
                          )}
                          {item.isActive === false && (
                            <span className="text-[10px] font-semibold bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded border border-rose-200">
                              Hidden
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[11px] text-slate-400">{item.url}</span>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => toggleItemActive(item)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                        title={item.isActive !== false ? 'Currently Visible (click to hide)' : 'Currently Hidden (click to show)'}
                      >
                        {item.isActive !== false ? (
                          <ToggleRight className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-slate-400" />
                        )}
                      </button>

                      <a
                        href={getPublicWebUrl(item.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-[#00a8ff] rounded-lg hover:bg-sky-50 transition-colors"
                        title="Open destination link in new tab"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      <button
                        type="button"
                        onClick={() => setEditingItem({ ...item })}
                        className="p-1.5 text-slate-500 hover:text-[#00a8ff] rounded-lg hover:bg-sky-50 transition-colors cursor-pointer"
                        title="Edit Item Label & URL"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Link from Menu"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#00a8ff]" /> Edit Navigation Link
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Menu Label Title *</label>
                <input
                  type="text"
                  required
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#00a8ff]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Target URL Path *</label>
                <input
                  type="text"
                  required
                  value={editingItem.url}
                  onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                  className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-lg font-mono text-slate-700 focus:outline-none focus:border-[#00a8ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Target Window</label>
                  <select
                    value={editingItem.target}
                    onChange={(e) => setEditingItem({ ...editingItem, target: e.target.value })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
                  >
                    <option value="_self">Same Tab (_self)</option>
                    <option value="_blank">New Tab (_blank)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Display Status</label>
                  <select
                    value={editingItem.isActive !== false ? 'true' : 'false'}
                    onChange={(e) => setEditingItem({ ...editingItem, isActive: e.target.value === 'true' })}
                    className="w-full h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
                  >
                    <option value="true">Visible</option>
                    <option value="false">Hidden</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingItem(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-[#00a8ff] hover:bg-[#0097e6] text-white">
                  Update Link
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

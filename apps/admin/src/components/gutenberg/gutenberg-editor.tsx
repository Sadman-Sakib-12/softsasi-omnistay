'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BeatLoader } from 'react-spinners';
import {
  GutenbergBlock,
  BlockType,
  createEmptyBlock,
  parseContentToBlocks,
  serializeBlocksToContent,
} from './types';
import { BlockRenderer } from './block-renderer';
import { InlineInserter } from './inline-inserter';
import { LeftBlockDrawer } from './left-block-drawer';
import { RightInspector } from './right-inspector';
import { contentService, CustomPageItem } from '@/features/content/services/content.service';
import {
  Plus,
  Edit2,
  Undo2,
  Redo2,
  Info,
  ListTree,
  Settings,
  MoreVertical,
  ChevronDown,
  Check,
  ExternalLink,
  Eye,
  FileText,
  Trash2,
  Save,
  Sparkles,
  Globe,
  PlusCircle,
  HelpCircle,
  Palette,
} from 'lucide-react';

interface GutenbergEditorProps {
  initialSlug?: string;
  onOpenThemeCustomizer?: () => void;
}

export function GutenbergEditor({ initialSlug, onOpenThemeCustomizer }: GutenbergEditorProps) {
  const queryClient = useQueryClient();

  // Queries
  const { data: pages = [], isLoading: isLoadingPages } = useQuery<CustomPageItem[]>({
    queryKey: ['systemPages'],
    queryFn: () => contentService.getPages(),
  });

  // Active page state
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [pageTitle, setPageTitle] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const [pageStatus, setPageStatus] = useState('Published');
  const [pageTemplate, setPageTemplate] = useState('Standard Template');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');

  // Blocks & Canvas state
  const [blocks, setBlocks] = useState<GutenbergBlock[]>([]);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  // Undo / Redo history
  const [history, setHistory] = useState<GutenbergBlock[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // UI Panels
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightInspectorOpen, setRightInspectorOpen] = useState(true);
  const [showPageMenu, setShowPageMenu] = useState(false);
  const [showDocStats, setShowDocStats] = useState(false);
  const [showOutline, setShowOutline] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Push history snapshot
  const pushHistory = (newBlocks: GutenbergBlock[]) => {
    const updated = history.slice(0, historyIndex + 1);
    updated.push(newBlocks);
    setHistory(updated);
    setHistoryIndex(updated.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setBlocks(prev);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setBlocks(next);
    }
  };

  // Select initial page when pages load
  useEffect(() => {
    if (pages.length > 0 && !selectedPageId) {
      // Find matching page by slug or pick first page
      let target = pages[0];
      if (initialSlug) {
        const found = pages.find(
          (p) =>
            p.slug === initialSlug ||
            p.slug === `/${initialSlug}` ||
            p.slug.replace(/^\//, '') === initialSlug
        );
        if (found) target = found;
      }
      loadPage(target);
    }
  }, [pages, initialSlug, selectedPageId]);

  const loadPage = (page: CustomPageItem) => {
    setSelectedPageId(page.id);
    setPageTitle(page.title || 'Untitled Page');
    setPageSlug(page.slug || '/page');
    setPageStatus(page.status || 'Published');
    setPageTemplate(page.template || 'Standard Template');
    setMetaTitle(page.metaTitle || '');
    setMetaDescription(page.metaDescription || '');
    setFeaturedImage(
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80'
    );

    const parsed = parseContentToBlocks(page.content);
    setBlocks(parsed);
    setActiveBlockId(parsed.length > 0 ? parsed[0].id : null);
    setHistory([parsed]);
    setHistoryIndex(0);
  };

  const handleCreateNewPage = () => {
    const newId = `page-${Date.now()}`;
    const defaultTitle = 'New Page';
    const defaultSlug = `/page-${Math.floor(Math.random() * 900 + 100)}`;
    const initBlocks = [
      createEmptyBlock('heading'),
      createEmptyBlock('paragraph'),
    ];

    setSelectedPageId(newId);
    setPageTitle(defaultTitle);
    setPageSlug(defaultSlug);
    setPageStatus('Draft');
    setPageTemplate('Standard Template');
    setMetaTitle('');
    setMetaDescription('');
    setFeaturedImage('');
    setBlocks(initBlocks);
    setActiveBlockId(initBlocks[0].id);
    setHistory([initBlocks]);
    setHistoryIndex(0);
    setShowPageMenu(false);
    showToast('New draft page created. Start typing to build your layout!');
  };

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async ({ isPublish = true }: { isPublish?: boolean }) => {
      const serializedContent = serializeBlocksToContent(blocks);
      const payload: Partial<CustomPageItem> = {
        title: pageTitle || 'Untitled Page',
        slug: pageSlug.startsWith('/') ? pageSlug : `/${pageSlug}`,
        status: isPublish ? 'Published' : 'Draft',
        template: pageTemplate,
        content: serializedContent,
        metaTitle,
        metaDescription,
      };

      const existing = pages.find((p) => p.id === selectedPageId);
      if (existing) {
        return await contentService.updatePage(existing.id, payload);
      } else {
        return await contentService.createPage(payload);
      }
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['systemPages'] });
      if (saved && saved.id) {
        setSelectedPageId(saved.id);
      }
      setPageStatus(saved.status || 'Published');
      showToast(`Page "${saved.title}" successfully saved & updated!`);
    },
    onError: (err: any) => {
      showToast(`Failed to save: ${err?.message || 'Unknown error'}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await contentService.deletePage(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemPages'] });
      setSelectedPageId(null);
      showToast('Page moved to trash.');
    },
  });

  // Block Operations
  const handleUpdateBlock = (id: string, updates: Partial<GutenbergBlock>) => {
    const updated = blocks.map((b) => (b.id === id ? { ...b, ...updates } : b));
    setBlocks(updated);
    pushHistory(updated);
  };

  const handleInsertBlockAt = (type: BlockType, index: number) => {
    const newBlock = createEmptyBlock(type);
    const updated = [...blocks];
    updated.splice(index, 0, newBlock);
    setBlocks(updated);
    setActiveBlockId(newBlock.id);
    pushHistory(updated);
  };

  const handleAppendBlock = (type: BlockType) => {
    const newBlock = createEmptyBlock(type);
    const updated = [...blocks, newBlock];
    setBlocks(updated);
    setActiveBlockId(newBlock.id);
    pushHistory(updated);
  };

  const handleInsertPattern = (patternBlocks: GutenbergBlock[]) => {
    const updated = [...blocks, ...patternBlocks];
    setBlocks(updated);
    if (patternBlocks.length > 0) {
      setActiveBlockId(patternBlocks[0].id);
    }
    pushHistory(updated);
    setLeftDrawerOpen(false);
    showToast('Pattern inserted into page canvas!');
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;
    const updated = [...blocks];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setBlocks(updated);
    pushHistory(updated);
  };

  const handleDuplicateBlock = (index: number) => {
    const original = blocks[index];
    const clone: GutenbergBlock = {
      ...original,
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    };
    const updated = [...blocks];
    updated.splice(index + 1, 0, clone);
    setBlocks(updated);
    setActiveBlockId(clone.id);
    pushHistory(updated);
  };

  const handleDeleteBlock = (index: number) => {
    const updated = blocks.filter((_, i) => i !== index);
    setBlocks(updated.length > 0 ? updated : [createEmptyBlock('paragraph')]);
    setActiveBlockId(updated.length > 0 ? updated[Math.max(0, index - 1)].id : null);
    pushHistory(updated);
  };

  // Document Stats Computation
  const computeWordCount = () => {
    let text = pageTitle + ' ';
    blocks.forEach((b) => {
      text += (b.content || '') + ' ' + (b.items?.join(' ') || '') + ' ';
    });
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  const computeCharCount = () => {
    let text = pageTitle;
    blocks.forEach((b) => {
      text += (b.content || '') + (b.items?.join('') || '');
    });
    return text.length;
  };

  const activeBlock = blocks.find((b) => b.id === activeBlockId) || null;
  const cleanSlug = pageSlug ? pageSlug.replace(/^\//, '') : '';
  const livePageUrl = `http://localhost:3001/page/${cleanSlug}`;

  if (isLoadingPages && pages.length === 0) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-3">
        <BeatLoader color="#22d3ee" size={18} speedMultiplier={1.2} />
        <p className="text-slate-500 text-sm font-medium animate-pulse">
          Loading OmniStay Gutenberg Block Editor...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#f8fafc] text-slate-800 overflow-hidden font-sans select-none">
      {/* =========================================================================
          TOP BAR (WordPress Gutenberg Header Bar - Image 5)
          ========================================================================= */}
      <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-30 shrink-0">
        {/* Left Action Group */}
        <div className="flex items-center gap-2">
          {/* Blue '+' Block Inserter Toggle Button */}
          <button
            type="button"
            onClick={() => setLeftDrawerOpen(!leftDrawerOpen)}
            className={`w-9 h-9 rounded-md flex items-center justify-center transition cursor-pointer shadow-xs ${
              leftDrawerOpen
                ? 'bg-slate-900 text-white'
                : 'bg-[#00a8ff] hover:bg-[#0097e6] text-white'
            }`}
            title="Toggle Block Inserter"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Edit / Pointer Mode Tool */}
          <button
            type="button"
            className="w-9 h-9 rounded-md flex items-center justify-center hover:bg-slate-100 text-slate-700 transition cursor-pointer"
            title="Tools"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          {/* Undo Button */}
          <button
            type="button"
            disabled={historyIndex <= 0}
            onClick={handleUndo}
            className="w-9 h-9 rounded-md flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent text-slate-700 transition cursor-pointer"
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          {/* Redo Button */}
          <button
            type="button"
            disabled={historyIndex >= history.length - 1}
            onClick={handleRedo}
            className="w-9 h-9 rounded-md flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent text-slate-700 transition cursor-pointer"
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          {/* Details / Document Info '(i)' */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDocStats(!showDocStats)}
              className="w-9 h-9 rounded-md flex items-center justify-center hover:bg-slate-100 text-slate-700 transition cursor-pointer"
              title="Details & Word Count"
            >
              <Info className="w-4 h-4" />
            </button>

            {showDocStats && (
              <div className="absolute left-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-4 z-40 space-y-2 text-xs">
                <h5 className="font-bold text-slate-900 border-b border-slate-100 pb-1.5">
                  Document Overview
                </h5>
                <div className="flex justify-between text-slate-600">
                  <span>Words:</span>
                  <span className="font-bold text-slate-900">{computeWordCount()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Characters:</span>
                  <span className="font-bold text-slate-900">{computeCharCount()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Blocks:</span>
                  <span className="font-bold text-slate-900">{blocks.length}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Reading Time:</span>
                  <span className="font-bold text-slate-900">
                    {Math.max(1, Math.ceil(computeWordCount() / 200))} min
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Document Outline / List View */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowOutline(!showOutline)}
              className="w-9 h-9 rounded-md flex items-center justify-center hover:bg-slate-100 text-slate-700 transition cursor-pointer"
              title="Document Outline"
            >
              <ListTree className="w-4 h-4" />
            </button>

            {showOutline && (
              <div className="absolute left-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-40 max-h-80 overflow-y-auto space-y-1 text-xs">
                <h5 className="font-bold text-slate-900 px-2 py-1 border-b border-slate-100">
                  Block Hierarchy
                </h5>
                {blocks.map((b, idx) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setActiveBlockId(b.id);
                      setShowOutline(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left transition cursor-pointer ${
                      activeBlockId === b.id
                        ? 'bg-sky-50 text-[#00a8ff] font-bold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="w-4 text-[10px] text-slate-400">{idx + 1}</span>
                    <span className="capitalize font-semibold">{b.type}</span>
                    <span className="text-[11px] text-slate-400 truncate flex-1">
                      {b.content || b.items?.[0] || ''}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Live Page Selector & Status Badge */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPageMenu(!showPageMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition cursor-pointer"
          >
            <FileText className="w-4 h-4 text-[#00a8ff]" />
            <span className="font-bold text-xs text-slate-900 max-w-[200px] truncate">
              {pageTitle || 'Untitled Page'}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                pageStatus === 'Published'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : 'bg-amber-50 text-amber-600 border border-amber-200'
              }`}
            >
              {pageStatus}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Page Switcher Popover Menu */}
          {showPageMenu && (
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl p-2 z-40 max-h-96 overflow-y-auto">
              <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  All CMS Pages
                </span>
                <span className="text-xs text-slate-500 font-medium">{pages.length} total</span>
              </div>

              <div className="py-1 space-y-1">
                {pages.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      loadPage(p);
                      setShowPageMenu(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition cursor-pointer ${
                      selectedPageId === p.id
                        ? 'bg-sky-50 text-[#00a8ff] font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="font-bold text-xs text-slate-900 truncate">{p.title}</div>
                      <div className="text-[11px] text-slate-400 font-mono truncate">{p.slug}</div>
                    </div>
                    {selectedPageId === p.id && <Check className="w-4 h-4 text-[#00a8ff] shrink-0" />}
                  </button>
                ))}
              </div>

              {/* Action: Create New Page */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCreateNewPage}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-bold transition cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-[#00a8ff]" />
                  <span>+ Add New Page</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Action Group (Image 5) */}
        <div className="flex items-center gap-2">
          {/* Save Draft Button */}
          <button
            type="button"
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate({ isPublish: false })}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition cursor-pointer"
          >
            Save draft
          </button>

          {/* Preview Button */}
          <a
            href={livePageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition flex items-center gap-1 cursor-pointer"
            title="Preview live site in new tab"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </a>

          {/* Publish / Update Solid Blue Button */}
          <button
            type="button"
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate({ isPublish: true })}
            className="bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-bold px-4 py-2 rounded-md shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saveMutation.isPending ? (
              <BeatLoader color="#ffffff" size={6} speedMultiplier={1.2} />
            ) : (
              <span>Publish</span>
            )}
          </button>

          {/* Settings Gear Icon (Toggles Right Inspector) */}
          <button
            type="button"
            onClick={() => setRightInspectorOpen(!rightInspectorOpen)}
            className={`w-9 h-9 rounded-md flex items-center justify-center transition cursor-pointer ${
              rightInspectorOpen
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Settings Sidebar"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* More Options Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="w-9 h-9 rounded-md flex items-center justify-center hover:bg-slate-100 text-slate-600 transition cursor-pointer"
              title="More"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMoreMenu && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-40 divide-y divide-slate-100 text-xs">
                {onOpenThemeCustomizer && (
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMoreMenu(false);
                        onOpenThemeCustomizer();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      <Palette className="w-4 h-4 text-[#00a8ff]" />
                      <span>Theme Presets & Palette</span>
                    </button>
                  </div>
                )}
                <div className="py-1">
                  <a
                    href={livePageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                    <span>View Published Page</span>
                  </a>
                </div>
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Clear all blocks in this document?')) {
                        setBlocks([createEmptyBlock('paragraph')]);
                        pushHistory([createEmptyBlock('paragraph')]);
                      }
                      setShowMoreMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-rose-500" />
                    <span>Clear All Blocks</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* =========================================================================
          MAIN WORKSPACE: LEFT DRAWER + CENTER CANVAS + RIGHT INSPECTOR
          ========================================================================= */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <Sparkles className="w-3.5 h-3.5 text-[#00a8ff]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 1. LEFT BLOCK INSERTER DRAWER (Images 4 & 5) */}
        <LeftBlockDrawer
          isOpen={leftDrawerOpen}
          onClose={() => setLeftDrawerOpen(false)}
          onInsertBlock={handleAppendBlock}
          onInsertPattern={handleInsertPattern}
          activeBlockType={activeBlock?.type}
        />

        {/* 2. CENTER CANVAS (The Clean Gutenberg Writing Canvas - Images 1, 2, 3) */}
        <div
          className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 flex justify-center bg-[#f8fafc]"
          onClick={() => {
            setShowPageMenu(false);
            setShowDocStats(false);
            setShowOutline(false);
            setShowMoreMenu(false);
          }}
        >
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xs border border-slate-200/70 min-h-[85vh] p-8 sm:p-14 transition-all">
            {/* Document Title ("Add title" - Image 1 & 5) */}
            <div className="mb-6 pb-2 border-b border-slate-100">
              <input
                type="text"
                value={pageTitle}
                placeholder="Add title"
                onChange={(e) => setPageTitle(e.target.value)}
                className="w-full font-serif font-black text-3xl sm:text-4xl text-slate-900 placeholder:text-slate-300 border-none bg-transparent focus:outline-hidden leading-tight"
              />
            </div>

            {/* Block List with In-between Inline Inserters */}
            <div className="space-y-1">
              {blocks.map((block, index) => (
                <React.Fragment key={block.id}>
                  {/* Subtle In-between blue insertion line with '+' button (Image 3) */}
                  <InlineInserter
                    onInsert={(type) => handleInsertBlockAt(type, index)}
                    onBrowseAll={() => setLeftDrawerOpen(true)}
                  />

                  {/* The Block Renderer with Floating Toolbar (Image 2) */}
                  <BlockRenderer
                    block={block}
                    isActive={activeBlockId === block.id}
                    onSelect={() => setActiveBlockId(block.id)}
                    onUpdate={(updates) => handleUpdateBlock(block.id, updates)}
                    onMoveUp={() => handleMoveBlock(index, 'up')}
                    onMoveDown={() => handleMoveBlock(index, 'down')}
                    onDuplicate={() => handleDuplicateBlock(index)}
                    onDelete={() => handleDeleteBlock(index)}
                    onInsertBefore={() => handleInsertBlockAt('paragraph', index)}
                    onInsertAfter={() => handleInsertBlockAt('paragraph', index + 1)}
                    canMoveUp={index > 0}
                    canMoveDown={index < blocks.length - 1}
                  />
                </React.Fragment>
              ))}

              {/* Bottom In-between inserter */}
              <InlineInserter
                onInsert={(type) => handleAppendBlock(type)}
                onBrowseAll={() => setLeftDrawerOpen(true)}
              />

              {/* Bottom "Start writing or type / to choose a block" Prompt (Image 1) */}
              <div className="pt-8 flex items-center justify-between border-t border-dashed border-slate-200 text-slate-400">
                <span className="text-xs sm:text-sm">
                  Start writing or type <code className="text-[#00a8ff] bg-sky-50 px-1 rounded">/</code> to choose a block
                </span>
                <button
                  type="button"
                  onClick={() => setLeftDrawerOpen(true)}
                  className="w-7 h-7 rounded-md bg-slate-900 hover:bg-black text-white flex items-center justify-center transition shadow-xs cursor-pointer"
                  title="Add block"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. RIGHT INSPECTOR SIDEBAR (Image 5) */}
        <RightInspector
          isOpen={rightInspectorOpen}
          onClose={() => setRightInspectorOpen(false)}
          pageTitle={pageTitle}
          pageSlug={pageSlug}
          pageStatus={pageStatus}
          pageTemplate={pageTemplate}
          metaTitle={metaTitle}
          metaDescription={metaDescription}
          featuredImage={featuredImage}
          onUpdatePageMeta={({ slug, status, template, metaTitle: mt, metaDescription: md, featuredImage: fi }) => {
            if (slug !== undefined) setPageSlug(slug);
            if (status !== undefined) setPageStatus(status);
            if (template !== undefined) setPageTemplate(template);
            if (mt !== undefined) setMetaTitle(mt);
            if (md !== undefined) setMetaDescription(md);
            if (fi !== undefined) setFeaturedImage(fi);
          }}
          onDeletePage={
            selectedPageId && pages.some((p) => p.id === selectedPageId)
              ? () => {
                  if (confirm(`Are you sure you want to delete "${pageTitle}"?`)) {
                    deleteMutation.mutate(selectedPageId);
                  }
                }
              : undefined
          }
          activeBlock={activeBlock}
          onUpdateActiveBlock={(updates) => {
            if (activeBlockId) {
              handleUpdateBlock(activeBlockId, updates);
            }
          }}
        />
      </div>
    </div>
  );
}

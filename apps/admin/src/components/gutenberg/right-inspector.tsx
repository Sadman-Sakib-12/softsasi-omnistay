'use client';

import React, { useState } from 'react';
import { GutenbergBlock, BlockType } from './types';
import {
  X,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Trash2,
  Image as ImageIcon,
  Check,
  Type,
  Palette,
  Eye,
  Sliders,
} from 'lucide-react';

interface RightInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  // Page Meta
  pageTitle: string;
  pageSlug: string;
  pageStatus: string;
  pageTemplate: string;
  metaTitle: string;
  metaDescription: string;
  featuredImage: string;
  onUpdatePageMeta: (updates: {
    slug?: string;
    status?: string;
    template?: string;
    metaTitle?: string;
    metaDescription?: string;
    featuredImage?: string;
  }) => void;
  onDeletePage?: () => void;

  // Active Block
  activeBlock: GutenbergBlock | null;
  onUpdateActiveBlock: (updates: Partial<GutenbergBlock>) => void;
}

export function RightInspector({
  isOpen,
  onClose,
  pageTitle,
  pageSlug,
  pageStatus,
  pageTemplate,
  metaTitle,
  metaDescription,
  featuredImage,
  onUpdatePageMeta,
  onDeletePage,
  activeBlock,
  onUpdateActiveBlock,
}: RightInspectorProps) {
  const [activeTab, setActiveTab] = useState<'page' | 'block'>('page');

  // Accordion states
  const [openStatus, setOpenStatus] = useState(true);
  const [openTemplate, setOpenTemplate] = useState(true);
  const [openPermalink, setOpenPermalink] = useState(true);
  const [openFeaturedImage, setOpenFeaturedImage] = useState(false);
  const [openSeo, setOpenSeo] = useState(false);

  if (!isOpen) return null;

  const cleanSlug = pageSlug ? pageSlug.replace(/^\//, '') : '';
  const livePageUrl = `http://localhost:3001/page/${cleanSlug}`;

  return (
    <div className="w-80 h-full bg-white border-l border-slate-200 flex flex-col shrink-0 z-30 shadow-lg select-none text-xs">
      {/* Top Tabs & Close (Image 5) */}
      <div className="p-3 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('page')}
            className={`px-3 py-1.5 font-bold rounded-md transition cursor-pointer ${
              activeTab === 'page'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Page
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('block')}
            className={`px-3 py-1.5 font-bold rounded-md transition cursor-pointer ${
              activeTab === 'block'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Block
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md cursor-pointer"
          title="Close Settings"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Area */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {activeTab === 'page' ? (
          <div>
            {/* 1. Status & Visibility Accordion */}
            <div className="border-b border-slate-100">
              <button
                type="button"
                onClick={() => setOpenStatus(!openStatus)}
                className="w-full p-3 flex items-center justify-between font-bold text-slate-800 hover:bg-slate-50 transition cursor-pointer"
              >
                <span>Status & visibility</span>
                {openStatus ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>

              {openStatus && (
                <div className="p-3 pt-0 space-y-3 text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Visibility</span>
                    <span className="font-semibold text-[#00a8ff]">Public</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Status</span>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdatePageMeta({
                          status: pageStatus === 'Published' ? 'Draft' : 'Published',
                        })
                      }
                      className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition ${
                        pageStatus === 'Published'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}
                    >
                      {pageStatus}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Publish</span>
                    <span className="text-slate-400">Immediately</span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="pending-review"
                      className="rounded border-slate-300 text-[#00a8ff] focus:ring-[#00a8ff]"
                    />
                    <label htmlFor="pending-review" className="text-slate-600 cursor-pointer">
                      Pending review
                    </label>
                  </div>

                  <div className="pt-1">
                    <label className="block text-slate-500 text-[11px] mb-1">Author</label>
                    <select
                      defaultValue="admin"
                      className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white text-slate-700"
                    >
                      <option value="admin">admin (Platform SuperAdmin)</option>
                      <option value="editorial">Editorial Desk</option>
                      <option value="softsasi">Softsasi Enterprise</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Template Accordion */}
            <div className="border-b border-slate-100">
              <button
                type="button"
                onClick={() => setOpenTemplate(!openTemplate)}
                className="w-full p-3 flex items-center justify-between font-bold text-slate-800 hover:bg-slate-50 transition cursor-pointer"
              >
                <span>Template</span>
                {openTemplate ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>

              {openTemplate && (
                <div className="p-3 pt-0">
                  <select
                    value={pageTemplate || 'Standard Template'}
                    onChange={(e) => onUpdatePageMeta({ template: e.target.value })}
                    className="w-full text-xs p-2 border border-slate-300 rounded bg-white text-slate-800 focus:outline-hidden focus:border-[#00a8ff]"
                  >
                    <option value="Standard Template">Default template</option>
                    <option value="Legal Template">Legal / Document template</option>
                    <option value="Full-Width Landing">Full-width landing template</option>
                    <option value="Minimal Canvas">Header & Footer Only</option>
                  </select>
                </div>
              )}
            </div>

            {/* 3. Permalink Accordion (Image 5) */}
            <div className="border-b border-slate-100">
              <button
                type="button"
                onClick={() => setOpenPermalink(!openPermalink)}
                className="w-full p-3 flex items-center justify-between font-bold text-slate-800 hover:bg-slate-50 transition cursor-pointer"
              >
                <span>Permalink</span>
                {openPermalink ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>

              {openPermalink && (
                <div className="p-3 pt-0 space-y-2">
                  <div>
                    <label className="block text-slate-600 text-[11px] font-semibold mb-1">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      value={cleanSlug}
                      onChange={(e) => {
                        const val = e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
                        onUpdatePageMeta({ slug: `/${val}` });
                      }}
                      placeholder="e.g. terms, privacy, about"
                      className="w-full text-xs p-2 border border-slate-300 rounded font-mono text-slate-800 focus:outline-hidden focus:border-[#00a8ff]"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      The last part of the URL.
                    </p>
                  </div>

                  <div className="pt-2">
                    <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                      View Page
                    </span>
                    <a
                      href={livePageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-[#00a8ff] hover:underline font-mono break-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      <span>{livePageUrl}</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Featured Image Accordion */}
            <div className="border-b border-slate-100">
              <button
                type="button"
                onClick={() => setOpenFeaturedImage(!openFeaturedImage)}
                className="w-full p-3 flex items-center justify-between font-bold text-slate-800 hover:bg-slate-50 transition cursor-pointer"
              >
                <span>Featured Image</span>
                {openFeaturedImage ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>

              {openFeaturedImage && (
                <div className="p-3 pt-0 space-y-2">
                  <input
                    type="text"
                    value={featuredImage || ''}
                    onChange={(e) => onUpdatePageMeta({ featuredImage: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full text-xs p-2 border border-slate-300 rounded text-slate-800"
                  />
                  {featuredImage && (
                    <div className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={featuredImage}
                        alt="Featured thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 5. SEO & Meta Accordion */}
            <div className="border-b border-slate-100">
              <button
                type="button"
                onClick={() => setOpenSeo(!openSeo)}
                className="w-full p-3 flex items-center justify-between font-bold text-slate-800 hover:bg-slate-50 transition cursor-pointer"
              >
                <span>SEO & Meta tags</span>
                {openSeo ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>

              {openSeo && (
                <div className="p-3 pt-0 space-y-2.5">
                  <div>
                    <label className="block text-slate-500 text-[11px] mb-1">Meta Title</label>
                    <input
                      type="text"
                      value={metaTitle || ''}
                      onChange={(e) => onUpdatePageMeta({ metaTitle: e.target.value })}
                      placeholder="Title for search engines"
                      className="w-full text-xs p-1.5 border border-slate-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[11px] mb-1">Meta Description</label>
                    <textarea
                      rows={3}
                      value={metaDescription || ''}
                      onChange={(e) => onUpdatePageMeta({ metaDescription: e.target.value })}
                      placeholder="Summary snippet for search results..."
                      className="w-full text-xs p-1.5 border border-slate-300 rounded"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 6. Page Action: Delete */}
            {onDeletePage && (
              <div className="p-4">
                <button
                  type="button"
                  onClick={onDeletePage}
                  className="w-full py-2 px-3 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Move to trash</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Block Tab Settings */
          <div className="p-4 space-y-4">
            {activeBlock ? (
              <>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-900 capitalize text-sm">
                    {activeBlock.type} Block
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    Selected
                  </span>
                </div>

                {/* Typography Settings */}
                <div className="space-y-2">
                  <label className="block font-bold text-slate-700 flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-slate-500" />
                    <span>Typography Size</span>
                  </label>
                  <div className="grid grid-cols-5 gap-1 text-center">
                    {(['sm', 'base', 'lg', 'xl', '2xl'] as const).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => onUpdateActiveBlock({ fontSize: sz })}
                        className={`py-1 rounded border text-[11px] font-semibold cursor-pointer ${
                          (activeBlock.fontSize || 'base') === sz
                            ? 'bg-[#00a8ff] text-white border-[#00a8ff]'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {sz.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Settings */}
                <div className="space-y-3 pt-2">
                  <label className="block font-bold text-slate-700 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-slate-500" />
                    <span>Color Settings</span>
                  </label>

                  <div>
                    <span className="block text-[11px] text-slate-500 mb-1">Text Color</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {['#0f172a', '#00a8ff', '#10b981', '#f59e0b', '#ef4444', '#64748b'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => onUpdateActiveBlock({ textColor: c })}
                          style={{ backgroundColor: c }}
                          className="w-5 h-5 rounded-full border border-slate-300 hover:scale-115 transition cursor-pointer"
                          title={c}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="block text-[11px] text-slate-500 mb-1">Background Color</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {['transparent', '#f8fafc', '#f0f9ff', '#f0fdf4', '#fffbeb', '#fef2f2'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => onUpdateActiveBlock({ backgroundColor: c })}
                          style={{ backgroundColor: c === 'transparent' ? '#ffffff' : c }}
                          className="w-5 h-5 rounded-full border border-slate-300 hover:scale-115 transition cursor-pointer relative"
                          title={c}
                        >
                          {c === 'transparent' && (
                            <span className="absolute inset-0 flex items-center justify-center text-[8px] text-slate-400">
                              Ø
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Block specific attributes */}
                {activeBlock.type === 'heading' && (
                  <div className="space-y-2 pt-2">
                    <label className="block font-bold text-slate-700">Heading Level</label>
                    <div className="grid grid-cols-4 gap-1.5 text-center">
                      {([1, 2, 3, 4] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => onUpdateActiveBlock({ level: lvl })}
                          className={`py-1 rounded border text-xs font-bold cursor-pointer ${
                            (activeBlock.level || 2) === lvl
                              ? 'bg-[#00a8ff] text-white border-[#00a8ff]'
                              : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          H{lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeBlock.type === 'image' && (
                  <div className="space-y-2.5 pt-2">
                    <label className="block font-bold text-slate-700">Image Source URL</label>
                    <input
                      type="text"
                      value={activeBlock.url || ''}
                      onChange={(e) => onUpdateActiveBlock({ url: e.target.value })}
                      placeholder="https://..."
                      className="w-full text-xs p-1.5 border border-slate-300 rounded"
                    />
                    <label className="block font-bold text-slate-700">Caption</label>
                    <input
                      type="text"
                      value={activeBlock.caption || ''}
                      onChange={(e) => onUpdateActiveBlock({ caption: e.target.value })}
                      placeholder="Image caption text..."
                      className="w-full text-xs p-1.5 border border-slate-300 rounded"
                    />
                    <label className="block font-bold text-slate-700">Alt Text (Accessibility)</label>
                    <input
                      type="text"
                      value={activeBlock.alt || ''}
                      onChange={(e) => onUpdateActiveBlock({ alt: e.target.value })}
                      placeholder="Describe image..."
                      className="w-full text-xs p-1.5 border border-slate-300 rounded"
                    />
                  </div>
                )}

                {activeBlock.type === 'button' && (
                  <div className="space-y-2.5 pt-2">
                    <label className="block font-bold text-slate-700">Button Label</label>
                    <input
                      type="text"
                      value={activeBlock.buttonText || ''}
                      onChange={(e) => onUpdateActiveBlock({ buttonText: e.target.value })}
                      placeholder="Button text..."
                      className="w-full text-xs p-1.5 border border-slate-300 rounded"
                    />
                    <label className="block font-bold text-slate-700">Destination URL</label>
                    <input
                      type="text"
                      value={activeBlock.url || ''}
                      onChange={(e) => onUpdateActiveBlock({ url: e.target.value })}
                      placeholder="/stays or https://..."
                      className="w-full text-xs p-1.5 border border-slate-300 rounded"
                    />
                    <label className="block font-bold text-slate-700">Button Style</label>
                    <select
                      value={activeBlock.buttonVariant || 'primary'}
                      onChange={(e) =>
                        onUpdateActiveBlock({
                          buttonVariant: e.target.value as 'primary' | 'secondary' | 'outline',
                        })
                      }
                      className="w-full text-xs p-1.5 border border-slate-300 rounded bg-white"
                    >
                      <option value="primary">Primary Solid</option>
                      <option value="secondary">Secondary Slate</option>
                      <option value="outline">Outline Border</option>
                    </select>
                  </div>
                )}

                {activeBlock.type === 'spacer' && (
                  <div className="space-y-2 pt-2">
                    <label className="block font-bold text-slate-700">
                      Height in Pixels ({activeBlock.spacerHeight || 32}px)
                    </label>
                    <input
                      type="range"
                      min={8}
                      max={120}
                      step={8}
                      value={activeBlock.spacerHeight || 32}
                      onChange={(e) => onUpdateActiveBlock({ spacerHeight: Number(e.target.value) })}
                      className="w-full accent-[#00a8ff]"
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <Sliders className="w-8 h-8 mx-auto text-slate-300" />
                <p className="font-semibold text-slate-600 text-xs">No block selected</p>
                <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
                  Click on any block in the canvas to adjust its typography, colors, and properties.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

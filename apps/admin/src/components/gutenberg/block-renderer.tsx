'use client';

import React from 'react';
import { GutenbergBlock, BlockType } from './types';
import { BlockToolbar } from './block-toolbar';
import {
  Sparkles,
  Star,
  Plus,
  Trash2,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react';

interface BlockRendererProps {
  block: GutenbergBlock;
  isActive: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<GutenbergBlock>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onInsertBefore: () => void;
  onInsertAfter: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function BlockRenderer({
  block,
  isActive,
  onSelect,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onInsertBefore,
  onInsertAfter,
  canMoveUp,
  canMoveDown,
}: BlockRendererProps) {
  // Compute text alignment class
  const alignClass =
    block.align === 'center'
      ? 'text-center'
      : block.align === 'right'
      ? 'text-right'
      : 'text-left';

  // Compute font size class
  const getFontSizeClass = () => {
    switch (block.fontSize) {
      case 'sm':
        return 'text-xs';
      case 'lg':
        return 'text-lg';
      case 'xl':
        return 'text-xl';
      case '2xl':
        return 'text-2xl';
      case '3xl':
        return 'text-3xl';
      case 'base':
      default:
        return 'text-sm sm:text-base';
    }
  };

  const styleOverrides: React.CSSProperties = {
    color: block.textColor || undefined,
    backgroundColor: block.backgroundColor && block.backgroundColor !== 'transparent' ? block.backgroundColor : undefined,
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`relative group my-2 p-3 rounded-lg transition-all ${
        isActive
          ? 'ring-2 ring-[#00a8ff] ring-offset-2 bg-sky-50/10'
          : 'hover:bg-slate-50/70 border border-transparent hover:border-slate-200'
      }`}
      style={styleOverrides}
    >
      {/* Floating Toolbar above the active block (Image 2) */}
      {isActive && (
        <BlockToolbar
          block={block}
          onUpdate={onUpdate}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onInsertBefore={onInsertBefore}
          onInsertAfter={onInsertAfter}
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
        />
      )}

      {/* Render block contents depending on type */}
      {block.type === 'paragraph' && (
        <textarea
          rows={Math.max(2, (block.content || '').split('\n').length)}
          value={block.content || ''}
          placeholder="Start writing or type / to choose a block"
          onChange={(e) => onUpdate({ content: e.target.value })}
          className={`w-full bg-transparent resize-none leading-relaxed text-slate-800 placeholder:text-slate-400 focus:outline-hidden ${alignClass} ${getFontSizeClass()}`}
        />
      )}

      {block.type === 'heading' && (
        <input
          type="text"
          value={block.content || ''}
          placeholder={`Heading ${block.level || 2}...`}
          onChange={(e) => onUpdate({ content: e.target.value })}
          className={`w-full bg-transparent font-black tracking-tight text-slate-900 placeholder:text-slate-300 focus:outline-hidden ${alignClass} ${
            block.level === 1
              ? 'text-3xl sm:text-4xl'
              : block.level === 2
              ? 'text-2xl sm:text-3xl'
              : block.level === 3
              ? 'text-xl sm:text-2xl'
              : 'text-lg font-bold'
          }`}
        />
      )}

      {block.type === 'image' && (
        <div className={`space-y-2 ${alignClass}`}>
          <div className="relative group/img inline-block max-w-full rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={block.url || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80'}
              alt={block.alt || 'Gutenberg block image'}
              className="max-h-[420px] w-full object-cover"
            />
          </div>
          <input
            type="text"
            value={block.caption || ''}
            placeholder="Write caption..."
            onChange={(e) => onUpdate({ caption: e.target.value })}
            className={`w-full text-xs text-slate-400 italic text-center bg-transparent focus:outline-hidden`}
          />
        </div>
      )}

      {block.type === 'gallery' && (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-3">
            {(block.images || []).map((img, idx) => (
              <div key={idx} className="relative rounded-xl overflow-hidden aspect-4/3 border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.caption || 'Gallery photo'} className="w-full h-full object-cover" />
                {img.caption && (
                  <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] p-1 text-center truncate">
                    {img.caption}
                  </span>
                )}
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 text-center italic">Photo Gallery (3 items)</p>
        </div>
      )}

      {block.type === 'list' && (
        <div className="space-y-1.5 pl-2">
          {(block.items || []).map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm text-slate-800">
              <span className="text-[#00a8ff] font-bold select-none">•</span>
              <input
                type="text"
                value={item}
                onChange={(e) => {
                  const updatedItems = [...(block.items || [])];
                  updatedItems[idx] = e.target.value;
                  onUpdate({ items: updatedItems });
                }}
                className="flex-1 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#00a8ff] focus:outline-hidden text-sm"
              />
              <button
                type="button"
                onClick={() => {
                  const updatedItems = (block.items || []).filter((_, i) => i !== idx);
                  onUpdate({ items: updatedItems });
                }}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const updatedItems = [...(block.items || []), 'New list item'];
              onUpdate({ items: updatedItems });
            }}
            className="text-xs text-[#00a8ff] font-semibold hover:underline flex items-center gap-1 mt-2 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add list item</span>
          </button>
        </div>
      )}

      {block.type === 'quote' && (
        <div className="border-l-4 border-[#00a8ff] pl-4 py-2 bg-sky-50/30 rounded-r-xl space-y-1">
          <textarea
            rows={2}
            value={block.content || ''}
            placeholder="Quote text..."
            onChange={(e) => onUpdate({ content: e.target.value })}
            className="w-full bg-transparent text-base sm:text-lg italic font-serif text-slate-800 placeholder:text-slate-400 focus:outline-hidden resize-none"
          />
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>—</span>
            <input
              type="text"
              value={block.citation || ''}
              placeholder="Citation / Author..."
              onChange={(e) => onUpdate({ citation: e.target.value })}
              className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#00a8ff] focus:outline-hidden flex-1"
            />
          </div>
        </div>
      )}

      {block.type === 'code' && (
        <div className="bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-xs overflow-x-auto shadow-inner">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-widest select-none">
            <span>Code Snippet</span>
            <span>UTF-8</span>
          </div>
          <textarea
            rows={4}
            value={block.content || ''}
            onChange={(e) => onUpdate({ content: e.target.value })}
            className="w-full bg-transparent text-emerald-400 font-mono text-xs mt-2 focus:outline-hidden resize-none"
          />
        </div>
      )}

      {block.type === 'columns' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(block.columns || []).map((col, cIdx) => (
            <div key={col.id || cIdx} className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">Column {cIdx + 1}</span>
              <textarea
                rows={3}
                value={col.content}
                onChange={(e) => {
                  const updatedCols = [...(block.columns || [])];
                  updatedCols[cIdx] = { ...col, content: e.target.value };
                  onUpdate({ columns: updatedCols });
                }}
                className="w-full text-xs leading-relaxed text-slate-700 bg-transparent resize-none focus:outline-hidden"
              />
            </div>
          ))}
        </div>
      )}

      {block.type === 'button' && (
        <div className={`py-2 ${alignClass}`}>
          <div className="inline-flex items-center gap-2">
            <span
              className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm cursor-pointer inline-flex items-center gap-2 ${
                block.buttonVariant === 'outline'
                  ? 'border-2 border-[#00a8ff] text-[#00a8ff] bg-transparent'
                  : block.buttonVariant === 'secondary'
                  ? 'bg-slate-800 text-white'
                  : 'bg-[#00a8ff] text-white hover:bg-[#0097e6]'
              }`}
            >
              <span>{block.buttonText || 'Call To Action'}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">Target: {block.url || '/stays'}</p>
        </div>
      )}

      {block.type === 'separator' && (
        <div className="py-4">
          <hr className="border-t-2 border-slate-200" />
        </div>
      )}

      {block.type === 'spacer' && (
        <div
          style={{ height: `${block.spacerHeight || 32}px` }}
          className="w-full border border-dashed border-slate-200 rounded flex items-center justify-center text-[10px] text-slate-400 select-none bg-slate-50/30"
        >
          Spacer ({block.spacerHeight || 32}px)
        </div>
      )}

      {block.type === 'feature-cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-2">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full inline-block">
              Holiday Sale
            </span>
            <h4 className="font-extrabold text-sm sm:text-base">Special Offers</h4>
            <p className="text-xs text-sky-100">Up to 35% discount on beachfront villas.</p>
          </div>
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full inline-block">
              Members Club
            </span>
            <h4 className="font-extrabold text-sm sm:text-base">Newsletters</h4>
            <p className="text-xs text-blue-100">Weekly insider secret deals & rewards.</p>
          </div>
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full inline-block">
              Destination Guides
            </span>
            <h4 className="font-extrabold text-sm sm:text-base">Travel Tips</h4>
            <p className="text-xs text-amber-100">Bespoke itineraries from local concierges.</p>
          </div>
        </div>
      )}

      {block.type === 'testimonial' && (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-sky-50/40 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-1 text-amber-400">
            {[...Array(block.rating || 5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <textarea
            rows={2}
            value={block.content || ''}
            onChange={(e) => onUpdate({ content: e.target.value })}
            className="w-full bg-transparent text-sm sm:text-base text-slate-800 italic leading-relaxed resize-none focus:outline-hidden"
          />
          <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
            <span className="text-xs font-bold text-slate-900">—</span>
            <input
              type="text"
              value={block.citation || ''}
              onChange={(e) => onUpdate({ citation: e.target.value })}
              className="bg-transparent text-xs font-bold text-slate-700 flex-1 focus:outline-hidden"
            />
          </div>
        </div>
      )}
    </div>
  );
}

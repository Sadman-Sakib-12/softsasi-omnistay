'use client';

import React, { useState } from 'react';
import {
  GutenbergBlock,
  BlockType,
  BLOCK_METAS,
} from './types';
import {
  Pilcrow,
  Heading,
  List,
  Quote,
  Code,
  Table,
  Image as ImageIcon,
  Columns3,
  MousePointerClick,
  Minus,
  MoveVertical,
  Sparkles,
  Star,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Strikethrough,
  Link as LinkIcon,
  Copy,
  Trash2,
  MoreVertical,
  Plus,
} from 'lucide-react';

interface BlockToolbarProps {
  block: GutenbergBlock;
  onUpdate: (updated: Partial<GutenbergBlock>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onInsertBefore: () => void;
  onInsertAfter: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function BlockToolbar({
  block,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onInsertBefore,
  onInsertAfter,
  canMoveUp,
  canMoveDown,
}: BlockToolbarProps) {
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const getBlockIcon = (type: BlockType) => {
    switch (type) {
      case 'paragraph':
        return <Pilcrow className="w-4 h-4 text-slate-700" />;
      case 'heading':
        return <Heading className="w-4 h-4 text-slate-700" />;
      case 'list':
        return <List className="w-4 h-4 text-slate-700" />;
      case 'quote':
        return <Quote className="w-4 h-4 text-slate-700" />;
      case 'code':
        return <Code className="w-4 h-4 text-slate-700" />;
      case 'table':
        return <Table className="w-4 h-4 text-slate-700" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-slate-700" />;
      case 'columns':
        return <Columns3 className="w-4 h-4 text-slate-700" />;
      case 'button':
        return <MousePointerClick className="w-4 h-4 text-slate-700" />;
      case 'separator':
        return <Minus className="w-4 h-4 text-slate-700" />;
      case 'spacer':
        return <MoveVertical className="w-4 h-4 text-slate-700" />;
      case 'feature-cards':
        return <Sparkles className="w-4 h-4 text-slate-700" />;
      case 'testimonial':
        return <Star className="w-4 h-4 text-slate-700" />;
      default:
        return <Pilcrow className="w-4 h-4 text-slate-700" />;
    }
  };

  const handleApplyFormatting = (tag: 'bold' | 'italic' | 'strike') => {
    // Basic inline markdown wrapper
    const current = block.content || '';
    if (tag === 'bold') {
      onUpdate({ content: `**${current}**` });
    } else if (tag === 'italic') {
      onUpdate({ content: `*${current}*` });
    } else if (tag === 'strike') {
      onUpdate({ content: `~~${current}~~` });
    }
  };

  const handleApplyLink = () => {
    if (linkUrl) {
      const current = block.content || 'Link text';
      onUpdate({ content: `[${current}](${linkUrl})` });
      setShowLinkInput(false);
      setLinkUrl('');
    }
  };

  return (
    <div
      className="absolute -top-12 left-0 z-30 flex items-center bg-white border border-slate-300 rounded-md shadow-md divide-x divide-slate-200 text-xs select-none animate-in fade-in zoom-in-95 duration-100"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 1. Block Switcher Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowTypeMenu(!showTypeMenu)}
          className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-slate-100 rounded-l-md text-slate-800 font-semibold cursor-pointer"
          title="Change block type or style"
        >
          {getBlockIcon(block.type)}
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {showTypeMenu && (
          <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-xl py-1.5 z-40">
            <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Transform to
            </div>
            {(['paragraph', 'heading', 'list', 'quote', 'code', 'columns'] as BlockType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  onUpdate({ type: t });
                  setShowTypeMenu(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left cursor-pointer hover:bg-slate-100 ${
                  block.type === t ? 'text-[#00a8ff] font-bold bg-sky-50/50' : 'text-slate-700'
                }`}
              >
                {getBlockIcon(t)}
                <span className="capitalize">{t}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Drag & Reorder Arrows */}
      <div className="flex items-center">
        <button
          type="button"
          disabled={!canMoveUp}
          onClick={onMoveUp}
          className="p-1.5 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent text-slate-600 cursor-pointer"
          title="Move up"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          disabled={!canMoveDown}
          onClick={onMoveDown}
          className="p-1.5 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent text-slate-600 cursor-pointer"
          title="Move down"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3. Text Alignment */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => onUpdate({ align: 'left' })}
          className={`p-1.5 hover:bg-slate-100 cursor-pointer ${
            block.align === 'left' || !block.align ? 'text-[#00a8ff] font-bold' : 'text-slate-600'
          }`}
          title="Align text left"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onUpdate({ align: 'center' })}
          className={`p-1.5 hover:bg-slate-100 cursor-pointer ${
            block.align === 'center' ? 'text-[#00a8ff] font-bold' : 'text-slate-600'
          }`}
          title="Align text center"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onUpdate({ align: 'right' })}
          className={`p-1.5 hover:bg-slate-100 cursor-pointer ${
            block.align === 'right' ? 'text-[#00a8ff] font-bold' : 'text-slate-600'
          }`}
          title="Align text right"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4. Heading Levels (if block is heading) */}
      {block.type === 'heading' && (
        <div className="flex items-center px-1 gap-1">
          {([1, 2, 3, 4] as const).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => onUpdate({ level: lvl })}
              className={`px-1.5 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                (block.level || 2) === lvl
                  ? 'bg-[#00a8ff] text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              H{lvl}
            </button>
          ))}
        </div>
      )}

      {/* 5. Rich Text Formatting (Bold, Italic, Link) */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => handleApplyFormatting('bold')}
          className="p-1.5 hover:bg-slate-100 text-slate-700 cursor-pointer font-bold"
          title="Bold"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => handleApplyFormatting('italic')}
          className="p-1.5 hover:bg-slate-100 text-slate-700 cursor-pointer italic"
          title="Italic"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setShowLinkInput(!showLinkInput)}
          className={`p-1.5 hover:bg-slate-100 cursor-pointer ${
            showLinkInput ? 'text-[#00a8ff]' : 'text-slate-700'
          }`}
          title="Insert Link"
        >
          <LinkIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Link popover input */}
      {showLinkInput && (
        <div className="absolute top-full left-16 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl p-2 z-40 flex items-center gap-1.5">
          <input
            type="text"
            placeholder="Paste URL or type..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="text-xs px-2 py-1 border border-slate-300 rounded w-48 focus:outline-hidden focus:border-[#00a8ff]"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleApplyLink();
            }}
          />
          <button
            type="button"
            onClick={handleApplyLink}
            className="bg-[#00a8ff] text-white px-2 py-1 rounded text-xs font-semibold hover:bg-[#0097e6] cursor-pointer"
          >
            Apply
          </button>
        </div>
      )}

      {/* 6. More Options Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          className="p-1.5 hover:bg-slate-100 rounded-r-md text-slate-600 cursor-pointer"
          title="More options"
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </button>

        {showMoreMenu && (
          <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-40 divide-y divide-slate-100">
            <div className="py-1">
              <button
                type="button"
                onClick={() => {
                  onInsertBefore();
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-slate-400" />
                <span>Insert before</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onInsertAfter();
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-slate-400" />
                <span>Insert after</span>
              </button>
            </div>
            <div className="py-1">
              <button
                type="button"
                onClick={() => {
                  onDuplicate();
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Duplicate</span>
              </button>
            </div>
            <div className="py-1">
              <button
                type="button"
                onClick={() => {
                  onDelete();
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Delete block</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

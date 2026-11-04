'use client';

import React, { useState, useRef, useEffect } from 'react';
import { BlockType, createEmptyBlock } from './types';
import {
  Plus,
  Search,
  Pilcrow,
  Heading,
  List,
  Quote,
  Image as ImageIcon,
  Grid,
  Columns3,
  MousePointerClick,
  Sparkles,
} from 'lucide-react';

interface InlineInserterProps {
  onInsert: (type: BlockType) => void;
  onBrowseAll?: () => void;
}

export function InlineInserter({ onInsert, onBrowseAll }: InlineInserterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const QUICK_BLOCKS: Array<{ type: BlockType; label: string; icon: React.ReactNode }> = [
    { type: 'paragraph', label: 'Paragraph', icon: <Pilcrow className="w-5 h-5 text-slate-700" /> },
    { type: 'heading', label: 'Heading', icon: <Heading className="w-5 h-5 text-slate-700" /> },
    { type: 'image', label: 'Image', icon: <ImageIcon className="w-5 h-5 text-slate-700" /> },
    { type: 'gallery', label: 'Gallery', icon: <Grid className="w-5 h-5 text-slate-700" /> },
    { type: 'list', label: 'List', icon: <List className="w-5 h-5 text-slate-700" /> },
    { type: 'quote', label: 'Quote', icon: <Quote className="w-5 h-5 text-slate-700" /> },
  ];

  const filteredBlocks = QUICK_BLOCKS.filter((b) =>
    b.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative group/inserter py-2 my-1">
      {/* 1. Subtle blue insertion line with centered '+' button */}
      <div className="flex items-center justify-center opacity-0 group-hover/inserter:opacity-100 transition-opacity duration-150">
        <div className="w-full border-t-2 border-[#00a8ff]/60" />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute z-20 w-6 h-6 rounded-full bg-[#00a8ff] hover:bg-[#0097e6] text-white flex items-center justify-center shadow-md transition-transform hover:scale-115 cursor-pointer"
          title="Add block"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
        </button>
      </div>

      {/* 2. Popover Block Chooser (WordPress Gutenberg style - Image 1 & 3) */}
      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute left-1/2 -translate-x-1/2 top-7 z-40 w-72 bg-white border border-slate-300 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Search bar */}
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <input
                type="text"
                autoFocus
                placeholder="Search for a block"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-7 pr-3 py-1.5 border border-sky-400 rounded-md focus:outline-hidden focus:ring-1 focus:ring-[#00a8ff] text-slate-800"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
            </div>
          </div>

          {/* 6-Grid Block Picker */}
          <div className="p-3 grid grid-cols-3 gap-2">
            {filteredBlocks.map((item) => (
              <button
                key={item.type}
                type="button"
                onClick={() => {
                  onInsert(item.type);
                  setIsOpen(false);
                }}
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 text-slate-700 transition cursor-pointer group"
              >
                <div className="p-1 rounded group-hover:scale-110 transition">
                  {item.icon}
                </div>
                <span className="text-[11px] font-medium text-slate-700">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Bottom "Browse all" bar */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onBrowseAll?.();
            }}
            className="w-full py-2.5 bg-[#1e1e1e] hover:bg-black text-white text-xs font-semibold text-center transition cursor-pointer"
          >
            Browse all
          </button>
        </div>
      )}
    </div>
  );
}

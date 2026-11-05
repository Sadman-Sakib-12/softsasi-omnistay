'use client';

import React, { useState } from 'react';
import { BlockType, BLOCK_METAS, GutenbergBlock } from './types';
import {
  Search,
  X,
  Pilcrow,
  Heading,
  List,
  Quote,
  Code,
  Table,
  Image as ImageIcon,
  Grid,
  Columns3,
  MousePointerClick,
  Minus,
  MoveVertical,
  Sparkles,
  Star,
  Layers,
  FileText,
} from 'lucide-react';

interface LeftBlockDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertBlock: (type: BlockType) => void;
  onInsertPattern: (blocks: GutenbergBlock[]) => void;
  activeBlockType?: BlockType;
}

export function LeftBlockDrawer({
  isOpen,
  onClose,
  onInsertBlock,
  onInsertPattern,
  activeBlockType = 'paragraph',
}: LeftBlockDrawerProps) {
  const [activeTab, setActiveTab] = useState<'blocks' | 'patterns'>('blocks');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const renderIcon = (type: BlockType) => {
    switch (type) {
      case 'paragraph':
        return <Pilcrow className="w-5 h-5 text-slate-800" />;
      case 'heading':
        return <Heading className="w-5 h-5 text-slate-800" />;
      case 'list':
        return <List className="w-5 h-5 text-slate-800" />;
      case 'quote':
        return <Quote className="w-5 h-5 text-slate-800" />;
      case 'code':
        return <Code className="w-5 h-5 text-slate-800" />;
      case 'table':
        return <Table className="w-5 h-5 text-slate-800" />;
      case 'image':
        return <ImageIcon className="w-5 h-5 text-slate-800" />;
      case 'gallery':
        return <Grid className="w-5 h-5 text-slate-800" />;
      case 'columns':
        return <Columns3 className="w-5 h-5 text-slate-800" />;
      case 'button':
        return <MousePointerClick className="w-5 h-5 text-slate-800" />;
      case 'separator':
        return <Minus className="w-5 h-5 text-slate-800" />;
      case 'spacer':
        return <MoveVertical className="w-5 h-5 text-slate-800" />;
      case 'feature-cards':
        return <Sparkles className="w-5 h-5 text-slate-800" />;
      case 'testimonial':
        return <Star className="w-5 h-5 text-slate-800" />;
      default:
        return <Pilcrow className="w-5 h-5 text-slate-800" />;
    }
  };

  const filteredBlocks = BLOCK_METAS.filter(
    (b) =>
      b.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const textBlocks = filteredBlocks.filter((b) => b.category === 'text');
  const mediaBlocks = filteredBlocks.filter((b) => b.category === 'media');
  const designBlocks = filteredBlocks.filter((b) => b.category === 'design');
  const widgetBlocks = filteredBlocks.filter((b) => b.category === 'widgets');

  // Pre-made Gutenberg patterns
  const PATTERNS: Array<{
    title: string;
    description: string;
    category: string;
    blocks: () => GutenbergBlock[];
  }> = [
    {
      title: 'Luxury Welcome Hero with CTA',
      description: 'Bold heading, paragraph explanation, image banner, and booking button.',
      category: 'Hero',
      blocks: () => [
        {
          id: `pat-${Date.now()}-1`,
          type: 'heading',
          level: 1,
          content: 'Experience Extraordinary Stays Worldwide',
          align: 'center',
        },
        {
          id: `pat-${Date.now()}-2`,
          type: 'paragraph',
          content:
            'From overwater villas in the Maldives to private penthouses in Manhattan, OmniStay curated properties deliver unparalleled hospitality.',
          align: 'center',
        },
        {
          id: `pat-${Date.now()}-3`,
          type: 'button',
          buttonText: 'Explore Handcrafted Collections',
          url: '/stays',
          buttonVariant: 'primary',
          align: 'center',
        },
      ],
    },
    {
      title: 'Legal Terms & Policy Breakdown',
      description: 'H2 title, bulleted terms, and highlighted legal callout box.',
      category: 'Legal',
      blocks: () => [
        {
          id: `pat-${Date.now()}-4`,
          type: 'heading',
          level: 2,
          content: 'Terms of Service & Booking Cancellation Policy',
        },
        {
          id: `pat-${Date.now()}-5`,
          type: 'paragraph',
          content:
            'Please review the policies governing all reservations, security deposits, and multi-vertical transactions across the OmniStay ecosystem.',
        },
        {
          id: `pat-${Date.now()}-6`,
          type: 'list',
          items: [
            '100% full refund available up to 48 hours prior to local property check-in time.',
            'Refundable security deposits are pre-authorized upon key handover and released post-inspection.',
            'Corporate master billing accounts settle automatically under standard Net 30 terms.',
          ],
          listType: 'unordered',
        },
        {
          id: `pat-${Date.now()}-7`,
          type: 'quote',
          content:
            'All transactions are processed with bank-grade 256-bit encryption and comply with global travel security regulations.',
          citation: 'Softsasi Trust & Safety Division',
        },
      ],
    },
    {
      title: '3-Card Feature Highlights (Figure 5.1)',
      description: 'Special offers, newsletters, and travel tips highlight row.',
      category: 'Marketing',
      blocks: () => [
        {
          id: `pat-${Date.now()}-8`,
          type: 'heading',
          level: 2,
          content: 'Exclusive Member Perks & Travel Concierge',
          align: 'center',
        },
        {
          id: `pat-${Date.now()}-9`,
          type: 'feature-cards',
        },
      ],
    },
    {
      title: 'Guest Testimonials & 5-Star Reviews',
      description: 'Verified guest quote with 5-star rating badge and author attribution.',
      category: 'Social Proof',
      blocks: () => [
        {
          id: `pat-${Date.now()}-10`,
          type: 'testimonial',
          content:
            'The seamless integration between room booking, yacht charter, and private airport limousine was unlike anything we have experienced.',
          citation: 'Alexander Sterling · Executive Traveler',
          rating: 5,
        },
      ],
    },
  ];

  return (
    <div className="w-80 h-full bg-white border-r border-slate-200 flex flex-col shrink-0 z-30 shadow-lg select-none">
      {/* Header & Tabs */}
      <div className="p-3 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('blocks')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${
              activeTab === 'blocks'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Blocks
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('patterns')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${
              activeTab === 'patterns'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Patterns
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md cursor-pointer"
          title="Close Inserter"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-slate-100">
        <div className="relative">
          <input
            type="text"
            placeholder={activeTab === 'blocks' ? 'Search for a block' : 'Search patterns'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#00a8ff] focus:ring-1 focus:ring-[#00a8ff]"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activeTab === 'blocks' ? (
          <>
            {/* Category: Text */}
            {textBlocks.length > 0 && (
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Text
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {textBlocks.map((b) => (
                    <button
                      key={b.type}
                      type="button"
                      onClick={() => onInsertBlock(b.type)}
                      className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-slate-200 hover:border-[#00a8ff] hover:bg-sky-50/50 transition cursor-pointer text-center group"
                      title={b.description}
                    >
                      <div className="p-1.5 rounded-md group-hover:scale-110 transition">
                        {renderIcon(b.type)}
                      </div>
                      <span className="text-[11px] font-medium text-slate-700 mt-1">
                        {b.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Category: Media */}
            {mediaBlocks.length > 0 && (
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Media
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {mediaBlocks.map((b) => (
                    <button
                      key={b.type}
                      type="button"
                      onClick={() => onInsertBlock(b.type)}
                      className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-slate-200 hover:border-[#00a8ff] hover:bg-sky-50/50 transition cursor-pointer text-center group"
                      title={b.description}
                    >
                      <div className="p-1.5 rounded-md group-hover:scale-110 transition">
                        {renderIcon(b.type)}
                      </div>
                      <span className="text-[11px] font-medium text-slate-700 mt-1">
                        {b.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Category: Design & Layout */}
            {designBlocks.length > 0 && (
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Design & Layout
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {designBlocks.map((b) => (
                    <button
                      key={b.type}
                      type="button"
                      onClick={() => onInsertBlock(b.type)}
                      className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-slate-200 hover:border-[#00a8ff] hover:bg-sky-50/50 transition cursor-pointer text-center group"
                      title={b.description}
                    >
                      <div className="p-1.5 rounded-md group-hover:scale-110 transition">
                        {renderIcon(b.type)}
                      </div>
                      <span className="text-[11px] font-medium text-slate-700 mt-1">
                        {b.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Category: Widgets & Hospitality */}
            {widgetBlocks.length > 0 && (
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Hospitality Widgets
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {widgetBlocks.map((b) => (
                    <button
                      key={b.type}
                      type="button"
                      onClick={() => onInsertBlock(b.type)}
                      className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:border-[#00a8ff] hover:bg-sky-50/50 transition cursor-pointer text-center group"
                      title={b.description}
                    >
                      <div className="p-1.5 rounded-md group-hover:scale-110 transition">
                        {renderIcon(b.type)}
                      </div>
                      <span className="text-[11px] font-medium text-slate-700 mt-1">
                        {b.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Patterns List */
          <div className="space-y-4">
            {PATTERNS.map((p, idx) => (
              <div
                key={idx}
                onClick={() => onInsertPattern(p.blocks())}
                className="p-3.5 border border-slate-200 hover:border-[#00a8ff] rounded-xl hover:bg-sky-50/30 transition cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#00a8ff] bg-sky-50 px-2 py-0.5 rounded">
                    {p.category}
                  </span>
                </div>
                <h5 className="font-bold text-xs text-slate-900 mt-1.5 group-hover:text-[#00a8ff] transition">
                  {p.title}
                </h5>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Status Breadcrumb (Image 4) */}
      <div className="p-2.5 border-t border-slate-200 bg-slate-50 text-[10px] text-slate-500 flex items-center justify-between">
        <span>Document → {activeBlockType}</span>
        <span className="text-slate-400">OmniStay Block Engine</span>
      </div>
    </div>
  );
}


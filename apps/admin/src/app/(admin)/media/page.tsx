'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, Upload, Search, Trash2, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function MediaLibraryPage() {
  const [mediaList] = useState([
    { id: 'm-1', name: 'hotel-banner.jpg', size: '240 KB', path: '/images/hotel-banner.jpg', date: '2026-10-25' },
    { id: 'm-2', name: 'deluxe-suite-living.jpg', size: '380 KB', path: '/images/hotel-banner.jpg', date: '2026-10-20' },
    { id: 'm-3', name: 'rooftop-poolside.jpg', size: '420 KB', path: '/images/hotel-banner.jpg', date: '2026-10-18' },
  ]);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-[#00a8ff] font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-slate-400">Content / Media</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-[#00a8ff]" /> Media Asset Library
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Centralized multi-resolution photography, S3/Cloudflare R2 uploads, and room gallery assets.
          </p>
        </div>

        <label className="h-9 px-4 bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer">
          <Upload className="w-4 h-4" />
          <span>Upload Media</span>
          <input type="file" className="hidden" multiple accept="image/*" />
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {mediaList.map((m) => (
          <div key={m.id} className="group relative bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs hover:shadow-xs transition-all">
            <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
              <Image src={m.path} alt={m.name} fill className="object-cover group-hover:scale-105 transition-transform" />
            </div>
            <div className="p-2.5">
              <p className="font-semibold text-xs text-slate-800 truncate" title={m.name}>{m.name}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{m.size} · {m.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, Upload, Search, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contentService, MediaAssetItem } from '@/features/content/services/content.service';

export default function MediaLibraryPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: mediaList = [], isLoading } = useQuery<MediaAssetItem[]>({
    queryKey: ['systemMedia'],
    queryFn: () => contentService.getMedia(),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) =>
      contentService.uploadMedia({
        name: file.name,
        size: `${Math.round(file.size / 1024)} KB`,
        path: `/uploads/${file.name}`,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemMedia'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contentService.deleteMedia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemMedia'] });
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadMutation.mutate(e.target.files[0]);
    }
  };

  const filtered = mediaList.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <span>{uploadMutation.isPending ? 'Uploading...' : 'Upload Media'}</span>
          <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#00a8ff]" />
            <span className="mt-2 block">Loading media gallery...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs bg-white rounded-lg border border-slate-200">
            No media assets found.
          </div>
        ) : (
          filtered.map((m) => (
            <div
              key={m.id}
              className="bg-white border border-slate-200 rounded-lg overflow-hidden group shadow-2xs hover:shadow-xs transition-shadow"
            >
              <div className="aspect-video bg-slate-100 flex items-center justify-center relative overflow-hidden">
                <ImageIcon className="w-8 h-8 text-slate-300" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => deleteMutation.mutate(m.id)}
                    className="p-1.5 rounded-full bg-white/90 text-rose-600 hover:bg-white"
                    title="Delete asset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="p-2.5">
                <p className="text-[11px] font-semibold text-slate-800 truncate" title={m.name}>
                  {m.name}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                  <span>{m.size}</span>
                  <span>{m.date}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

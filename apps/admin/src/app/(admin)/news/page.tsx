'use client';

import React, { useState } from 'react';
import { Newspaper, Plus, Search, Calendar, User, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function NewsCmsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [articles, setArticles] = useState([
    { id: 'art-1', title: 'Top 10 Secret Scuba Diving Spots in Saint Martin', category: 'Destination Travel', author: 'Editorial Team', date: '2026-10-18', views: 1420, status: 'Published' },
    { id: 'art-2', title: 'Grand Palace Introduces Michelin-Star Autumn Tasting Menu', category: 'Dining & Culinary', author: 'Chef Roberto', date: '2026-10-14', views: 890, status: 'Published' },
    { id: 'art-3', title: 'How Contactless IoT Check-In Elevates Luxury Hospitality', category: 'Hospitality Insights', author: 'Platform Team', date: '2026-10-09', views: 2310, status: 'Published' },
  ]);

  const filtered = articles.filter((a) =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-[#00a8ff] font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-slate-400">Content / News</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-[#00a8ff]" /> Articles & News Manager
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Publish travel destination guides, hotel announcements, and culinary stories.
          </p>
        </div>

        <button className="h-9 px-4 bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>Write Article</span>
        </button>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search news..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-[#00a8ff]"
          />
        </div>
        <span className="text-xs text-slate-500">Found {filtered.length} articles</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Article Title</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Author</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Views</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((art) => (
              <tr key={art.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-4 font-semibold text-slate-900">{art.title}</td>
                <td className="py-3 px-4">
                  <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 text-[10px]">
                    {art.category}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-slate-500">{art.author}</td>
                <td className="py-3 px-4 text-slate-500">{art.date}</td>
                <td className="py-3 px-4 text-slate-600 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>{art.views}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {art.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

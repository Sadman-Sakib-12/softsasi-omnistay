'use client';

import React, { useState } from 'react';
import { FileText, Plus, Search, ExternalLink, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function StaticPagesCmsPage() {
  const [pages, setPages] = useState([
    { id: 'p-1', title: 'About OmniStay Luxury Group', slug: '/about-us', template: 'Corporate Story', updated: '2026-10-15', status: 'Published' },
    { id: 'p-2', title: 'Privacy Policy & GDPR Compliance', slug: '/privacy-policy', template: 'Legal Terms', updated: '2026-10-10', status: 'Published' },
    { id: 'p-3', title: 'Terms of Service & Guest Rules', slug: '/terms', template: 'Legal Terms', updated: '2026-10-10', status: 'Published' },
    { id: 'p-4', title: 'Careers & Hospitality Talent', slug: '/careers', template: 'Careers Portal', updated: '2026-10-01', status: 'Published' },
  ]);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-[#00a8ff] font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-slate-400">Content / Pages</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#00a8ff]" /> Static & Custom Site Pages
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Build bespoke landing pages, legal disclosures, and about pages.
          </p>
        </div>

        <button className="h-9 px-4 bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-semibold rounded inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>Add New Page</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Page Title</th>
              <th className="py-3 px-4">URL Slug</th>
              <th className="py-3 px-4">Template</th>
              <th className="py-3 px-4">Last Updated</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pages.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-4 font-semibold text-slate-900">{p.title}</td>
                <td className="py-3 px-4 font-mono text-slate-500">{p.slug}</td>
                <td className="py-3 px-4 text-slate-600">{p.template}</td>
                <td className="py-3 px-4 text-slate-500">{p.updated}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {p.status}
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

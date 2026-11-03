"use client";

import React, { useEffect, useState } from "react";
import apiClient from "@/lib/api-client";
import { MarkdownContent } from "@/components/cms/markdown-content";
import { Loader2, Lock } from "lucide-react";

export default function PrivacyPage() {
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/system/pages/find?slug=/privacy")
      .then((res) => {
        if (res.data) setPage(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-in fade-in duration-200">
      <div>
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#00a8ff]">
          <Lock className="w-4 h-4" />
          <span>Security & Data Protection</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
          {page?.title || "Privacy Policy"}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Last Updated: {page?.updated || "October 2026"} • {page?.template || "Legal Template"}
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#00a8ff]" />
            <span className="mt-2 block text-xs">Loading privacy disclosures...</span>
          </div>
        ) : page?.content ? (
          <MarkdownContent content={page.content} />
        ) : (
          <div className="space-y-6 text-xs text-slate-600 leading-relaxed">
            <p>Our global data protection policy complies with GDPR, CCPA, and hospitality industry data governance standards.</p>
          </div>
        )}
      </div>
    </div>
  );
}

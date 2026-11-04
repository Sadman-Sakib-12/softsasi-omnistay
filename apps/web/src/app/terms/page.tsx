"use client";
import { BeatLoader } from 'react-spinners';

import React, { useEffect, useState } from "react";
import apiClient from "@/lib/api-client";
import { MarkdownContent } from "@/components/cms/markdown-content";
import { Loader2, ShieldCheck } from "lucide-react";

export default function TermsPage() {
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/system/pages/find?slug=/terms")
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
          <ShieldCheck className="w-4 h-4" />
          <span>Legal Agreement & Governance</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
          {page?.title || "Terms of Service"}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Last Updated: {page?.updated || "October 2026"} • {page?.template || "Legal Template"}
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xs">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <BeatLoader color="#22d3ee" size={18} speedMultiplier={1.2} />
            <span className="text-xs font-semibold text-slate-400 animate-pulse">Loading legal terms...</span>
          </div>
        ) : page?.content ? (
          <MarkdownContent content={page.content} />
        ) : (
          <div className="space-y-6 text-xs text-slate-600 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-900 uppercase">1. Platform Services</h2>
              <p>
                Softsasi OmniStay 360 acts as a modern enterprise marketplace connecting registered travelers with certified hospitality properties, licensed tour operators, vehicle rental fleets, and private vessel operators.
              </p>
            </section>
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-slate-900 uppercase">2. Guest Verification & Safety</h2>
              <p>
                For security and regulatory compliance, guests accessing contactless check-in must provide valid government-issued photographic identification. Digital room keys and QR access tokens are strictly non-transferable.
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

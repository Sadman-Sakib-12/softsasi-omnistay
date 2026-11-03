"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import apiClient from "@/lib/api-client";
import { MarkdownContent } from "@/components/cms/markdown-content";
import { Building2, Globe, ShieldCheck, Award, Users, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/system/pages/find?slug=/about")
      .then((res) => {
        if (res.data) setPage(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-in fade-in duration-200">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-black uppercase tracking-widest text-[#00a8ff]">
          About SOFTSASI 360 & OmniStay
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
          {page?.title || "Next-Generation Autonomous Hospitality Cloud"}
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          {page?.metaDescription ||
            "Softsasi OmniStay 360 is Bangladesh's premier unified multi-vertical travel ecosystem, empowering guests with frictionless booking across luxury resorts, guided wildlife expeditions, executive car fleets, and private yacht charters."}
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs text-center">
          <span className="text-3xl sm:text-4xl font-black text-[#00a8ff]">7+</span>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mt-1">Travel Verticals</span>
        </div>
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs text-center">
          <span className="text-3xl sm:text-4xl font-black text-[#00a8ff]">100%</span>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mt-1">Contactless Check-In</span>
        </div>
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs text-center">
          <span className="text-3xl sm:text-4xl font-black text-[#00a8ff]">24/7</span>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mt-1">AI Concierge</span>
        </div>
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs text-center">
          <span className="text-3xl sm:text-4xl font-black text-[#00a8ff]">256-Bit</span>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mt-1">Bank-Grade Encryption</span>
        </div>
      </div>

      {/* Dynamic CMS Page Body */}
      {loading ? (
        <div className="py-12 text-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#00a8ff]" />
          <span className="mt-2 block text-xs">Loading page details...</span>
        </div>
      ) : page?.content ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs">
          <MarkdownContent content={page.content} />
        </div>
      ) : null}

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#00a8ff] flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Unified Marketplace</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Consolidating hotels, tours, spaces, boats, and cars into a single enterprise inventory pool with multi-vendor payout settlement.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#00a8ff] flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Zero-Trust Security</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Role-based privilege segregation, mandatory multi-factor authentication for financial controllers, and cryptographic audit logs.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#00a8ff] flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Autonomous AI Intelligence</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Dynamic yield pricing algorithms, predictive demand forecasting, automated OCR passport scanning, and 24/7 guest concierges.
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import apiClient from "@/lib/api-client";
import { MarkdownContent } from "@/components/cms/markdown-content";
import { Loader2, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DynamicCmsPage() {
  const params = useParams();
  const slugParam = params?.slug as string;
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slugParam) return;
    const cleanSlug = slugParam.startsWith("/") ? slugParam : `/${slugParam}`;

    apiClient
      .get(`/system/pages/find?slug=${encodeURIComponent(cleanSlug)}`)
      .then((res) => {
        if (res.data) {
          setPage(res.data);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => {
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slugParam]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#00a8ff]" />
        <p className="text-slate-500 text-sm mt-3">Loading page content...</p>
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <FileText className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Page Not Found</h1>
        <p className="text-slate-500 text-xs max-w-sm mx-auto">
          The requested custom CMS page could not be found or has not been published yet.
        </p>
        <Link href="/">
          <Button variant="outline" size="sm" className="mt-4">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Return to Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-in fade-in duration-200">
      <div>
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#00a8ff]">
          <FileText className="w-4 h-4" />
          <span>{page.template || "Standard Page"}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
          {page.title}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Last Updated: {page.updated || "Recently"} • Status: {page.status}
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs">
        <MarkdownContent content={page.content} />
      </div>
    </div>
  );
}


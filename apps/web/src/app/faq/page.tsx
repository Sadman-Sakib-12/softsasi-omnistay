"use client";

import React, { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";

const FAQS = [
  {
    q: "How does 24-Hour Contactless Self Check-In work?",
    a: "24 hours prior to your scheduled check-in time, a secure link is dispatched to your registered email and mobile number. You can verify your photo ID online, select special preferences, and instantly unlock your dynamic QR code digital keycard.",
  },
  {
    q: "Can I bundle hotel stays with private yacht and car rentals?",
    a: "Yes. Softsasi OmniStay 360 features a unified multi-vertical cart. You can select a resort suite, add an airport chauffeur car transfer, and schedule a private sunset boat cruise all in one checkout with a single consolidated folio.",
  },
  {
    q: "How do I redeem my OmniPoints rewards?",
    a: "OmniPoints earned on stays can be redeemed directly in your Digital Wallet (/guest/wallet). 1,000 OmniPoints = ৳1,000 cash discount voucher that can be applied to any hotel, tour, or transport booking.",
  },
  {
    q: "What payment gateways are accepted?",
    a: "We support instant local mobile financial services (bKash Instant, Nagad Direct) as well as Visa, Mastercard, and American Express. You may also utilize your pre-funded Stored-Value Digital Wallet.",
  },
  {
    q: "What is your cancellation policy?",
    a: "Standard resort reservations offer free cancellation up to 48 hours prior to check-in. Expeditions, helicopter transfers, and yacht charters have specialized weather-guaranteed rescheduling policies.",
  },
];

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-2">
        <span className="text-xs font-black uppercase tracking-widest text-[#00a8ff]">
          Help & Support Center
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-slate-500 text-sm">
          Everything you need to know about reservations, digital wallets, and contactless check-in.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden transition-all shadow-xs"
          >
            <button
              type="button"
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              className="w-full p-5 text-left flex items-center justify-between gap-4"
            >
              <span className="text-sm font-bold text-slate-900">{faq.q}</span>
              {openIdx === idx ? (
                <ChevronUp className="w-4 h-4 text-[#00a8ff] shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              )}
            </button>
            {openIdx === idx && (
              <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KeyRound, Search, ArrowRight, ShieldCheck, Smartphone, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GuestPortalNav } from "@/components/guest/guest-portal-nav";

export default function GeneralCheckinLookupPage() {
  const router = useRouter();
  const [confirmationCode, setConfirmationCode] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationCode) return;
    router.push(`/guest/checkin/${confirmationCode.trim().toLowerCase()}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <GuestPortalNav />

      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-sky-50 text-[#00a8ff] flex items-center justify-center mx-auto mb-3">
          <KeyRound className="w-7 h-7" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#00a8ff]">
          Contactless Guest Journey (Chapter 15.1)
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Express Self Check-in & Digital Key
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Skip the reception desk. Enter your booking confirmation code to verify identity, upload passport and receive your BLE door access PIN.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
        <form onSubmit={handleLookup} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Booking Confirmation Code *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. PARIAN-8841 or STANFORD-01"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              className="w-full h-11 px-4 text-sm font-mono font-bold uppercase bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#00a8ff]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Guest Email Address (Optional)
            </label>
            <input
              type="email"
              placeholder="e.g. guest@example.com"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              className="w-full h-11 px-4 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#00a8ff]"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" size="lg" className="w-full bg-[#00a8ff] hover:bg-[#0097e6] text-white">
              <span>Find Reservation & Start Check-in</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 mt-6 border-t border-slate-100 text-center text-xs">
          <div className="p-3 bg-slate-50 rounded-xl">
            <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
            <div className="font-bold text-slate-800">Passport OCR</div>
            <div className="text-[10px] text-slate-500">Fast identity check</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <KeyRound className="w-5 h-5 text-[#00a8ff] mx-auto mb-1" />
            <div className="font-bold text-slate-800">Keypad 6-Digit PIN</div>
            <div className="text-[10px] text-slate-500">Direct door access</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <Smartphone className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <div className="font-bold text-slate-800">Apple/Google Wallet</div>
            <div className="text-[10px] text-slate-500">Tap to unlock NFC</div>
          </div>
        </div>
      </div>
    </div>
  );
}


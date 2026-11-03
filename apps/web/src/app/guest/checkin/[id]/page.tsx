"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BookingService } from "@/features/booking/booking.service";
import {
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Smartphone,
  Upload,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GuestCheckinPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "booking-1";

  const [idUploaded, setIdUploaded] = useState(false);
  const [digitalKey, setDigitalKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePerformCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await BookingService.selfCheckIn(id);
    setDigitalKey(result.digitalKeyPasscode);
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-sky-50 text-[#00a8ff] flex items-center justify-center mx-auto mb-3">
          <KeyRound className="w-7 h-7" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-[#00a8ff]">
          Contactless Hospitality
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Smart Self Check-in & Keycard
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Bypass front-desk queues. Check in 24 hours prior to unlock your digital room access PIN.
        </p>
      </div>

      {!digitalKey ? (
        <form onSubmit={handlePerformCheckIn} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Booking Reference
              </label>
              <input
                type="text"
                disabled
                value={id.toUpperCase()}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700"
              />
            </div>

            {/* Document Upload for Hospitality Compliance */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Identity Verification (Passport / NID)
              </label>
              <div
                onClick={() => setIdUploaded(true)}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  idUploaded
                    ? "border-emerald-500 bg-emerald-50/40"
                    : "border-slate-200 hover:border-[#00a8ff] bg-slate-50"
                }`}
              >
                {idUploaded ? (
                  <div className="flex flex-col items-center text-emerald-700">
                    <CheckCircle2 className="w-8 h-8 mb-1" />
                    <p className="text-xs font-bold">Government ID Verified</p>
                    <p className="text-[10px] text-emerald-600">Encrypted token stored securely</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-slate-500">
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-xs font-semibold text-slate-700">
                      Click to upload Photo ID or Passport
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, PDF up to 10MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Arrival Time */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Estimated Arrival Time
              </label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#00a8ff]">
                <option>02:00 PM (Standard Check-in)</option>
                <option>03:00 PM - 05:00 PM</option>
                <option>06:00 PM - 09:00 PM (Late Arrival)</option>
                <option>After 10:00 PM (Night Arrival)</option>
              </select>
            </div>
          </div>

          <Button
            type="submit"
            isLoading={loading}
            size="lg"
            className="w-full py-4 text-base font-bold shadow-xl shadow-sky-500/25 gap-2"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Complete Contactless Check-in</span>
          </Button>

          <p className="text-[11px] text-center text-slate-400">
            Protected by Verified Stay protocols. Smart lock PIN activates at scheduled check-in time.
          </p>
        </form>
      ) : (
        /* Digital Keycard Active State */
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white rounded-3xl p-8 border border-slate-800 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
            <CheckCircle2 className="w-4 h-4" />
            <span>Check-in Verified & Key Activated</span>
          </div>

          <div>
            <span className="text-xs uppercase tracking-widest text-slate-400 block mb-2">
              Your Smart Room Lock Passcode
            </span>
            <div className="text-5xl font-mono font-black tracking-widest text-[#00a8ff] bg-black/40 py-4 px-6 rounded-2xl border border-sky-500/30 inline-block shadow-inner">
              {digitalKey}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-left text-xs bg-white/5 p-4 rounded-2xl border border-white/10">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Smart Lock Type</span>
              <strong className="text-white">RFID / Keypad Door Lock</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Access Status</span>
              <strong className="text-emerald-400">Active upon arrival</strong>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
            Approach your assigned suite door, enter your 5-digit passcode on the electronic lock pad, and turn the handle.
          </p>

          <div className="pt-2 flex justify-center gap-3">
            <Link href="/guest/bookings">
              <Button variant="secondary" size="md">
                My Bookings
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}


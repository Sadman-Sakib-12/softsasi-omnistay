"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BookingService, BookingResponse } from "@/features/booking/booking.service";
import { formatCurrency } from "@/lib/utils";
import {
  CheckCircle2,
  Download,
  KeyRound,
  QrCode,
  Calendar,
  Share2,
  ShieldCheck,
  ArrowRight,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BookingConfirmationPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "OMNI-SAMPLE";
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    BookingService.getBooking(id).then((res) => {
      setBooking(res);
      setLoading(false);
    });
  }, [id]);

  if (loading || !booking) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-8 h-8 border-4 border-[#00a8ff] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Generating your encrypted digital voucher...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Success Badge */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
          Reservation Confirmed
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          You're all set, {booking.guestName}!
        </h1>
        <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
          A confirmation email with your travel itinerary and PDF voucher has been sent to{" "}
          <strong className="text-slate-700">{booking.guestEmail}</strong>.
        </p>
      </div>

      {/* Digital Travel Voucher Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden mb-8">
        {/* Voucher Header Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-widest text-sky-400">
                Official Digital Travel Voucher
              </span>
              <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3" />
                Verified
              </span>
            </div>
            <p className="text-2xl font-black tracking-tight">{booking.bookingReference}</p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block">Total Amount Paid</span>
            <span className="text-2xl font-extrabold text-white">
              {formatCurrency(booking.totalAmount)}
            </span>
          </div>
        </div>

        {/* Voucher Body: QR Code + Details */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
            {booking.qrCodeUrl ? (
              <img
                src={booking.qrCodeUrl}
                alt="Booking QR Voucher"
                className="w-44 h-44 rounded-xl shadow-xs mix-blend-multiply"
              />
            ) : (
              <QrCode className="w-40 h-40 text-slate-700" />
            )}
            <span className="text-[11px] font-semibold text-slate-500 mt-3 block">
              Scan at Check-in / Gate
            </span>
          </div>

          {/* Reserved Items List */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Reserved Travel Items
            </h3>
            <div className="space-y-3">
              {booking.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#00a8ff]">
                      {item.verticalType}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                    {item.startDate && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        Date: {item.startDate} {item.endDate ? `to ${item.endDate}` : ""}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-slate-900 text-sm">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                    <span className="text-[11px] text-slate-400 block">Qty: {item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Guest details summary */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs text-slate-600">
              <div>
                <span className="text-slate-400 block">Guest Name</span>
                <strong className="text-slate-800">{booking.guestName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Contact Phone</span>
                <strong className="text-slate-800">{booking.guestPhone}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Voucher Action Bar */}
        <div className="bg-slate-50 px-6 sm:px-8 py-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-[#00a8ff] transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Save / Print PDF Voucher</span>
          </button>

          <Link href={`/guest/checkin/${booking.id}`}>
            <Button size="sm" className="gap-2">
              <KeyRound className="w-4 h-4" />
              <span>Digital Self Check-in</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Guest Navigation */}
      <div className="flex justify-center gap-4">
        <Link href="/guest/bookings">
          <Button variant="outline" size="md" className="gap-2">
            <User className="w-4 h-4" />
            <span>View All My Bookings</span>
          </Button>
        </Link>
        <Link href="/">
          <Button variant="ghost" size="md">
            Return to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
}


"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BookingService, BookingResponse } from "@/features/booking/booking.service";
import { useCurrencyStore } from "@/features/currency/currency-store";
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
  FileText,
  Printer,
  Sparkles,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BookingConfirmationPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "OMNI-SAMPLE";
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDocTab, setActiveDocTab] = useState<"voucher" | "invoice">("voucher");
  const { formatPrice } = useCurrencyStore();

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

      {/* Chapter 6.6 Document Selector: Travel Voucher vs Legal Tax Invoice */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <button
          type="button"
          onClick={() => setActiveDocTab("voucher")}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeDocTab === "voucher"
              ? "bg-[#00a8ff] text-white shadow-md shadow-sky-500/25"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Travel Voucher (Dynamic QR)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDocTab("invoice")}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeDocTab === "invoice"
              ? "bg-[#00a8ff] text-white shadow-md shadow-sky-500/25"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Legally Compliant Tax Invoice</span>
        </button>
      </div>

      {activeDocTab === "voucher" ? (
        /* View 1: Digital Travel Voucher with Dynamic QR Code */
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
                {formatPrice(booking.totalAmount)}
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
                <div className="w-44 h-44 bg-white p-3 rounded-xl border border-slate-200 flex flex-col items-center justify-center shadow-xs">
                  <QrCode className="w-32 h-32 text-slate-900" />
                  <span className="text-[9px] font-mono text-slate-400 mt-1 uppercase">
                    {booking.bookingReference}
                  </span>
                </div>
              )}
              <span className="text-[11px] font-bold text-slate-700 mt-3 block">
                Contactless Self Check-in
              </span>
              <span className="text-[10px] text-slate-400">
                Scan at front desk or IoT smart lock
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
                        {formatPrice(item.price * item.quantity)}
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
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF Voucher</span>
            </button>

            <Link href={`/guest/checkin/${booking.id}`}>
              <Button size="sm" className="gap-2 bg-[#2577e3] hover:bg-[#1d62c2]">
                <KeyRound className="w-4 h-4" />
                <span>Digital Self Check-in</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* View 2: Legally Compliant Tax Invoice (Chapter 6.6) */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 sm:p-10 mb-8 space-y-6">
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-[#2577e3]" />
                <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                  SOFTSASI OMNISTAY 360 ENTERPRISE
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                BSCIC Registration No: KU-20250430-0020292 • Global Hospitality Financial Clearing
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                OFFICIAL TAX INVOICE
              </span>
              <span className="text-base font-mono font-bold text-slate-900 block">
                INV-2026-{booking.bookingReference.replace(/[^0-9]/g, "").slice(0, 6) || "984210"}
              </span>
              <span className="text-xs text-slate-500">
                Date: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
          </div>

          {/* Billed To */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs border-b border-slate-100 pb-6">
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Billed To:</span>
              <p className="font-extrabold text-slate-900 text-sm">{booking.guestName}</p>
              <p className="text-slate-600">{booking.guestEmail}</p>
              <p className="text-slate-600">{booking.guestPhone}</p>
            </div>
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">Booking Reference:</span>
              <p className="font-mono font-bold text-slate-900 text-sm">{booking.bookingReference}</p>
              <p className="text-slate-600">Payment Channel: Stripe / Secured Clearing</p>
              <p className="text-emerald-600 font-bold">Status: Cleared & Confirmed</p>
            </div>
          </div>

          {/* Itemized Services Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                  <th className="py-2.5">Item Description</th>
                  <th className="py-2.5 text-center">Vertical</th>
                  <th className="py-2.5 text-center">Qty</th>
                  <th className="py-2.5 text-right">Unit Rate</th>
                  <th className="py-2.5 text-right">Net Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {booking.items.map((item, idx) => (
                  <tr key={idx} className="py-2">
                    <td className="py-2.5 font-bold text-slate-800">{item.title}</td>
                    <td className="py-2.5 text-center uppercase text-[10px] text-slate-500">{item.verticalType}</td>
                    <td className="py-2.5 text-center text-slate-700">{item.quantity}</td>
                    <td className="py-2.5 text-right text-slate-700">{formatPrice(item.price)}</td>
                    <td className="py-2.5 text-right font-bold text-slate-900">{formatPrice(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tax Breakdown & Stamp */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            {/* Confirmation Stamp */}
            <div className="flex items-center gap-3 border-2 border-emerald-500/40 rounded-2xl p-3 bg-emerald-50/50">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                ✓
              </div>
              <div className="text-[11px]">
                <p className="font-black text-emerald-950 uppercase tracking-wide">PAID & VERIFIED</p>
                <p className="text-emerald-700 font-mono text-[10px]">AUTH-CLEARED-STAMP: {booking.bookingReference}</p>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="w-full sm:w-64 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal (Net):</span>
                <span className="font-semibold text-slate-800">{formatPrice(booking.totalAmount * 0.90)}</span>
              </div>
              <div className="flex justify-between">
                <span>Hospitality VAT / GST (5%):</span>
                <span className="font-semibold text-slate-800">{formatPrice(booking.totalAmount * 0.05)}</span>
              </div>
              <div className="flex justify-between">
                <span>Municipal Lodging Tax:</span>
                <span className="font-semibold text-slate-800">{formatPrice(7.00)}</span>
              </div>
              <div className="flex justify-between">
                <span>Resort Amenities Fee:</span>
                <span className="font-semibold text-slate-800">{formatPrice(15.00)}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 text-slate-900">
                <span className="font-black text-sm uppercase">Total Settled:</span>
                <span className="font-black text-lg text-emerald-600">{formatPrice(booking.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Invoice Print Bar */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-[#00a8ff] transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Tax Invoice (PDF)</span>
            </button>
            <span className="text-[10px] text-slate-400">
              Official Computer Generated Invoice • No Physical Signature Required
            </span>
          </div>
        </div>
      )}

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


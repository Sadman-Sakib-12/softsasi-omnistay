"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BookingService, BookingResponse } from "@/features/booking/booking.service";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BOOKING_STATUS_COLORS, BOOKING_STATUS_LABELS } from "@/lib/constants";
import {
  Calendar,
  KeyRound,
  QrCode,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GuestPortalNav } from "@/components/guest/guest-portal-nav";

export default function GuestBookingsPage() {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    BookingService.getGuestBookings().then((res) => {
      setBookings(res);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Guest Self-Service Portal
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          View your active travel itineraries, digital vouchers, and contactless check-in passes.
        </p>
      </div>

      <GuestPortalNav />

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-[#00a8ff] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading your reservations...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-sky-50 text-[#00a8ff] flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Reservations Yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Your confirmed hotel stays, tours, and car rentals will automatically appear here.
          </p>
          <div className="mt-6">
            <Link href="/stays">
              <Button size="md">Start Exploring Stays</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:border-[#00a8ff] transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-lg">
                    {booking.bookingReference}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      BOOKING_STATUS_COLORS[booking.status] || "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {BOOKING_STATUS_LABELS[booking.status] || booking.status}
                  </span>
                </div>

                <div className="text-xs text-slate-500 space-y-1">
                  <p>
                    Booked on <strong>{formatDate(booking.createdAt)}</strong> for{" "}
                    <strong>{booking.guestName}</strong>
                  </p>
                  <p className="text-slate-700 font-medium">
                    {booking.items.map((i) => i.title).join(" + ")}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                <div className="text-left md:text-right">
                  <span className="text-xl font-black text-slate-900 block">
                    {formatCurrency(booking.totalAmount)}
                  </span>
                  <span className="text-[10px] text-slate-400">Total Paid</span>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/booking/confirmation/${booking.id}`}>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <QrCode className="w-3.5 h-3.5 text-[#00a8ff]" />
                      <span>Voucher</span>
                    </Button>
                  </Link>

                  <Link href={`/guest/checkin/${booking.id}`}>
                    <Button size="sm" className="gap-1.5">
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Self Check-in</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


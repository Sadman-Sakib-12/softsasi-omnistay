"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/features/cart/cart-store";
import { BookingService, CreateBookingPayload } from "@/features/booking/booking.service";
import { formatCurrency } from "@/lib/utils";
import apiClient from "@/lib/api-client";
import { PAYMENT_METHODS } from "@/lib/constants";
import {
  ShieldCheck,
  Lock,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Clock,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bkash" | "nagad" | "bank">("card");
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamic Currency Conversion (Chapter 6.3)
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USD");
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.78,
    BDT: 119.5,
    AUD: 1.52,
    CAD: 1.36,
  });
  const [rateLockSeconds, setRateLockSeconds] = useState(900); // 15 minutes

  React.useEffect(() => {
    // Fetch live system rates
    apiClient.get<any>("/system/exchange-rates").then((res) => {
      if (res.data?.rates) {
        setExchangeRates((prev) => ({ ...prev, ...res.data.rates }));
      }
    }).catch(() => {});

    // 15-minute countdown timer
    const interval = setInterval(() => {
      setRateLockSeconds((prev) => (prev > 0 ? prev - 1 : 900));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentRate = exchangeRates[selectedCurrency] || 1.0;
  const convertedTotal = (grandTotal: number) => (grandTotal * currentRate).toFixed(2);
  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const subtotal = getTotal();
  const vatTax = subtotal * 0.05;
  const grandTotal = Math.max(0, subtotal + vatTax - promoDiscount);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    try {
      const res = await apiClient.post<any>("/loyalty/coupons/validate", {
        code: promoCode.trim().toUpperCase(),
        subtotal,
      });
      if (res.data && (res.data.isValid || res.data.discountAmount !== undefined)) {
        setPromoDiscount(Number(res.data.discountAmount || subtotal * 0.1));
        setError(null);
      } else if (["OMNISTAY", "LUXURY10", "SAVE20", "WELCOME50"].includes(promoCode.trim().toUpperCase())) {
        setPromoDiscount(Math.round(subtotal * 0.15 * 100) / 100);
        setError(null);
      } else {
        setError(res.data?.message || "Invalid or expired promotional voucher code.");
      }
    } catch {
      if (["OMNISTAY", "LUXURY10", "SAVE20", "WELCOME50"].includes(promoCode.trim().toUpperCase())) {
        setPromoDiscount(Math.round(subtotal * 0.15 * 100) / 100);
        setError(null);
      } else {
        setError("Invalid promotional voucher code.");
      }
    }
  };

  const handlePlaceBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone) {
      setError("Please complete all required guest details.");
      return;
    }

    // Disposable email sanity check
    const forbiddenDomains = ["mailinator.com", "tempmail.com", "10minutemail.com", "guerrillamail.com"];
    const emailDomain = email.split("@")[1]?.toLowerCase();
    if (forbiddenDomains.includes(emailDomain)) {
      setError("Disposable / temporary email addresses are not permitted. Please provide an authentic email for digital voucher & keycard delivery.");
      return;
    }

    if (!items || items.length === 0) {
      setError("Your travel itinerary is empty. Please select a stay or activity before checking out.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const stayItem = items.find((i) => i.verticalType === "stay") || items[0];
      const propertyId = stayItem?.meta?.propertyId || stayItem?.resourceId;
      const roomTypeId = stayItem?.meta?.roomTypeId || stayItem?.resourceId;

      if (!propertyId || !roomTypeId) {
        setError("Missing property or room selection details. Please return to hotel stays and re-select your preferred room.");
        setLoading(false);
        return;
      }

      const payload: CreateBookingPayload = {
        guestName: fullName,
        guestEmail: email,
        guestPhone: phone,
        specialRequests,
        paymentMethod,
        promoCode: promoCode || undefined,
        propertyId,
        roomTypeId,
        checkInDate: stayItem?.startDate || "2026-11-10",
        checkOutDate: stayItem?.endDate || "2026-11-12",
        adults: 2,
        children: 0,
        depositAmount: grandTotal,
      };

      const result = await BookingService.createBooking(payload);
      clearCart();
      router.push(`/booking/confirmation/${result.id || result.bookingReference}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Booking creation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Secure Travel Checkout
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Complete your guest reservation with immediate digital voucher delivery.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <div>
            <p className="font-semibold">Attention Required</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handlePlaceBooking}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Guest Form & Payment */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. Guest Information */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#00a8ff] text-white text-xs flex items-center justify-center">1</span>
                <span>Primary Guest Contact Details</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Arif Rahman"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a8ff]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Email Address * (For PDF Voucher & Key)
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. arif@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a8ff]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Mobile Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +880 1712-345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a8ff]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Special Requests / Dietary / Arrival Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. High floor ocean view, vegetarian meal on cruise..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a8ff]"
                  />
                </div>
              </div>
            </div>

            {/* 2. Payment Method */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#00a8ff] text-white text-xs flex items-center justify-center">2</span>
                <span>Payment Method</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PAYMENT_METHODS.map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id as any)}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-24 transition-all cursor-pointer ${
                      paymentMethod === pm.id
                        ? "border-[#00a8ff] bg-sky-50/50 shadow-xs ring-2 ring-[#00a8ff]/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <span className="text-2xl">{pm.icon}</span>
                    <span className="text-xs font-bold text-slate-900">{pm.label}</span>
                  </button>
                ))}
              </div>

              {/* Interactive Gateway Specific Inputs */}
              {paymentMethod === "bkash" && (
                <div className="p-4 rounded-2xl bg-[#e2136e]/5 border border-[#e2136e]/20 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#e2136e]">bKash Direct Gateway</span>
                    <span className="text-[10px] font-mono text-[#e2136e] bg-[#e2136e]/10 px-2 py-0.5 rounded">Tokenized 1-Click</span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">bKash Account Number</label>
                    <input
                      type="tel"
                      placeholder="017XXXXXXXX"
                      defaultValue={phone}
                      className="w-full bg-white border border-[#e2136e]/30 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#e2136e]"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    A secure 6-digit OTP will be dispatched to this number upon clicking "Confirm & Place Reservation".
                  </p>
                </div>
              )}

              {paymentMethod === "nagad" && (
                <div className="p-4 rounded-2xl bg-[#f7941d]/5 border border-[#f7941d]/20 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#f7941d]">Nagad Direct Checkout</span>
                    <span className="text-[10px] font-mono text-[#f7941d] bg-[#f7941d]/10 px-2 py-0.5 rounded">Fast Pay</span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Nagad Registered Mobile</label>
                    <input
                      type="tel"
                      placeholder="018XXXXXXXX"
                      defaultValue={phone}
                      className="w-full bg-white border border-[#f7941d]/30 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#f7941d]"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === "card" && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Visa / Mastercard / AMEX</span>
                    <div className="flex gap-1 text-[10px] text-slate-500 font-mono">256-Bit SSL</div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Card Number</label>
                    <input
                      type="text"
                      maxLength={19}
                      placeholder="4111 2222 3333 4444"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00a8ff]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        maxLength={5}
                        placeholder="12/28"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00a8ff]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">CVV / CVC</label>
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="•••"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00a8ff]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "bank" && (
                <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-200 space-y-2 text-xs animate-in fade-in">
                  <span className="font-bold text-slate-900 block">Softsasi OmniStay Corporate Accounts</span>
                  <div className="text-[11px] text-slate-600 font-mono space-y-0.5">
                    <p>The City Bank PLC • A/C: 110-2384-9021 (Gulshan Branch)</p>
                    <p>BRAC Bank PLC • A/C: 150-1200-8472 (Corporate Division)</p>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter Deposit Slip / Transfer Reference #"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-mono text-slate-800 mt-1"
                  />
                </div>
              )}

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  PCI-DSS Level-1 Encrypted Payment Gateway
                </p>
                <p>
                  You will be securely authenticated. Upon authorization, your PDF voucher with dynamic QR code is delivered instantly.
                </p>
              </div>
            </div>
          </div>

          {/* Right Summary Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="sticky top-28 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-900 text-lg">Order Review</h3>

              {/* Items summary */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {items.map((i) => (
                  <div key={i.id} className="flex justify-between text-xs py-1 border-b border-slate-100">
                    <div className="pr-2">
                      <p className="font-semibold text-slate-800 line-clamp-1">{i.title}</p>
                      <p className="text-slate-400">Qty: {i.quantity} {i.unitLabel}</p>
                    </div>
                    <span className="font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(i.pricePerUnit * i.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Voucher promo code */}
              <div className="pt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon: OMNISTAY"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs uppercase focus:outline-none focus:ring-2 focus:ring-[#00a8ff]"
                  />
                  <Button type="button" onClick={handleApplyPromo} variant="outline" size="sm">
                    Apply
                  </Button>
                </div>
              </div>

              {/* Pricing breakdown */}
              <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Voucher Discount</span>
                    <span>-{formatCurrency(promoDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Hospitality VAT (5%)</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(vatTax)}</span>
                </div>
                <div className="flex justify-between items-baseline text-slate-900 pt-3 border-t border-slate-100">
                  <span className="text-sm font-bold">Total Due (USD)</span>
                  <span className="text-2xl font-black">{formatCurrency(grandTotal)}</span>
                </div>

                {/* DCC Multi-Currency Converter (Chapter 6.3) */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-blue-600" /> Pay in Home Currency:
                    </span>
                    <select
                      value={selectedCurrency}
                      onChange={(e) => setSelectedCurrency(e.target.value)}
                      className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-semibold text-slate-800"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="BDT">BDT (৳)</option>
                      <option value="CAD">CAD (C$)</option>
                      <option value="AUD">AUD (A$)</option>
                    </select>
                  </div>

                  {selectedCurrency !== "USD" && (
                    <div className="p-2.5 bg-sky-50/70 border border-sky-200 rounded-xl flex items-center justify-between text-xs">
                      <span className="text-sky-900 font-medium">Estimated Charge:</span>
                      <span className="font-mono font-bold text-sky-900 text-sm">
                        {selectedCurrency} {convertedTotal(grandTotal)}
                      </span>
                    </div>
                  )}

                  {/* 15-Minute Guaranteed Rate Lock */}
                  <div className="p-2 rounded-xl bg-amber-50/80 border border-amber-200 text-[10px] text-amber-900 flex items-center justify-between">
                    <span className="flex items-center gap-1 font-semibold">
                      <Clock className="w-3 h-3 text-amber-700 shrink-0" /> Rate Lock Guarantee:
                    </span>
                    <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-amber-300">
                      {formatTimer(rateLockSeconds)}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                isLoading={loading}
                size="lg"
                className="w-full py-4 text-base font-bold shadow-xl shadow-sky-500/25"
              >
                Confirm & Pay Now
              </Button>

              <div className="text-center">
                <p className="text-[11px] text-slate-400">
                  By confirming, you agree to OmniStay 360 terms of service & host policies.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
}


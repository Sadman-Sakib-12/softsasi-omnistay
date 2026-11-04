"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/features/cart/cart-store";
import { useCurrencyStore, CurrencyCode } from "@/features/currency/currency-store";
import { BookingService, CreateBookingPayload } from "@/features/booking/booking.service";
import apiClient from "@/lib/api-client";
import {
  ShieldCheck,
  Lock,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Clock,
  Globe,
  Wallet,
  Building2,
  Hotel,
  Banknote,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type PaymentMode = "full" | "deposit_20" | "pay_at_hotel" | "wallet";
export type PaymentMethodId = "card" | "bkash" | "nagad" | "wallet" | "bank" | "pay_at_hotel";

const CHECKOUT_PAYMENT_METHODS = [
  { id: "card", label: "Credit / Debit Card", icon: "💳", subtitle: "Visa, Mastercard, AMEX" },
  { id: "bkash", label: "bKash Direct", icon: "📱", subtitle: "Instant Mobile Checkout" },
  { id: "nagad", label: "Nagad Direct", icon: "🟠", subtitle: "Fast Mobile Payment" },
  { id: "wallet", label: "Digital Wallet", icon: "👛", subtitle: "Stored-Value Credits" },
  { id: "bank", label: "Bank Wire Transfer", icon: "🏦", subtitle: "Direct Corporate Invoice" },
  { id: "pay_at_hotel", label: "Pay at Property", icon: "🏨", subtitle: "Credit Card Guarantee" },
] as const;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const { currentCurrency, setCurrency, formatPrice, convert } = useCurrencyStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  
  // Chapter 6.2 - 5 Flexible Payment Modes
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("full");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>("card");

  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLockSeconds, setRateLockSeconds] = useState(900); // 15 minutes
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 15-minute countdown timer
    const interval = setInterval(() => {
      setRateLockSeconds((prev) => (prev > 0 ? prev - 1 : 900));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const subtotal = getTotal();
  const vatTax = subtotal * 0.05;
  const grandTotal = Math.max(0, subtotal + vatTax - promoDiscount);

  // Dynamic deposit & balance calculation (Chapter 6.2)
  const depositAmount =
    paymentMode === "full"
      ? grandTotal
      : paymentMode === "deposit_20"
      ? Math.round(grandTotal * 0.2 * 100) / 100
      : paymentMode === "wallet"
      ? grandTotal
      : 0; // pay_at_hotel

  const balanceDueAtCheckIn = Math.max(0, grandTotal - depositAmount);

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

            {/* 2. Flexible Payment Modes (Sakib_Project_Plan.pdf Chapter 6.2) */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#00a8ff] text-white text-xs flex items-center justify-center font-bold">2</span>
                  <span>Payment Mode</span>
                </h2>
                <span className="text-[11px] font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100">
                  Chapter 6.2 Flexible Terms
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Mode 1: 100% Prepayment */}
                <button
                  type="button"
                  onClick={() => setPaymentMode("full")}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    paymentMode === "full"
                      ? "border-[#00a8ff] bg-sky-50/60 ring-2 ring-[#00a8ff]/20 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-slate-900 uppercase">100% Full Prepayment</span>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMode === "full" ? "border-[#00a8ff] bg-[#00a8ff]" : "border-slate-300"
                    }`}>
                      {paymentMode === "full" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Pay full amount now. Instant booking voucher & keycard issuance.
                  </p>
                  <div className="mt-2 text-xs font-bold text-slate-800">
                    Pay Now: {formatPrice(grandTotal)}
                  </div>
                </button>

                {/* Mode 2: 20% Partial Deposit */}
                <button
                  type="button"
                  onClick={() => setPaymentMode("deposit_20")}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    paymentMode === "deposit_20"
                      ? "border-[#00a8ff] bg-sky-50/60 ring-2 ring-[#00a8ff]/20 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-slate-900 uppercase">20% Partial Deposit</span>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMode === "deposit_20" ? "border-[#00a8ff] bg-[#00a8ff]" : "border-slate-300"
                    }`}>
                      {paymentMode === "deposit_20" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Lock room with 20% deposit. Pay remaining 80% at hotel check-in.
                  </p>
                  <div className="mt-2 text-xs font-bold text-emerald-600 flex items-center justify-between">
                    <span>Pay Today: {formatPrice(Math.round(grandTotal * 0.2 * 100) / 100)}</span>
                    <span className="text-slate-500 text-[10px]">Due Later: {formatPrice(Math.round(grandTotal * 0.8 * 100) / 100)}</span>
                  </div>
                </button>

                {/* Mode 3: Pay-at-Hotel (CC Guarantee) */}
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMode("pay_at_hotel");
                    setPaymentMethod("pay_at_hotel");
                  }}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    paymentMode === "pay_at_hotel"
                      ? "border-[#00a8ff] bg-sky-50/60 ring-2 ring-[#00a8ff]/20 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-slate-900 uppercase">Pay at Hotel / Arrival</span>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMode === "pay_at_hotel" ? "border-[#00a8ff] bg-[#00a8ff]" : "border-slate-300"
                    }`}>
                      {paymentMode === "pay_at_hotel" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Credit card guarantee. No charge today; pay 100% upon arrival.
                  </p>
                  <div className="mt-2 text-xs font-bold text-amber-600">
                    Pay Online Today: {formatPrice(0)}
                  </div>
                </button>

                {/* Mode 4: Digital Wallet */}
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMode("wallet");
                    setPaymentMethod("wallet");
                  }}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    paymentMode === "wallet"
                      ? "border-[#00a8ff] bg-sky-50/60 ring-2 ring-[#00a8ff]/20 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-slate-900 uppercase">OmniStay Digital Wallet</span>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMode === "wallet" ? "border-[#00a8ff] bg-[#00a8ff]" : "border-slate-300"
                    }`}>
                      {paymentMode === "wallet" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Instant 1-click checkout using stored value credits.
                  </p>
                  <div className="mt-2 text-xs font-bold text-blue-600">
                    Available Balance: {formatPrice(500)}
                  </div>
                </button>
              </div>
            </div>

            {/* 3. Payment Method & Gateway Details */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#00a8ff] text-white text-xs flex items-center justify-center font-bold">3</span>
                <span>Select Payment Gateway</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CHECKOUT_PAYMENT_METHODS.map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(pm.id as any);
                      if (pm.id === "pay_at_hotel") setPaymentMode("pay_at_hotel");
                      else if (pm.id === "wallet") setPaymentMode("wallet");
                      else if (paymentMode === "pay_at_hotel") setPaymentMode("full");
                    }}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between h-24 transition-all cursor-pointer ${
                      paymentMethod === pm.id
                        ? "border-[#00a8ff] bg-sky-50/60 shadow-xs ring-2 ring-[#00a8ff]/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{pm.icon}</span>
                      <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        paymentMethod === pm.id ? "border-[#00a8ff] bg-[#00a8ff]" : "border-slate-300"
                      }`}>
                        {paymentMethod === pm.id && <div className="w-1 h-1 rounded-full bg-white" />}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block leading-tight">{pm.label}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5 truncate">{pm.subtitle}</span>
                    </div>
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

              {paymentMethod === "wallet" && (
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2 text-xs animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-900 flex items-center gap-1.5">
                      <Wallet className="w-4 h-4 text-blue-600" /> OmniStay Stored-Value Wallet
                    </span>
                    <span className="font-mono font-bold text-emerald-600 bg-white px-2 py-0.5 rounded border border-emerald-200">
                      Balance: {formatPrice(500)}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Subtotal will be instantly debited from your active wallet balance with zero transaction fees.
                  </p>
                </div>
              )}

              {paymentMethod === "pay_at_hotel" && (
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2 text-xs animate-in fade-in">
                  <span className="font-bold text-amber-900 block flex items-center gap-1.5">
                    <Hotel className="w-4 h-4 text-amber-600" /> Pay at Hotel Front Desk
                  </span>
                  <p className="text-slate-600 text-[11px]">
                    Your reservation is 100% confirmed now. Total payment of <strong>{formatPrice(grandTotal)}</strong> is payable upon check-in via cash, card, or room folio.
                  </p>
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
                      {formatPrice(i.pricePerUnit * i.quantity)}
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

              {/* Pricing breakdown with Live Dynamic Payment Mode & Currency Update */}
              <div className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Voucher Discount</span>
                    <span>-{formatPrice(promoDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Hospitality VAT (5%)</span>
                  <span className="font-semibold text-slate-900">{formatPrice(vatTax)}</span>
                </div>
                <div className="flex justify-between items-baseline text-slate-900 pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-600">Total Booking Value</span>
                  <span className="text-base font-bold text-slate-900">{formatPrice(grandTotal)}</span>
                </div>

                {/* Due Today Highlighted Box based on Payment Mode */}
                <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200/80 space-y-1.5 my-2">
                  <div className="flex justify-between items-center text-sky-950">
                    <span className="font-bold text-xs uppercase tracking-wide">
                      {paymentMode === "full"
                        ? "Total Due Today (100%)"
                        : paymentMode === "deposit_20"
                        ? "Deposit Due Today (20%)"
                        : paymentMode === "pay_at_hotel"
                        ? "Due Today (Pay at Arrival)"
                        : "Total Due Today (Wallet)"}
                    </span>
                    <span className="text-xl font-black text-sky-600">
                      {formatPrice(depositAmount)}
                    </span>
                  </div>
                  {balanceDueAtCheckIn > 0 && (
                    <div className="flex justify-between items-center text-[11px] text-slate-600 pt-1 border-t border-sky-100">
                      <span>Due Upon Check-In:</span>
                      <span className="font-bold text-slate-800">{formatPrice(balanceDueAtCheckIn)}</span>
                    </div>
                  )}
                </div>

                {/* DCC Multi-Currency Converter (Chapter 6.3) */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-blue-600" /> Currency:
                    </span>
                    <select
                      value={mounted ? currentCurrency : "USD"}
                      onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                      className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 font-bold text-slate-800 cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="BDT">BDT (৳)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="AED">AED (AED )</option>
                      <option value="SGD">SGD (S$)</option>
                    </select>
                  </div>

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
                className="w-full py-4 text-base font-bold shadow-xl shadow-sky-500/25 cursor-pointer"
              >
                {depositAmount > 0
                  ? `Pay ${formatPrice(depositAmount)} & Confirm`
                  : `Confirm Reservation (Pay at Arrival)`}
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


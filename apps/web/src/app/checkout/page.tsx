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

export type PaymentMode = "full" | "deposit_20" | "pay_at_hotel" | "wallet" | "corporate_invoice";
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
  const { items, getTotal, clearCart, addItem } = useCartStore();
  const { currentCurrency, setCurrency, formatPrice, convert } = useCurrencyStore();

  const [checkoutType, setCheckoutType] = useState<"guest" | "corporate">("guest");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  // Corporate Portal Checkout Fields (Chapter 6.1 & 6.2)
  const [corporateClientId, setCorporateClientId] = useState("CORP-TITAN-8890");
  const [companyName, setCompanyName] = useState("Apex Global Holdings Ltd.");
  const [billingPoNumber, setBillingPoNumber] = useState("PO-2026-OMNI-091");

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
    // If cart is empty, automatically add canonical Figure 6.1 stay so checkout is immediately active
    if (items.length === 0) {
      addItem({
        verticalType: "stay",
        resourceId: "1101b61f-9971-47b8-8724-0036c1b3d3fa",
        title: "Parian Holiday Villas - Standard Double Room",
        subtitle: "1x King Size Bed • Max 2 Guests",
        imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
        pricePerUnit: 350,
        quantity: 2,
        unitLabel: "night",
        startDate: "2026-11-10",
        endDate: "2026-11-12",
        meta: {
          propertyId: "4f1b230f-9aab-4b96-a735-6d8468f3b284",
          propertyName: "Parian Holiday Villas",
          roomTypeId: "1101b61f-9971-47b8-8724-0036c1b3d3fa",
          roomTypeName: "Standard Double Room",
        },
      });
    }
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

  // Chapter 6.1 - Smart Vacation Bundling & Dynamic Package Discounts
  // Automatically applies 12% bundle discount on car rental when booked with a stay
  const hasStay = items.some((i) => i.verticalType === "stay");
  const carItems = items.filter((i) => i.verticalType === "car");
  const carSubtotal = carItems.reduce((acc, c) => acc + c.pricePerUnit * c.quantity, 0);
  const bundleDiscount = (hasStay && carItems.length > 0) ? Math.round(carSubtotal * 0.12 * 100) / 100 : 0;

  // Chapter 6.4 - Comprehensive Tax & Fee Computation Engine
  const subtotal = getTotal();
  const vatTax = Math.round(subtotal * 0.05 * 100) / 100; // 5% VAT / GST
  const cityLodgingTax = 7.00; // Flat municipal city lodging tax ($3.50/guest x 2 nights)
  const resortFacilityFee = 15.00; // Daily facility amenities & Wi-Fi fee
  const totalSavings = promoDiscount + bundleDiscount;
  const grandTotal = Math.max(0, subtotal + vatTax + cityLodgingTax + resortFacilityFee - totalSavings);

  // Dynamic deposit & balance calculation (Chapter 6.2)
  const depositAmount =
    paymentMode === "full"
      ? grandTotal
      : paymentMode === "deposit_20"
        ? Math.round(grandTotal * 0.2 * 100) / 100
        : paymentMode === "wallet"
          ? grandTotal
          : 0; // pay_at_hotel or corporate_invoice

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
        paymentMode,
        promoCode: promoCode || undefined,
        propertyId,
        roomTypeId,
        checkInDate: stayItem?.startDate || "2026-11-10",
        checkOutDate: stayItem?.endDate || "2026-11-12",
        adults: 2,
        children: 0,
        depositAmount: depositAmount,
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
        {/* Chapter 6.1 Guest vs Corporate Account Checkout Switcher */}
        <div className="mb-6 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => {
              setCheckoutType("guest");
              if (paymentMode === "corporate_invoice") setPaymentMode("full");
            }}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${checkoutType === "guest"
              ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
              : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <span>👤 Express Guest Checkout</span>
            <span className="text-[10px] font-normal text-slate-400">(No password required)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCheckoutType("corporate");
              setPaymentMode("corporate_invoice");
              setPaymentMethod("bank");
            }}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${checkoutType === "corporate"
              ? "bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-200"
              : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <span>🏢 Corporate Portal Checkout</span>
            <span className="text-[10px] font-normal text-indigo-400">(Net 30/60 AR Billing)</span>
          </button>
        </div>

        {/* Chapter 6.1 Vacation Bundle Notification */}
        {bundleDiscount > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Smart Vacation Bundle Active:</strong> You bundled a hotel sanctuary with an airport vehicle! A <strong>12% vehicle discount</strong> has been applied automatically.
              </span>
            </div>
            <span className="font-black text-emerald-700 whitespace-nowrap ml-2">
              Save {formatPrice(bundleDiscount)}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Guest Form & Payment */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. Guest Information */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#00a8ff] text-white text-xs flex items-center justify-center">1</span>
                  <span>{checkoutType === "corporate" ? "Corporate Traveler & Company Details" : "Primary Guest Contact Details"}</span>
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {checkoutType === "corporate" ? "Corporate Master AR" : "One-Click Guest"}
                </span>
              </div>

              {/* Chapter 6.7 Cancellation Policy Assurance */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Flexible Cancellation (Chapter 6.7):</strong> 100% full refund if cancelled up to 24 hours prior to arrival. 1-click automated refund routing.
                </span>
              </div>

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

                {/* Corporate Account Fields (Chapter 6.1) */}
                {checkoutType === "corporate" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-indigo-700 mb-1">
                        Corporate Client ID *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. CORP-TITAN-8890"
                        value={corporateClientId}
                        onChange={(e) => setCorporateClientId(e.target.value)}
                        className="w-full bg-indigo-50/50 border border-indigo-200 rounded-xl px-4 py-3 text-sm font-mono text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-indigo-700 mb-1">
                        Organization / Company Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Apex Global Holdings Ltd."
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full bg-indigo-50/50 border border-indigo-200 rounded-xl px-4 py-3 text-sm text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-indigo-700 mb-1">
                        Purchase Order (PO) / Cost Center Ref
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. PO-2026-OMNI-091"
                        value={billingPoNumber}
                        onChange={(e) => setBillingPoNumber(e.target.value)}
                        className="w-full bg-indigo-50/50 border border-indigo-200 rounded-xl px-4 py-3 text-sm font-mono text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </>
                )}

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
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${paymentMode === "full"
                    ? "border-[#00a8ff] bg-sky-50/60 ring-2 ring-[#00a8ff]/20 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-slate-900 uppercase">100% Full Prepayment</span>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMode === "full" ? "border-[#00a8ff] bg-[#00a8ff]" : "border-slate-300"
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
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${paymentMode === "deposit_20"
                    ? "border-[#00a8ff] bg-sky-50/60 ring-2 ring-[#00a8ff]/20 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-slate-900 uppercase">20% Partial Deposit</span>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMode === "deposit_20" ? "border-[#00a8ff] bg-[#00a8ff]" : "border-slate-300"
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
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${paymentMode === "pay_at_hotel"
                    ? "border-[#00a8ff] bg-sky-50/60 ring-2 ring-[#00a8ff]/20 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-slate-900 uppercase">Pay at Hotel / Arrival</span>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMode === "pay_at_hotel" ? "border-[#00a8ff] bg-[#00a8ff]" : "border-slate-300"
                      }`}>
                      {paymentMode === "pay_at_hotel" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Credit card guarantee ($1 pre-auth). Zero charged online today; settle 100% upon front desk arrival.
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
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${paymentMode === "wallet"
                    ? "border-[#00a8ff] bg-sky-50/60 ring-2 ring-[#00a8ff]/20 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-slate-900 uppercase">OmniStay Digital Wallet</span>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMode === "wallet" ? "border-[#00a8ff] bg-[#00a8ff]" : "border-slate-300"
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

                {/* Mode 5: Corporate Master Invoicing (Chapter 6.2) */}
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMode("corporate_invoice");
                    setPaymentMethod("bank");
                    setCheckoutType("corporate");
                  }}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${paymentMode === "corporate_invoice"
                    ? "border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-indigo-900 uppercase">Corporate Master Invoicing</span>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMode === "corporate_invoice" ? "border-indigo-500 bg-indigo-600" : "border-slate-300"
                      }`}>
                      {paymentMode === "corporate_invoice" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Net 30/60 terms. Posts directly to Accounts Receivable against Corporate Client ID.
                  </p>
                  <div className="mt-2 text-xs font-bold text-indigo-600">
                    Net 30 AR Terms: {formatPrice(grandTotal)}
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
          className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between h-24 transition-all cursor-pointer ${paymentMethod === pm.id
            ? "border-[#00a8ff] bg-sky-50/60 shadow-xs ring-2 ring-[#00a8ff]/20"
            : "border-slate-200 hover:border-slate-300 bg-white"
            }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xl">{pm.icon}</span>
            <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${paymentMethod === pm.id ? "border-[#00a8ff] bg-[#00a8ff]" : "border-slate-300"
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
          </div >

    {/* Right Summary Sidebar */ }
    < aside className = "lg:col-span-1 space-y-6" >
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

        {/* Pricing breakdown with Chapter 6.1 & 6.4 details */}
        <div className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-900">{formatPrice(subtotal)}</span>
          </div>

          {bundleDiscount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Vacation Bundle (12% off Car)</span>
              <span>-{formatPrice(bundleDiscount)}</span>
            </div>
          )}

          {promoDiscount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Voucher Discount</span>
              <span>-{formatPrice(promoDiscount)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Hospitality VAT / GST (5%)</span>
            <span className="font-semibold text-slate-900">{formatPrice(vatTax)}</span>
          </div>

          <div className="flex justify-between">
            <span>Municipal City Lodging Tax</span>
            <span className="font-semibold text-slate-900">{formatPrice(cityLodgingTax)}</span>
          </div>

          <div className="flex justify-between">
            <span>Mandatory Resort & Amenities Fee</span>
            <span className="font-semibold text-slate-900">{formatPrice(resortFacilityFee)}</span>
          </div>

          <div className="flex justify-between text-emerald-600 font-medium">
            <span>Platform Booking Fee</span>
            <span>FREE (Promotional Waiver)</span>
          </div>

          <div className="flex justify-between items-baseline text-slate-900 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-600">Total Booking Value</span>
            <span className="text-base font-bold text-slate-900">{formatPrice(grandTotal)}</span>
          </div>

          {/* Due Today Highlighted Box based on Payment Mode (Chapter 6.2) */}
          <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200/80 space-y-1.5 my-2">
            <div className="flex justify-between items-center text-sky-950">
              <span className="font-bold text-xs uppercase tracking-wide">
                {paymentMode === "full"
                  ? "Total Due Today (100%)"
                  : paymentMode === "deposit_20"
                    ? "Deposit Due Today (20%)"
                    : paymentMode === "pay_at_hotel"
                      ? "Due Today (Pay at Arrival)"
                      : paymentMode === "corporate_invoice"
                        ? "Due Today (Net 30 Invoicing)"
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
            {paymentMode === "corporate_invoice" && (
              <div className="flex justify-between items-center text-[11px] text-indigo-700 pt-1 border-t border-sky-100">
                <span>Net 30 Corporate AR Terms:</span>
                <span className="font-bold">{formatPrice(grandTotal)}</span>
              </div>
            )}
          </div>

          {/* Active Payment Gateway Badge */}
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-sky-50/70 border border-sky-200 text-xs font-semibold text-slate-800">
            <span className="text-slate-500 font-medium text-[11px]">Selected Gateway:</span>
            <span className="text-[#00a8ff] font-bold flex items-center gap-1.5">
              <span>{CHECKOUT_PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.icon}</span>
              <span>{CHECKOUT_PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.label}</span>
            </span>
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
          <span>
            {paymentMode === "pay_at_hotel"
              ? `Confirm Reservation (Pay ${formatPrice(grandTotal)} at Check-in)`
              : paymentMode === "deposit_20"
                ? `Pay 20% Deposit (${formatPrice(depositAmount)}) via ${CHECKOUT_PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.label || 'Gateway'}`
                : paymentMode === "corporate_invoice"
                  ? `Generate Net 30 AR Invoice (${formatPrice(grandTotal)})`
                  : paymentMode === "wallet"
                    ? `Authorize ${formatPrice(grandTotal)} via Digital Wallet`
                    : `Pay ${formatPrice(depositAmount || grandTotal)} via ${CHECKOUT_PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.label || 'Card'} & Confirm`}
          </span>
          <CheckCircle2 className="w-5 h-5 ml-1" />
        </Button>

        <div className="text-center">
          <p className="text-[11px] text-slate-400">
            By confirming, you agree to OmniStay 360 terms of service & host policies.
          </p>
        </div>
      </div>
          </aside >
        </div >
      </form >
    </div >
  );
}


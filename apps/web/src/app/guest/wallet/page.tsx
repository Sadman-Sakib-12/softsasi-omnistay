"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GuestAuthService, GuestUser } from "@/features/auth/auth.service";
import { formatCurrency } from "@/lib/utils";
import {
  Wallet,
  Award,
  Gift,
  Share2,
  Copy,
  CheckCircle2,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Crown,
  Sparkles,
  Zap,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BeatLoader } from "react-spinners";
import { GuestPortalNav } from "@/components/guest/guest-portal-nav";

const LOYALTY_TIERS = [
  {
    name: "Bronze Explorer",
    minNights: 0,
    maxNights: 4,
    color: "from-amber-700 to-amber-900",
    badge: "bg-amber-100 text-amber-900 border-amber-300",
    multiplier: "1.0x OmniPoints",
    perks: ["Complimentary Wi-Fi 6 Across All Properties", "Welcome Signature Mocktail", "Member-Only Discount Rates"],
  },
  {
    name: "Silver Voyager",
    minNights: 5,
    maxNights: 14,
    color: "from-slate-400 to-slate-600",
    badge: "bg-slate-100 text-slate-800 border-slate-300",
    multiplier: "1.25x OmniPoints",
    perks: ["Late Check-Out until 1:00 PM", "5% Food & Beverage Dining Discount", "Priority Waiting List"],
  },
  {
    name: "Gold Elite",
    minNights: 15,
    maxNights: 29,
    color: "from-amber-400 to-yellow-600",
    badge: "bg-yellow-100 text-yellow-900 border-yellow-300",
    multiplier: "1.5x OmniPoints",
    perks: ["Complimentary Suite Upgrade upon Availability", "Daily Gourmet Breakfast Included", "10% Luxury Spa Treatment Discount"],
  },
  {
    name: "Platinum Ambassador",
    minNights: 30,
    maxNights: 999,
    color: "from-sky-500 to-indigo-700",
    badge: "bg-sky-100 text-sky-900 border-sky-300",
    multiplier: "2.0x OmniPoints",
    perks: ["Guaranteed 24-Hour Flexible Check-in / Check-out", "Dedicated 24/7 Personal Butler & Concierge", "Complimentary Helipad or Airport Luxury Transfer"],
  },
];

export default function GuestWalletPage() {
  const [user, setUser] = useState<GuestUser | null>(null);
  const [balance, setBalance] = useState(5000);
  const [points, setPoints] = useState(2450);
  const [nightsStayed, setNightsStayed] = useState(7); // Silver Voyager
  const [selectedTopUp, setSelectedTopUp] = useState<number | null>(null);
  const [customTopUp, setCustomTopUp] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"bkash" | "nagad" | "card">("bkash");
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);

  // Transactions ledger
  const [transactions, setTransactions] = useState([
    {
      id: "TX-9018",
      type: "TOPUP",
      description: "Digital Wallet Top-Up via bKash Instant",
      amount: 5000,
      date: "Oct 28, 2026",
      status: "COMPLETED",
    },
    {
      id: "TX-8942",
      type: "REFERRAL",
      description: "Referral Bonus: Invited Tanvir Ahmed",
      amount: 2500,
      date: "Oct 25, 2026",
      status: "COMPLETED",
    },
    {
      id: "TX-8810",
      type: "SPEND",
      description: "Folio Charge: Parian Holiday Villas (BK-8849)",
      amount: -12500,
      date: "Oct 15, 2026",
      status: "COMPLETED",
    },
    {
      id: "TX-8701",
      type: "CASHBACK",
      description: "5% Loyalty Cash Back Reward",
      amount: 625,
      date: "Oct 15, 2026",
      status: "COMPLETED",
    },
  ]);

  useEffect(() => {
    const stored = GuestAuthService.getStoredUser();
    if (stored) {
      setUser(stored);
      if (stored.walletBalance !== undefined) setBalance(stored.walletBalance);
      if (stored.loyaltyPoints !== undefined) setPoints(stored.loyaltyPoints);
    }
  }, []);

  const currentTier =
    LOYALTY_TIERS.find(
      (t) => nightsStayed >= t.minNights && nightsStayed <= t.maxNights
    ) || LOYALTY_TIERS[0];

  const nextTier =
    LOYALTY_TIERS[LOYALTY_TIERS.indexOf(currentTier) + 1] || currentTier;
  const nightsToNext = Math.max(0, nextTier.minNights - nightsStayed);
  const progressPercent = Math.min(
    100,
    Math.round(((nightsStayed - currentTier.minNights) / (nextTier.minNights - currentTier.minNights || 1)) * 100)
  );

  const referralCode = `OMNI-${user?.id?.substring(0, 4).toUpperCase() || "7824"}`;
  const referralLink = `https://softsasi.com/ref/${referralCode}`;

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2500);
  };

  const handleTopUp = () => {
    const amount = selectedTopUp || Number(customTopUp);
    if (!amount || amount <= 0) return;

    setTopUpLoading(true);
    setTimeout(() => {
      setBalance((prev) => prev + amount);
      setTransactions((prev) => [
        {
          id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
          type: "TOPUP",
          description: `Instant Top-Up via ${paymentMethod.toUpperCase()}`,
          amount,
          date: "Just now",
          status: "COMPLETED",
        },
        ...prev,
      ]);
      setSelectedTopUp(null);
      setCustomTopUp("");
      setTopUpLoading(false);
    }, 1000);
  };

  const handleRedeemPoints = (pointsToRedeem: number) => {
    if (points < pointsToRedeem) return;
    const cashValue = pointsToRedeem; // 1 pt = 1 BDT
    setPoints((prev) => prev - pointsToRedeem);
    setBalance((prev) => prev + cashValue);
    setRedeemSuccess(`Redeemed ${pointsToRedeem} OmniPoints for ৳${cashValue.toLocaleString()} in wallet credits!`);
    setTimeout(() => setRedeemSuccess(null), 4000);

    setTransactions((prev) => [
      {
        id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
        type: "CASHBACK",
        description: `OmniPoints Redemption (${pointsToRedeem} pts)`,
        amount: cashValue,
        date: "Just now",
        status: "COMPLETED",
      },
      ...prev,
    ]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-[#00a8ff]">
            Chapter 13 • Member Financial Ecosystem
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
            Digital Stored-Value Wallet & Loyalty Club
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Manage instant deposit balances, redeem OmniPoints rewards, and share referral perks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/guest/bookings">
            <Button variant="outline" size="sm" className="font-bold">
              My Reservations
            </Button>
          </Link>
          <Link href="/stays">
            <Button size="sm" className="font-extrabold bg-[#00a8ff] hover:bg-[#0092dd]">
              Book a Stay
            </Button>
          </Link>
        </div>
      </div>

      <GuestPortalNav />

      {/* Grid: Wallet Card + Loyalty Tier Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wallet Balance Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-8 -top-8 w-44 h-44 bg-[#00a8ff]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-8 -bottom-8 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                OmniStay Stored-Value Balance
              </span>
              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
                <Wallet className="w-5 h-5 text-[#00a8ff]" />
              </div>
            </div>

            <div className="mt-4">
              <div className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                {formatCurrency(balance, "BDT")}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                ≈ ${(balance / 115).toFixed(2)} USD • Usable across all Hotels, Cars, Tours & Yachts
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                Account Holder
              </span>
              <span className="font-bold text-white truncate block">
                {user?.name || "Traveler Member"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">
                Security Pass
              </span>
              <span className="font-mono text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit Active
              </span>
            </div>
          </div>
        </div>

        {/* Loyalty Tier Progress */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                    OmniClub Loyalty Tier
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <h3 className="text-xl font-black text-slate-900">{currentTier.name}</h3>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${currentTier.badge}`}>
                      {currentTier.multiplier}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black text-[#00a8ff]">{nightsStayed}</span>
                <span className="text-xs text-slate-400 block font-semibold">Nights Stayed</span>
              </div>
            </div>

            {/* Progress bar */}
            {currentTier.name !== "Platinum Ambassador" ? (
              <div className="mt-6">
                <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                  <span className="text-slate-600">
                    Progress to <span className="text-slate-900">{nextTier.name}</span>
                  </span>
                  <span className="text-[#00a8ff]">
                    {nightsToNext} more night{nightsToNext > 1 ? "s" : ""} needed
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#00a8ff] to-sky-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="mt-6 p-3 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-900 font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00a8ff]" />
                <span>You have attained the pinnacle tier: Platinum Ambassador!</span>
              </div>
            )}
          </div>

          {/* Current Tier Perks list */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-2">
              Your Active Tier Privileges:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {currentTier.perks.map((perk, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="font-medium leading-snug">{perk}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row: Instant Top-Up + OmniPoints Redemption */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Instant Top-Up Panel */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">Instant Wallet Top-Up</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Fund your stored balance for seamless checkout across all 7 verticals.
              </p>
            </div>
            <Zap className="w-6 h-6 text-[#00a8ff]" />
          </div>

          {/* Quick Amounts */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Select Top-Up Amount
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1000, 2500, 5000, 10000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setSelectedTopUp(amt);
                    setCustomTopUp("");
                  }}
                  className={`py-3 px-2 rounded-2xl border text-xs font-black transition-all ${
                    selectedTopUp === amt
                      ? "border-[#00a8ff] bg-sky-50 text-[#00a8ff] ring-2 ring-[#00a8ff]"
                      : "border-slate-200 hover:border-slate-300 text-slate-800 bg-slate-50"
                  }`}
                >
                  ৳{amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Or Enter Custom Amount (BDT)
            </label>
            <input
              type="number"
              placeholder="e.g. 15000"
              value={customTopUp}
              onChange={(e) => {
                setCustomTopUp(e.target.value);
                setSelectedTopUp(null);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a8ff]"
            />
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Payment Gateway
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "bkash", label: "bKash Instant", color: "text-pink-600" },
                { id: "nagad", label: "Nagad Direct", color: "text-amber-600" },
                { id: "card", label: "Visa / Master", color: "text-sky-600" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                    paymentMethod === m.id
                      ? "border-[#00a8ff] bg-sky-50 text-[#00a8ff] ring-2 ring-[#00a8ff]"
                      : "border-slate-200 text-slate-700 bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <CreditCard className={`w-4 h-4 ${m.color}`} />
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleTopUp}
            disabled={topUpLoading || (!selectedTopUp && !customTopUp)}
            className="w-full py-6 font-black uppercase tracking-wider text-sm bg-[#00a8ff] hover:bg-[#0092dd] shadow-md shadow-sky-500/20"
          >
            {topUpLoading ? (
              <BeatLoader color="#ffffff" size={10} speedMultiplier={1.2} />
            ) : (
              <span>Proceed to Top-Up</span>
            )}
          </Button>
        </div>

        {/* OmniPoints Rewards & Redemption */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">OmniPoints Rewards</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Redeem 1,000 points = ৳1,000 instant cash credit voucher.
                </p>
              </div>
              <Gift className="w-6 h-6 text-amber-500" />
            </div>

            {/* Points Balance */}
            <div className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-800">
                  Available OmniPoints
                </span>
                <div className="text-3xl font-black text-amber-900 mt-0.5">
                  {points.toLocaleString()} <span className="text-sm font-semibold">pts</span>
                </div>
                <span className="text-xs text-amber-700 font-medium">
                  Worth ৳{points.toLocaleString()} in booking discounts
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                <Sparkles className="w-6 h-6" />
              </div>
            </div>

            {redeemSuccess && (
              <div className="mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{redeemSuccess}</span>
              </div>
            )}

            {/* Quick Redeem Options */}
            <div className="mt-6 space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                Redeem for Instant Cash Credit
              </span>
              {[1000, 2000].map((pts) => (
                <div
                  key={pts}
                  className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-black text-slate-900">
                      ৳{pts.toLocaleString()} Travel Voucher
                    </span>
                    <span className="text-[11px] text-slate-500 block">Cost: {pts} OmniPoints</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={points < pts}
                    onClick={() => handleRedeemPoints(pts)}
                    className="font-bold text-xs"
                  >
                    Redeem
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Points never expire for active loyalty members.</span>
            <Link href="/terms" className="text-[#00a8ff] font-bold hover:underline">
              Terms & Rules
            </Link>
          </div>
        </div>
      </div>

      {/* Double-Sided Referral Engine (Chapter 13 from PDF) */}
      <div className="bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-black uppercase tracking-widest text-[#00a8ff]">
              <Share2 className="w-3.5 h-3.5" />
              <span>Double-Sided Referral Program</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Give ৳2,500, Get ৳2,500 ($25 Reward)
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
              Invite friends to SOFTSASI 360. When they complete their first hotel stay, yacht charter, or tour expedition, both of you receive ৳2,500 credited directly into your Digital Wallets!
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-md">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none w-full"
              />
              <Button
                onClick={handleCopyReferral}
                className="bg-[#00a8ff] hover:bg-[#0092dd] font-bold text-xs shrink-0 py-3 px-5 gap-1.5"
              >
                {copiedReferral ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Link</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-2xl border border-white/10 text-center">
            <div className="bg-white p-3 rounded-2xl shadow-lg mb-3">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                  referralLink
                )}`}
                alt="Referral QR Code"
                className="w-28 h-28"
              />
            </div>
            <span className="text-xs font-black tracking-wider uppercase text-slate-300">
              Scan to Invite Friends
            </span>
            <span className="text-[11px] text-[#00a8ff] font-mono mt-0.5 font-bold">
              Code: {referralCode}
            </span>
          </div>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">Wallet Folio Ledger</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Audited transaction record for top-ups, checkout folio debits, and loyalty bonuses.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">
            {transactions.length} Transactions
          </span>
        </div>

        <div className="divide-y divide-slate-100 overflow-x-auto">
          {transactions.map((tx) => (
            <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    tx.amount > 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                  }`}
                >
                  {tx.amount > 0 ? (
                    <ArrowDownLeft className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">{tx.description}</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {tx.id} • {tx.date}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`font-black text-sm block ${
                    tx.amount > 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {tx.amount > 0 ? "+" : ""}
                  {formatCurrency(tx.amount, "BDT")}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


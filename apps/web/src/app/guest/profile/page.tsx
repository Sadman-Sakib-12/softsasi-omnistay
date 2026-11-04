"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GuestAuthService, GuestUser } from "@/features/auth/auth.service";
import apiClient from "@/lib/api-client";
import { GuestPortalNav } from "@/components/guest/guest-portal-nav";
import { useCurrencyStore, CurrencyCode } from "@/features/currency/currency-store";
import { CURRENCIES } from "@/lib/constants";
import {
  User,
  Mail,
  Phone,
  Shield,
  KeyRound,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Award,
  Wallet,
  Globe,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BeatLoader } from "react-spinners";

export default function GuestProfilePage() {
  const router = useRouter();
  const { currentCurrency, setCurrency } = useCurrencyStore();
  const [user, setUser] = useState<GuestUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    const stored = GuestAuthService.getStoredUser();
    if (!stored && !GuestAuthService.isLoggedIn()) {
      router.push("/auth/login?redirect=/guest/profile");
      return;
    }

    if (stored) {
      setUser(stored);
      setFullName(stored.name || "");
    }

    // Attempt to load fresh profile from backend
    apiClient
      .get("/users/me")
      .then((res) => {
        if (res.data) {
          const freshUser = {
            id: res.data.id || stored?.id || "",
            name: `${res.data.firstName || ""} ${res.data.lastName || ""}`.trim() || res.data.name || stored?.name || "",
            email: res.data.email || stored?.email || "",
            role: res.data.role || stored?.role || "GUEST",
            walletBalance: stored?.walletBalance ?? 0,
            loyaltyTier: stored?.loyaltyTier || "Bronze Explorer",
            loyaltyPoints: stored?.loyaltyPoints ?? 0,
          };
          setUser(freshUser);
          setFullName(freshUser.name);
          if (res.data.phone) setPhone(res.data.phone);
        }
      })
      .catch(() => {
        // Continue with local stored session
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      const parts = fullName.trim().split(" ");
      const firstName = parts[0] || fullName.trim();
      const lastName = parts.slice(1).join(" ") || "";

      await apiClient.patch("/users/me", {
        firstName,
        lastName,
        phone: phone.trim() || undefined,
      });

      // Update local storage representation
      if (user) {
        const updated = { ...user, name: fullName.trim() };
        setUser(updated);
        localStorage.setItem("omnistay_guest_user", JSON.stringify(updated));
      }

      setSaveSuccess("Profile successfully updated.");
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (err: any) {
      setSaveError(err.response?.data?.message || "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordUpdating(true);
    setPasswordSuccess(null);
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      setPasswordUpdating(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      setPasswordUpdating(false);
      return;
    }

    try {
      await apiClient.patch("/users/me", {
        password: newPassword,
      });

      setPasswordSuccess("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(null), 4000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || "Failed to update password.");
    } finally {
      setPasswordUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="py-20 flex flex-col items-center justify-center">
          <BeatLoader color="#22d3ee" size={18} speedMultiplier={1.2} />
          <p className="text-slate-500 text-sm mt-4 font-medium animate-pulse">Loading your account profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Guest Self-Service Portal
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your personal information, travel preferences, loyalty tier, and account security.
        </p>
      </div>

      {/* Guest Portal Sub-Navigation Tabs */}
      <GuestPortalNav />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: User Summary Card */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#2577e3] text-white flex items-center justify-center text-2xl font-black shadow-md">
                {user?.name ? user.name.charAt(0).toUpperCase() : "G"}
              </div>
              <div className="overflow-hidden">
                <h2 className="text-lg font-bold text-slate-900 truncate">{user?.name || "Guest Traveler"}</h2>
                <p className="text-xs text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{user?.email}</span>
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  Loyalty Tier
                </span>
                <span className="font-bold text-slate-800 bg-amber-50 border border-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full">
                  {user?.loyaltyTier || "Bronze Explorer"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-emerald-500" />
                  OmniPoints
                </span>
                <span className="font-bold text-slate-800">
                  {user?.loyaltyPoints ?? 2450} pts
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-sky-500" />
                  Account Status
                </span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <Link
                href="/guest/wallet"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition-colors"
              >
                <Wallet className="w-4 h-4 text-slate-500" />
                <span>View Digital Wallet & Rewards</span>
              </Link>
            </div>
          </div>

          {/* Quick Sign Out Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Session Control</h3>
            <p className="text-xs text-slate-600 mb-4">
              Sign out from this device to end your guest session and clear stored tokens.
            </p>
            <Button
              variant="outline"
              onClick={() => GuestAuthService.logout()}
              className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 font-semibold text-xs flex items-center justify-center gap-2 py-2.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Account</span>
            </Button>
          </div>
        </div>

        {/* Right Column: Profile Edit & Preferences */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information Form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#2577e3]" /> Personal Information
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your primary identity information used for booking confirmations and hotel check-in.
                </p>
              </div>
            </div>

            {saveSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{saveSuccess}</span>
              </div>
            )}

            {saveError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full h-10 px-3.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#2577e3] focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ""}
                    className="w-full h-10 px-3.5 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Email address is verified and tied to your travel itineraries.
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full h-10 pl-9 pr-3.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#2577e3] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-[#2577e3] text-white hover:bg-blue-700 px-5 text-xs font-semibold"
                >
                  {saving ? "Saving Changes..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>

          {/* Regional & Currency Preferences */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-[#2577e3]" /> Travel & Currency Preferences
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Customize how pricing and booking rates are presented to you across the marketplace.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Display Currency
                </label>
                <select
                  value={currentCurrency}
                  onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                  className="w-full h-10 px-3.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#2577e3] focus:bg-white transition-colors"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.symbol}) — {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Interface Language
                </label>
                <select
                  defaultValue="en"
                  className="w-full h-10 px-3.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#2577e3] focus:bg-white transition-colors"
                >
                  <option value="en">English (US)</option>
                  <option value="bn">বাংলা (Bengali)</option>
                  <option value="es">Español (Spanish)</option>
                  <option value="fr">Français (French)</option>
                  <option value="ar">العربية (Arabic)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Account Security Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4 text-[#2577e3]" /> Password & Security
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Ensure your account is protected with a secure password and multi-factor protection.
            </p>

            {passwordSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full h-10 px-3.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#2577e3] focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full h-10 px-3.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-[#2577e3] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  disabled={passwordUpdating}
                  className="bg-slate-900 text-white hover:bg-slate-800 px-5 text-xs font-semibold"
                >
                  {passwordUpdating ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

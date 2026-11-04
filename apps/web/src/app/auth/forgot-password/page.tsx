"use client";
import { BeatLoader } from 'react-spinners';

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GuestAuthService } from "@/features/auth/auth.service";
import {
  KeyRound,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function ForgotPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // State for Request Reset
  const [email, setEmail] = useState("");
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  // State for Confirm Reset
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please provide your account email.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await GuestAuthService.forgotPassword(email);
      setRequestSubmitted(true);
      setSuccess("A password reset link has been sent to your email address.");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Could not send reset link. Please verify the email and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await GuestAuthService.resetPassword(token, newPassword);
      setSuccess("Password updated successfully! Redirecting to Sign In...");
      setTimeout(() => {
        router.push("/auth/login?reset=success");
      }, 1500);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Invalid or expired reset token. Please request a new password reset."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 sm:p-10 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#00a8ff] flex items-center justify-center mx-auto mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-[#00a8ff]">
            Account Recovery
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            {token ? "Create New Password" : "Reset Your Password"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {token
              ? "Choose a strong password with at least 8 characters."
              : "Enter your registered email and we’ll dispatch a secure recovery link."}
          </p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="font-semibold">{success}</p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {token ? (
          /* Set New Password Form */
          <form onSubmit={handleConfirmReset} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Min 8 chars (letters + numbers)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a8ff]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a8ff]"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-6 font-black uppercase tracking-wider text-sm bg-[#00a8ff] hover:bg-[#0092dd] shadow-md shadow-sky-500/20 gap-2"
            >
              {loading ? (
                <BeatLoader color="#ffffff" size={8} speedMultiplier={1.2} />
              ) : (
                <>
                  <span>Save New Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        ) : (
          /* Request Reset Form */
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a8ff]"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || requestSubmitted}
              className="w-full py-6 font-black uppercase tracking-wider text-sm bg-[#00a8ff] hover:bg-[#0092dd] shadow-md shadow-sky-500/20 gap-2"
            >
              {loading ? (
                <BeatLoader color="#ffffff" size={8} speedMultiplier={1.2} />
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        )}

        {/* Footer */}
        <div className="text-center pt-2">
          <Link
            href="/auth/login"
            className="text-xs font-bold text-slate-500 hover:text-slate-800"
          >
            ← Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <BeatLoader color="#22d3ee" size={18} speedMultiplier={1.2} />
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}

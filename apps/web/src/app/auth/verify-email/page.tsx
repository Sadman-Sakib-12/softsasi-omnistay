"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GuestAuthService } from "@/features/auth/auth.service";
import {
  ShieldCheck,
  Mail,
  KeyRound,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialEmail = searchParams.get("email") || "";
  const is2FA = searchParams.get("reason") === "2fa";
  const justRegistered = searchParams.get("registered") === "1";

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(
    justRegistered ? "Account created! Please enter the 6-digit code sent to your email." : null
  );

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please provide your email address.");
      return;
    }
    if (!code || code.length !== 6) {
      setError("Verification code must be exactly 6 digits.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await GuestAuthService.verifyEmail(email, code);
      setSuccessMsg("Email successfully verified! Redirecting to your dashboard...");
      setTimeout(() => {
        router.push("/guest/bookings");
      }, 1500);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Invalid or expired verification code. Please request a new one."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Please enter your email to resend code.");
      return;
    }

    setResending(true);
    setError(null);

    try {
      await GuestAuthService.resendVerification(email);
      setSuccessMsg("A fresh 6-digit verification code has been dispatched to your email.");
      setTimer(60);
      setCanResend(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to resend code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 sm:p-10 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#00a8ff] flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-[#00a8ff]">
            {is2FA ? "Two-Factor Verification" : "Email Activation"}
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            {is2FA ? "Enter 2FA Code" : "Verify Your Account"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            We sent a secure 6-digit numeric activation code to{" "}
            <span className="font-semibold text-slate-800">{email || "your email address"}</span>.
          </p>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="font-semibold">{successMsg}</p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          {!initialEmail && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Account Email
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
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              6-Digit Activation Code
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                maxLength={6}
                required
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3.5 text-center text-xl font-mono font-bold tracking-widest text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00a8ff]"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1 text-center">
              Enter the numeric code without any spaces or symbols.
            </p>
          </div>

          <Button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full py-6 font-black uppercase tracking-wider text-sm bg-[#00a8ff] hover:bg-[#0092dd] shadow-md shadow-sky-500/20 gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Activate Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        {/* Resend Code Section */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Didn’t receive the code?</span>
          {canResend ? (
            <button
              onClick={handleResend}
              disabled={resending}
              className="font-bold text-[#00a8ff] hover:underline flex items-center gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
              <span>Resend Code</span>
            </button>
          ) : (
            <span className="font-semibold text-slate-400">
              Resend in <span className="text-slate-700 font-mono">{timer}s</span>
            </span>
          )}
        </div>

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

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#00a8ff] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}

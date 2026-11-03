'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MailCheck, KeyRound, Loader2, CheckCircle2, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { authService } from '@/features/auth/services/auth.service';
import { sessionManager } from '@/lib/auth/session';
import { useTenantStore } from '@/stores/tenant-store';
import { useUiStore } from '@/stores/ui-store';
import { Role } from '@/lib/auth/permissions';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const tokenParam = searchParams.get('token') || '';

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const { setTenantId } = useTenantStore();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Auto-verify if cryptographic token is present in URL
  useEffect(() => {
    if (tokenParam && emailParam) {
      handleVerify(tokenParam);
    }
  }, [tokenParam, emailParam]);

  const handleVerify = async (tokenOverride?: string) => {
    const verificationCode = tokenOverride || code;
    if (!email) {
      setErrorMsg('Email address is required');
      return;
    }
    if (!verificationCode) {
      setErrorMsg('Please enter the 6-digit verification code');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      const res = await authService.verifyEmail({
        email: email.trim(),
        code: verificationCode.length === 6 ? verificationCode.trim() : undefined,
        token: verificationCode.length !== 6 ? verificationCode.trim() : undefined,
      });

      if (res.accessToken) {
        const tenantId = res.organization?.id || res.user?.tenantId || '';
        const activeRole = (res.role as Role) || (res.user?.role as Role) || Role.COMPANY_OWNER_GM;

        sessionManager.setToken(res.accessToken, res.refreshToken);
        sessionManager.setUser({
          id: res.user?.id || '',
          email: res.user?.email || email,
          name: res.user?.name || 'Verified User',
          role: activeRole,
          tenantId: tenantId,
          permissions: res.permissions || ['*'],
        });

        if (tenantId) setTenantId(tenantId);
        useUiStore.getState().setActiveRole(activeRole);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid or expired verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setErrorMsg('Please enter your registered email address first');
      return;
    }

    setIsResending(true);
    setErrorMsg(null);
    try {
      const res = await authService.resendVerification(email.trim());
      setInfoMsg(
        res.activationCode
          ? `Code dispatched! (Dev Code: ${res.activationCode})`
          : 'A new 6-digit verification code has been dispatched to your email.',
      );
      setCountdown(60);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend verification code');
    } finally {
      setIsResending(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-6 space-y-4 animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200 shadow-sm">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Email Verified!</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Your SoftSasi OmniStay account has been activated successfully. Redirecting you to the management workspace...
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-[#00a8ff] pt-2 font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-[#00a8ff]" /> Entering Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Top Shield Icon Badge */}
      <div className="w-14 h-14 rounded-2xl bg-[#00a8ff] text-white flex items-center justify-center mx-auto mb-5 shadow-md shadow-blue-500/20">
        <MailCheck className="w-7 h-7 text-white stroke-[2.2]" />
      </div>

      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Verify Your Email</h1>
        <p className="text-xs text-slate-500 mt-1.5 font-normal">
          We&apos;ve dispatched a 6-digit activation code to confirm ownership and prevent fraudulent registrations (Chapter 17.4 & 19.5).
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {infoMsg && (
        <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-500" />
          <span>{infoMsg}</span>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleVerify();
        }}
        className="space-y-4"
      >
        {/* Email Address */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Account Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@yourresort.com"
            required
            className="w-full h-11 px-3.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#00a8ff] transition-all"
          />
        </div>

        {/* 6-Digit Code */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700">6-Digit Activation Code</label>
            <button
              type="button"
              disabled={isResending || countdown > 0}
              onClick={handleResend}
              className="text-[11px] text-[#00a8ff] hover:underline font-semibold flex items-center gap-1 disabled:opacity-50 cursor-pointer"
            >
              {isResending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
            </button>
          </div>
          <div className="relative">
            <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="123456"
              className="w-full h-11 pl-10 pr-3.5 text-center tracking-[0.3em] font-mono text-base font-bold bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-[#00a8ff] transition-all"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || code.length < 6}
            className="w-full h-11 bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-bold rounded-xl shadow-2xs transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Activating Account...</span>
              </div>
            ) : (
              'Verify & Activate Account'
            )}
          </button>
        </div>

        <p className="text-center text-xs text-slate-500 pt-3 flex items-center justify-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <Link href="/login" className="text-[#00a8ff] font-bold hover:underline">
            Back to Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#f8fafc]">
      <div className="w-full max-w-[440px] rounded-[32px] border border-slate-200 bg-white p-8 sm:p-10 shadow-sm animate-in fade-in zoom-in-95 duration-200">
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#00a8ff]" />
            </div>
          }
        >
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}


'use client';
import { BeatLoader } from 'react-spinners';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, Loader2, ShieldCheck, QrCode, Smartphone, Sparkles, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { verify2faSchema, Verify2faFormData } from '@/features/auth/schemas/login.schema';
import { useAuth } from '@/features/auth/hooks/use-auth';

export default function Verify2faPage() {
  const { verify2fa, isVerifying2fa } = useAuth();
  const [secret, setSecret] = useState<string | null>(null);
  const [otpAuthUri, setOtpAuthUri] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedSecret = sessionStorage.getItem('omnistay_2fa_secret');
      const storedOtpAuth = sessionStorage.getItem('omnistay_2fa_otpauth');
      if (storedSecret) setSecret(storedSecret);
      if (storedOtpAuth) setOtpAuthUri(storedOtpAuth);
    }
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Verify2faFormData>({
    resolver: zodResolver(verify2faSchema),
  });

  const onSubmit = (data: Verify2faFormData) => {
    verify2fa(data);
  };

  const handleUseTestCode = () => {
    setValue('code', '123456', { shouldValidate: true });
  };

  const qrImageUrl = otpAuthUri
    ? `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(otpAuthUri)}`
    : secret
    ? `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`otpauth://totp/OmniStay%20360?secret=${secret}&issuer=OmniStay`)}`
    : null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#f8fafc]">
      <div className="w-full max-w-[460px] rounded-[32px] border border-slate-200 bg-white p-7 sm:p-9 shadow-sm animate-in fade-in zoom-in-95 duration-200">
        {/* Top Shield Icon Badge */}
        <div className="w-14 h-14 rounded-2xl bg-[#00a8ff] text-white flex items-center justify-center mx-auto mb-4 shadow-md shadow-blue-500/20">
          <ShieldCheck className="w-7 h-7 text-white stroke-[2.2]" />
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Two-Factor Authentication (TOTP)</h1>
          <p className="text-xs text-slate-500 mt-1.5 font-normal">
            Chapter 19 §19.5: Mandatory for SuperAdmin, Owner / GM & CFO
          </p>
        </div>

        {/* Important Clarification Banner on Email vs Authenticator App */}
        <div className="mb-4 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-[11px] leading-relaxed flex items-start gap-2.5">
          <Smartphone className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-950 block">ওটিপি কি ইমেইলে যাবে?</span>
            না, এটি <strong>TOTP (Time-based OTP)</strong>। কোডটি আপনার মোবাইলের <strong>Google Authenticator</strong> বা <strong>Microsoft Authenticator</strong> অ্যাপে প্রতি ৩০ সেকেন্ডে তৈরি হয়, কোনো ইমেইল পাঠানো হয় না।
          </div>
        </div>

        {/* Authenticator Setup / QR Code Card */}
        {secret && (
          <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl text-sky-900 text-xs space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sky-950 flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-sky-600" />
                Authenticator Setup Key
              </span>
              <button
                type="button"
                onClick={() => setShowQr(!showQr)}
                className="text-[11px] text-[#00a8ff] font-bold hover:underline cursor-pointer"
              >
                {showQr ? 'Hide QR' : 'Show QR Code'}
              </button>
            </div>

            {showQr && qrImageUrl && (
              <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-sky-100 shadow-2xs">
                <img src={qrImageUrl} alt="TOTP QR Code" className="w-36 h-36 rounded-lg" />
                <span className="text-[10px] text-slate-400 mt-1.5 font-medium">
                  Scan with Google Authenticator
                </span>
              </div>
            )}

            <div className="font-mono bg-white p-2 rounded-xl border border-sky-100 text-center tracking-widest font-bold text-slate-800 select-all text-xs">
              {secret}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">6-Digit TOTP Code</label>
              {/* Quick Test Code Button for Dev */}
              <button
                type="button"
                onClick={handleUseTestCode}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-emerald-500" />
                Quick Test Code (123456)
              </button>
            </div>

            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="123456"
                maxLength={6}
                {...register('code')}
                className="w-full h-11 pl-10 pr-3.5 text-center tracking-[0.3em] font-mono text-base font-bold bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-[#00a8ff] transition-all"
              />
            </div>
            {errors.code && <p className="text-[11px] text-rose-500 mt-0.5">{errors.code.message}</p>}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isVerifying2fa}
              className="w-full h-11 bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-bold rounded-xl shadow-2xs transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              {isVerifying2fa ? (
                <div className="flex items-center gap-2">
                  <BeatLoader color="currentColor" size={8} speedMultiplier={1.2} />
                  <span>Verifying Code...</span>
                </div>
              ) : (
                'Verify & Continue to Dashboard'
              )}
            </button>
          </div>

          <p className="text-center text-xs text-slate-500 pt-2">
            <Link href="/login" className="text-[#00a8ff] font-bold hover:underline">
              Back to Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}


'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, Loader2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { verify2faSchema, Verify2faFormData } from '@/features/auth/schemas/login.schema';
import { useAuth } from '@/features/auth/hooks/use-auth';

export default function Verify2faPage() {
  const { verify2fa, isVerifying2fa } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Verify2faFormData>({
    resolver: zodResolver(verify2faSchema),
  });

  const onSubmit = (data: Verify2faFormData) => {
    verify2fa(data);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#f8fafc]">
      <div className="w-full max-w-[430px] rounded-[32px] border border-slate-200 bg-white p-8 sm:p-10 shadow-sm animate-in fade-in zoom-in-95 duration-200">
        {/* Top Shield Icon Badge */}
        <div className="w-14 h-14 rounded-2xl bg-[#00a8ff] text-white flex items-center justify-center mx-auto mb-5 shadow-md shadow-blue-500/20">
          <ShieldCheck className="w-7 h-7 text-white stroke-[2.2]" />
        </div>

        {/* Header */}
        <div className="text-center mb-7">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Two-Factor Challenge</h1>
          <p className="text-xs text-slate-500 mt-1.5 font-normal">
            Enter the 6-digit verification code from your authenticator app
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Security Code</label>
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
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Code...</span>
                </div>
              ) : (
                'Verify & Continue'
              )}
            </button>
          </div>

          <p className="text-center text-xs text-slate-500 pt-3">
            <Link href="/login" className="text-[#00a8ff] font-bold hover:underline">
              Back to Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}


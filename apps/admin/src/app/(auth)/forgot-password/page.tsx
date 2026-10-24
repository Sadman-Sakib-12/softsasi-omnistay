'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, Loader2, CheckCircle2, KeyRound } from 'lucide-react';
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/features/auth/schemas/login.schema';
import { useAuth } from '@/features/auth/hooks/use-auth';

export default function ForgotPasswordPage() {
  const { forgotPassword, isForgotPasswordLoading } = useAuth();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPassword(data, {
      onSuccess: () => setSubmitted(true),
    });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#f8fafc]">
      <div className="w-full max-w-[430px] rounded-[32px] border border-slate-200 bg-white p-8 sm:p-10 shadow-sm animate-in fade-in zoom-in-95 duration-200">
        {/* Top Key Icon Badge */}
        <div className="w-14 h-14 rounded-2xl bg-[#00a8ff] text-white flex items-center justify-center mx-auto mb-5 shadow-md shadow-blue-500/20">
          <KeyRound className="w-7 h-7 text-white stroke-[2.2]" />
        </div>

        {/* Header */}
        <div className="text-center mb-7">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Forgot Password</h1>
          <p className="text-xs text-slate-500 mt-1.5 font-normal">
            Enter your business email to receive reset instructions
          </p>
        </div>

        {submitted ? (
          <div className="text-center space-y-4 py-4 animate-in fade-in duration-300">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200 shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Reset Link Sent</h3>
            <p className="text-xs text-slate-500">
              If an account exists with that email, instructions have been delivered to your inbox.
            </p>
            <Link
              href="/login"
              className="w-full h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 mt-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="admin@omnistay.com"
                  {...register('email')}
                  className="w-full h-11 pl-10 pr-3.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#00a8ff] transition-all"
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-rose-500 mt-0.5">{errors.email.message}</p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isForgotPasswordLoading}
                className="w-full h-11 bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-bold rounded-xl shadow-2xs transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                {isForgotPasswordLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Instructions...</span>
                  </div>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </div>

            <p className="text-center text-xs text-slate-500 pt-3">
              Remember your password?{' '}
              <Link href="/login" className="text-[#00a8ff] font-bold hover:underline ml-1">
                Sign In
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}


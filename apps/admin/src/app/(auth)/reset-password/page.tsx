'use client';

import React, { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Loader2, KeyRound, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { resetPasswordSchema, ResetPasswordFormData } from '@/features/auth/schemas/login.schema';
import { useAuth } from '@/features/auth/hooks/use-auth';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const { resetPassword, isResetPasswordLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    resetPassword({ data, token });
  };

  return (
    <div className="w-full max-w-[430px] rounded-[32px] border border-slate-200 bg-white p-8 sm:p-10 shadow-sm animate-in fade-in zoom-in-95 duration-200">
      {/* Top Key Icon Badge */}
      <div className="w-14 h-14 rounded-2xl bg-[#00a8ff] text-white flex items-center justify-center mx-auto mb-5 shadow-md shadow-blue-500/20">
        <KeyRound className="w-7 h-7 text-white stroke-[2.2]" />
      </div>

      {/* Header */}
      <div className="text-center mb-7">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Set New Password</h1>
        <p className="text-xs text-slate-500 mt-1.5 font-normal">Choose a secure password for your OmniStay account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">New Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              className="w-full h-11 pl-10 pr-10 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#00a8ff] transition-all tracking-wider font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-[11px] text-rose-500 mt-0.5">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Confirm Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('confirmPassword')}
              className="w-full h-11 pl-10 pr-10 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#00a8ff] transition-all tracking-wider font-mono"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-[11px] text-rose-500 mt-0.5">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isResetPasswordLoading}
            className="w-full h-11 bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-bold rounded-xl shadow-2xs transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
          >
            {isResetPasswordLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating Password...</span>
              </div>
            ) : (
              'Update Password'
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
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#f8fafc]">
      <Suspense fallback={<div className="text-slate-400 text-xs">Loading reset page...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}


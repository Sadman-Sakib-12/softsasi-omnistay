'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, ArrowRight, Loader2 } from 'lucide-react';
import { resetPasswordSchema, ResetPasswordFormData } from '@/features/auth/schemas/login.schema';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const { resetPassword, isResetPasswordLoading } = useAuth();

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
    <div className="w-full max-w-md z-10 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white tracking-tight">Set New Password</h1>
        <p className="text-xs text-slate-400">Choose a secure password for your OmniStay account</p>
      </div>

      <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-8 backdrop-blur-2xl shadow-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">New Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              icon={<Lock className="w-4 h-4" />}
              {...register('password')}
            />
            {errors.password && <p className="text-[11px] text-rose-400">{errors.password.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Confirm Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              icon={<Lock className="w-4 h-4" />}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-[11px] text-rose-400">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" variant="glow" className="w-full mt-2" disabled={isResetPasswordLoading}>
            {isResetPasswordLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Updating Password...
              </>
            ) : (
              <>
                Update Password <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden">
      <Suspense fallback={<div className="text-slate-400 text-xs">Loading reset page...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}

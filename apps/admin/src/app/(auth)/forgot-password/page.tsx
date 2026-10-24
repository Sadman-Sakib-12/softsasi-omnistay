'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/features/auth/schemas/login.schema';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Reset Your Password
          </h1>
          <p className="text-xs text-slate-400">
            Enter your business email and we will send password reset instructions
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-8 backdrop-blur-2xl shadow-2xl">
          {submitted ? (
            <div className="text-center space-y-4 py-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-sm font-semibold text-white">Reset link sent!</h3>
              <p className="text-xs text-slate-400">
                If an account exists with that email, instructions have been delivered to your inbox.
              </p>
              <Link href="/login">
                <Button variant="outline" className="w-full mt-2">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Registered Email</label>
                <Input
                  type="email"
                  placeholder="admin@omnistay.com"
                  icon={<Mail className="w-4 h-4" />}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-[11px] text-rose-400">{errors.email.message}</p>
                )}
              </div>

              <Button type="submit" variant="glow" className="w-full mt-2" disabled={isForgotPasswordLoading}>
                {isForgotPasswordLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Sending Instructions...
                  </>
                ) : (
                  <>
                    Send Reset Link <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>

              <div className="text-center pt-2">
                <Link href="/login" className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

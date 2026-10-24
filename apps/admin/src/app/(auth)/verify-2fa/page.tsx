'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { verify2faSchema, Verify2faFormData } from '@/features/auth/schemas/login.schema';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Two-Factor Challenge</h1>
          <p className="text-xs text-slate-400">
            Enter the 6-digit verification code from your authenticator app
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-8 backdrop-blur-2xl shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Security Code</label>
              <Input
                type="text"
                placeholder="123456"
                maxLength={6}
                icon={<KeyRound className="w-4 h-4" />}
                className="text-center tracking-widest text-lg font-mono"
                {...register('code')}
              />
              {errors.code && <p className="text-[11px] text-rose-400">{errors.code.message}</p>}
            </div>

            <Button type="submit" variant="glow" className="w-full mt-2" disabled={isVerifying2fa}>
              {isVerifying2fa ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Verifying Code...
                </>
              ) : (
                <>
                  Verify & Continue <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

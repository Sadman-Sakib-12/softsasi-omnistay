'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { loginSchema, LoginFormData } from '../schemas/login.schema';
import { useAuth } from '../hooks/use-auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const DEMO_PRESETS = [
  { label: 'SuperAdmin', email: 'superadmin@omnistay.com', roleDesc: 'Full Root Access' },
  { label: 'General Manager', email: 'gm@grandresort.com', roleDesc: 'Property & Financial Control' },
  { label: 'Front Desk', email: 'frontdesk@grandresort.com', roleDesc: 'Tape Chart & Check-In' },
  { label: 'Accountant', email: 'finance@grandresort.com', roleDesc: 'Night Audit & Ledger' },
];

export function LoginForm() {
  const { login, isLoggingIn, loginError } = useAuth();
  const [showDemoPresets, setShowDemoPresets] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema) as any,
    defaultValues: {
      email: 'superadmin@omnistay.com',
      password: 'Password@123',
      rememberMe: true,
    },
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  const applyDemoPreset = (email: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', 'Password@123', { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {loginError && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{loginError.message || 'Authentication failed. Please verify your credentials.'}</span>
          </div>
        )}

        {/* Business Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">Work / Operator Email</label>
          <Input
            type="email"
            placeholder="admin@omnistay.com"
            icon={<Mail className="w-4 h-4" />}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-[11px] text-rose-400 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-300">Password</label>
            <Link
              href="/forgot-password"
              className="text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            type="password"
            placeholder="••••••••••••"
            icon={<Lock className="w-4 h-4" />}
            {...register('password')}
          />
          {errors.password && (
            <p className="text-[11px] text-rose-400 mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Remember me & Security */}
        <div className="flex items-center justify-between pt-1 text-xs text-slate-400">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              {...register('rememberMe')}
              className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/30"
            />
            <span>Remember this device</span>
          </label>
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 2FA Protected
          </span>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="glow"
          className="w-full mt-2 h-11 text-xs font-semibold tracking-wide"
          disabled={isLoggingIn}
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Authenticating Session...
            </>
          ) : (
            <>
              Sign In to PMS Console <ArrowRight className="w-4 h-4 ml-1.5" />
            </>
          )}
        </Button>

        {/* Link to Register */}
        <div className="text-center pt-2">
          <span className="text-xs text-slate-400">
            Need a new property workspace?{' '}
            <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4">
              Register Hotel Property
            </Link>
          </span>
        </div>
      </form>

      {/* Quick Demo Preset Selector for Evaluation */}
      <div className="pt-3 border-t border-slate-800/80">
        <button
          type="button"
          onClick={() => setShowDemoPresets(!showDemoPresets)}
          className="w-full flex items-center justify-between text-[11px] text-slate-500 hover:text-slate-300 transition-colors py-1"
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Demo Evaluation Accounts
          </span>
          <span className="text-[10px] text-slate-600 font-mono">
            {showDemoPresets ? 'Hide' : 'Quick Autofill'}
          </span>
        </button>

        {showDemoPresets && (
          <div className="grid grid-cols-2 gap-2 mt-2 pt-1 animate-in fade-in duration-200">
            {DEMO_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => applyDemoPreset(p.email)}
                className="text-left p-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/40 hover:bg-slate-800/80 transition-all"
              >
                <div className="text-xs font-semibold text-white">{p.label}</div>
                <div className="text-[10px] text-slate-400 truncate">{p.email}</div>
                <div className="text-[9px] text-emerald-400/80 mt-0.5">{p.roleDesc}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Loader2, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { loginSchema, LoginFormData } from '../schemas/login.schema';
import { useAuth } from '../hooks/use-auth';

export function LoginForm() {
  const { login, isLoggingIn, loginError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema) as any,
    defaultValues: {
      email: 'admin@unseengadget.com',
      password: 'Password@123',
      rememberMe: true,
    },
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <div className="w-full">
      {/* Top Shield Icon Badge */}
      <div className="w-14 h-14 rounded-2xl bg-[#00a8ff] text-white flex items-center justify-center mx-auto mb-5 shadow-md shadow-blue-500/20">
        <ShieldCheck className="w-7 h-7 text-white stroke-[2.2]" />
      </div>

      {/* Header */}
      <div className="text-center mb-7">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Portal</h1>
        <p className="text-xs text-slate-500 mt-1.5 font-normal">Enter your credentials to access</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {loginError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{loginError.message || 'Authentication failed. Please verify credentials.'}</span>
          </div>
        )}

        {/* Email Address */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              placeholder="admin@unseengadget.com"
              {...register('email')}
              className="w-full h-11 pl-10 pr-3.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#00a8ff] transition-all"
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-rose-500 mt-0.5">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Password
          </label>
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
          {errors.password && (
            <p className="text-[11px] text-rose-500 mt-0.5">{errors.password.message}</p>
          )}
        </div>

        {/* Forgot Password */}
        <div className="flex justify-end pt-0.5">
          <Link
            href="/forgot-password"
            className="text-xs text-[#00a8ff] font-semibold hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Sign In Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full h-11 bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-bold rounded-xl shadow-2xs transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
          >
            {isLoggingIn ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing In...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 pt-3">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-[#00a8ff] font-bold hover:underline ml-1">
            Create Account
          </Link>
        </p>
      </form>
    </div>
  );
}

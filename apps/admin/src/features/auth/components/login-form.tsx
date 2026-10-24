'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
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
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {loginError && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{loginError.message || 'Authentication failed. Please verify credentials.'}</span>
          </div>
        )}

        {/* Business Email */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Work / Operator Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              placeholder="admin@omnistay.com"
              {...register('email')}
              className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-200 rounded text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-rose-500">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] text-blue-600 hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              className="w-full h-9 pl-9 pr-8 text-xs bg-white border border-slate-200 rounded text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[11px] text-rose-500">{errors.password.message}</p>
          )}
        </div>

        {/* Remember me */}
        <div className="flex items-center justify-between text-xs pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
            <input
              type="checkbox"
              {...register('rememberMe')}
              className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
            />
            <span>Remember session on this device</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoggingIn}
          className="w-full h-10 px-4 text-xs font-bold text-white bg-[#00a8ff] hover:bg-[#0097e6] rounded transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Verifying Credentials...
            </>
          ) : (
            <>
              <span>Sign In to Admin</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Register link */}
        <div className="text-center pt-2 text-xs text-slate-500">
          Need a new hotel property workspace?{' '}
          <Link href="/register" className="text-blue-600 font-bold hover:underline">
            Register Property
          </Link>
        </div>
      </form>
    </div>
  );
}

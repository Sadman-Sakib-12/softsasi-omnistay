'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Building2,
  Mail,
  Lock,
  User,
  Phone,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { sessionManager } from '@/lib/auth/session';
import { useTenantStore } from '@/stores/tenant-store';
import { useUiStore } from '@/stores/ui-store';
import { Role } from '@/lib/auth/permissions';

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Full name is required'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().min(6, 'Valid phone number is required'),
    companyName: z.string().min(2, 'Hotel / Property name is required'),
    propertyType: z.string().default('hotel'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .regex(/[A-Z]/, 'Must contain at least 1 uppercase letter')
      .regex(/[0-9]/, 'Must contain at least 1 number'),
    confirmPassword: z.string(),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the Terms of Service',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const { setTenantId, tenants, setTenants } = useTenantStore();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema) as any,
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      companyName: '',
      propertyType: 'hotel',
      password: '',
      confirmPassword: '',
      agreeTerms: true,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const slug = data.companyName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const newTenantId = `tenant-${Date.now()}`;
      const newTenant = {
        id: newTenantId,
        name: data.companyName,
        subdomain: slug || 'myhotel',
        domain: `${slug || 'myhotel'}.omnistay.com`,
        planId: 'professional',
      };

      setTenants([...tenants, newTenant]);
      setTenantId(newTenantId);

      sessionManager.setToken('jwt-session-' + Date.now());
      sessionManager.setUser({
        id: `user-${Date.now()}`,
        email: data.email,
        name: data.fullName,
        role: Role.COMPANY_OWNER_GM,
        tenantId: newTenantId,
        permissions: ['*'],
      });

      useUiStore.getState().setActiveRole(Role.COMPANY_OWNER_GM);

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-6 space-y-4 animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200 shadow-sm">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Account Created!</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Welcome to SoftSasi OmniStay. Your administrator account and hotel workspace have been initialized successfully.
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-[#00a8ff] pt-2 font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-[#00a8ff]" /> Redirecting to Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Top Shield Icon Badge */}
      <div className="w-14 h-14 rounded-2xl bg-[#00a8ff] text-white flex items-center justify-center mx-auto mb-5 shadow-md shadow-blue-500/20">
        <ShieldCheck className="w-7 h-7 text-white stroke-[2.2]" />
      </div>

      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Account</h1>
        <p className="text-xs text-slate-500 mt-1.5 font-normal">Enter your details to create admin workspace</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="John Doe"
              {...register('fullName')}
              className="w-full h-11 pl-10 pr-3.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#00a8ff] transition-all"
            />
          </div>
          {errors.fullName && (
            <p className="text-[11px] text-rose-500 mt-0.5">{errors.fullName.message}</p>
          )}
        </div>

        {/* Work Email */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              placeholder="admin@hotel.com"
              {...register('email')}
              className="w-full h-11 pl-10 pr-3.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#00a8ff] transition-all"
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-rose-500 mt-0.5">{errors.email.message}</p>
          )}
        </div>

        {/* Phone Number */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Phone Number <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="+880 1700 000000"
              {...register('phone')}
              className="w-full h-11 pl-10 pr-3.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#00a8ff] transition-all"
            />
          </div>
          {errors.phone && (
            <p className="text-[11px] text-rose-500 mt-0.5">{errors.phone.message}</p>
          )}
        </div>

        {/* Property Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Property Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Grand Palace Hotel"
              {...register('companyName')}
              className="w-full h-11 pl-10 pr-3.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#00a8ff] transition-all"
            />
          </div>
          {errors.companyName && (
            <p className="text-[11px] text-rose-500 mt-0.5">{errors.companyName.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Password <span className="text-rose-500">*</span>
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

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Confirm Password <span className="text-rose-500">*</span>
          </label>
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

        {/* Terms Checkbox */}
        <div className="pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              {...register('agreeTerms')}
              className="rounded border-slate-300 text-[#00a8ff] focus:ring-0 cursor-pointer"
            />
            <span className="text-xs text-slate-600">
              I agree to the{' '}
              <span className="text-[#00a8ff] font-semibold hover:underline">
                Terms of Service
              </span>{' '}
              and{' '}
              <span className="text-[#00a8ff] font-semibold hover:underline">
                Privacy Policy
              </span>
            </span>
          </label>
          {errors.agreeTerms && (
            <p className="text-[11px] text-rose-500 mt-1">{errors.agreeTerms.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-[#00a8ff] hover:bg-[#0097e6] text-white text-xs font-bold rounded-xl shadow-2xs transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </div>

        {/* Sign In Link */}
        <p className="text-center text-xs text-slate-500 pt-3">
          Already have an account?{' '}
          <Link href="/login" className="text-[#00a8ff] font-bold hover:underline ml-1">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}

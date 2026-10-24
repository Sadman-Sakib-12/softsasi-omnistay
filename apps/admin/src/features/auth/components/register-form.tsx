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
  Hotel,
  ArrowRight,
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
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8 space-y-4 animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Hotel Property Registered!</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Welcome to SoftSasi OmniStay. Your General Manager master account and property workspace have been created successfully.
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-blue-600 pt-2 font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> Redirecting to Master PMS Dashboard...
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Full Name & Business Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="e.g. John Doe"
              {...register('fullName')}
              className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-200 rounded text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          {errors.fullName && (
            <p className="text-[11px] text-rose-500">{errors.fullName.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Work Email <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              placeholder="admin@hotel.com"
              {...register('email')}
              className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-200 rounded text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-rose-500">{errors.email.message}</p>
          )}
        </div>
      </div>

      {/* Phone Number & Hotel Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Phone Number <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="+880 1700 000000"
              {...register('phone')}
              className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-200 rounded text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          {errors.phone && (
            <p className="text-[11px] text-rose-500">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Hotel / Property Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Hotel className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="e.g. Hotel Stanford"
              {...register('companyName')}
              className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-200 rounded text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          {errors.companyName && (
            <p className="text-[11px] text-rose-500">{errors.companyName.message}</p>
          )}
        </div>
      </div>

      {/* Property Classification */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-slate-700">
          Property Type
        </label>
        <select
          {...register('propertyType')}
          className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-blue-500"
        >
          <option value="hotel">Commercial Hotel</option>
          <option value="resort">Luxury Beach Resort & Spa</option>
          <option value="boutique">Boutique Hotel & Suites</option>
          <option value="villa">Private Villa Collection</option>
          <option value="apartments">Serviced Apartments</option>
        </select>
      </div>

      {/* Password & Confirm Password */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Password <span className="text-rose-500">*</span>
          </label>
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
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[11px] text-rose-500">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Confirm Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('confirmPassword')}
              className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-200 rounded text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-[11px] text-rose-500">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      {/* Terms Checkbox */}
      <div className="pt-1">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            {...register('agreeTerms')}
            className="rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
          />
          <span className="text-xs text-slate-600">
            I agree to the{' '}
            <span className="text-blue-600 font-semibold hover:underline">
              Terms of Service
            </span>{' '}
            and{' '}
            <span className="text-blue-600 font-semibold hover:underline">
              Privacy Policy
            </span>
          </span>
        </label>
        {errors.agreeTerms && (
          <p className="text-[11px] text-rose-500 mt-1">{errors.agreeTerms.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-10 px-4 text-xs font-bold text-white bg-[#00a8ff] hover:bg-[#0097e6] rounded transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Provisioning Hotel Workspace...
          </>
        ) : (
          <>
            <span>Register Hotel Property</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Sign In Link */}
      <div className="text-center pt-2 text-xs text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 font-bold hover:underline">
          Sign In here
        </Link>
      </div>
    </form>
  );
}

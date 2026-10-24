'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Building2,
  Mail,
  Lock,
  User,
  Phone,
  Globe,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Hotel,
  Zap,
  Crown,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerSchema, RegisterFormData, SaaSPlan } from '../schemas/register.schema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { sessionManager } from '@/lib/auth/session';
import { useTenantStore } from '@/stores/tenant-store';
import { useUiStore } from '@/stores/ui-store';
import { Role } from '@/lib/auth/permissions';

const SAAS_PLANS = [
  {
    id: SaaSPlan.STARTER,
    name: 'Starter Boutique',
    subtitle: 'Independent B&Bs & Boutique Villas (up to 15 rooms)',
    monthlyPrice: 49,
    annualPrice: 490,
    icon: Hotel,
    features: [
      '1 Property Location',
      'Up to 15 Rooms Inventory',
      '1 POS Dining Terminal',
      'Basic PMS & Booking Engine',
      'Email Support SLA',
    ],
  },
  {
    id: SaaSPlan.PROFESSIONAL,
    name: 'Professional Resort',
    subtitle: 'Mid-size resorts & commercial hotels (up to 75 rooms)',
    monthlyPrice: 149,
    annualPrice: 1490,
    popular: true,
    icon: Zap,
    features: [
      'Up to 3 Properties',
      '75 Rooms & Multi-Bed Matrix',
      '5 POS Outlets & Table Maps',
      'Full Double-Entry Accounting',
      'HRM & Biometric Attendance',
      'WhatsApp Business API',
    ],
  },
  {
    id: SaaSPlan.ENTERPRISE,
    name: 'Enterprise Chain',
    subtitle: 'Hotel chains & multi-location operators (Unlimited)',
    monthlyPrice: 399,
    annualPrice: 3990,
    icon: Crown,
    features: [
      'Unlimited Properties & Rooms',
      'White-Labeling & Custom Domain',
      'Autonomous AI Concierge RAG',
      'Multi-Vendor Host Marketplace',
      'Dedicated Account Manager & SLA',
    ],
  },
];

const PROPERTY_TYPES = [
  { value: 'boutique', label: 'Boutique Hotel' },
  { value: 'resort', label: 'Luxury Beach Resort' },
  { value: 'city_hotel', label: 'City Business Hotel' },
  { value: 'chalet', label: 'Mountain Chalet / Eco-Lodge' },
  { value: 'villa', label: 'Vacation Villas & Serviced Apts' },
];

export function RegisterForm() {
  const router = useRouter();
  const { setTenantId, tenants, setTenants } = useTenantStore();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema) as any,
    defaultValues: {
      plan: 'professional',
      billingCycle: 'monthly',
      propertyType: 'resort',
      companyName: '',
      subdomain: '',
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    },
  });

  const selectedPlan = watch('plan');
  const billingCycle = watch('billingCycle');
  const companyName = watch('companyName');
  const subdomain = watch('subdomain');

  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue('companyName', val, { shouldValidate: true });
    const slug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setValue('subdomain', slug, { shouldValidate: true });
  };

  const handleNextStep = async () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      const valid = await trigger(['companyName', 'subdomain', 'propertyType']);
      if (valid) setStep(3);
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const newTenantId = `tenant-${Date.now()}`;
      const newTenant = {
        id: newTenantId,
        name: data.companyName,
        subdomain: data.subdomain,
        domain: `${data.subdomain}.omnistay.com`,
        planId: data.plan,
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
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-white">Hotel Workspace Provisioned!</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Welcome to OmniStay 360. Your isolated tenant partition and General Manager master account are ready.
        </p>
        <div className="pt-2">
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 font-mono text-xs">
            https://{subdomain || 'grandresort'}.omnistay.com
          </Badge>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-2">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> Redirecting to Master PMS...
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Step Indicators */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        {[
          { num: 1, title: 'Subscription Plan' },
          { num: 2, title: 'Hotel Profile' },
          { num: 3, title: 'Admin Account' },
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step === s.num
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                  : step > s.num
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {step > s.num ? '✓' : s.num}
            </div>
            <span
              className={`text-xs hidden sm:inline font-medium ${
                step === s.num ? 'text-white' : 'text-slate-500'
              }`}
            >
              {s.title}
            </span>
          </div>
        ))}
      </div>

      {/* ================= STEP 1: SAAS PLAN SELECTION ================= */}
      {step === 1 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Select SaaS Subscription Tier</h3>
              <p className="text-xs text-slate-400">Choose a scale matching your hospitality portfolio (PDF Chapter 19.2)</p>
            </div>
            {/* Billing Cycle Toggle */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setValue('billingCycle', 'monthly')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-slate-800 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setValue('billingCycle', 'annual')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  billingCycle === 'annual'
                    ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Annual <span className="text-[10px] bg-slate-900/60 px-1 rounded text-white">-20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 pt-1">
            {SAAS_PLANS.map((plan) => {
              const Icon = plan.icon;
              const isSelected = selectedPlan === plan.id;
              const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
              const unit = billingCycle === 'annual' ? '/year' : '/month';

              return (
                <div
                  key={plan.id}
                  onClick={() => setValue('plan', plan.id as any, { shouldValidate: true })}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-950/20 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/50'
                      : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                >
                  {plan.popular && (
                    <Badge variant="success" className="absolute top-3 right-3 text-[10px] py-0 px-2 bg-emerald-500 text-slate-950 font-bold">
                      Recommended
                    </Badge>
                  )}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          {plan.name}
                        </div>
                        <div className="text-[11px] text-slate-400">{plan.subtitle}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-white">${price}</span>
                      <span className="text-[10px] text-slate-400">{unit}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-300">
                    {plan.features.map((feat) => (
                      <div key={feat} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <Button
            type="button"
            variant="glow"
            onClick={handleNextStep}
            className="w-full mt-4 h-11 text-xs font-semibold"
          >
            Configure Hotel Profile <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      )}

      {/* ================= STEP 2: PROPERTY & WORKSPACE ================= */}
      {step === 2 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div>
            <h3 className="text-sm font-semibold text-white">Hotel Property & Subdomain</h3>
            <p className="text-xs text-slate-400">Establish your isolated cloud tenant and domain identifier</p>
          </div>

          {/* Hotel Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Hotel / Resort Legal Brand Name</label>
            <Input
              placeholder="e.g., Grand Horizon Palace & Resort"
              icon={<Building2 className="w-4 h-4" />}
              value={companyName}
              onChange={handleCompanyNameChange}
            />
            {errors.companyName && (
              <p className="text-[11px] text-rose-400 mt-1">{errors.companyName.message}</p>
            )}
          </div>

          {/* Property Classification */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Property Classification (Chapter 4.1.1)</label>
            <select
              {...register('propertyType')}
              className="w-full h-10 rounded-xl border border-slate-700/80 bg-slate-900/60 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/80"
            >
              {PROPERTY_TYPES.map((pt) => (
                <option key={pt.value} value={pt.value} className="bg-slate-900 text-white">
                  {pt.label}
                </option>
              ))}
            </select>
            {errors.propertyType && (
              <p className="text-[11px] text-rose-400 mt-1">{errors.propertyType.message}</p>
            )}
          </div>

          {/* Subdomain Slug */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Dedicated Tenant Subdomain (Chapter 19.1)</label>
            <div className="relative">
              <Input
                placeholder="grand-horizon"
                icon={<Globe className="w-4 h-4" />}
                {...register('subdomain')}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
              <span>Live Portal URL:</span>
              <span className="font-mono text-emerald-400">
                https://{subdomain || 'your-hotel'}.omnistay.com
              </span>
            </div>
            {errors.subdomain && (
              <p className="text-[11px] text-rose-400 mt-1">{errors.subdomain.message}</p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              className="w-1/3 h-11 text-xs"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button
              type="button"
              variant="glow"
              onClick={handleNextStep}
              className="w-2/3 h-11 text-xs font-semibold"
            >
              Create Master Account <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* ================= STEP 3: MASTER ADMIN ACCOUNT ================= */}
      {step === 3 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div>
            <h3 className="text-sm font-semibold text-white">General Manager / Admin Credentials</h3>
            <p className="text-xs text-slate-400">
              Primary tenant administrator account with root property privileges
            </p>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Full Legal Name</label>
            <Input
              placeholder="Sadman Sakib"
              icon={<User className="w-4 h-4" />}
              {...register('fullName')}
            />
            {errors.fullName && (
              <p className="text-[11px] text-rose-400 mt-1">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Work Email</label>
              <Input
                type="email"
                placeholder="gm@grandresort.com"
                icon={<Mail className="w-4 h-4" />}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-[11px] text-rose-400 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Phone Hotline</label>
              <Input
                placeholder="+880 1700 000000"
                icon={<Phone className="w-4 h-4" />}
                {...register('phone')}
              />
              {errors.phone && (
                <p className="text-[11px] text-rose-400 mt-1">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Password & Confirm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Master Password</label>
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

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Confirm Password</label>
              <Input
                type="password"
                placeholder="••••••••••••"
                icon={<Lock className="w-4 h-4" />}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-[11px] text-rose-400 mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          {/* Agree Terms */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-400">
              <input
                type="checkbox"
                {...register('agreeTerms')}
                className="mt-0.5 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/30"
              />
              <span>
                I agree to the 14-Day Free Trial terms, SLA Policy, and Enterprise Master Services Agreement. No credit card charged today.
              </span>
            </label>
            {errors.agreeTerms && (
              <p className="text-[11px] text-rose-400 mt-1">{errors.agreeTerms.message}</p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(2)}
              className="w-1/3 h-11 text-xs"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button
              type="submit"
              variant="glow"
              disabled={isLoading}
              className="w-2/3 h-11 text-xs font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Provisioning Cloud PMS...
                </>
              ) : (
                <>
                  Complete Registration <ArrowRight className="w-4 h-4 ml-1.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Link to Login */}
      <div className="text-center pt-2 border-t border-slate-800/80">
        <span className="text-xs text-slate-400">
          Already have an enterprise hotel workspace?{' '}
          <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-4">
            Sign In to PMS
          </Link>
        </span>
      </div>
    </form>
  );
}

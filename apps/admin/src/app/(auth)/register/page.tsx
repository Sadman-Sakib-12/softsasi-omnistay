import React from 'react';
import { RegisterForm } from '@/features/auth/components/register-form';
import { Hotel, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#f8fafc] py-12">
      <div className="w-full max-w-xl space-y-6">
        {/* SoftSasi Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#00a8ff] text-white shadow-md shadow-blue-500/20 mb-1">
            <Hotel className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Register Your Hotel Property
          </h1>
          <p className="text-xs text-slate-500">
            Create an enterprise hotel workspace on SoftSasi OmniStay 360
          </p>
        </div>

        {/* Clean White Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-8 shadow-sm">
          <RegisterForm />
        </div>

        {/* Security badge footer */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Multi-Tenant Schema Isolation • Role-Based Access Control • TLS 1.3</span>
        </div>
      </div>
    </div>
  );
}

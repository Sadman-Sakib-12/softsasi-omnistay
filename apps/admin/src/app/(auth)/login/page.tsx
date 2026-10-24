import React from 'react';
import { LoginForm } from '@/features/auth/components/login-form';
import { ShieldCheck, Hotel } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-xl shadow-emerald-500/20 mb-2">
            <Hotel className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            OmniStay 360 Admin
          </h1>
          <p className="text-xs text-slate-400">
            Enterprise Cloud PMS & Multi-Tenant Hospitality ERP
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-8 backdrop-blur-2xl shadow-2xl shadow-black/40">
          <LoginForm />
        </div>

        {/* Security badge footer */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Secured with JWT, Role-Based Access Control & TLS 1.3</span>
        </div>
      </div>
    </div>
  );
}

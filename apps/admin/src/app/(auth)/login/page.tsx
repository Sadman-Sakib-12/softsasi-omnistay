import React from 'react';
import { LoginForm } from '@/features/auth/components/login-form';

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#f8fafc]">
      <div className="w-full max-w-[460px] rounded-[32px] border border-slate-200 bg-white p-8 sm:p-10 shadow-sm animate-in fade-in zoom-in-95 duration-200">
        <LoginForm />
      </div>
    </div>
  );
}


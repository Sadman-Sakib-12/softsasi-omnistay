import React from 'react';
import { RegisterForm } from '@/features/auth/components/register-form';

export default function RegisterPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#f8fafc] py-10">
      <div className="w-full max-w-[580px] rounded-[32px] border border-slate-200 bg-white p-8 sm:p-12 shadow-sm animate-in fade-in zoom-in-95 duration-200">
        <RegisterForm />
      </div>
    </div>
  );
}



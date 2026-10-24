'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminShell } from '@/components/layout/admin-shell';
import { sessionManager } from '@/lib/auth/session';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-screen w-screen bg-[#f8fafc] flex items-center justify-center text-slate-500 text-xs font-medium">
        Loading OmniStay Admin Shell...
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}

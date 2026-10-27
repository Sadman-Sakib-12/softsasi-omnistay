'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ShieldAlert, ArrowLeft, RefreshCw } from 'lucide-react';
import { AdminShell } from '@/components/layout/admin-shell';
import { useUiStore } from '@/stores/ui-store';
import { isRouteAllowedForRole, ROLE_LABELS, Role } from '@/lib/auth/permissions';
import { sessionManager } from '@/lib/auth/session';
import { useQuery } from '@tanstack/react-query';
import { contentService } from '@/features/content/services/content.service';

import { applyThemeStyles } from './themes/page';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { activeRole } = useUiStore();
  const [mounted, setMounted] = useState(false);

  const { data: themeConfig } = useQuery({
    queryKey: ['systemTheme'],
    queryFn: () => contentService.getThemeConfig(),
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!sessionManager.isAuthenticated()) {
      router.push('/login');
      return;
    }
    const sessionUser = sessionManager.getUser();
    if (sessionUser?.role && sessionUser.role !== activeRole) {
      useUiStore.getState().setActiveRole(sessionUser.role as Role);
    }
  }, [mounted, router, activeRole]);

  useEffect(() => {
    if (themeConfig?.activeThemeId) {
      applyThemeStyles(themeConfig.activeThemeId);
    }
  }, [themeConfig]);

  if (!mounted) {
    return (
      <div className="h-screen w-screen bg-[#f8fafc] flex items-center justify-center text-slate-500 text-xs font-medium">
        Loading OmniStay Admin Shell...
      </div>
    );
  }

  const isAllowed = isRouteAllowedForRole(activeRole, pathname);

  return (
    <AdminShell>
      {!isAllowed ? (
        <div className="p-8 max-w-xl mx-auto my-16 bg-white border border-amber-200 rounded-xl shadow-xs text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 flex items-center justify-center text-amber-500 mb-4 border border-amber-100">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Module Access Restricted (RBAC)
          </h2>
          <p className="text-xs text-slate-600 mb-6 leading-relaxed max-w-md mx-auto">
            Your assigned role{' '}
            <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
              {ROLE_LABELS[activeRole] || activeRole}
            </span>{' '}
            does not have permission to view this module (
            <code className="text-amber-600 font-mono text-xs">{pathname}</code>
            ). Please contact your administrator or return to your allowed dashboard.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#00a8ff] hover:bg-[#0097e6] text-white rounded text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Allowed Dashboard
            </button>
          </div>
        </div>
      ) : (
        children
      )}
    </AdminShell>
  );
}


'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  LogOut,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { useUiStore } from '@/stores/ui-store';
import { useTenantStore } from '@/stores/tenant-store';
import { sessionManager, UserSession } from '@/lib/auth/session';
import { Role, ROLE_LABELS, normalizeRole } from '@/lib/auth/permissions';
import { organizationsService } from '@/features/organizations/services/organizations.service';
import { api } from '@/lib/api/client';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export function AdminHeader() {
  const router = useRouter();
  const { activeRole, setActiveRole } = useUiStore();
  const { currentTenantId, tenants, setTenantId, setTenants } = useTenantStore();
  const [user, setUser] = useState<UserSession | null>(() => {
    if (typeof window !== 'undefined') {
      return sessionManager.getUser();
    }
    return null;
  });

  useEffect(() => {
    const sessionUser = sessionManager.getUser();
    if (sessionUser) {
      setUser(sessionUser);
      if (sessionUser.role && sessionUser.role !== activeRole) {
        setActiveRole(sessionUser.role as Role);
      }
    }

    // Load real tenant organizations from backend API
    organizationsService.getAll().then((orgs) => {
      if (orgs.length > 0) {
        setTenants(orgs);

        // Auto-detect tenant partition from URL subdomain (e.g. sazzad.localhost or sazzad.omnistay.com)
        if (typeof window !== 'undefined') {
          const hostname = window.location.hostname.toLowerCase();
          const parts = hostname.split('.');
          if (parts.length >= 2 && parts[0] !== 'localhost' && parts[0] !== 'www' && parts[0] !== '127') {
            const subdomain = parts[0];
            const matched = orgs.find((o) => o.slug === subdomain || o.subdomain === subdomain);
            if (matched) {
              setTenantId(matched.id);
              return;
            }
          }
        }

        // If currentTenantId is not among orgs, sync to user tenant or first org
        const isValid = orgs.some((o) => o.id === currentTenantId);
        if (!isValid) {
          const fallbackId = (sessionUser?.tenantId && orgs.some((o) => o.id === sessionUser.tenantId))
            ? sessionUser.tenantId
            : orgs[0].id;
          setTenantId(fallbackId);
        }
      }
    });
  }, [currentTenantId, setTenantId, setTenants, activeRole, setActiveRole]);

  const activeTenant =
    tenants.find((t) => t.id === currentTenantId) ||
    (user?.tenantId ? tenants.find((t) => t.id === user.tenantId) : null) ||
    (user?.organizationName
      ? { id: user.tenantId, name: user.organizationName, slug: user.organizationSlug }
      : null) ||
    tenants[0];

  const tenantDisplayName =
    activeTenant?.name ||
    user?.organizationName ||
    'My Hotel';

  const handleLogout = async () => {
    try {
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('omnistay_refresh_token') : null;
      if (refreshToken) {
        await api.post('/api/v1/auth/logout', { refreshToken });
      }
    } catch {
      // Ignore network errors during logout
    } finally {
      sessionManager.clear();
      router.push('/login');
    }
  };

  return (
    <header className="h-14 border-b border-slate-200 bg-white px-5 flex items-center justify-between z-20 shadow-xs">
      {/* Left: Current Hotel / Property Partition */}
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all text-xs text-slate-800 font-medium cursor-pointer">
              <Building2 className="w-3.5 h-3.5 text-[#00a8ff]" />
              <span className="truncate max-w-[140px] sm:max-w-[200px]">
                {tenantDisplayName}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64 bg-white border border-slate-200 shadow-md">
            <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Hotel Properties
            </div>
            {tenants.map((t, idx) => (
              <DropdownMenuItem
                key={t.id || t.subdomain || `header-tenant-${idx}`}
                onClick={() => setTenantId(t.id)}
                className="flex items-center justify-between text-xs py-2 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <span>{t.name}</span>
                {t.id === currentTenantId && (
                  <Check className="w-3.5 h-3.5 text-[#00a8ff]" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right: Notifications & Interactive Role Switcher */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00a8ff]" />
        </button>

        {/* User Profile Pill with Interactive Role Switcher Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 pl-2 py-1 pr-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer">
              <div className="w-7 h-7 rounded bg-[#00a8ff] flex items-center justify-center text-white font-bold text-xs shadow-2xs">
                {user?.name ? user.name[0].toUpperCase() : 'S'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 leading-tight">
                  {user?.name || 'Administrator'}
                </span>
                <span className="text-[10px] text-[#00a8ff] font-semibold leading-tight">
                  {ROLE_LABELS[normalizeRole(user?.role || activeRole)] || 'Company Owner / General Manager'}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-80 bg-white border border-slate-200 shadow-xl rounded-2xl p-2 z-50">
            {/* User Profile Header Card */}
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl mb-1.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00a8ff] flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                  {user?.name ? user.name[0].toUpperCase() : 'A'}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {user?.name || 'Administrator'}
                  </span>
                  <span className="text-[11px] text-slate-500 truncate">
                    {user?.email || 'admin@omnistay.com'}
                  </span>
                </div>
              </div>

              {/* Active Role & Property Badges (Read-Only) */}
              <div className="mt-2.5 pt-2 border-t border-slate-200/70 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00a8ff] shrink-0" />
                  <span className="truncate">{ROLE_LABELS[normalizeRole(user?.role || activeRole)] || 'Company Owner / General Manager'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{tenantDisplayName}</span>
                </div>
              </div>
            </div>

            {/* Account Quick Links */}
            <div className="space-y-0.5">
              <DropdownMenuItem
                onClick={() => router.push('/settings')}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-700 hover:bg-slate-50 cursor-pointer font-medium"
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Account & System Settings</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => router.push('/organizations')}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-700 hover:bg-slate-50 cursor-pointer font-medium"
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span>Organization & Properties</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => router.push('/audit-logs')}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-700 hover:bg-slate-50 cursor-pointer font-medium"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  <span>Security & Audit Logs</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              </DropdownMenuItem>
            </div>

            {/* Logout Action */}
            <DropdownMenuSeparator className="my-1 bg-slate-100" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-rose-600 hover:bg-rose-50 cursor-pointer font-semibold transition-colors"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import {
  Bell,
  Building2,
  Check,
  ChevronDown,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { useUiStore } from '@/stores/ui-store';
import { useTenantStore } from '@/stores/tenant-store';
import { sessionManager, UserSession } from '@/lib/auth/session';
import { ROLE_LABELS } from '@/lib/auth/permissions';
import { organizationsService } from '@/features/organizations/services/organizations.service';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

export function AdminHeader() {
  const { activeRole } = useUiStore();
  const { currentTenantId, tenants, setTenantId, setTenants } = useTenantStore();
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    setUser(sessionManager.getUser());
    // Load real tenant organizations from backend API
    organizationsService.getAll().then((orgs) => {
      if (orgs.length > 0) {
        setTenants(orgs);
        if (!currentTenantId) {
          setTenantId(orgs[0].id);
        }
      }
    });
  }, [currentTenantId, setTenantId, setTenants]);

  const activeTenant = tenants.find((t) => t.id === currentTenantId) || tenants[0];

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between z-20 shadow-xs">
      {/* Left: Current Hotel / Property Partition */}
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all text-xs text-slate-800 font-medium cursor-pointer">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span className="truncate max-w-[140px] sm:max-w-[200px]">
                {activeTenant?.name || 'Grand Palace Hotel'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64 bg-white border border-slate-200 shadow-md">
            <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Hotel Properties
            </div>
            {tenants.map((t) => (
              <DropdownMenuItem
                key={t.id}
                onClick={() => setTenantId(t.id)}
                className="flex items-center justify-between text-xs py-2 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <span>{t.name}</span>
                {t.id === currentTenantId && (
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right: Notifications & User Profile */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
        </button>

        {/* User Profile Pill */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
            {user?.name ? user.name[0].toUpperCase() : 'S'}
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-900">
              {user?.name || 'Super Admin'}
            </span>
            <span className="text-[10px] text-blue-600 font-semibold">
              {ROLE_LABELS[activeRole] || 'Platform SuperAdmin'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

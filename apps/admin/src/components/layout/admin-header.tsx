'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Bell,
  Building2,
  Check,
  ChevronDown,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import { useUiStore } from '@/stores/ui-store';
import { useTenantStore } from '@/stores/tenant-store';
import { sessionManager, UserSession } from '@/lib/auth/session';
import { Role, ROLE_LABELS, isRouteAllowedForRole } from '@/lib/auth/permissions';
import { organizationsService } from '@/features/organizations/services/organizations.service';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { activeRole, setActiveRole } = useUiStore();
  const { currentTenantId, tenants, setTenantId, setTenants } = useTenantStore();
  const [user, setUser] = useState<UserSession | null>(null);

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
        if (!currentTenantId) {
          setTenantId(orgs[0].id);
        }
      }
    });
  }, [currentTenantId, setTenantId, setTenants, activeRole, setActiveRole]);

  const activeTenant = tenants.find((t) => t.id === currentTenantId) || tenants[0];

  const handleRoleChange = (newRole: Role) => {
    setActiveRole(newRole);
    if (user) {
      const updatedUser = { ...user, role: newRole };
      sessionManager.setUser(updatedUser);
      setUser(updatedUser);
    }
    // If the new role does not have permission for the current path, redirect to dashboard
    if (!isRouteAllowedForRole(newRole, pathname)) {
      router.push('/dashboard');
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
                  {ROLE_LABELS[activeRole] || 'Platform SuperAdmin'}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-72 bg-white border border-slate-200 shadow-lg p-1.5">
            <div className="px-3 py-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Current Role (RBAC Simulation)
              </p>
              <p className="text-xs font-semibold text-slate-800 mt-0.5">
                Switch role to test dynamic menu & page permissions:
              </p>
            </div>
            <DropdownMenuSeparator className="my-1 bg-slate-100" />

            <div className="max-h-72 overflow-y-auto space-y-0.5">
              {Object.entries(Role).map(([key, val]) => {
                const isSelected = activeRole === val;
                return (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => handleRoleChange(val)}
                    className={`flex items-center justify-between px-3 py-2 rounded text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50 text-[#00a8ff] font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span>{ROLE_LABELS[val]}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{val}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#00a8ff]" />}
                  </DropdownMenuItem>
                );
              })}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

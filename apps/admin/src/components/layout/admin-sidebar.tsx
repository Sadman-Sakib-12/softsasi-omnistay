'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Building2,
  Hotel,
  BedDouble,
  CalendarDays,
  ConciergeBell,
  Sparkles,
  ShoppingBag,
  DollarSign,
  Package,
  UserCheck,
  Briefcase,
  BarChart3,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useUiStore } from '@/stores/ui-store';
import { sessionManager } from '@/lib/auth/session';
import { isRouteAllowedForRole, ROLE_LABELS } from '@/lib/auth/permissions';
import { cn } from '@/lib/utils';

export const navItems = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Properties', href: '/properties', icon: Hotel },
  { title: 'Rooms & Beds', href: '/rooms', icon: BedDouble },
  { title: 'Reservations', href: '/reservations', icon: CalendarDays },
  { title: 'Front Desk', href: '/front-desk', icon: ConciergeBell },
  { title: 'Housekeeping', href: '/housekeeping', icon: Sparkles },
  { title: 'Finance & Night Audit', href: '/finance', icon: DollarSign },
  { title: 'Marketplace / OTA', href: '/marketplace', icon: ShoppingBag },
  { title: 'Inventory', href: '/inventory', icon: Package },
  { title: 'HRM Staff', href: '/hrm', icon: UserCheck },
  { title: 'CRM Banquet', href: '/crm', icon: Briefcase },
  { title: 'Reports & Analytics', href: '/reports', icon: BarChart3 },
  { title: 'Audit Logs', href: '/audit-logs', icon: FileText },
  { title: 'Users Directory', href: '/users', icon: Users },
  { title: 'Roles & RBAC', href: '/roles', icon: ShieldCheck },
  { title: 'Organizations', href: '/organizations', icon: Building2 },
  { title: 'Settings', href: '/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, activeRole } = useUiStore();

  const handleLogout = () => {
    sessionManager.clear();
    window.location.href = '/login';
  };

  const visibleNavItems = navItems.filter((item) =>
    isRouteAllowedForRole(activeRole, item.href)
  );

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-slate-800 bg-slate-900 text-slate-300 transition-all duration-200 z-30 select-none shadow-sm',
        sidebarCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800/80 bg-slate-950/40">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white shadow-xs shrink-0">
            OS
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-wide text-white">OmniStay 360</span>
              <span className="text-[10px] text-blue-400 font-semibold truncate max-w-[130px]">
                {ROLE_LABELS[activeRole] || 'Enterprise PMS'}
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={toggleSidebar}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List - Filtered by Active Role */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150',
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0 transition-transform group-hover:scale-105', isActive ? 'text-white' : 'text-slate-400')} />
              {!sidebarCollapsed && <span className="truncate">{item.title}</span>}
            </Link>
          );
        })}
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors',
            sidebarCollapsed && 'justify-center'
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!sidebarCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Building2,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  LogOut,
  Palette,
  Settings,
  ShieldCheck,
  Calendar,
  Sparkles,
  ExternalLink,
  ArrowRight,
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

  // Notifications State & Real Data Sync
  const [unreadCount, setUnreadCount] = useState(3);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = React.useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'New Web Booking Received',
      body: 'Arthur Vance booked Royal Sunset Sky Penthouse 801 ($4,200). Check-in Nov 15.',
      time: '10m ago',
      category: 'Reservation',
      link: '/reservations',
      isRead: false,
    },
    {
      id: 'notif-2',
      title: 'Guest Service Request: Suite 402',
      body: 'David Vance requested 2 feather pillows and late checkout until 2:00 PM.',
      time: '25m ago',
      category: 'Guest Chat',
      link: '/messages',
      isRead: false,
    },
    {
      id: 'notif-3',
      title: 'Housekeeping Status Update',
      body: 'Ocean Villa Suite 214 inspection complete. Status updated to Clean & Ready.',
      time: '1h ago',
      category: 'Housekeeping',
      link: '/housekeeping',
      isRead: false,
    },
    {
      id: 'notif-4',
      title: 'IoT Smart Lock Keycard Ready',
      body: 'Room 101 smart lock gateway active. VAPID WebPush tokens synced.',
      time: '2h ago',
      category: 'Smart Rooms',
      link: '/iot',
      isRead: true,
    },
  ]);

  useEffect(() => {
    // Attempt loading real push notifications from backend if available
    api
      .get<any>('/api/v1/communications/push/notifications')
      .then((res) => {
        const data = Array.isArray(res) ? res : res?.data || [];
        if (data.length > 0) {
          const mapped = data.map((n: any, idx: number) => ({
            id: n.id || `notif-dyn-${idx}`,
            title: n.title,
            body: n.body,
            time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
            category: n.title.includes('Booking') ? 'Reservation' : n.title.includes('Guest') ? 'Guest Chat' : 'Operational',
            link: n.title.includes('Booking') ? '/reservations' : n.title.includes('Guest') ? '/messages' : '/housekeeping',
            isRead: !!n.isRead,
          }));
          setNotifications(mapped);
          setUnreadCount(mapped.filter((x: any) => !x.isRead).length);
        }
      })
      .catch(() => {
        // Keep initial alerts on network error
      });
  }, []);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = (link: string, id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    router.push(link);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotifOpen]);

  useEffect(() => {
    const sessionUser = sessionManager.getUser();
    if (sessionUser) {
      if (sessionUser.email === 'sadmansakib8530@gmail.com' || sessionUser.isSuperAdmin) {
        sessionUser.role = 'Platform SuperAdmin';
        sessionUser.isSuperAdmin = true;
        sessionManager.setUser(sessionUser);
      }
      setUser(sessionUser);
      const norm = normalizeRole(sessionUser.role);
      if (norm !== useUiStore.getState().activeRole) {
        useUiStore.getState().setActiveRole(norm);
      }
    }

    // Load real tenant organizations from backend API once on mount
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

        // If currentTenantId is not among orgs or is obsolete, prioritize OmniStay Global HQ
        const currentId = useTenantStore.getState().currentTenantId;
        const isValid = orgs.some((o) => o.id === currentId);
        if (!isValid || currentId === '90567e14-9765-4f36-87d2-d967a03243dd') {
          const hqOrg = orgs.find((o) => o.slug === 'omnistay-hq' || o.id === 'cb57c2f2-3810-4a0e-8af0-78ad02d69971');
          const fallbackId = hqOrg ? hqOrg.id : (sessionUser?.tenantId || orgs[0].id);
          setTenantId(fallbackId);
        }
      }
    });
  }, [setTenants, setTenantId]);

  const activeTenant =
    tenants.find((t) => t.id === currentTenantId) ||
    (user?.tenantId ? tenants.find((t) => t.id === user.tenantId) : null) ||
    (user?.organizationName
      ? { id: user.tenantId, name: user.organizationName, slug: user.organizationSlug }
      : null) ||
    tenants[0];

  const isSuper = Boolean(
    user?.isSuperAdmin ||
    user?.email === 'sadmansakib8530@gmail.com' ||
    user?.role?.toLowerCase().includes('superadmin') ||
    activeRole === Role.PLATFORM_SUPERADMIN
  );

  const isAllOrHQ =
    currentTenantId === 'all' ||
    currentTenantId === 'cb57c2f2-3810-4a0e-8af0-78ad02d69971' ||
    !currentTenantId;

  const tenantDisplayName = isSuper
    ? (isAllOrHQ
      ? 'OmniStay Global HQ (Platform Root)'
      : (activeTenant?.name ? `Inspecting: ${activeTenant.name}` : 'OmniStay Global HQ (Platform Root)'))
    : (activeTenant?.name || user?.organizationName || 'My Hotel');

  const displayRoleLabel = isSuper
    ? 'Platform SuperAdmin'
    : (ROLE_LABELS[normalizeRole(user?.role || activeRole)] || 'Platform SuperAdmin');

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
          <DropdownMenuContent align="start" className="w-72 bg-white border border-slate-200 shadow-xl rounded-2xl p-1.5 z-50">
            {isSuper && (
              <>
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Platform Root (Global Scope)
                </div>
                <DropdownMenuItem
                  onClick={() => {
                    setTenantId('cb57c2f2-3810-4a0e-8af0-78ad02d69971');
                    if (typeof window !== 'undefined') window.location.reload();
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer ${isAllOrHQ ? 'bg-sky-50 text-[#00a8ff] font-bold' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm">🌐</span>
                    <div className="flex flex-col">
                      <span className="font-bold">OmniStay Global HQ</span>
                      <span className="text-[10px] text-slate-500 font-normal">Full System Master Control</span>
                    </div>
                  </div>
                  {isAllOrHQ && <Check className="w-4 h-4 text-[#00a8ff] shrink-0" />}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1.5" />
              </>
            )}

            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {isSuper ? 'Switch Hotel Tenant to Inspect' : 'Hotel Properties'}
            </div>
            {tenants
              .filter((t) => t.id !== 'cb57c2f2-3810-4a0e-8af0-78ad02d69971')
              .map((t, idx) => {
                const isSelected = t.id === currentTenantId && !isAllOrHQ;
                return (
                  <DropdownMenuItem
                    key={t.id || t.subdomain || `header-tenant-${idx}`}
                    onClick={() => {
                      setTenantId(t.id);
                      if (typeof window !== 'undefined') window.location.reload();
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer ${isSelected ? 'bg-sky-50 text-[#00a8ff] font-bold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate">{t.name}</span>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#00a8ff] shrink-0" />
                    )}
                  </DropdownMenuItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right: Notifications & Interactive Role Switcher */}
      <div className="flex items-center gap-3">
        {/* Notifications Interactive Popover */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen((prev) => !prev)}
            className={`relative p-2 rounded-lg border transition-all cursor-pointer outline-none ${
              isNotifOpen
                ? 'bg-sky-50 border-[#00a8ff] text-[#00a8ff]'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Notifications & System Alerts"
            aria-label="Open notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00a8ff] ring-2 ring-white animate-pulse" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-slate-200 shadow-2xl rounded-2xl p-0 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-[#00a8ff] flex items-center justify-center">
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Notifications & Alerts</h3>
                    <p className="text-[10px] text-slate-500">Real-time hospitality dispatches</p>
                  </div>
                </div>

                {unreadCount > 0 ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAllRead();
                    }}
                    className="text-[11px] font-semibold text-[#00a8ff] hover:text-[#0097e6] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                ) : (
                  <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    All caught up
                  </span>
                )}
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No notifications at this time.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        handleNotificationClick(notif.link, notif.id);
                        setIsNotifOpen(false);
                      }}
                      className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 ${
                        !notif.isRead ? 'bg-sky-50/40' : 'bg-white'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {!notif.isRead ? (
                          <div className="w-2 h-2 rounded-full bg-[#00a8ff] mt-1" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-slate-200 mt-1" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                            {notif.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                          {notif.body}
                        </p>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-[9px] uppercase font-bold text-[#00a8ff] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                            {notif.category}
                          </span>
                          <span className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-0.5">
                            View details <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsNotifOpen(false);
                    router.push('/messages');
                  }}
                  className="w-full py-1 text-center font-semibold text-[#00a8ff] hover:text-[#0097e6] flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>View All Omnichannel Messages</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

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
                  {displayRoleLabel}
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
                  <span className="truncate">{displayRoleLabel}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">
                    {isSuper ? 'OmniStay Global HQ (Platform Root)' : tenantDisplayName}
                  </span>
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

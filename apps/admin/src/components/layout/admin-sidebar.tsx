'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MapPin,
  Building2,
  Compass,
  Home,
  Plane,
  Car,
  Ship,
  CalendarCheck,
  TicketPercent,
  MessageSquare,
  Newspaper,
  FileText,
  Image as ImageIcon,
  Users,
  ShieldCheck,
  Layers,
  Menu as MenuIcon,
  DollarSign,
  Settings,
  UtensilsCrossed,
  Bot,
  KeyRound,
  Hammer,
  MessageCircle,
  Wallet,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  ConciergeBell,
  CalendarDays,
  Sparkles,
  Warehouse,
  Briefcase,
  Store,
  BarChart3,
  History,
  Building,
} from 'lucide-react';
import { useUiStore } from '@/stores/ui-store';
import { sessionManager } from '@/lib/auth/session';
import { isRouteAllowedForRole } from '@/lib/auth/permissions';
import { cn } from '@/lib/utils';

interface SubNavItem {
  title: string;
  href: string;
}

interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  hasSubmenu?: boolean;
  submenu?: SubNavItem[];
  badge?: string;
}

interface NavSection {
  section?: string;
  items: NavItem[];
}

export const navigationSections: NavSection[] = [
  {
    section: 'HOSPITALITY PMS',
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { title: 'Front Desk', href: '/front-desk', icon: ConciergeBell },
      { title: 'Reservations', href: '/reservations', icon: CalendarDays },
      {
        title: 'Hotel',
        icon: Building2,
        hasSubmenu: true,
        submenu: [
          { title: 'All Hotels', href: '/properties' },
          { title: 'Add new Hotel', href: '/properties?create=true' },
          { title: 'Room Management', href: '/rooms' },
          { title: 'Room Availability', href: '/rooms/availability' },
          { title: 'Attributes', href: '/properties/attributes' },
          { title: 'Room Attributes', href: '/rooms/attributes' },
          { title: 'Recovery', href: '/properties/recovery' },
        ],
      },
      { title: 'Housekeeping', href: '/housekeeping', icon: Sparkles },
    ],
  },
  {
    section: 'TRAVEL & PACKAGES',
    items: [
      { title: 'Destinations', href: '/locations', icon: MapPin },
      { title: 'Tour Packages', href: '/tours', icon: Compass },
      { title: 'Spaces & Villas', href: '/spaces', icon: Home },
      { title: 'Flights', href: '/flights', icon: Plane },
      { title: 'Car Rentals', href: '/cars', icon: Car },
      { title: 'Boat Rentals', href: '/boats', icon: Ship },
      { title: 'Events & Banquets', href: '/events', icon: CalendarCheck },
    ],
  },
  {
    section: 'OPERATIONS & SUITE',
    items: [
      { title: 'Point of Sale (POS)', href: '/pos', icon: UtensilsCrossed },
      { title: 'Warehouse Inventory', href: '/inventory', icon: Warehouse },
      { title: 'IoT Smart Rooms', href: '/iot', icon: KeyRound },
      { title: 'AI Concierge Studio', href: '/ai', icon: Bot },
      { title: 'Live Messenger', href: '/messages', icon: MessageCircle },
      { title: 'Projects & Bugs', href: '/projects', icon: Hammer },
    ],
  },
  {
    section: 'FINANCE & CRM',
    items: [
      { title: 'Accounting & Night Audit', href: '/finance', icon: DollarSign },
      { title: 'Guest CRM & Banquets', href: '/crm', icon: Briefcase },
      { title: 'HR & Payroll', href: '/hrm', icon: Users },
      { title: 'Vendor Marketplace', href: '/marketplace', icon: Store },
      { title: 'Digital Wallet', href: '/wallet', icon: Wallet },
      { title: 'Coupons & Promos', href: '/coupons', icon: TicketPercent },
      { title: 'Guest Reviews', href: '/reviews', icon: MessageSquare },
    ],
  },
  {
    section: 'CONTENT & CMS',
    items: [
      { title: 'News', href: '/news', icon: Newspaper },
      { title: 'Page', href: '/pages', icon: FileText },
      { title: 'Media', href: '/media', icon: ImageIcon },
      { title: 'Popup Modals', href: '/popup', icon: Layers },
      { title: 'Menu Builder', href: '/menu', icon: MenuIcon },
    ],
  },
  {
    section: 'SYSTEM & GOVERNANCE',
    items: [
      { title: 'Organizations', href: '/organizations', icon: Building },
      {
        title: 'Users',
        icon: Users,
        hasSubmenu: true,
        submenu: [
          { title: 'All Users', href: '/users' },
          { title: 'Role Permissions', href: '/roles' },
        ],
      },
      { title: 'Reports & Analytics', href: '/reports', icon: BarChart3 },
      { title: 'Audit Trail', href: '/audit-logs', icon: History },
      { title: 'Settings', href: '/settings', icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, activeRole } = useUiStore();

  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    Hotel: true,
    Users: false,
    Setting: false,
  });

  // Automatically expand parent menus matching current path
  useEffect(() => {
    if (pathname?.startsWith('/properties') || pathname?.startsWith('/rooms')) {
      setExpandedMenus((prev) => ({ ...prev, Hotel: true }));
    }
    if (pathname?.startsWith('/users') || pathname?.startsWith('/roles')) {
      setExpandedMenus((prev) => ({ ...prev, Users: true }));
    }
    if (pathname?.startsWith('/settings')) {
      setExpandedMenus((prev) => ({ ...prev, Setting: true }));
    }
  }, [pathname]);

  const toggleSubmenu = (title: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const handleLogout = () => {
    sessionManager.clear();
    window.location.href = '/login';
  };

  // Dynamically filter sections and items according to the active role
  const visibleSections = navigationSections
    .map((section) => {
      const allowedItems = section.items
        .map((item) => {
          if (item.submenu && item.submenu.length > 0) {
            const filteredSub = item.submenu.filter((sub) =>
              isRouteAllowedForRole(activeRole, sub.href)
            );
            if (filteredSub.length > 0) {
              return { ...item, submenu: filteredSub };
            }
            return null;
          }
          if (item.href && isRouteAllowedForRole(activeRole, item.href)) {
            return item;
          }
          return null;
        })
        .filter((item): item is NavItem => item !== null);

      return { ...section, items: allowedItems };
    })
    .filter((section) => section.items.length > 0);

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-[#1b263b] text-slate-300 transition-all duration-200 z-30 select-none shadow-sm shrink-0',
        sidebarCollapsed ? 'w-16' : 'w-60'
      )}
      style={{ backgroundColor: 'var(--brand-bg, #162032)' }}
    >
      {/* Brand Header Matching PDF Figures */}
      <div className="flex h-14 items-center justify-between px-3 border-b border-[#212f45]" style={{ backgroundColor: 'var(--brand-bg, #111927)' }}>
        <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <div
            className="w-8 h-8 rounded flex items-center justify-center font-black text-white text-xs shadow-xs shrink-0 tracking-wider transition-colors"
            style={{ backgroundColor: 'var(--brand-primary, #00a8ff)' }}
          >
            OS
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-xs tracking-wider text-white uppercase">OmniStay 360</span>
              <span className="text-[10px] text-slate-400 font-medium truncate max-w-[130px]">
                Administrator
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={toggleSidebar}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#212f45] transition-colors"
          title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Navigation List Matching Exact Hierarchy in PDF Figures 2.1, 3.1, 4.1 */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-3 scrollbar-thin scrollbar-thumb-[#212f45]">
        {visibleSections.map((section, secIdx) => (
          <div key={secIdx} className="space-y-0.5">
            {section.section && !sidebarCollapsed && (
              <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {section.section}
              </div>
            )}

            {section.items.map((item) => {
              const Icon = item.icon;
              const hasSub = item.submenu && item.submenu.length > 0;
              const isSubExpanded = !!expandedMenus[item.title];

              // Check if parent or one of its children is active
              const isDirectActive = item.href ? pathname === item.href : false;
              const isChildActive = hasSub && item.submenu?.some((sub) => pathname === sub.href);
              const isActive = isDirectActive || isChildActive;

              if (hasSub) {
                return (
                  <div key={item.title} className="space-y-0.5">
                    <button
                      onClick={() => toggleSubmenu(item.title)}
                      className={cn(
                        'w-full group flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-colors cursor-pointer text-left',
                        isActive
                          ? 'bg-[#1e2c44] text-white font-semibold'
                          : 'text-slate-300 hover:text-white hover:bg-[#1a2538]'
                      )}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={cn('w-4 h-4 shrink-0', isActive ? 'text-white' : 'text-slate-400')}
                          style={isActive ? { color: 'var(--brand-primary, #00a8ff)' } : {}}
                        />
                        {!sidebarCollapsed && <span className="truncate">{item.title}</span>}
                      </div>
                      {!sidebarCollapsed && (
                        <div className="text-slate-400">
                          {isSubExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </div>
                      )}
                    </button>

                    {/* Submenu Items Matching PDF Figures 3.1 & 4.1 */}
                    {!sidebarCollapsed && isSubExpanded && (
                      <div className="pl-6 space-y-0.5 py-0.5">
                        {item.submenu?.map((sub) => {
                          const isSubSelected = pathname === sub.href;
                          return (
                            <Link
                              key={sub.title}
                              href={sub.href}
                              className={cn(
                                'block px-3 py-1.5 rounded text-[11px] transition-colors',
                                isSubSelected
                                  ? 'text-white font-semibold shadow-2xs'
                                  : 'text-slate-400 hover:text-white hover:bg-[#1a2538]'
                              )}
                              style={isSubSelected ? { backgroundColor: 'var(--brand-primary, #00a8ff)' } : {}}
                            >
                              {sub.title}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // Normal Nav Item
              return (
                <Link
                  key={item.title}
                  href={item.href || '#'}
                  className={cn(
                    'group flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-colors',
                    isActive
                      ? 'text-white font-semibold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-[#1a2538]'
                  )}
                  style={isActive ? { backgroundColor: 'var(--brand-primary, #00a8ff)' } : {}}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-white' : 'text-slate-400')} />
                    {!sidebarCollapsed && <span className="truncate">{item.title}</span>}
                  </div>
                  {!sidebarCollapsed && item.hasSubmenu && (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-2 border-t border-[#212f45] bg-[#111927]">
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer',
            sidebarCollapsed && 'justify-center px-0'
          )}
          title="Sign Out"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!sidebarCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}

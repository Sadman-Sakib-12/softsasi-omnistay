"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Wallet, KeyRound, User, LogOut } from "lucide-react";
import { GuestAuthService } from "@/features/auth/auth.service";

interface TabItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabItem[] = [
  { label: "My Bookings & Vouchers", href: "/guest/bookings", icon: Calendar },
  { label: "Digital Wallet & Points", href: "/guest/wallet", icon: Wallet },
  { label: "Express Self Check-In", href: "/guest/checkin", icon: KeyRound },
  { label: "Profile & Settings", href: "/guest/profile", icon: User },
];

export function GuestPortalNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center justify-between border-b border-slate-200 pb-px mb-8 overflow-x-auto no-scrollbar gap-4">
      <div className="flex items-center gap-2">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-all border-b-2 whitespace-nowrap ${
                isActive
                  ? "border-[#2577e3] text-[#2577e3] bg-sky-50/50"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-[#2577e3]" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>

      <button
        onClick={() => GuestAuthService.logout()}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50/60 hover:bg-rose-50 border border-rose-200/80 rounded-lg transition-colors cursor-pointer shrink-0"
        title="Sign Out of Guest Account"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Sign Out</span>
      </button>
    </div>
  );
}


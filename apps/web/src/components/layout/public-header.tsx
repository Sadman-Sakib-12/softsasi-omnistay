"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/features/cart/cart-store";
import { CURRENCIES } from "@/lib/constants";
import {
  ShoppingBag,
  Globe,
  User,
  ChevronDown,
  Calendar,
  Wallet,
  KeyRound,
  LogOut,
  Menu,
  X,
  Sparkles,
  Hotel,
  Compass,
  Building2,
  Car,
  Plane,
  Anchor,
  HelpCircle,
} from "lucide-react";
import { GuestAuthService, GuestUser } from "@/features/auth/auth.service";
import { useCurrencyStore, CurrencyCode } from "@/features/currency/currency-store";

// Refined navigation items mapped directly to Figure 5.1 in Sakib_Project_Plan.pdf
const DEFAULT_NAV_ITEMS = [
  { label: "HOME", path: "/" },
  { label: "HOTEL", path: "/stays" },
  { label: "TOURS", path: "/tours" },
  { label: "SPACE", path: "/spaces" },
  { label: "CAR", path: "/cars" },
  { label: "EVENT", path: "/stays?type=event" },
  { label: "FLIGHT", path: "/flights" },
  { label: "BOAT", path: "/boats" },
  { label: "PAGES", path: "/about" },
];

export function PublicHeader() {
  const pathname = usePathname();
  const cartItemsCount = useCartStore((s) => s.getItemCount());
  const { currentCurrency, setCurrency } = useCurrencyStore();
  const [user, setUser] = useState<GuestUser | null>(null);
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navItems, setNavItems] = useState(DEFAULT_NAV_ITEMS);
  const [siteTitle, setSiteTitle] = useState("SOFTSASI");
  const [headerCta, setHeaderCta] = useState({ text: "Become a Partner", link: "/auth/register" });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const stored = GuestAuthService.getStoredUser();
    if (stored) {
      setUser(stored);
    } else if (GuestAuthService.isLoggedIn()) {
      import("@/lib/api-client").then(({ apiClient }) => {
        apiClient
          .get("/users/me")
          .then((res) => {
            if (res.data) {
              const u: GuestUser = {
                id: res.data.id,
                name: `${res.data.firstName || ""} ${res.data.lastName || ""}`.trim() || res.data.name || res.data.email?.split("@")[0] || "Guest",
                email: res.data.email,
                role: res.data.role || "GUEST",
                loyaltyTier: res.data.loyaltyTier || "Privé Gold Explorer",
              };
              setUser(u);
              localStorage.setItem("omnistay_guest_user", JSON.stringify(u));
            }
          })
          .catch(() => {});
      });
    }

    // Hydrate Navigation Menus live from CMS Menu Builder
    import("@/lib/api-client").then(({ apiClient }) => {
      apiClient
        .get("/system/menus?location=header")
        .then((res) => {
          if (Array.isArray(res.data) && res.data.length > 0) {
            const mapped = res.data
              .filter((m: any) => m.isActive !== false)
              .map((m: any) => ({
                label: m.title,
                path: m.url,
                icon: Hotel,
              }));
            setNavItems(mapped);
          }
        })
        .catch(() => {});

      // Hydrate Website Customizer Branding & Identity
      apiClient
        .get("/system/website-customizer")
        .then((res) => {
          if (res.data?.siteTitle) {
            setSiteTitle(res.data.siteTitle);
          } else {
            setSiteTitle("SOFTSASI");
          }
          if (res.data?.headerCtaText) {
            setHeaderCta({
              text: res.data.headerCtaText,
              link: res.data.headerCtaLink || "/auth/register",
            });
          }
        })
        .catch(() => {});
    });

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Balanced 3-Zone Header Layout with standard 64px (h-16) height */}
        <div className="flex items-center justify-between h-16">
          {/* ZONE 1 (Left): Brand Logo & Tagline (Figure 5.1 in PDF) */}
          <div className="flex items-center shrink-0">
            <Link href="/" className="flex items-center gap-2 group focus:outline-none">
              <span className="font-black text-xl sm:text-2xl tracking-tighter text-slate-900 group-hover:text-[#00a8ff] transition-colors uppercase font-sans">
                {siteTitle}
              </span>
            </Link>
          </div>

          {/* ZONE 2 (Center): Centered Navigation Bar (Figure 5.1 in PDF) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item, idx) => {
              const active = item.path === "/" ? pathname === "/" : pathname.startsWith(item.path);
              return (
                <Link
                  key={idx}
                  href={item.path}
                  className={`text-xs font-bold px-2.5 py-1.5 rounded transition-all whitespace-nowrap inline-flex items-center gap-1 uppercase tracking-tight ${
                    active
                      ? "text-[#00a8ff] font-extrabold"
                      : "text-slate-700 hover:text-slate-900"
                  }`}
                >
                  <span>{item.label}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400 stroke-[2.5]" />
                </Link>
              );
            })}
          </nav>

          {/* ZONE 3 (Right): Utilities & Account Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Currency Pill */}
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 transition-colors">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={mounted ? currentCurrency : "USD"}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="bg-transparent focus:outline-none cursor-pointer text-[11px] font-semibold text-slate-700"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Cart Icon with Counter */}
            <Link
              href="/cart"
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="View Cart & Itinerary"
            >
              <ShoppingBag className="w-4.5 h-4.5 stroke-[1.8]" />
              {mounted && cartItemsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[9px] font-black rounded-full min-w-3.5 h-3.5 px-0.5 flex items-center justify-center shadow-xs">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* User Account / Auth Actions */}
            {mounted && user ? (
              <div className="flex items-center gap-2">
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 pl-1.5 pr-2.5 py-1 rounded-full transition-all cursor-pointer text-xs"
                    aria-expanded={dropdownOpen}
                  >
                    <div className="w-5 h-5 rounded-full bg-[#0284c7] text-white flex items-center justify-center text-[10px] font-bold">
                      {user.name ? user.name.charAt(0).toUpperCase() : "G"}
                    </div>
                    <span className="font-bold text-slate-800 hidden sm:inline max-w-[90px] truncate text-xs">
                      {user.name ? user.name.split(" ")[0] : "Guest"}
                    </span>
                    <ChevronDown
                      className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                        dropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-68 bg-white border border-slate-100 rounded-xl shadow-xl z-50 py-2 animate-in fade-in zoom-in-95">
                      {/* User Identity Header */}
                      <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/60 rounded-t-xl">
                        <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        <div className="mt-1.5 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span className="text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded-full">
                            {user.loyaltyTier || "Privé Gold Explorer"}
                          </span>
                        </div>
                      </div>

                      {/* Links */}
                      <div className="py-1">
                        <Link
                          href="/guest/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0284c7] transition-colors"
                        >
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>My Profile & Settings</span>
                        </Link>

                        <Link
                          href="/guest/bookings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0284c7] transition-colors"
                        >
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>My Bookings & Vouchers</span>
                        </Link>

                        <Link
                          href="/guest/wallet"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0284c7] transition-colors"
                        >
                          <Wallet className="w-3.5 h-3.5 text-slate-400" />
                          <span>Digital Wallet & Rewards</span>
                        </Link>

                        <Link
                          href="/guest/checkin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0284c7] transition-colors"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                          <span>Express Mobile Key</span>
                        </Link>
                      </div>

                      {/* Sign out */}
                      <div className="border-t border-slate-100 pt-1 mt-1">
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            GuestAuthService.logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5 text-rose-500" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Book Now Button (Figure 1.1) */}
                <Link
                  href="/stays"
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold bg-slate-950 hover:bg-slate-800 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 uppercase tracking-wider"
                >
                  <span>BOOK NOW</span>
                  <span className="text-amber-400">↗</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="text-xs font-bold text-slate-700 hover:text-[#0284c7] px-2.5 py-1.5 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="hidden md:inline-flex items-center text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-all"
                >
                  Become a Host
                </Link>
                <Link
                  href="/stays"
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-950 hover:bg-slate-800 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 uppercase tracking-wider"
                >
                  <span>BOOK NOW</span>
                  <span className="text-amber-400">↗</span>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 py-3 px-2 space-y-1 animate-in slide-in-from-top-1 duration-150">
            {navItems.map((item, idx) => {
              const active = item.path === "/" ? pathname === "/" : pathname.startsWith(item.path);
              return (
                <Link
                  key={idx}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? "bg-sky-50 text-[#0284c7] font-bold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-3">
              <span className="text-xs text-slate-500">Selected Currency:</span>
              <select
                value={mounted ? currentCurrency : "USD"}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

import React from "react";
import Link from "next/link";
import { HeroSearchEngine } from "@/components/search/hero-search-engine";
import { StayCard } from "@/components/cards/stay-card";
import { PropertiesService } from "@/features/properties/properties.service";
import { Play, Star, ArrowRight, ShieldCheck, Award } from "lucide-react";

export const metadata = {
  title: "HOTELIN — Private Seaside Sanctuary | OmniStay 360",
  description: "Unified Platform Luxury Experience — High-Converting Guest Booking Portal (Figure 1.1)",
};

export default async function HotelinLuxuryPage() {
  const properties = await PropertiesService.getAll();

  return (
    <div className="flex flex-col min-h-screen bg-[#0b0f19] text-white">
      {/* Figure 1.1 HOTELIN Header */}
      <header className="sticky top-0 z-50 bg-[#0b0f19]/90 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* HOTELIN Brand Logo */}
          <Link href="/hotelin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full border-2 border-amber-500 flex items-center justify-center">
              <div className="w-3.5 h-3.5 rounded-full bg-amber-500" />
            </div>
            <span className="font-serif font-black tracking-widest text-xl text-white uppercase">
              HOTELIN
            </span>
          </Link>

          {/* Nav Items from Figure 1.1 */}
          <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest text-white/80 font-semibold">
            <Link href="/hotelin" className="text-amber-400 hover:text-amber-300">Home ⌵</Link>
            <Link href="/stays" className="hover:text-amber-300">Rooms ⌵</Link>
            <Link href="/about" className="hover:text-amber-300">Pages ⌵</Link>
            <Link href="/news" className="hover:text-amber-300">Blog ⌵</Link>
            <Link href="/contact" className="hover:text-amber-300">Contact</Link>
          </nav>

          {/* Book Now Button from Figure 1.1 */}
          <Link
            href="/stays"
            className="px-5 py-2.5 rounded-full bg-white text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-amber-400 transition-colors inline-flex items-center gap-1.5 shadow-lg"
          >
            <span>BOOK NOW</span>
            <span className="text-sm">↗</span>
          </Link>
        </div>
      </header>

      {/* Hero Section matching Figure 1.1 */}
      <section className="relative min-h-[640px] lg:min-h-[700px] w-full overflow-hidden flex items-center justify-center">
        {/* Backdrop Hotel Suite Photo */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=2400&q=85"
            alt="Private Seaside Sanctuary"
            className="w-full h-full object-cover object-center scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/60 to-[#0b0f19]/40" />
        </div>

        {/* Figure 1.1 LUXURY HOTEL Watermark */}
        <div className="pointer-events-none absolute bottom-6 left-0 right-0 overflow-hidden select-none z-5 text-center">
          <span className="text-[14vw] font-serif font-black tracking-[0.25em] uppercase text-white/[0.08] leading-none whitespace-nowrap block">
            LUXURY HOTEL
          </span>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-9 text-left">
              {/* 5-Star Rating Pill (Figure 1.1) */}
              <div className="flex items-center gap-1 text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-white drop-shadow-lg uppercase leading-[1.1]">
                PRIVATE SEASIDE SANCTUARY
              </h1>

              <p className="mt-4 text-sm sm:text-base text-white/80 max-w-2xl font-light leading-relaxed mb-8">
                Experience unhurried luxury where contemporary elegance meets timeless hospitality across the world's most breathtaking sanctuaries.
              </p>

              {/* Floating Luxury Search Capsule */}
              <HeroSearchEngine />
            </div>

            {/* Play Tour Button matching Figure 1.1 */}
            <div className="hidden lg:flex lg:col-span-3 items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <a
                  href="/stays"
                  className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-white text-slate-950 shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
                >
                  <div className="absolute inset-0 rounded-full bg-white/40 animate-ping opacity-60" />
                  <Play className="w-7 h-7 fill-slate-950 text-slate-950 ml-1 transition-transform group-hover:scale-110" />
                </a>
                <span className="text-xs font-semibold uppercase tracking-widest text-white/80">
                  Watch Tour
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Suites Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full bg-[#0b0f19]">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Exclusive Sanctuary Accommodations
            </span>
            <h2 className="text-3xl font-serif font-bold text-white mt-1">
              Signature Suites & Private Villas
            </h2>
          </div>
          <Link
            href="/stays"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 uppercase tracking-wider"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.slice(0, 3).map((prop) => (
            <StayCard key={prop.id} property={prop} />
          ))}
        </div>
      </section>
    </div>
  );
}


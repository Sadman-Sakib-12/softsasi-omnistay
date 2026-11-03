"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Hotel,
  Building2,
  Compass,
  Car,
  Plane,
  Anchor,
  MapPin,
  Calendar,
  Users,
  Search,
  ChevronDown,
} from "lucide-react";

// Exact tabs from Chapter 5 Travel Marketplace specifications
const ALL_TABS = [
  { id: "hotel", label: "Stays & Resorts", icon: Hotel, path: "/stays" },
  { id: "space", label: "Private Villas", icon: Building2, path: "/spaces" },
  { id: "tour", label: "Curated Tours", icon: Compass, path: "/tours" },
  { id: "car", label: "Cars & Chauffeur", icon: Car, path: "/cars" },
  { id: "flight", label: "Aviation", icon: Plane, path: "/flights" },
  { id: "boat", label: "Yacht Charters", icon: Anchor, path: "/boats" },
];

interface HeroSearchEngineProps {
  activeTabs?: string[];
  searchButtonText?: string;
  searchButtonColor?: string;
}

export function HeroSearchEngine({
  activeTabs,
  searchButtonText = "Search Availability",
  searchButtonColor,
}: HeroSearchEngineProps) {
  const visibleTabs =
    activeTabs && activeTabs.length > 0
      ? ALL_TABS.filter((t) => activeTabs.includes(t.id))
      : ALL_TABS;

  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>(visibleTabs[0]?.id || "hotel");
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("2026-11-10");
  const [checkOut, setCheckOut] = useState("2026-11-15");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const tabObj = visibleTabs.find((t) => t.id === activeTab) || ALL_TABS[0];
    const basePath = tabObj?.path || "/stays";

    const query = new URLSearchParams();
    if (destination) query.set("destination", destination);
    if (checkIn) query.set("checkIn", checkIn);
    if (checkOut) query.set("checkOut", checkOut);
    query.set("adults", String(adults));
    query.set("children", String(children));

    router.push(`${basePath}?${query.toString()}`);
  };

  return (
    <div className="w-full max-w-4xl">
      {/* 1. Frosted Glass Floating Category Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-2">
        <div className="bg-slate-950/40 backdrop-blur-md p-1 rounded-full border border-white/20 inline-flex items-center gap-1 shadow-md">
          {visibleTabs.map((tab) => {
            const active = activeTab === tab.id;
            const IconComp = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  active
                    ? "bg-white text-slate-900 shadow-sm scale-100"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                <IconComp className={`w-3.5 h-3.5 ${active ? "text-[#0284c7]" : "text-white/70"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Luxury Segmented Search Capsule */}
      <form
        onSubmit={handleSearch}
        className="bg-white/95 backdrop-blur-xl rounded-2xl md:rounded-full shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white/70 p-2 md:p-2.5 flex flex-col md:flex-row items-stretch md:items-center gap-2"
      >
        {/* Field 1: Destination / Where */}
        <div className="flex-1 px-4 py-2 rounded-xl md:rounded-full hover:bg-slate-50 transition-colors flex items-center gap-3 cursor-text">
          <div className="w-9 h-9 rounded-full bg-sky-50 flex items-center justify-center text-[#0284c7] shrink-0">
            <MapPin className="w-4 h-4 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
              Where
            </label>
            <input
              type="text"
              placeholder="Search destinations, cities, resorts..."
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="hidden md:block w-px h-10 bg-slate-200/80 my-auto" />

        {/* Field 2: Dates (Check In - Out) */}
        <div className="flex-1 px-4 py-2 rounded-xl md:rounded-full hover:bg-slate-50 transition-colors flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-sky-50 flex items-center justify-center text-[#0284c7] shrink-0">
            <Calendar className="w-4 h-4 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
              Check In — Check Out
            </label>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer w-24 text-slate-900 font-semibold"
              />
              <span className="text-slate-300 font-normal">→</span>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer w-24 text-slate-900 font-semibold"
              />
            </div>
          </div>
        </div>

        <div className="hidden md:block w-px h-10 bg-slate-200/80 my-auto" />

        {/* Field 3: Guests & Rooms */}
        <div className="w-full md:w-56 px-4 py-2 rounded-xl md:rounded-full hover:bg-slate-50 transition-colors flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-sky-50 flex items-center justify-center text-[#0284c7] shrink-0">
            <Users className="w-4 h-4 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
              Who
            </label>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <select
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
                className="bg-transparent focus:outline-none cursor-pointer text-slate-900 font-semibold"
              >
                <option value={1}>1 Guest</option>
                <option value={2}>2 Guests</option>
                <option value={4}>4 Guests</option>
                <option value={6}>6+ Guests</option>
              </select>
              <span className="text-slate-300 font-normal">·</span>
              <select
                value={children}
                onChange={(e) => setChildren(Number(e.target.value))}
                className="bg-transparent focus:outline-none cursor-pointer text-slate-900 font-semibold"
              >
                <option value={0}>0 Kids</option>
                <option value={1}>1 Kid</option>
                <option value={2}>2 Kids</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Button: Search */}
        <button
          type="submit"
          style={searchButtonColor ? { backgroundColor: searchButtonColor } : undefined}
          className="bg-gradient-to-r from-[#0284c7] to-[#2563eb] hover:from-[#0369a1] hover:to-[#1d4ed8] text-white font-bold text-xs sm:text-sm px-6 sm:px-8 py-3.5 rounded-xl md:rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shrink-0 shadow-md shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-[1.02] active:scale-95"
        >
          <Search className="w-4 h-4 stroke-[2.5]" />
          <span>{searchButtonText}</span>
        </button>
      </form>
    </div>
  );
}

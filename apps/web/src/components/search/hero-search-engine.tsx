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

// Exact tabs matching Figure 5.1 in Sakib_Project_Plan.pdf
const ALL_TABS = [
  { id: "hotel", label: "Hotel", icon: Hotel, path: "/stays" },
  { id: "space", label: "Space", icon: Building2, path: "/spaces" },
  { id: "tour", label: "Tour", icon: Compass, path: "/tours" },
  { id: "car", label: "Car", icon: Car, path: "/cars" },
  { id: "event", label: "Event", icon: Compass, path: "/stays?type=event" },
  { id: "flight", label: "Flight", icon: Plane, path: "/flights" },
  { id: "boat", label: "Boat", icon: Anchor, path: "/boats" },
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
    <div className="w-full max-w-5xl">
      {/* 1. Category Bar Matching Figure 5.1 in PDF */}
      <div className="flex items-center gap-0 overflow-x-auto scrollbar-none">
        {visibleTabs.map((tab) => {
          const active = activeTab === tab.id;
          const IconComp = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap rounded-t-lg ${
                active
                  ? "bg-[#2577e3] text-white shadow-md"
                  : "bg-[#0b132b]/85 text-white/80 hover:text-white hover:bg-[#0b132b]"
              }`}
            >
              <IconComp className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Unified Search Capsule Matching Figure 5.1 in PDF */}
      <form
        onSubmit={handleSearch}
        className="bg-white rounded-b-xl rounded-tr-xl shadow-2xl border border-slate-200/90 p-2 md:p-3 flex flex-col md:flex-row items-stretch md:items-center gap-2"
      >
        {/* Field 1: Location */}
        <div className="flex-1 px-4 py-2 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-3 cursor-text">
          <div className="text-[#2577e3] shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-tight">
              Location
            </label>
            <input
              type="text"
              placeholder="Where are you going?"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </div>

        <div className="hidden md:block w-px h-9 bg-slate-200 my-auto" />

        {/* Field 2: Check in - Out */}
        <div className="flex-1 px-4 py-2 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-3">
          <div className="text-[#2577e3] shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-tight">
              Check In - Out
            </label>
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-800">
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer w-24 text-slate-800 font-semibold text-xs"
              />
              <span className="text-slate-400">-</span>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer w-24 text-slate-800 font-semibold text-xs"
              />
            </div>
          </div>
        </div>

        <div className="hidden md:block w-px h-9 bg-slate-200 my-auto" />

        {/* Field 3: Guests */}
        <div className="w-full md:w-56 px-4 py-2 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-3">
          <div className="text-[#2577e3] shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-tight">
              Guests
            </label>
            <select
              value={`${adults}-${children}`}
              onChange={(e) => {
                const [a, c] = e.target.value.split("-").map(Number);
                setAdults(a);
                setChildren(c);
              }}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none w-full cursor-pointer"
            >
              <option value="1-0">1 Adult - 0 Child</option>
              <option value="2-0">2 Adults - 0 Child</option>
              <option value="2-1">2 Adults - 1 Child</option>
              <option value="4-2">4 Adults - 2 Children</option>
            </select>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </div>

        {/* Search Button (Figure 5.1) */}
        <button
          type="submit"
          className="w-full md:w-auto px-7 py-3 rounded-lg font-bold text-xs uppercase tracking-wider text-white bg-[#2577e3] hover:bg-[#1d62c2] transition-colors shadow-md cursor-pointer shrink-0"
        >
          {searchButtonText === "Search Availability" ? "SEARCH" : searchButtonText}
        </button>
      </form>
    </div>
  );
}

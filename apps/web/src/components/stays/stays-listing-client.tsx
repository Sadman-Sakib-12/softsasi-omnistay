"use client";

import React, { useState } from "react";
import { Property } from "@/features/properties/properties.service";
import { StayCard } from "@/components/cards/stay-card";
import { InteractiveMapView } from "@/components/map/interactive-map-view";
import { SlidersHorizontal, Map, LayoutGrid, Star, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StaysListingClientProps {
  properties: Property[];
  destination?: string;
}

export function StaysListingClient({ properties, destination }: StaysListingClientProps) {
  const [showMap, setShowMap] = useState(false);
  const [selectedStars, setSelectedStars] = useState<number[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  // Filter properties client-side by star rating & type if chosen
  const filteredProperties = properties.filter((p) => {
    if (selectedStars.length > 0) {
      const rating = Math.floor(p.starRating || 5);
      if (!selectedStars.includes(rating)) return false;
    }
    return true;
  });

  const toggleStar = (star: number) => {
    setSelectedStars((prev) =>
      prev.includes(star) ? prev.filter((s) => s !== star) : [...prev, star]
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {destination ? `Luxury Stays in "${destination}"` : "Hotels, Villas & Luxury Resorts"}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Showing {filteredProperties.length} hand-picked luxury sanctuaries with verified stay protection.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMap(!showMap)}
            className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              showMap
                ? "bg-[#2577e3] text-white border-[#2577e3] shadow-md shadow-blue-500/20"
                : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
            }`}
          >
            {showMap ? <LayoutGrid className="w-4 h-4" /> : <Map className="w-4 h-4" />}
            <span>{showMap ? "Hide Interactive Map" : "Explore on Map"}</span>
          </button>
        </div>
      </div>

      {/* Interactive Map View */}
      {showMap && (
        <div className="animate-in fade-in duration-300">
          <InteractiveMapView properties={filteredProperties} />
        </div>
      )}

      {/* Main Grid with Sidebar Filter */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs h-fit space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#2577e3]" />
              <span>Filters</span>
            </h3>
            {(selectedStars.length > 0 || selectedTypes.length > 0) && (
              <button
                onClick={() => {
                  setSelectedStars([]);
                  setSelectedTypes([]);
                }}
                className="text-xs text-[#2577e3] font-bold hover:underline"
              >
                Reset
              </button>
            )}
          </div>

          {/* Star Rating Filter */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Star Rating
            </h4>
            <div className="flex flex-wrap gap-2">
              {[5, 4, 3].map((stars) => (
                <button
                  key={stars}
                  onClick={() => toggleStar(stars)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    selectedStars.includes(stars)
                      ? "bg-amber-50 text-amber-700 border-amber-300 ring-2 ring-amber-300"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  ★ {stars} Stars
                </button>
              ))}
            </div>
          </div>

          {/* Property Types */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Property Type
            </h4>
            <div className="space-y-2">
              {["Luxury Resort", "Executive Hotel", "Tea Sanctuary Villa", "Eco Lodge"].map((t) => (
                <label key={t} className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded text-[#00a8ff] focus:ring-[#00a8ff]"
                  />
                  <span>{t}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Popular Amenities */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Key Amenities
            </h4>
            <div className="space-y-2 text-xs text-slate-700">
              {["Private Infinity Pool", "Direct Beach Access", "Ayurvedic Spa & Wellness", "Helipad Landing Transfer", "Wi-Fi 6 High Speed"].map((a) => (
                <div key={a} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{a}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Listings Grid */}
        <main className="lg:col-span-3">
          {filteredProperties.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
              <h3 className="text-base font-bold text-slate-900">No properties matched filters</h3>
              <p className="text-xs text-slate-400 mt-1">Try resetting your star or category filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <StayCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

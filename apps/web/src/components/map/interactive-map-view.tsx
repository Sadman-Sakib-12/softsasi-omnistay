"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Property } from "@/features/properties/properties.service";
import { formatCurrency } from "@/lib/utils";
import { MapPin, Star, X, ArrowRight, ShieldCheck } from "lucide-react";

interface InteractiveMapViewProps {
  properties: Property[];
}

// Normalized coordinate lookup for Bangladesh hospitality zones
const COORD_MAP: Record<string, { xPct: number; yPct: number; zone: string }> = {
  "PARIAN-01": { xPct: 62, yPct: 78, zone: "Cox's Bazar Beachfront" },
  "AZURE-01": { xPct: 68, yPct: 86, zone: "Inani Coral Beach" },
  "SYLVAN-01": { xPct: 75, yPct: 36, zone: "Sreemangal Tea Sanctuary" },
  "HORIZON-01": { xPct: 48, yPct: 48, zone: "Gulshan Diplomatic Zone, Dhaka" },
};

export function InteractiveMapView({ properties }: InteractiveMapViewProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  return (
    <div className="relative w-full h-[540px] rounded-3xl overflow-hidden border border-slate-200/80 bg-slate-900 shadow-xl select-none">
      {/* Stylized Map Canvas (Vector Dark/Satellite Map Style) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        {/* Decorative coastline / terrain contour curves */}
        <path
          d="M 120 0 Q 200 180 320 280 T 520 480 Q 640 520 700 600"
          fill="none"
          stroke="#00a8ff"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          className="opacity-30"
        />
        <path
          d="M 280 0 Q 380 140 450 320 T 680 540"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="1"
          className="opacity-20"
        />
      </svg>

      {/* Top Map Bar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 text-white text-xs font-bold">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Live Interactive Property Geolocation</span>
        <span className="text-slate-400 font-normal">({properties.length} Verified Resorts)</span>
      </div>

      {/* Interactive Map Pins */}
      {properties.map((property, idx) => {
        const coord =
          COORD_MAP[property.id] ||
          COORD_MAP[property.code || ""] || {
            xPct: 30 + idx * 18,
            yPct: 35 + (idx % 2) * 25,
            zone: property.city || property.address,
          };

        const isSelected = selectedProperty?.id === property.id;

        return (
          <div
            key={property.id}
            style={{ left: `${coord.xPct}%`, top: `${coord.yPct}%` }}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110"
            onClick={() => setSelectedProperty(property)}
          >
            {/* Pulsing beacon */}
            <div className="relative">
              <span className="absolute -inset-1 rounded-full bg-[#00a8ff] opacity-40 animate-ping" />
              <div
                className={`relative px-3 py-1.5 rounded-full text-xs font-black shadow-lg flex items-center gap-1.5 border transition-all ${
                  isSelected
                    ? "bg-[#00a8ff] text-white border-white scale-110 shadow-sky-500/50"
                    : "bg-white text-slate-900 border-slate-200 hover:bg-sky-50"
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>৳{(property.lowestPrice || 16000).toLocaleString()}</span>
              </div>
            </div>
            {/* Sub-label */}
            <span className="mt-1 block text-[10px] font-bold text-slate-300 drop-shadow-md text-center truncate max-w-[120px]">
              {property.name.split(" ")[0]}
            </span>
          </div>
        );
      })}

      {/* Floating Selected Property Card Popover */}
      {selectedProperty && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-30 bg-white rounded-3xl p-4 border border-slate-200/80 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          <button
            onClick={() => setSelectedProperty(null)}
            className="absolute top-3 right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex gap-3">
            <img
              src={selectedProperty.images[0]}
              alt={selectedProperty.name}
              className="w-20 h-20 rounded-2xl object-cover shrink-0"
            />
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{selectedProperty.starRating || 5}.0</span>
                <span className="text-slate-400 font-normal">(48 reviews)</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">
                {selectedProperty.name}
              </h4>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {selectedProperty.city || selectedProperty.address}
              </p>
              <div className="mt-1 text-xs font-black text-[#00a8ff]">
                ৳{(selectedProperty.lowestPrice || 16000).toLocaleString()}{" "}
                <span className="text-[10px] text-slate-400 font-normal">/ night</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Stay</span>
            </div>
            <Link href={`/stays/${selectedProperty.id}`}>
              <button className="px-3 py-1.5 rounded-xl bg-[#00a8ff] hover:bg-[#0092dd] text-white text-[11px] font-bold flex items-center gap-1">
                <span>View Rooms</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { Star, MapPin, ShieldCheck } from "lucide-react";
import { Property } from "@/features/properties/properties.service";
import { useCurrencyStore } from "@/features/currency/currency-store";
import { AMENITY_ICONS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

export function StayCard({ property }: { property: Property }) {
  const formatPrice = useCurrencyStore((s) => s.formatPrice);
  const primaryImage =
    property.images?.[0] ||
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80";

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* Image Container */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100">
        <img
          src={primaryImage}
          alt={property.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <Badge variant="primary" className="bg-white/95 backdrop-blur-md text-slate-800 font-semibold shadow-xs">
            {property.propertyType}
          </Badge>
          <span className="inline-flex items-center gap-1 bg-[#00a8ff] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
            <ShieldCheck className="w-3 h-3" />
            Verified Stay
          </span>
        </div>

        {property.starRating && (
          <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-amber-400 px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{property.starRating}.0</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1 text-slate-500 text-xs mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="line-clamp-1">{property.city}, {property.country}</span>
          </div>

          <Link href={`/stays/${property.code || property.id}`}>
            <h3 className="font-bold text-slate-900 text-base group-hover:text-[#2577e3] transition-colors line-clamp-1">
              {property.name}
            </h3>
          </Link>

          {property.description && (
            <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
              {property.description}
            </p>
          )}

          {/* Amenities icons */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="flex items-center gap-2 mt-3 text-slate-400 text-xs">
              {property.amenities.slice(0, 4).map((a) => (
                <span
                  key={a}
                  className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-sm border border-slate-100"
                  title={a}
                >
                  {AMENITY_ICONS[a] || "✨"}
                </span>
              ))}
              {property.amenities.length > 4 && (
                <span className="text-[11px] font-medium text-slate-400">
                  +{property.amenities.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Pricing & CTA */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
              From
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-slate-900">
                {formatPrice(property.lowestPrice && property.lowestPrice < 2000 ? property.lowestPrice : 350)}
              </span>
              <span className="text-xs text-slate-500">/ night</span>
            </div>
          </div>

          <Link href={`/stays/${property.code || property.id}`}>
            <button className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-[#2577e3] text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer">
              View Rooms
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}


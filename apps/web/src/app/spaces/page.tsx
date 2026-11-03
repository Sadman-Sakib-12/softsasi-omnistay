import React from "react";
import { TravelService } from "@/features/travel/travel.service";
import { VerticalCard } from "@/components/cards/vertical-card";
import { Building2 } from "lucide-react";

export default async function SpacesPage() {
  const spaces = await TravelService.getSpaces();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <span className="text-xs font-bold text-[#00a8ff] uppercase tracking-widest flex items-center gap-1.5 mb-2">
          <Building2 className="w-4 h-4" /> Venues & Working Spaces
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Banquet Halls & Executive Boardrooms
        </h1>
        <p className="text-slate-500 text-sm mt-1 max-w-2xl">
          World-class event venues, opulent grand ballrooms, and top-tier tech boardrooms for corporate summits, diplomacy, and milestone celebrations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {spaces.map((space) => (
          <VerticalCard
            key={space.id}
            id={space.id}
            verticalType="space"
            title={space.name}
            subtitle={`${space.type.toUpperCase()} • ${space.location}`}
            imageUrl={space.images[0]}
            price={space.dailyRate}
            unitLabel="day"
            detailUrl={`/spaces/${space.id}`}
            metaBadge={`Capacity: ${space.capacity}`}
            specs={[
              { label: "Hourly Rate", value: `৳${space.hourlyRate}` },
              { label: "Capacity", value: `${space.capacity} pax` },
            ]}
          />
        ))}
      </div>
    </div>
  );
}


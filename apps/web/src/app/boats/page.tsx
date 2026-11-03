import React from "react";
import { TravelService } from "@/features/travel/travel.service";
import { VerticalCard } from "@/components/cards/vertical-card";
import { Anchor } from "lucide-react";

export default async function BoatsPage() {
  const boats = await TravelService.getBoats();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <span className="text-xs font-bold text-[#00a8ff] uppercase tracking-widest flex items-center gap-1.5 mb-2">
          <Anchor className="w-4 h-4" /> Marine & Coastal Charters
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Private Yachts & Boat Charters
        </h1>
        <p className="text-slate-500 text-sm mt-1 max-w-2xl">
          Charter state-of-the-art dual-deck yachts, catamarans, and luxury river cruise vessels along the Bay of Bengal and Bengal river deltas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {boats.map((boat) => (
          <VerticalCard
            key={boat.id}
            id={boat.id}
            verticalType="boat"
            title={boat.name}
            subtitle={`${boat.type} Charter`}
            imageUrl={boat.images[0]}
            price={boat.pricePerDay}
            unitLabel="day"
            detailUrl={`/boats/${boat.id}`}
            metaBadge={boat.includesCaptain ? "Captain & Crew Included" : "Bareboat"}
            specs={[
              { label: "Capacity", value: `${boat.capacity} guests` },
              { label: "Base Port", value: boat.location },
            ]}
          />
        ))}
      </div>
    </div>
  );
}


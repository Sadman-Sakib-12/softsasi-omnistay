import React from "react";
import { TravelService } from "@/features/travel/travel.service";
import { VerticalCard } from "@/components/cards/vertical-card";
import { Compass, MapPin } from "lucide-react";

export default async function ToursPage() {
  const tours = await TravelService.getTours();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <span className="text-xs font-bold text-[#00a8ff] uppercase tracking-widest flex items-center gap-1.5 mb-2">
          <Compass className="w-4 h-4" /> Extraordinary Experiences
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Guided Expeditions & Tours
        </h1>
        <p className="text-slate-500 text-sm mt-1 max-w-2xl">
          Immersive wildlife safaris, coral reef sailing, tea valley trails, and historic heritage walks led by certified naturalist guides.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {tours.map((tour) => (
          <VerticalCard
            key={tour.id}
            id={tour.id}
            verticalType="tour"
            title={tour.title}
            subtitle={`${tour.durationHours} Hours • ${tour.location}`}
            imageUrl={tour.images[0]}
            price={tour.pricePerPerson}
            unitLabel="person"
            detailUrl={`/tours/${tour.id}`}
            metaBadge="Naturalist Escorted"
            specs={[
              { label: "Duration", value: `${tour.durationHours}h` },
              { label: "Max Group", value: `${tour.maxParticipants} guests` },
            ]}
          />
        ))}
      </div>
    </div>
  );
}


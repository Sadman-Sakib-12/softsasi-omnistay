import React from "react";
import { TravelService } from "@/features/travel/travel.service";
import { VerticalCard } from "@/components/cards/vertical-card";
import { Car, ShieldCheck } from "lucide-react";

export default async function CarsPage() {
  const cars = await TravelService.getCars();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <span className="text-xs font-bold text-[#00a8ff] uppercase tracking-widest flex items-center gap-1.5 mb-2">
          <Car className="w-4 h-4" /> Executive Mobility
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Chauffeur Fleets & Luxury Car Rental
        </h1>
        <p className="text-slate-500 text-sm mt-1 max-w-2xl">
          Arrive in elegance with our certified executive chauffeurs and pristine premium vehicles. Ideal for airport transfers, VIP delegations, and coastal roadtrips.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cars.map((car) => (
          <VerticalCard
            key={car.id}
            id={car.id}
            verticalType="car"
            title={`${car.make} ${car.model} (${car.year})`}
            subtitle={car.category}
            imageUrl={car.images[0]}
            price={car.pricePerDay}
            unitLabel="day"
            detailUrl={`/cars/${car.id}`}
            metaBadge={car.withDriver ? "Chauffeur Included" : "Self-Drive"}
            specs={[
              { label: "Seats", value: String(car.seats) },
              { label: "Transmission", value: car.transmission },
              { label: "Fuel", value: car.fuelType },
            ]}
          />
        ))}
      </div>
    </div>
  );
}


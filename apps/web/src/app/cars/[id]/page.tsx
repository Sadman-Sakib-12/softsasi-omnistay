"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { TravelService, CarItem } from "@/features/travel/travel.service";
import { useCartStore } from "@/features/cart/cart-store";
import { formatCurrency } from "@/lib/utils";
import { BeatLoader } from "react-spinners";
import {
  Car,
  Users,
  Fuel,
  Gauge,
  ShieldCheck,
  Calendar,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "car-1";

  const [car, setCar] = useState<CarItem | null>(null);
  const [days, setDays] = useState(1);
  const [withDriver, setWithDriver] = useState(true);
  const [startDate, setStartDate] = useState("");
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    TravelService.getCarById(id).then((res) => {
      if (res) setCar(res);
      else {
        // Fallback to searching in list
        TravelService.getCars().then((cars) => {
          const match = cars.find((c) => c.id === id) || cars[0];
          setCar(match || null);
        });
      }
    });
  }, [id]);

  if (!car) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <BeatLoader color="#22d3ee" size={18} speedMultiplier={1.2} />
        <p className="text-slate-500 text-sm mt-4 font-medium animate-pulse">Loading vehicle specifications...</p>
      </div>
    );
  }

  const effectiveDailyPrice = car.pricePerDay + (withDriver ? 2000 : 0);
  const totalPrice = effectiveDailyPrice * days;

  const handleAddToCart = () => {
    addItem({
      verticalType: "car",
      resourceId: car.id,
      title: `${car.make} ${car.model} (${car.year})`,
      subtitle: `${withDriver ? "With Professional Chauffeur" : "Self-Drive"} • ${car.transmission} • ${car.category}`,
      imageUrl: car.images[0],
      pricePerUnit: effectiveDailyPrice,
      quantity: days,
      unitLabel: "day",
      startDate: startDate || undefined,
    });
    router.push("/cart");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#00a8ff] mb-2">
          <MapPin className="w-4 h-4" />
          <span>{car.location}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {car.make} {car.model} ({car.year})
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {car.category} Class • Certified by Softsasi Executive Fleet Management
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Image & Specs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative rounded-3xl overflow-hidden aspect-video bg-slate-100 shadow-md">
            <img
              src={car.images[0]}
              alt={`${car.make} ${car.model}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Full Comprehensive Insurance Included</span>
            </div>
          </div>

          {/* Specs Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <Users className="w-5 h-5 text-[#00a8ff] mb-2" />
              <span className="text-xs text-slate-400 block font-medium">Passenger Capacity</span>
              <span className="text-sm font-bold text-slate-900">{car.seats} Adults</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <Gauge className="w-5 h-5 text-[#00a8ff] mb-2" />
              <span className="text-xs text-slate-400 block font-medium">Transmission</span>
              <span className="text-sm font-bold text-slate-900">{car.transmission}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <Fuel className="w-5 h-5 text-[#00a8ff] mb-2" />
              <span className="text-xs text-slate-400 block font-medium">Fuel Type</span>
              <span className="text-sm font-bold text-slate-900">{car.fuelType}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <Car className="w-5 h-5 text-[#00a8ff] mb-2" />
              <span className="text-xs text-slate-400 block font-medium">Vehicle Category</span>
              <span className="text-sm font-bold text-slate-900">{car.category}</span>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Rental Inclusions & Safety</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Unlimited Mileage in Metropolitan Zone</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Complimentary Mineral Water & Wi-Fi Onboard</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>24/7 Roadside Assistance & GPS Tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Airport Meet & Greet Service Available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Booking Widget */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl space-y-6 sticky top-24">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Daily Rental Rate
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-slate-900">
                  {formatCurrency(effectiveDailyPrice, "BDT")}
                </span>
                <span className="text-xs text-slate-500">/ day</span>
              </div>
            </div>

            {/* Chauffeur Toggle */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 cursor-pointer">
                  Dedicated Chauffeur
                </label>
                <input
                  type="checkbox"
                  checked={withDriver}
                  onChange={(e) => setWithDriver(e.target.checked)}
                  className="h-4 w-4 rounded text-[#00a8ff] focus:ring-[#00a8ff] cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                English-speaking, background-verified executive driver (+৳2,000/day).
              </p>
            </div>

            {/* Date & Days */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00a8ff]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Number of Days
                </label>
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setDays(Math.max(1, days - 1))}
                    className="px-4 py-2 text-sm font-bold hover:bg-slate-200"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center text-xs font-bold text-slate-800">
                    {days} {days > 1 ? "Days" : "Day"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDays(days + 1)}
                    className="px-4 py-2 text-sm font-bold hover:bg-slate-200"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Total breakdown */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Total Investment</span>
              <span className="text-xl font-black text-[#00a8ff]">
                {formatCurrency(totalPrice, "BDT")}
              </span>
            </div>

            <Button
              onClick={handleAddToCart}
              className="w-full py-6 font-extrabold uppercase tracking-wider text-xs bg-[#00a8ff] hover:bg-[#0092dd] shadow-lg shadow-sky-500/20 gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add Vehicle to Cart</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


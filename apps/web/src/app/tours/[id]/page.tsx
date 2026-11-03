"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { TravelService, TourItem } from "@/features/travel/travel.service";
import { useCartStore } from "@/features/cart/cart-store";
import { formatCurrency } from "@/lib/utils";
import {
  Clock,
  Users,
  CheckCircle2,
  MapPin,
  Calendar,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TourDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "tour-1";

  const [tour, setTour] = useState<TourItem | null>(null);
  const [participants, setParticipants] = useState(2);
  const [date, setDate] = useState("");
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    TravelService.getTourById(id).then(setTour);
  }, [id]);

  if (!tour) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-4 border-[#00a8ff] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Loading expedition itinerary...</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem({
      verticalType: "tour",
      resourceId: tour.id,
      title: tour.title,
      subtitle: `${tour.durationHours} Hours • ${tour.location}`,
      imageUrl: tour.images[0],
      pricePerUnit: tour.pricePerPerson,
      quantity: participants,
      unitLabel: "person",
      startDate: date || undefined,
    });
    router.push("/cart");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Tour Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#00a8ff] mb-2">
          <MapPin className="w-4 h-4" />
          <span>{tour.location}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {tour.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-3">
          <span className="flex items-center gap-1 font-medium text-slate-700">
            <Clock className="w-4 h-4 text-slate-400" />
            Duration: {tour.durationHours} Hours
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 font-medium text-slate-700">
            <Users className="w-4 h-4 text-slate-400" />
            Max {tour.maxParticipants} Participants
          </span>
        </div>
      </div>

      {/* Main Image */}
      <div className="relative aspect-21/9 w-full rounded-3xl overflow-hidden mb-12 bg-slate-100 shadow-md">
        <img
          src={tour.images[0]}
          alt={tour.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Itinerary & Inclusions */}
        <div className="lg:col-span-2 space-y-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-3">Expedition Overview</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{tour.description}</p>
          </div>

          {/* Inclusions */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">What's Included</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tour.inclusions.map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Day by Day Itinerary */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-6">Day-by-Day Itinerary</h2>
            <div className="space-y-6 relative border-l-2 border-sky-100 ml-4 pl-6">
              {tour.itinerary.map((step, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[31px] top-0 w-3.5 h-3.5 rounded-full bg-[#00a8ff] ring-4 ring-sky-100" />
                  <h4 className="font-bold text-slate-900 text-sm">{step.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Card */}
        <aside className="lg:col-span-1">
          <div className="sticky top-28 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Price per person
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-slate-900">
                  {formatCurrency(tour.pricePerPerson)}
                </span>
                <span className="text-xs text-slate-500">/ person</span>
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-100 pt-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Departure Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#00a8ff] cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Participants
                </label>
                <select
                  value={participants}
                  onChange={(e) => setParticipants(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#00a8ff] cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "Person" : "Persons"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-between items-center text-sm font-bold text-slate-900 border-t border-slate-100">
                <span>Total:</span>
                <span>{formatCurrency(tour.pricePerPerson * participants)}</span>
              </div>

              <Button
                onClick={handleAddToCart}
                className="w-full py-3.5 rounded-2xl gap-2 font-bold"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add Tour to Cart</span>
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

